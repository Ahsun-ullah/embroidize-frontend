import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
} from '@heroui/navbar';
import Link from 'next/link';

import CategorySelect from '@/components/Common/CategorySelect';
import SearchBox from '@/components/Common/SearchBox';
import UserProfileDropdown from '@/components/Common/UserProfileDropdown';
import { siteConfig } from '@/lib/datas/page';
import { Divider } from '@heroui/react';

export const Header = () => {
  return (
    <>
      <HeroUINavbar
        maxWidth='full'
        position='sticky'
        className='h-[5.5rem] z-50'
      >
        <div className='container flex items-center'>
          <NavbarContent justify='start'>
            <NavbarBrand as='li' className='gap-3 max-w-fit'>
              <Link href='/' className='flex items-center gap-2'>
                <i className='ri-centos-fill text-3xl'></i>
                <p className='font-bold text-lg hidden sm:block'>Embroid</p>
              </Link>
            </NavbarBrand>
          </NavbarContent>

          <NavbarContent justify='center' className='flex-1'>
            <SearchBox />
          </NavbarContent>

          <NavbarContent justify='end'>
            <UserProfileDropdown />
          </NavbarContent>

          <NavbarMenu>
            <div className='px-4 py-2 flex flex-col gap-3'>
              <SearchBox />
              {Array.isArray(siteConfig?.navMenuItems) &&
                siteConfig.navMenuItems.map((item, index) => (
                  <NavbarMenuItem key={`${item.href}-${index}`}>
                    <Link href={item.href} className='text-base'>
                      {item.label}
                    </Link>
                  </NavbarMenuItem>
                ))}
              <UserProfileDropdown />
            </div>
          </NavbarMenu>
        </div>
      </HeroUINavbar>

      {/* Divider and Category Bar */}
      <Divider className='my-0' />
      <div className='flex flex-wrap items-center justify-center gap-x-10 py-3 text-wrap bg-white'>
        <CategorySelect />
      </div>
    </>
  );
};
