'use client';

import { Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');

// Counts down to the end of the vote day. Uses the server's clock (serverNow)
// so a visitor whose own clock is wrong still sees the right time left. When it
// reaches zero the page refreshes and shows the new free design.
export default function VoteCountdown({
  endsAt,
  serverNow,
  label = 'Next free design in',
  className = '',
}) {
  const router = useRouter();
  const offsetRef = useRef(0);
  const [left, setLeft] = useState(null);

  useEffect(() => {
    if (!endsAt) return undefined;
    offsetRef.current = serverNow
      ? new Date(serverNow).getTime() - Date.now()
      : 0;
    const end = new Date(endsAt).getTime();
    let refreshed = false;
    const tick = () => {
      const ms = Math.max(0, end - (Date.now() + offsetRef.current));
      setLeft(ms);
      if (ms === 0 && !refreshed) {
        refreshed = true;
        // A few seconds' grace for the rollover to finish.
        setTimeout(() => router.refresh(), 4000);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt, serverNow, router]);

  const s = Math.floor((left ?? 0) / 1000);
  const text =
    left === null
      ? '--:--:--'
      : `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-900 ${className}`}
      role='timer'
      aria-live='off'
    >
      <Clock className='h-5 w-5 text-amber-600' aria-hidden />
      <span className='text-sm font-medium'>{label}</span>
      <span className='font-mono text-xl font-extrabold tabular-nums text-amber-600'>
        {text}
      </span>
    </div>
  );
}
