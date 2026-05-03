'use client';

import {
  useGetLikedIdsQuery,
  useToggleLikeMutation,
} from '@/lib/redux/common/likes/likesSlice';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const ThumbFilled = ({ size = 14 }) => (
  <svg
    viewBox='0 0 24 24'
    width={size}
    height={size}
    aria-hidden='true'
    fill='currentColor'
  >
    <path d='M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z' />
  </svg>
);

const ThumbOutline = ({ size = 14 }) => (
  <svg
    viewBox='0 0 24 24'
    width={size}
    height={size}
    aria-hidden='true'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9A2 2 0 0 0 19.66 9H14z' />
    <path d='M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3' />
  </svg>
);

function formatCount(n) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Math.max(0, Number(n) || 0));
}

/**
 * variant:
 *   - 'card'   → small pill overlay used on ProductCard
 *   - 'detail' → larger pill used on the product detail download card
 */
export default function LikeButton({
  productId,
  initialCount = 0,
  variant = 'card',
  className = '',
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: userInfo } = useUserInfoQuery();
  const isLoggedIn = !!Cookies.get('token') && !!userInfo?._id;

  const { data: idsData } = useGetLikedIdsQuery(undefined, {
    skip: !isLoggedIn,
  });

  const [toggleLike, { isLoading }] = useToggleLikeMutation();

  const isLiked = isLoggedIn
    ? (idsData?.data?.ids?.includes(productId) ?? false)
    : false;

  // The count from the server (initialCount) reflects the moment the page rendered.
  // Track a local delta so the count stays in sync with the user's optimistic toggle.
  const [delta, setDelta] = useState(0);
  const displayCount = Math.max(0, Number(initialCount || 0) + delta);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push(`/auth/login?pathName=${encodeURIComponent(pathname)}`);
      return;
    }
    if (isLoading) return;

    // Optimistic count nudge — RTK Query already flips the icon optimistically.
    const nextDelta = delta + (isLiked ? -1 : 1);
    setDelta(nextDelta);
    toggleLike(productId)
      .unwrap()
      .then((res) => {
        const serverCount = res?.data?.likeCount;
        if (typeof serverCount === 'number') {
          // Reconcile delta to the authoritative server count.
          setDelta(serverCount - Number(initialCount || 0));
        }
      })
      .catch(() => {
        setDelta(delta);
      });
  };

  const isCard = variant === 'card';
  const sizeClasses = isCard
    ? 'h-8 px-2.5 gap-1.5 text-xs'
    : 'h-9 px-3 gap-2 text-sm';
  const iconSize = isCard ? 14 : 16;

  return (
    <button
      type='button'
      onClick={handleClick}
      disabled={isLoading}
      aria-pressed={isLiked}
      aria-label={
        !isLoggedIn
          ? 'Sign in to like this design'
          : isLiked
            ? 'Unlike this design'
            : 'Like this design'
      }
      title={!isLoggedIn ? 'Sign in to like this design' : undefined}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-all duration-150 active:scale-95 disabled:opacity-60 ${sizeClasses} ${
        isLiked
          ? 'bg-black text-white hover:bg-gray-800'
          : 'bg-white/95 text-gray-800 backdrop-blur-sm border border-gray-200 hover:bg-gray-100'
      } ${isCard ? 'shadow-md' : ''} ${className}`}
    >
      {isLiked ? (
        <ThumbFilled size={iconSize} />
      ) : (
        <ThumbOutline size={iconSize} />
      )}
      <span className='tabular-nums'>{formatCount(displayCount)}</span>
    </button>
  );
}
