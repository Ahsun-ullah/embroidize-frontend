'use client';

import { HeroUIProvider, ToastProvider } from '@heroui/react';

export default function UiProvider({ children }) {
  return (
    <HeroUIProvider>
      <ToastProvider
        placement={'top-right'}
        toastOffset={'top-right'.includes('top') ? 40 : 0}
      />
      {children}
    </HeroUIProvider>
  );
}
