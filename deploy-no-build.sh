#!/bin/bash
#
# Zero-downtime deploy: build into a staging dir, then swap it in.
#
# Disk safety is the whole design here. The previous version of this script did
# `cp -r $LIVE_DIR $BUILD_DIR`, which copied .next — including the image cache
# Next writes at RUNTIME (.next/cache/images). That cache then became part of
# the new live dir and was inherited by every later deploy, so it grew forever
# and eventually filled the droplet mid-copy. Because nothing checked exit
# codes, the deploy carried on with a 0-byte package.json and failed with a
# confusing `npm JSON.parse` error instead of "the disk is full".
#
# Rules that keep that from coming back:
#   1. .next is NEVER copied — `npm run build` regenerates it.
#   2. The previous release is freed once the preflight passes and before the
#      new one is built, so live + old + build never coexist.
#   3. A preflight refuses to start a deploy that cannot finish, without having
#      touched the live site or the rollback copy.
#   4. set -euo pipefail: the first failure stops the deploy, live untouched.
#
# The contract, unchanged from the original script: the live directory is only
# ever READ until the build has fully succeeded. If anything fails first, the
# currently deployed site keeps serving and nothing is swapped.

set -euo pipefail

# Overridable so the staging logic can be exercised outside /var/www.
LIVE_DIR="${LIVE_DIR:-/var/www/embroidize-frontend}"
BUILD_DIR="${BUILD_DIR:-/var/www/embroidize-frontend-build}"
OLD_DIR="${OLD_DIR:-/var/www/embroidize-frontend-old}"
ENV_FILE="${ENV_FILE:-$LIVE_DIR/.env.production}"
PM2_APP="${PM2_APP:-embroidize-frontend}"

# Headroom for node_modules + a fresh .next + the standalone copy.
MIN_FREE_MB="${MIN_FREE_MB:-4000}"

log() { echo "▸ $*"; }
fail() { echo "✖ $*" >&2; exit 1; }

# Any failure below leaves LIVE_DIR untouched; just clear the staging dir so the
# next run starts clean rather than inheriting a half-built tree.
cleanup_on_fail() {
  local code=$?
  if [ $code -ne 0 ]; then
    echo "✖ Deploy failed (exit $code). Live site untouched."
    rm -rf "$BUILD_DIR"
  fi
}
trap cleanup_on_fail EXIT

[ -d "$LIVE_DIR" ] || fail "$LIVE_DIR does not exist."

# ── 1. Reclaim what is unambiguously garbage ──────────────────────────────
# Only the staging dir here. $OLD_DIR is the rollback copy of the CURRENT live
# release and is deliberately kept until the preflight passes — an aborted
# deploy must not cost you the ability to roll back.
log "Removing any stale staging dir…"
rm -rf "$BUILD_DIR"

# ── 2. Preflight: refuse a deploy that cannot finish ──────────────────────
# $OLD_DIR counts as available because it is freed in step 3 once we commit.
FREE_MB=$(df -Pm "$(dirname "$LIVE_DIR")" | awk 'NR==2 {print $4}')
OLD_MB=$(du -sm "$OLD_DIR" 2>/dev/null | cut -f1 || true)
OLD_MB=${OLD_MB:-0}
USABLE_MB=$((FREE_MB + OLD_MB))
log "Free space: ${FREE_MB}MB + ${OLD_MB}MB reclaimable = ${USABLE_MB}MB (need ${MIN_FREE_MB}MB)"
if [ "$USABLE_MB" -lt "$MIN_FREE_MB" ]; then
  echo "Largest consumers:" >&2
  du -sh "$LIVE_DIR"/.next "$LIVE_DIR"/node_modules /root/.npm 2>/dev/null | sort -h >&2 || true
  fail "Not enough disk to deploy safely. Nothing was touched — live site and
  rollback copy are both intact.
  Try:  rm -rf $LIVE_DIR/.next/cache/images && npm cache clean --force && pm2 flush"
fi

# ── 3. Committed: release the previous rollback copy ──────────────────────
# Holding live + old + build simultaneously is what filled the disk before.
if [ -d "$OLD_DIR" ]; then
  log "Freeing previous release (${OLD_MB}MB)…"
  rm -rf "$OLD_DIR"
fi

# ── 4. Stage the source tree WITHOUT .next ────────────────────────────────
# node_modules is copied so npm install stays incremental; .next is excluded
# because the build recreates it and its runtime cache is the thing that grows.
log "Staging source into $BUILD_DIR (excluding .next)…"
mkdir -p "$BUILD_DIR"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude='.next' --exclude='node_modules/.cache' \
    "$LIVE_DIR/" "$BUILD_DIR/"
else
  # tar honours excludes without needing rsync installed.
  (cd "$LIVE_DIR" && tar --exclude='./.next' --exclude='./node_modules/.cache' -cf - .) \
    | (cd "$BUILD_DIR" && tar -xf -)
fi

