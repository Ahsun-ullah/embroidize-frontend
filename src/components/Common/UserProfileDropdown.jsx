'use client';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
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
import LoadingSpinner from './LoadingSpinner';

export default function UserProfileDropdown() {
  const token = Cookies.get('token');
  const isLoggedIn = !!token;

  const {
    data: userInfoData,
    isLoading,
    refetch: userInfoRefetch,
  } = useUserInfoQuery();

  const handleLogout = () => {
    Cookies.remove('token');
    userInfoRefetch();
  };

  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
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
                  src={userInfoData?.image}
                />
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  isBordered
                  key='profile'
                  className='p-2 gap-2 border-dashed'
                >
                  <p className='font-semibold'>{userInfoData?.name} </p>
                  <p className='font-medium'>{userInfoData?.email} </p>
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
                  <button onClick={handleLogout}>
                    <span className='font-semibold'>Log Out</span>
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
                  size='sm'
                  radius='md'
                  className='bg-black text-white hover:bg-slate-700 font-bold px-4 text-sm'
                >
                  Sign In
                </Button>
              </NavbarItem>
            </NavbarContent>
          )}
        </NavbarMenuItem>
      )}
    </div>
  );
}
