'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Mobile-only sticky CTA bar (hidden above 640px by landing.css).
 *
 * Port of the inline <script> the standalone design shipped with: the bar
 * slides in once the hero has scrolled out of view, and the button switches
 * from an on-page jump to the real subscription link once the plans section
 * has been reached — by then there is nothing left to scroll to.
 */
export default function LandingStickyCta() {
  const [visible, setVisible] = useState(false);
  const [plansSeen, setPlansSeen] = useState(false);

  useEffect(() => {
    // No IntersectionObserver: show the bar unconditionally rather than
    // leaving mobile with no persistent CTA at all.
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observers = [];
    const hero = document.getElementById('hero');
    const plans = document.getElementById('plans');

    if (hero) {
      const heroObserver = new IntersectionObserver(
        (entries) => setVisible(!entries[0].isIntersecting),
        { threshold: 0 },
      );
      heroObserver.observe(hero);
      observers.push(heroObserver);
    }

    if (plans) {
      const plansObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) setPlansSeen(true);
        },
        { threshold: 0.12 },
      );
      plansObserver.observe(plans);
      observers.push(plansObserver);
    }

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  return (
    <div className={visible ? 'sticky is-on' : 'sticky'} id='sticky'>
      {plansSeen ? (
        <Link
          className='btn btn--primary btn--block'
          id='stickyCta'
          href='/subscriptions'
        >
          Start Subscription
        </Link>
      ) : (
        <a className='btn btn--primary btn--block' id='stickyCta' href='#plans'>
          View Plans
        </a>
      )}
    </div>
  );
}
