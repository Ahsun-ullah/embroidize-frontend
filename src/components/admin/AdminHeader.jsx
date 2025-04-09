import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import ProfileDropdown from '../Common/ProfileDropdown';

export default function AdminHeader({ isCollapsed }) {
  const { data: userInfoData } = useUserInfoQuery();
  return (
    <header className={`admin-header ${isCollapsed ? 'collapsed' : ''}`}>
      <div className='logo'>Admin Dashboard</div>
      <div className='header-actions'>
        <ProfileDropdown userData={userInfoData} />
      </div>
    </header>
  );
}
