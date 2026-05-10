'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { useToggleAdminChoiceMutation } from '@/lib/redux/admin/adminChoice/adminChoiceSlice';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { useEffect, useState } from 'react';

/**
 * Admin-only click-to-toggle badge that flips Product.isAdminChoice on the
 * server. Renders nothing for non-admins.
 *
 * Optimistic: local state flips immediately on click, reverts on API error.
 * The "Embroidize Choice Designs" homepage section is SSR — toggling here
 * won't refresh that section in the same session, but the card itself updates
 * instantly and the next page load reflects the change everywhere.
 */
export default function AdminChoiceToggle({ productId, initialStatus = false }) {
  // RTK Query cache + persisted state only exist on the client. If userInfo
  // is cached as an admin, rendering the button before hydration completes
  // would diverge from the server (which sees nothing). Gate behind `mounted`
  // so SSR + first client render both produce the same output.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: userInfo } = useUserInfoQuery();
  const isAdmin = mounted && userInfo?.role === 'admin';

  const [isActive, setIsActive] = useState(!!initialStatus);
  const [toggle, { isLoading }] = useToggleAdminChoiceMutation();

  if (!isAdmin) return null;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;

    const previous = isActive;
    setIsActive(!previous);

    toggle(productId)
      .unwrap()
      .then((res) => {
        const serverStatus = res?.data?.isAdminChoice;
        if (typeof serverStatus === 'boolean') {
          setIsActive(serverStatus);
        }
        SuccessToast(
          'Embroidize Choice',
          serverStatus
            ? 'Added to Embroidize Choice'
            : 'Removed from Embroidize Choice',
          2000,
        );
      })
      .catch(() => {
        setIsActive(previous);
        ErrorToast(
          'Error',
          'Could not update Embroidize Choice. Please try again.',
          3000,
        );
      });
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      disabled={isLoading}
      aria-pressed={isActive}
      aria-label={
        isActive
          ? 'Remove from Embroidize Choice'
          : 'Add to Embroidize Choice'
      }
      title={
        isActive
          ? 'Remove from Embroidize Choice'
          : 'Add to Embroidize Choice'
      }
      className='flex h-9 w-9 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm border border-gray-200 shadow-md hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-150 disabled:opacity-60'
    >
      <i
        className={`text-lg ${
          isActive
            ? 'ri-shield-star-fill text-black'
            : 'ri-shield-star-line text-gray-400'
        }`}
      />
    </button>
  );
}
