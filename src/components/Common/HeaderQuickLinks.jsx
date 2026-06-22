'use client';

import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import Cookies from 'js-cookie';
import { Crown, Download, Heart } from 'lucide-react';
import Link from 'next/link';

// Quick-access shortcuts shown in the header on desktop only. These mirror the
// destinations already available in the profile dropdown, so a logged-in user
// can jump straight to them without opening the menu.
const QUICK_LINKS = [
  {
    href: '/user/user-details?tabName=favourites',
    Icon: Heart,
    label: 'My Favourites',
  },
  {
    href: '/user/user-details?tabName=downloads',
    Icon: Download,
    label: 'Downloads',
  },
  {
    href: '/user/my-plan',
    Icon: Crown,
    label: 'My Plan',
  },
];

export default function HeaderQuickLinks() {
  const token = Cookies.get('token');
  const isLoggedIn = !!token;

  const { data: userInfoData } = useUserInfoQuery(undefined, {
    skip: !isLoggedIn,
  });

  // Only relevant for logged-in, non-admin users (admins get a dashboard link
  // in the dropdown instead). Rendering nothing keeps the header clean otherwise.
  if (!isLoggedIn || userInfoData?.role === 'admin') return null;

  return (
    // hidden on mobile, visible from the md breakpoint up
    <div className='hidden md:flex items-center gap-1'>
      {QUICK_LINKS.map(({ href, Icon, label }) => (
        <Link
          key={href}
          href={href}
          prefetch={false}
          aria-label={label}
          title={label}
          className='flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400'
        >
          <Icon className='h-[22px] w-[22px]' strokeWidth={2} aria-hidden='true' />
        </Link>
      ))}
    </div>
  );
}
