'use client';

import { Navbar as HeroUINavbar, NavbarContent } from '@heroui/navbar';
import { Divider } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import CategoryMenu from '@/components/Common/CategoryMenu';
import SearchBox from '@/components/Common/SearchBox';

const mainLogo = '/logo-black.png';
const mobileLogo = '/favicon.png';

import dynamic from 'next/dynamic';

const UserProfileDropdown = dynamic(
  () => import('@/components/Common/UserProfileDropdown'),
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
              <SearchBox onFocusChange={setIsSearchFocused} />
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
              {/* <Link
                href='/subscriptions'
                prefetch={false}
                aria-label='Subscriptions'
                className='flex items-center justify-center rounded px-2 py-2 font-bold text-gray-800 transition-colors hover:text-blue-600 focus:outline-none focus-visible:ring focus-visible:ring-gray-400'
              >
                <i
                  className='ri-vip-crown-line text-[20px] sm:text-[22px]'
                  aria-hidden='true'
                />
                <span className='hidden sm:inline ml-2 text-sm md:text-base'>
                  Subscriptions
                </span>
              </Link> */}

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
        className={`bg-white overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-[80%] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <CategoryMenu isMobileMenuOpen={isMobileMenuOpen} />
      </div>

      <Divider className='bg-gray-300' />

      
    </>
  );
};

export default Header;
