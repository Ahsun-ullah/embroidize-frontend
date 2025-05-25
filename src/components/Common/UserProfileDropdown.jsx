'use client';

import {
  userInfoSlice,
  useUserInfoQuery,
} from '@/lib/redux/common/user/userInfoSlice';
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  NavbarContent,
  NavbarItem,
  NavbarMenuItem,
} from '@heroui/react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

export default function UserProfileDropdown() {
  const token = Cookies.get('token');
  const isLoggedIn = !!token;
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    data: userInfoData,
    isLoading,
    refetch: userInfoRefetch,
  } = useUserInfoQuery(undefined, {
    skip: !isLoggedIn,
  });

  useEffect(() => {
    if (isLoggedIn) {
      userInfoRefetch();
    }
  }, [isLoggedIn, userInfoRefetch]);

  const handleLogout = () => {
    Cookies.remove('token');
    dispatch(userInfoSlice.util.resetApiState());
    router.push('/'); // Redirect to homepage after logout
  };

  if (isLoading) {
    return (
      <NavbarContent>
        <LoadingSpinner />
      </NavbarContent>
    );
  }

  if (userInfoData?.role === 'admin') {
    return (
      <NavbarContent>
        <Link
          href='/admin'
          className='button text-sm sm:text-sm md:text-lg xl:text-xl'
          aria-label='Go to admin dashboard'
        >
          Dashboard
        </Link>
      </NavbarContent>
    );
  }

  return (
    <div>
      <NavbarMenuItem>
        {isLoggedIn && userInfoData?.email ? (
          <Dropdown placement='bottom-start' className='text-black'>
            <DropdownTrigger>
              <Avatar
                isBordered
                as='button'
                className='transition-transform'
                color='primary'
                name={userInfoData?.name}
                size='sm'
                src={userInfoData?.profile_image?.url}
                aria-label='User profile menu'
              />
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                isBordered
                key='profile'
                className='p-3 gap-2 border-dashed'
              >
                <div className='flex items-center gap-x-4 text-base'>
                  <Avatar
                    isBordered
                    as='button'
                    className='transition-transform'
                    color='primary'
                    name={userInfoData?.name}
                    size='sm'
                    src={userInfoData?.profile_image?.url}
                    aria-hidden='true'
                  />
                  <div>
                    <p className='font-semibold'>{userInfoData?.name}</p>
                    <p className='font-medium'>{userInfoData?.email}</p>
                  </div>
                </div>
              </DropdownItem>

              <DropdownItem>
                <Link
                  href='/user/user-details?tabName=account'
                  className='flex text-base gap-1 font-medium'
                >
                  <i className='ri-account-circle-fill' aria-hidden='true'></i>
                  Account
                </Link>
              </DropdownItem>
              <DropdownItem>
                <Link
                  href='/user/user-details?tabName=downloads'
                  className='flex text-base gap-1 font-medium'
                >
                  <i className='ri-download-fill' aria-hidden='true'></i>
                  Downloads
                </Link>
              </DropdownItem>
              <DropdownItem>
                <Divider />
              </DropdownItem>
              <DropdownItem
                key='logout'
                isBordered
                className='p-2'
                color='danger'
              >
                <button
                  onClick={handleLogout}
                  type='button'
                  className='font-semibold flex text-base gap-1 w-full'
                  aria-label='Log out'
                >
                  Log Out
                </button>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <NavbarContent>
            <NavbarItem>
              <Button
                as={Link}
                color='primary'
                href='/auth/login'
                variant='flat'
                size='md'
                radius='full'
                className='bg-black text-white hover:bg-slate-700 font-bold px-4 text-base'
                aria-label='Sign in'
              >
                Sign In
              </Button>
            </NavbarItem>
          </NavbarContent>
        )}
      </NavbarMenuItem>
    </div>
  );
}
