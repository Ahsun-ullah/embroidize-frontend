'use client';

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
} from '@heroui/navbar';
import { Divider } from '@heroui/react';
import Link from 'next/link';

import CategorySelect from '@/components/Common/CategorySelect';
import SearchBox from '@/components/Common/SearchBox';
import UserProfileDropdown from '@/components/Common/UserProfileDropdown';
import { siteConfig } from '@/lib/datas/page';
import Image from 'next/image';
import mainLogo from '../../../../public/logo-black.png';

export const Header = () => {
  return (
    <>
      <HeroUINavbar
        maxWidth='full'
        position='sticky'
        className='h-[5.5rem] z-50'
      >
        <div className='container mx-auto flex items-center justify-center gap-x-4'>
          <NavbarContent justify='start' className='flex-1'>
            <Link
              href='/'
              className='w-[120] h-[120]'
              aria-label='Navigate to homepage'
            >
              <Image
                src={mainLogo}
                alt='Company Logo'
                className='object-contain'
              />
            </Link>
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
      <Divider className='bg-gray-200' />
      <div className='container mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 bg-white'>
        <CategorySelect />
      </div>
    </>
  );
};

export default Header;
