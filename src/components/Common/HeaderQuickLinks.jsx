'use client';

import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import Cookies from 'js-cookie';
import { Download, Heart } from 'lucide-react';
import Link from 'next/link';

const QUICK_LINKS = [
  {
    href: '/user/user-details?tabName=favourites',
    Icon: (
      <Heart
        className='h-6 w-6 fill-red-500 text-red-500 transition-all duration-200 group-hover:scale-110'
        strokeWidth={1.8}
      />
    ),
    label: 'My Favourites',
  },
  {
    href: '/user/user-details?tabName=downloads',
    Icon: (
      <Download
        className='h-6 w-6 text-neutral-800 dark:text-white transition-all duration-200 group-hover:-translate-y-0.5'
        strokeWidth={2.4}
      />
    ),
    label: 'Downloads',
  },
];
export default function HeaderQuickLinks() {
  const token = Cookies.get('token');
  const isLoggedIn = !!token;

  const { data: userInfoData } = useUserInfoQuery(undefined, {
    skip: !isLoggedIn,
  });

  if (!isLoggedIn || userInfoData?.role === 'admin') return null;

  return (
    <div className='hidden md:flex items-center gap-2'>
      {QUICK_LINKS.map(({ href, Icon, label }) => (
        <Link
          key={href}
          href={href}
          prefetch={false}
          aria-label={label}
          title={label}
          className='group flex h-12 w-12 items-center justify-center rounded-full bg-white transition-all duration-300 hover:bg-gray-100 hover:shadow-md hover:scale-110 dark:bg-transparent dark:hover:bg-neutral-800'
        >
          {Icon}
        </Link>
      ))}
    </div>
  );
}
