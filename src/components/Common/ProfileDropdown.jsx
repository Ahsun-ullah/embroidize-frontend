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

const ProfileDropdown = ({ userData }) => {
  return (
    <Dropdown placement={userData?.email ? 'bottom-start' : 'bottom-end'}>
      <DropdownTrigger>
        {userData?.email ? (
          <User
            as='button'
            avatarProps={{
              isBordered: true,
              src: 'https://avatars.githubusercontent.com/u/30373425?v=4',
            }}
            className='transition-transform gap-4'
            name={userData?.name ?? 'User Name'}
            description={userData?.email}
          />
        ) : (
          <Avatar
            isBordered
            as='button'
            className='transition-transform'
            src={userData?.avatarSrc}
          />
        )}
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`${userData?.email ? 'User' : 'Profile'} Actions`}
        variant='flat'
      >
        <DropdownItem key='profile' className='py-2 gap-2'>
          <p className='font-bold'>{userData?.name ?? 'User Name'}</p>
          <p className='font-semibold text-xs'>
            {userData?.email ?? 'user@gmail.com'}
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
