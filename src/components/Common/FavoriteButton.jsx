'use client';

import {
  useGetFavoriteIdsQuery,
  useToggleFavoriteMutation,
} from '@/lib/redux/common/favorites/favoritesSlice';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';

const HeartFilled = () => (
  <svg viewBox='0 0 24 24' className='w-4 h-4' aria-hidden='true'>
    <path
      fill='#ef4444'
      d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
    />
  </svg>
);

const HeartOutline = () => (
  <svg viewBox='0 0 24 24' className='w-4 h-4' aria-hidden='true'>
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

export default function FavoriteButton({ productId, className = '' }) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: userInfo } = useUserInfoQuery();
  const isLoggedIn = !!Cookies.get('token') && !!userInfo?._id;

  const { data: idsData } = useGetFavoriteIdsQuery(undefined, {
    skip: !isLoggedIn,
  });

  const [toggleFavorite, { isLoading }] = useToggleFavoriteMutation();

  const isFavourited = isLoggedIn
    ? (idsData?.data?.ids?.includes(productId) ?? false)
    : false;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push(`/auth/login?pathName=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isLoading) return;
    toggleFavorite(productId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      aria-label={
        !isLoggedIn
          ? 'Sign in to save this design'
          : isFavourited
            ? 'Remove from favourites'
            : 'Add to favourites'
      }
      title={!isLoggedIn ? 'Sign in to save this design' : undefined}
      className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:scale-110 active:scale-95 transition-transform duration-150 disabled:opacity-60 ${className}`}
    >
      {isFavourited ? <HeartFilled /> : <HeartOutline />}
    </button>
  );
}
