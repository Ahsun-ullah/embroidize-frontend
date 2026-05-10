'use client';

import {
  useGetFavoriteIdsQuery,
  useToggleFavoriteMutation,
} from '@/lib/redux/common/favorites/favoritesSlice';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const HeartFilled = ({ size = 14 }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} aria-hidden='true'>
    <path
      fill='#ef4444'
      d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
    />
  </svg>
);

const HeartOutline = ({ size = 14 }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} aria-hidden='true'>
    <path
      fill='none'
      stroke='#6b7280'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
    />
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
export default function FavoriteButton({
  productId,
  initialCount = 0,
  variant = 'card',
  className = '',
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Cookies + RTK Query cache only exist on the client. Reading them during
  // the first render would make the SSR HTML disagree with the client HTML
  // (hydration mismatch). Gate everything browser-derived behind `mounted`
  // so SSR and the first client render produce the same output.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: userInfo } = useUserInfoQuery();
  const isLoggedIn =
    mounted && !!Cookies.get('token') && !!userInfo?._id;

  const { data: idsData } = useGetFavoriteIdsQuery(undefined, {
    skip: !isLoggedIn,
  });

  const [toggleFavorite, { isLoading }] = useToggleFavoriteMutation();

  const isFavourited = isLoggedIn
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
    const nextDelta = delta + (isFavourited ? -1 : 1);
    setDelta(nextDelta);
    toggleFavorite(productId)
      .unwrap()
      .then((res) => {
        const serverCount = res?.data?.favoriteCount;
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

  // Before mount we don't know whether the visitor is signed in, so we render
  // the neutral "Add to favourites" label on both server and first-client
  // render. The "Sign in to favourite" label only appears post-mount when we
  // can confirm the visitor is unauthenticated.
  const ariaLabel =
    mounted && !isLoggedIn
      ? 'Sign in to favourite this design'
      : isFavourited
        ? 'Remove from favourites'
        : 'Add to favourites';

  // Detail variant gets a hover hint that exposes the public count.
  const tooltip =
    mounted && !isLoggedIn
      ? 'Sign in to favourite this design'
      : !isCard
        ? `Favourited by ${displayCount} ${displayCount === 1 ? 'person' : 'people'}`
        : undefined;

  return (
    <button
      type='button'
      onClick={handleClick}
      disabled={isLoading}
      aria-pressed={isFavourited}
      aria-label={ariaLabel}
      title={tooltip}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-all duration-150 active:scale-95 disabled:opacity-60 bg-white/95 text-gray-800 backdrop-blur-sm border border-gray-200 hover:bg-gray-100 ${sizeClasses} ${
        isCard ? 'shadow-md' : ''
      } ${className}`}
    >
      {isFavourited ? (
        <HeartFilled size={iconSize} />
      ) : (
        <HeartOutline size={iconSize} />
      )}
      <span className='tabular-nums'>{formatCount(displayCount)}</span>
    </button>
  );
}
