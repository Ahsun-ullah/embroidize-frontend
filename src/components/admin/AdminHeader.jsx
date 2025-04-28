import Link from 'next/link';
import ProfileDropdown from '../Common/ProfileDropdown';

export default function AdminHeader({ isCollapsed }) {
  return (
    <header className={`admin-header ${isCollapsed ? 'collapsed' : ''}`}>
      <Link
        href={'/'}
        className='text-black font-medium px-6 py-1 rounded-sm bg-blue-50 hover:bg-blue-950 hover:text-white'
      >
        Visit Website
      </Link>
      <div className='header-actions'>
        <ProfileDropdown />
      </div>
    </header>
  );
}
