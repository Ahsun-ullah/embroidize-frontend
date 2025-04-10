import {
  userInfoSlice,
  useUserInfoQuery,
} from '@/lib/redux/common/user/userInfoSlice';
import {
  Avatar,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from '@heroui/react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

const ProfileDropdown = () => {
  const token = Cookies.get('token');
  const isLoggedIn = !!token;
  const dispatch = useDispatch();

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Dropdown placement={userInfoData?.email ? 'bottom-start' : 'bottom-end'}>
      <DropdownTrigger>
        {userInfoData?.email ? (
          <User
            as='button'
            avatarProps={{
              isBordered: true,
              src: 'https://avatars.githubusercontent.com/u/30373425?v=4',
            }}
            className='transition-transform gap-4'
            name={userInfoData?.name ?? 'User Name'}
            description={userInfoData?.email}
          />
        ) : (
          <Avatar
            isBordered
            as='button'
            className='transition-transform'
            src={userInfoData?.avatarSrc}
          />
        )}
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`${userInfoData?.email ? 'User' : 'Profile'} Actions`}
        variant='flat'
      >
        <DropdownItem key='profile' className='py-2 gap-2'>
          <p className='font-bold'>{userInfoData?.name ?? 'User Name'}</p>
          <p className='font-semibold text-xs'>
            {userInfoData?.email ?? 'user@gmail.com'}
          </p>
        </DropdownItem>
        <DropdownItem>
          <Divider />
        </DropdownItem>

        <DropdownItem key='logout' color='danger'>
          <Link
            href={'/auth/login'}
            onClick={() => {
              Cookies.remove('token');
              dispatch(userInfoSlice.util.resetApiState());
            }}
          >
            <span className='font-semibold'>Log Out</span>
          </Link>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
