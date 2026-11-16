'use client';

import { useEffect, useState } from 'react';

/* Time left until a FIXED deadline (the offer's endsAt), the same instant for
 * every visitor in every timezone. Unlike OfferCountdown's daily timer this
 * does not restart at midnight — it counts to the real end.
 *
 * Renders nothing on the server and until mounted: the server's clock and the
 * visitor's differ, so a server-rendered value would mismatch on hydration.
 */
export function useDeadline(endsAt) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (!endsAt) return undefined;
    const end = new Date(endsAt).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return left;
}

const pad = (n) => String(n).padStart(2, '0');

export function splitMs(ms) {
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/** Inline text: "3d 04:12:09" (or "04:12:09" on the last day). */
export function OfferCountdownText({ endsAt, className = '' }) {
  const left = useDeadline(endsAt);
  if (left == null) return <span className={className} aria-hidden>&nbsp;</span>;
  if (left <= 0) return <span className={className}>Offer ended</span>;
  const { days, hours, minutes, seconds } = splitMs(left);
  return (
    <span className={`tabular-nums ${className}`} role='timer'>
      {days > 0 ? `${days}d ` : ''}
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}

/** Boxed tiles for heroes and the landing page. `tone` = 'dark' | 'light' | 'theme' (offer colours). */
export default function OfferCountdownTiles({ endsAt, tone = 'dark' }) {
  const left = useDeadline(endsAt);
  const box =
    tone === 'theme'
      ? 'o-tile o-fg'
      : tone === 'dark'
        ? 'bg-white/10 text-white ring-1 ring-white/15'
        : 'bg-white text-black ring-1 ring-black/10 shadow-sm';
  const label = tone === 'theme' ? 'o-faint' : tone === 'dark' ? 'text-white/60' : 'text-gray-500';
  const parts =
    left == null
      ? null
      : left <= 0
        ? null
        : splitMs(left);
  if (left != null && left <= 0) {
    return <p className={`text-sm font-semibold ${label}`}>This offer has ended</p>;
  }
  const units = [
    ['days', 'Days'],
    ['hours', 'Hours'],
    ['minutes', 'Min'],
    ['seconds', 'Sec'],
  ];
  return (
    <div className='flex gap-2' role='timer' aria-live='off'>
      {units.map(([key, name]) => (
        <div key={key} className={`flex w-14 flex-col items-center rounded-xl py-2 sm:w-16 ${box}`}>
          <span className='text-xl font-extrabold tabular-nums sm:text-2xl'>
            {parts ? pad(parts[key]) : '--'}
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${label}`}>{name}</span>
        </div>
      ))}
    </div>
  );
}
