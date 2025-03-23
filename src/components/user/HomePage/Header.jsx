import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Link } from '@heroui/link';
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@heroui/navbar';
import { link as linkStyles } from '@heroui/theme';
import clsx from 'clsx';
import NextLink from 'next/link';

import { SearchIcon } from '@/components/icons';
import { headerLogo } from '@/lib/datas/page';
import { siteConfig } from '@/utils/data/page';
import Image from 'next/image';

export const Header = ({ session }) => {
  const searchInput = (
    <Input
      aria-label='Search'
      classNames={{
        inputWrapper: 'bg-default-100',
        input: 'text-sm',
      }}
      labelPlacement='outside'
      placeholder='Search...'
      startContent={
        <SearchIcon className='text-base text-default-400 pointer-events-none flex-shrink-0' />
      }
      type='search'
    />
  );

  return (
    <HeroUINavbar maxWidth='xl' position='sticky'>
      <NavbarContent className='basis-1/5 sm:basis-full' justify='start'>
        <NavbarBrand as='li' className='gap-3 max-w-fit'>
          <NextLink className='flex justify-start items-center gap-1' href='/'>
            <Image
              onClick={() => router.push('/')}
              style={{
                height: '10%',
                width: '10%',
              }}
              src={headerLogo}
              width={0}
              height={0}
              alt='Logo'
              className='mr-2 max-sm:hidden'
            />
            <p className='font-bold text-inherit'>Embroid</p>
          </NextLink>
        </NavbarBrand>
        <ul className='hidden lg:flex gap-4 justify-start ml-2'>
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

      <NavbarContent
        className='hidden sm:flex basis-1/5 sm:basis-full'
        justify='end'
      >
        <NavbarItem className='hidden lg:flex'>{searchInput}</NavbarItem>
        <NavbarItem className='hidden md:flex'>
          {session?.user ? (
            <div className='items-center' justify='end'>
              <Dropdown placement='bottom-end' className='text-black'>
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as='button'
                    className='transition-transform'
                    color='primary'
                    name='Jason Hughes'
                    size='sm'
                    src={session?.user?.image}
                  />
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    isBordered
                    key='profile'
                    className='h-14 gap-2 border-dashed'
                  >
                    <p className='font-semibold'>{session?.user?.name} </p>
                  </DropdownItem>
                  <DropdownItem key='logout' isBordered className='p-2'>
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          ) : (
            <NavbarContent justify='end'>
              <NavbarContent className='' justify='end'></NavbarContent>
              <NavbarItem>
                <Button
                  as={Link}
                  color='primary'
                  href='/auth/login'
                  variant='flat'
                  size='sm'
                  radius='large'
                  className='button text-black font-bold'
                >
                  Sign In
                </Button>
              </NavbarItem>
            </NavbarContent>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className='sm:hidden basis-1 pl-4' justify='end'>
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className='mx-4 mt-2 flex flex-col gap-2'>
          {siteConfig?.navMenuItems?.length > 0 &&
            siteConfig?.navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link color={'foreground'} href={item.href} size='lg'>
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
          <NavbarMenuItem>
            {session?.user ? (
              <div>
                <Dropdown placement='bottom-end' className='text-black'>
                  <DropdownTrigger>
                    <Avatar
                      isBordered
                      as='button'
                      className='transition-transform'
                      color='primary'
                      name='Jason Hughes'
                      size='sm'
                      src={session?.user?.image}
                    />
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem
                      isBordered
                      key='profile'
                      className='h-14 gap-2 border-dashed'
                    >
                      <p className='font-semibold'>{session?.user?.name} </p>
                    </DropdownItem>
                    <DropdownItem key='logout' isBordered className='p-2'>
                      Log Out
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            ) : (
              <NavbarContent>
                <NavbarItem>
                  <Button
                    as={Link}
                    color='primary'
                    href='/auth/login'
                    variant='flat'
                    size='sm'
                    radius='large'
                    className='button text-black font-bold'
                  >
                    Sign In
                  </Button>
                </NavbarItem>
              </NavbarContent>
            )}
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
