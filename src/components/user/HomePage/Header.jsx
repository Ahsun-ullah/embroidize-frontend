'use client';

import { Navbar as HeroUINavbar, NavbarContent } from '@heroui/navbar';
import { Divider } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState } from 'react';

import CategoryMenu from '@/components/Common/CategoryMenu';
import SearchBox from '@/components/Common/SearchBox';

const mainLogo = '/logo-black.png';
const mobileLogo = '/favicon.png';

import { CrownIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

const UserProfileDropdown = dynamic(
  () => import('@/components/Common/UserProfileDropdown'),
  { ssr: false },
);

// Static placeholder rendered during prerender while SearchBox suspends.
// SearchBox calls useSearchParams(), which — without a Suspense boundary —
// forces the ENTIRE page to bail out of static rendering
// (BAILOUT_TO_CLIENT_SIDE_RENDERING → empty HTML, invisible to crawlers).
// The boundary confines that to the search box; everything else stays SSR'd.
// Markup mirrors SearchBox's Input so there is no layout shift on hydration.
const SearchBoxFallback = () => (
  <div className='w-full min-w-0'>
    <div className='relative w-full'>
      <div
        aria-hidden='true'
        className='flex h-10 w-full items-center rounded-full border-2 border-gray-300 pe-14 ps-3 sm:h-11 sm:pe-16 md:h-12'
      >
        <span className='text-sm text-gray-500 sm:text-base'>
          Search designs...
        </span>
      </div>
    </div>
  </div>
);

const HeaderQuickLinks = dynamic(
  () => import('@/components/Common/HeaderQuickLinks'),
  { ssr: false },
);

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <>
      <HeroUINavbar
        maxWidth='full'
        className='h-auto min-h-[64px] sm:min-h-[76px] px-2 sm:px-4 md:px-6 z-50'
      >
        <div className='container  flex w-full items-center content-between gap-2 sm:gap-4'>
          {/* Left side */}
          <div
            className={`flex items-center gap-2 sm:gap-4 transition-all duration-300 ${
              isSearchFocused
                ? 'w-0 overflow-hidden opacity-0 lg:w-auto lg:overflow-visible lg:opacity-100'
                : 'w-auto opacity-100'
            }`}
          >
            <NavbarContent
              justify='start'
              className='flex flex-[0_0_auto] items-center gap-2 sm:gap-4'
            >
              <Link
                href='/'
                prefetch={false}
                aria-label='Go to homepage'
                className='relative block h-[34px] w-[34px] sm:h-[52px] sm:w-[95px] md:h-[72px] md:w-[110px] shrink-0'
              >
                <Image
                  src={mobileLogo}
                  alt='Embroidize Logo'
                  fill
                  priority
                  sizes='(max-width: 640px) 34px, 110px'
                  className='object-contain block sm:hidden'
                />
                <Image
                  src={mainLogo}
                  alt='Embroidize Logo'
                  fill
                  priority
                  sizes='(min-width: 640px) 110px'
                  className='object-contain hidden sm:block'
                />
              </Link>

              <button
                onClick={toggleMenu}
                className='flex items-center gap-2 rounded font-bold text-gray-800 focus:outline-none focus-visible:ring focus-visible:ring-gray-400'
                aria-expanded={isMobileMenuOpen}
                aria-controls='category-menu'
                type='button'
              >
                <i
                  className={`text-[20px] sm:text-[22px] ${
                    isMobileMenuOpen ? 'ri-menu-2-line' : 'ri-menu-3-line'
                  }`}
                  aria-hidden='true'
                />
                <span className='hidden md:inline text-sm lg:text-base'>
                  Categories
                </span>
              </button>
            </NavbarContent>
          </div>

          {/* Search */}
          <div className='min-w-0 flex-1 transition-all duration-300 flex items-center justify-center'>
            <div
              className={`w-full transition-all duration-300 ${
                isSearchFocused ? 'max-w-full ' : 'max-w-[720px]  '
              }`}
            >
              <Suspense fallback={<SearchBoxFallback />}>
                <SearchBox onFocusChange={setIsSearchFocused} />
              </Suspense>
            </div>
          </div>

          {isSearchFocused && (
            <button
              type='button'
              onClick={() => setIsSearchFocused(false)}
              className='shrink-0 text-sm font-medium text-gray-700 lg:hidden'
            >
              Cancel
            </button>
          )}

          {/* Right side */}
          <div
            className={`flex items-center gap-1 sm:gap-2 md:gap-3 transition-all duration-300 ${
              isSearchFocused
                ? 'w-0 overflow-hidden opacity-0 lg:w-auto lg:overflow-visible lg:opacity-100'
                : 'w-auto opacity-100'
            }`}
          >
            <NavbarContent
              justify='end'
              className='flex flex-[0_0_auto] items-center gap-1 sm:gap-2 md:gap-3'
            >
              <Link
                href='/subscriptions'
                prefetch={false}
                aria-label='Subscriptions'
                className='flex items-center justify-center rounded px-2 py-2 font-bold text-gray-800 transition-colors hover:text-yellow-500 focus:outline-none focus-visible:ring focus-visible:ring-gray-400'
              >
                <CrownIcon
                  fill='currentColor'
                  strokeWidth={1.8}
                  className='h-6 w-6 text-yellow-500'
                />

                <span className='hidden sm:inline ml-2 text-sm md:text-base'>
                  Pricing
                </span>
              </Link>

              {/* Desktop-only quick links (hidden on mobile) */}
              <HeaderQuickLinks />

              <div className='shrink-0'>
                <UserProfileDropdown />
              </div>
            </NavbarContent>
          </div>
        </div>
      </HeroUINavbar>

      <Divider className='bg-gray-300' />

      <div
        id='category-menu'
        className={` text-sm
    overflow-hidden transition-all duration-300 ease-in-out
    max-h-0 opacity-0
    md:max-h-full md:opacity-100 bg-white
    ${isMobileMenuOpen ? 'max-h-[80%] opacity-100' : ''}
  `}
      >
        <CategoryMenu isMobileMenuOpen={isMobileMenuOpen} />
      </div>

      <Divider className='bg-gray-300' />
    </>
  );
};

export default Header;
