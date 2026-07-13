'use client';

import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { useEffect, useState } from 'react';

/**
 * Single source of truth for the free-tier download usage + reset countdown.
 *
 * Both the My Plan page and the Download Limit modal consume this hook, so the
 * usage numbers and the reset moment are guaranteed identical in both places —
 * there is no second copy of the reset math anywhere.
 *
 * Design notes:
 *  - The live countdown is derived from the ABSOLUTE `nextResetTime` timestamp
 *    returned by /userinfo (not a decrementing counter). That keeps it accurate
 *    across re-renders, tab sleeps, and component remounts — a decrementing
 *    counter drifts in all three cases.
 *  - Timezone-safe: `nextResetTime` is an absolute instant; formatting to a
 *    wall-clock label is done in the browser locale by the formatter helpers.
 *  - Hydration-safe: `now` is null on the server and the first client render,
 *    so we fall back to the server-computed `timeUntilReset` for that single
 *    paint and only switch to live local time after mount. No SSR/CSR mismatch.
 *
 * @param {{ tickMs?: number }} [opts] - countdown refresh cadence.
 *        Default 1000ms (smooth, used by My Plan's live timer). Pass 60000 for
 *        minute-granular UIs (e.g. the modal) to avoid per-second re-renders.
 */
export function useDownloadReset({ tickMs = 1000 } = {}) {
  const { data: userInfo, isLoading } = useUserInfoQuery();

  const usedDownloads = userInfo?.usedDownloads ?? 0;
  const limit = userInfo?.downloadLimit ?? 0;
  const downloadWindow = userInfo?.downloadWindow ?? '1d';
  const remaining =
    userInfo?.remainingDownloads ?? Math.max(0, limit - usedDownloads);
  const currentPlanName = userInfo?.subscription?.planId?.name ?? null;

  const resetDate = userInfo?.nextResetTime
    ? new Date(userInfo.nextResetTime)
    : null;
  const targetMs =
    resetDate && !isNaN(resetDate.getTime()) ? resetDate.getTime() : null;

  // null until mounted → nothing time-dependent diverges between server & client.
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  // Live value once mounted; before that, reuse the server-computed duration so
  // there is no flash of "Available now" on first paint.
  const liveMs = targetMs != null && now != null ? Math.max(0, targetMs - now) : null;
  const msLeft = liveMs != null ? liveMs : userInfo?.timeUntilReset ?? 0;

  return {
    isLoading,
    isReady: now !== null,
    usedDownloads,
    limit,
    downloadWindow,
    remaining,
    isLimitReached: limit > 0 && remaining <= 0,
    currentPlanName,
    nextResetTime: targetMs != null ? new Date(targetMs) : null,
    msLeft,
  };
}
