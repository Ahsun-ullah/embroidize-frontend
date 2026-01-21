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

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <>
      <HeroUINavbar maxWidth='full' className='h-[5.5rem] z-50'>
        <div className='container mx-auto flex items-center justify-center gap-x-4'>
          <NavbarContent justify='start' className='flex-1'>
            <Link
              href='/'
              prefetch={false}
              aria-label='Go to homepage'
              className='relative w-[30px] h-[30px] sm:w-[60px] sm:h-[60px] md:w-[120px] md:h-[80px]'
            >
              <Image
                src={mobileLogo}
                alt='Embroidize Logo'
                fill
                priority
                sizes='(max-width: 640px) 80px'
                className='object-contain block sm:hidden'
              />

              <Image
                src={mainLogo}
                alt='Embroidize Logo'
                fill
                priority
                sizes='(min-width: 640px) 120px'
                className='object-contain hidden sm:block'
              />
            </Link>

            <div className='sm:flex items-center gap-x-2 text-base font-bold text-gray-700 sm:ms-6 md:ms-8'>
              <button
                onClick={toggleMenu}
                className='flex items-center gap-2 text-gray-800 font-bold focus:outline-none focus-visible:ring focus-visible:ring-gray-400 rounded'
                aria-expanded={isMobileMenuOpen}
                aria-controls='category-menu'
                type='button'
              >
                <i
                  className={`${
                    isMobileMenuOpen ? 'ri-menu-2-line' : 'ri-menu-3-line'
                  }`}
                  aria-hidden='true'
                />
                <span className='hidden sm:inline font-bold'>Categories</span>
              </button>
            </div>
          </NavbarContent>

          <NavbarContent justify='center' className='flex-1'>
            <SearchBox />
          </NavbarContent>

        

          <NavbarContent justify='end' className='flex-1'>
            <UserProfileDropdown />
          </NavbarContent>
        </div>
      </HeroUINavbar>

      <Divider className='bg-gray-300' />

      <div
        id='category-menu'
        className='bg-white overflow-auto transition-all ease-out duration-500 transform'
      >
        <CategoryMenu isMobileMenuOpen={isMobileMenuOpen} />
      </div>

      <Divider className='bg-gray-300' />
    </>
  );
};

export default Header;
