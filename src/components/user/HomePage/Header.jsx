import { Link } from '@heroui/link';
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
} from '@heroui/navbar';
import { link as linkStyles } from '@heroui/theme';
import clsx from 'clsx';
import NextLink from 'next/link';

import SearchBox from '@/components/Common/SearchBox';
import UserProfileDropdown from '@/components/Common/UserProfileDropdown';
import { headerLogo } from '@/lib/datas/page';
import { siteConfig } from '@/utils/data/page';
import Image from 'next/image';

export const Header = () => {
  return (
    <HeroUINavbar maxWidth='xl' position='sticky' className='h-[5.5rem]'>
      <NavbarContent justify='start'>
        <NavbarBrand as='li' className='gap-3 max-w-fit'>
          <NextLink className='flex justify-start items-center gap-1' href='/'>
            <Image
              style={{
                height: '20px',
                width: 'auto',
              }}
              src={headerLogo}
              width={0}
              height={0}
              alt='Logo'
              className='mr-2 max-sm:hidden'
            />
            <p className='font-bold text-lg'>Embroid</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent justify='center'>
        <SearchBox />
        <ul className=' gap-4 justify-start ml-2'>
          {siteConfig?.navItems?.lenght > 0 &&
            siteConfig?.navItems.map((item) => (
              <NavbarItem key={item.href}>
                <NextLink
                  className={clsx(
                    linkStyles({ color: 'foreground' }),
                    'data-[active=true]:text-primary data-[active=true]:font-medium',
                  )}
                  color='foreground'
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            ))}
        </ul>
      </NavbarContent>
      <NavbarContent justify='end'>
        <UserProfileDropdown />
      </NavbarContent>

      {/* for mobile view */}
      <NavbarMenu>
        <SearchBox />
        <div className='mx-4 mt-2 flex flex-col gap-2'>
          {siteConfig?.navMenuItems?.length > 0 &&
            siteConfig?.navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link color={'foreground'} href={item.href} size='lg'>
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
          <UserProfileDropdown />
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
