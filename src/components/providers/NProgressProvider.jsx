'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import { useEffect, useState } from 'react';

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 120, // how often it nudges forward — snappier feel
  minimum: 0.2, // start visibly filled so the bar is seen even on fast loads
  speed: 400, // completion animation duration
  easing: 'ease',
});

export const NProgressProvider = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Navigation finished (route/query changed) → stop bar + spinner.
  useEffect(() => {
    NProgress.done();
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const startLoading = () => {
      NProgress.start();
      setLoading(true);
    };

    const handleAnchorClick = (event) => {
      const targetUrl = new URL(event.currentTarget.href);
      const currentUrl = new URL(location.href);
      // Only for same-origin links that actually change the URL.
      if (
        targetUrl.origin === currentUrl.origin &&
        targetUrl.href !== currentUrl.href
      ) {
        startLoading();
      }
    };

    const handleMutation = () => {
      const anchorElements = document.querySelectorAll('a');
      anchorElements.forEach((anchor) =>
        anchor.addEventListener('click', handleAnchorClick),
      );
    };

    const mutationObserver = new MutationObserver(handleMutation);
    mutationObserver.observe(document, { childList: true, subtree: true });

    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray) => {
        // NOTE: do NOT call React state setters here — pushState is invoked by
        // Next's router from inside an insertion effect, and scheduling an update
        // there throws "useInsertionEffect must not schedule updates". The bar is
        // completed here; the route-change effect above clears `loading`.
        NProgress.done();
        return target.apply(thisArg, argArray);
      },
    });
  }, []);

  return (
    <>
      {loading && (
        <div className='np-corner-spinner' aria-hidden='true'>
          <span className='np-ring' />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className='np-logo' src='/favicon.png' alt='' />
        </div>
      )}
      {children}
    </>
  );
};
