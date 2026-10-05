'use client';

import { useEffect } from 'react';
import { captureFbclid } from '@/lib/analytics/metaBrowserIds';
import StoreProvider from '@/lib/providers/StoreProvider';
import UiProvider from '@/lib/providers/UiProvider';

export default function ClientProviders({ children }) {
  // Once per full page load, which is when an ad click's ?fbclid= arrives.
  useEffect(() => {
    captureFbclid();
  }, []);

  return (
    <StoreProvider>
      <UiProvider>{children}</UiProvider>
    </StoreProvider>
  );
}
