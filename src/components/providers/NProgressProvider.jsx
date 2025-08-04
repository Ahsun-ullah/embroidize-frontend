'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import { useEffect } from 'react';

NProgress.configure({ showSpinner: false });

export const NProgressProvider = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (event) => {
      const targetUrl = new URL(event.currentTarget.href);
      const currentUrl = new URL(location.href);
      if (targetUrl.origin === currentUrl.origin) {
        NProgress.start();
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
        NProgress.done();
        return target.apply(thisArg, argArray);
      },
    });
  });

  return <>{children}</>;
};
