'use client';

import StoreProvider from '@/lib/providers/StoreProvider';
import UiProvider from '@/lib/providers/UiProvider';

export default function ClientProviders({ children }) {
  return (
    <StoreProvider>
      <UiProvider>{children}</UiProvider>
    </StoreProvider>
  );
}
