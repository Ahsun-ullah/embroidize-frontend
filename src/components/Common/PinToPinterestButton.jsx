'use client';

import PinToPinterestModal from '@/components/Common/PinToPinterestModal';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { useEffect, useState } from 'react';

/**
 * Admin-only "Pin to Pinterest" trigger. Renders nothing for everyone else.
 *
 * Two variants:
 *   - `button` (default) — labelled button for the product page.
 *   - `icon` — compact circular icon for the admin product table rows.
 *
 * Mirrors AdminChoiceToggle's `mounted` gate: RTK Query's cached userInfo only
 * exists on the client, so rendering before hydration completes would diverge
 * from the server output and trip a hydration mismatch.
 */
export default function PinToPinterestButton({
  productId,
  variant = 'button',
  className = '',
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: userInfo } = useUserInfoQuery();
  const isAdmin = mounted && userInfo?.role === 'admin';

  const [isOpen, setIsOpen] = useState(false);

  if (!isAdmin) return null;

  const open = (e) => {
    // The table row and the product card are both clickable — without this the
    // click would navigate away underneath the modal.
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      {variant === 'icon' ? (
        <button
          type='button'
          onClick={open}
          aria-label='Pin to Pinterest'
          title='Pin to Pinterest'
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm border border-gray-200 shadow-md hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-150 ${className}`}
        >
          <i className='ri-pinterest-fill text-lg text-black' />
        </button>
      ) : (
        <button
          type='button'
          onClick={open}
          className={`inline-flex items-center justify-center gap-2 rounded-3xl border-2 border-black px-4 py-3 font-bold text-black transition hover:bg-black/5 ${className}`}
        >
          <i className='ri-pinterest-fill text-lg' />
          <span>PIN TO PINTEREST</span>
        </button>
      )}

      <PinToPinterestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productId={productId}
      />
    </>
  );
}