# Carry ONLY the webpack build cache forward — it makes rebuilds much faster on
# a 1-vCPU box, and unlike the image cache it is bounded and build-scoped.
if [ -d "$LIVE_DIR/.next/cache/webpack" ]; then
  log "Reusing webpack build cache…"
  mkdir -p "$BUILD_DIR/.next/cache"
  cp -r "$LIVE_DIR/.next/cache/webpack" "$BUILD_DIR/.next/cache/" 2>/dev/null || true
fi

cd "$BUILD_DIR"

# ── 5. Sync to origin ─────────────────────────────────────────────────────
# A hard reset to origin/main: the staging tree is disposable, so local drift
# (including files left half-written by an earlier failed deploy) is discarded
# rather than blocking the pull with "local changes would be overwritten".
log "Fetching origin/main…"
git fetch origin main
git reset --hard origin/main
git clean -fd

DEPLOY_SHA=$(git rev-parse --short HEAD)
log "Deploying $DEPLOY_SHA"

# .env.production is gitignored, so `git clean -fd` leaves it alone today — but
# the deploy must not depend on that. Restore it from the live release if it is
# missing, otherwise this build becomes the next live dir WITHOUT an env file
# and the deploy after it would have nothing to copy.
if [ ! -f "$BUILD_DIR/.env.production" ] && [ -f "$ENV_FILE" ]; then
  log "Restoring .env.production into the staging tree…"
  cp "$ENV_FILE" "$BUILD_DIR/.env.production"
fi

# ── 6. Install + build ────────────────────────────────────────────────────
log "Installing dependencies…"
npm install --no-audit --no-fund

log "Building…"
npm run build

[ -f ".next/standalone/server.js" ] || fail "Build produced no standalone server.js."

# ── 7. Assemble the standalone bundle ─────────────────────────────────────
# Next's standalone output ships server.js + a minimal node_modules, but not
# static assets — those are copied in here.
log "Assembling standalone bundle…"
mkdir -p .next/standalone/.next
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
cp -r .next/server .next/standalone/.next/
for f in BUILD_ID required-server-files.json routes-manifest.json \
         prerender-manifest.json react-loadable-manifest.json \
         app-build-manifest.json build-manifest.json \
         app-path-routes-manifest.json; do
  # Explicit if, not `[ -f x ] && cp`: under `set -e` a false test as the last
  # command in a loop body aborts the whole script, and not every Next version
  # emits every manifest.
  if [ -f ".next/$f" ]; then
    cp ".next/$f" .next/standalone/.next/
  fi
done

# Never let a build cache end up inside the bundle that becomes the live dir —
# that nesting is exactly how the old script compounded the image cache.
rm -rf .next/standalone/.next/cache

if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" .next/standalone/.env.production
else
  echo "⚠ $ENV_FILE not found — the app will start without production env vars." >&2
fi

# ── 8. Swap ───────────────────────────────────────────────────────────────
# The trap is cleared BEFORE the first mv, not after the second. Once LIVE_DIR
# has moved to OLD_DIR, "clean up the staging dir" would mean deleting the only
# built copy while nothing is serving — so from here failure means roll back,
# never delete.
trap - EXIT

rollback() {
  echo "✖ $1 — restoring previous release." >&2
  rm -rf "$LIVE_DIR"
  mv "$OLD_DIR" "$LIVE_DIR"
  pm2 reload "$PM2_APP" --update-env || true
  exit 1
}

log "Swapping into place…"
mv "$LIVE_DIR" "$OLD_DIR"

# `mv src dst` RENAMES only when dst does not exist; if it does, src is moved
# INSIDE it. That would park the app at $LIVE_DIR/<build-dir-name> and leave
# pm2 reloading a directory that no longer holds a server.js.
if [ -e "$LIVE_DIR" ]; then
  rollback "$LIVE_DIR reappeared after the move"
fi

mv "$BUILD_DIR" "$LIVE_DIR"

if [ ! -f "$LIVE_DIR/.next/standalone/server.js" ]; then
  rollback "Swapped tree has no .next/standalone/server.js"
fi

# The new tree is in place; a reload failure here means the files are live but
# the process still runs the old code. That is worth shouting about rather than
# dying on `set -e` with no explanation.
if ! pm2 reload "$PM2_APP" --update-env; then
  echo "⚠ Files swapped, but 'pm2 reload $PM2_APP' failed." >&2
  echo "  The new build is on disk; the running process is still the old one." >&2
  echo "  Retry:    pm2 restart $PM2_APP --update-env" >&2
  echo "  Roll back: rm -rf $LIVE_DIR && mv $OLD_DIR $LIVE_DIR && pm2 restart $PM2_APP" >&2
  exit 1
fi

pm2 status "$PM2_APP" || true

log "Deployed $DEPLOY_SHA. Free space now: $(df -Pm "$(dirname "$LIVE_DIR")" | awk 'NR==2 {print $4}')MB"
log "Rollback: rm -rf $LIVE_DIR && mv $OLD_DIR $LIVE_DIR && pm2 restart $PM2_APP"
