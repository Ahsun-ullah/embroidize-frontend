'use client';

import { Navbar as HeroUINavbar, NavbarContent } from '@heroui/navbar';
import { Divider } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import CategoryMenu from '@/components/Common/CategoryMenu';
import SearchBox from '@/components/Common/SearchBox';
import UserProfileDropdown from '@/components/Common/UserProfileDropdown';

import mobileLogo from '../../../../public/favicon.png';
import mainLogo from '../../../../public/logo-black.png';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <HeroUINavbar maxWidth='full' className='h-[5.5rem] z-50'>
        <div className='container mx-auto flex items-center justify-center gap-x-4'>
          <NavbarContent justify='start' className='flex-1'>
            <Link
              href='/'
              className='relative block w-[20px] h-[80px] sm:w-[80px] sm:h-[80px] md:w-[120px] md:h-[120px]'
              aria-label='Navigate to homepage'
            >
              <Image
                src={mobileLogo}
                alt='Mobile Company Logo'
                fill
                sizes='(max-width: 640px) 80px'
                priority
                className='object-contain block sm:hidden'
              />
              <Image
                src={mainLogo}
                alt='Desktop Company Logo'
                fill
                sizes='(min-width: 640px) 100px, 120px'
                priority
                className='object-contain hidden sm:block'
              />
            </Link>

            {/* Toggle Category Menu Button */}
            <div className='sm:flex items-center gap-x-2 text-base font-semibold text-gray-700  sm:ms-6 md:ms-8'>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='flex items-center gap-2 text-gray-800'
              >
                {isMobileMenuOpen ? (
                  <i className='ri-menu-2-line' />
                ) : (
                  <i className='ri-menu-3-line' />
                )}
                <span className='hidden sm:flex'>Categories</span>
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

      <div className='bg-white overflow-auto transition-all ease-out duration-500 transform'>
        <CategoryMenu isMobileMenuOpen={isMobileMenuOpen} />
      </div>

      <Divider className='bg-gray-300' />
    </>
  );
};

export default Header;
