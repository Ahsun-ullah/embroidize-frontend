#!/bin/bash
LIVE_DIR="/var/www/embroidize-frontend"
BUILD_DIR="/var/www/embroidize-frontend-build"
ENV_FILE="$LIVE_DIR/.env.production"
rm -rf $BUILD_DIR
cp -r $LIVE_DIR $BUILD_DIR
cd $BUILD_DIR
git reset --hard HEAD
git clean -fd
git pull origin main
npm install
npm run build
if [ $? -ne 0 ]; then
  rm -rf $BUILD_DIR
  exit 1
fi
cp -r public .next/standalone/ 2>/dev/null || true
cp $ENV_FILE .next/standalone/.env.production 2>/dev/null || true
mkdir -p .next/standalone/.next
cp -r .next/server .next/standalone/.next/ 2>/dev/null || true
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
cp .next/BUILD_ID .next/standalone/.next/ 2>/dev/null || true
cp .next/required-server-files.json .next/standalone/.next/ 2>/dev/null || true
cp .next/routes-manifest.json .next/standalone/.next/ 2>/dev/null || true
cp .next/prerender-manifest.json .next/standalone/.next/ 2>/dev/null || true
cp .next/react-loadable-manifest.json .next/standalone/.next/ 2>/dev/null || true
cp .next/app-build-manifest.json .next/standalone/.next/ 2>/dev/null || true
cp .next/build-manifest.json .next/standalone/.next/ 2>/dev/null || true
cp .next/app-path-routes-manifest.json .next/standalone/.next/ 2>/dev/null || true
if [ ! -f ".next/standalone/server.js" ]; then
  rm -rf $BUILD_DIR
  exit 1
fi
rm -rf /var/www/embroidize-frontend-old
mv $LIVE_DIR /var/www/embroidize-frontend-old
mv $BUILD_DIR $LIVE_DIR
pm2 reload embroidize-frontend --update-env
pm2 status embroidize-frontend