'use client';

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
} from '@heroui/navbar';
import { Divider } from '@heroui/react';
import Link from 'next/link';

import CategoryMenu from '@/components/Common/CategoryMenu';
import SearchBox from '@/components/Common/SearchBox';
import UserProfileDropdown from '@/components/Common/UserProfileDropdown';
import { siteConfig } from '@/lib/datas/page';
import Image from 'next/image';
import { useState } from 'react';
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
              {/* Mobile image (shown on screens smaller than `sm`) */}
              <Image
                src={mobileLogo || '/mobile-placeholder.svg'}
                alt='Mobile Company Logo'
                fill
                sizes='(max-width: 640px) 80px'
                priority
                className='object-contain block sm:hidden'
              />

              {/* Desktop image (shown on screens `sm` and larger) */}
              <Image
                src={mainLogo || '/desktop-placeholder.svg'}
                alt='Desktop Company Logo'
                fill
                sizes='(min-width: 640px) 100px, 120px'
                priority
                className='object-contain hidden sm:block'
              />
            </Link>
            <div className='sm:flex items-center gap-x-2 text-base font-semibold text-gray-700'>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='flex items-center gap-2 text-gray-800'
              >
                <i className='ri-menu-2-line' />
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

          <NavbarMenu>
            <div className='px-4 py-2 flex flex-col gap-3'>
              <SearchBox />
              {siteConfig?.navMenuItems?.length > 0 ? (
                siteConfig.navMenuItems.map((item, index) => (
                  <NavbarMenuItem key={`${item.href}-${index}`}>
                    <Link
                      href={item.href}
                      className='text-base hover:underline'
                      aria-current={item.href === '/' ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </NavbarMenuItem>
                ))
              ) : (
                <div>No menu items available</div>
              )}
              <UserProfileDropdown />
            </div>
          </NavbarMenu>
        </div>
      </HeroUINavbar>

      {/* Divider and Category Bar */}
      <Divider className='bg-gray-300' />
      <div className='bg-white '>
        <CategoryMenu isMobileMenuOpen={isMobileMenuOpen} />
      </div>
      <Divider className='bg-gray-300' />
    </>
  );
};

export default Header;
