'use client';

import {
  getActiveEventPromotions,
  trackEventPromotionClick,
} from '@/lib/apis/public/eventPromotions';
import { ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Thin announcement bar above every page for the first live event marked
// "Top strip". Fetched in the browser, not the layout: a server fetch there
// would make every page in the site dynamic for the sake of one line of text.
//
// Closing it hides THAT event for this browser; the next event still shows.

// Places a promo strip would get in the way of the job at hand.
const HIDDEN_PREFIXES = ['/admin', '/auth', '/custom-order-checkout', '/reset-password'];

const dismissKey = (id) => `event-strip-dismissed:${id}`;

export default function EventStrip() {
  const pathname = usePathname() || '';
  const [promo, setPromo] = useState(null);
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  // Re-checked on EVERY page change, not once per tab: the layout survives
  // client-side navigation, so a once-only fetch kept showing an event after
  // its end time (and missed one that started mid-visit) while the home
  // section and floating ad, which fetch per page, had already moved on. The
  // backend caches this list for 30s, so the extra requests are cheap. The
  // current strip stays up while the check runs — no flicker between pages.
  useEffect(() => {
    if (hidden) return;
    let active = true;
    (async () => {
      const list = await getActiveEventPromotions();
      if (!active) return;
      const now = Date.now();
      const next = list.find((p) => {
        if (!p.showOnStrip || !p.stripText) return false;
        if (p.endsAt && new Date(p.endsAt).getTime() <= now) return false;
        try {
          return !localStorage.getItem(dismissKey(p._id));
        } catch {
          return true;
        }
      });
      setPromo(next || null);
    })();
    return () => {
      active = false;
    };
  }, [hidden, pathname]);

  if (hidden || !promo) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(dismissKey(promo._id), '1');
    } catch {
      // Private mode: it simply comes back on the next page.
    }
    setPromo(null);
  };

  const href = promo.href || '/products';
  const external = /^https?:\/\//i.test(href);
  const LinkTag = external ? 'a' : Link;
  const linkProps = external ? { href } : { href, prefetch: false };

  return (
    <div className='relative bg-black text-white'>
      <div className='container mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2 text-center text-sm'>
        <LinkTag
          {...linkProps}
          onClick={() => trackEventPromotionClick(promo._id)}
          className='group inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1'
        >
          <span className='font-medium'>{promo.stripText}</span>
          <span className='inline-flex items-center gap-1 font-semibold underline underline-offset-4'>
            {promo.stripCtaLabel || 'Shop now'}
            <ArrowRight
              className='h-4 w-4 transition-transform group-hover:translate-x-0.5'
              aria-hidden
            />
          </span>
        </LinkTag>
        <button
          type='button'
          onClick={dismiss}
          aria-label='Close announcement'
          className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white'
        >
          <X className='h-4 w-4' aria-hidden />
        </button>
      </div>
    </div>
  );
}
