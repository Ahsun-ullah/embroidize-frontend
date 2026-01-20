'use client';

import Link from 'next/link';
import ProfileDropdown from '../Common/ProfileDropdown';

export default function AdminHeader({ isCollapsed }) {
  // Sidebar width in px
  const sidebarWidth = isCollapsed ? 56 : 224;

  return (
    <header
      style={{
        left: sidebarWidth,
        width: `calc(100% - ${sidebarWidth}px)`,
      }}
      className={`
        fixed top-0
        z-40
        flex items-center justify-between
        h-16
        bg-slate-900
        text-white
        px-4 md:px-6
        shadow-sm
        transition-all duration-200
      `}
    >
      <Link
        href='/'
        className='text-sm md:text-base text-black font-medium px-4 py-1.5 rounded-sm bg-blue-50 hover:bg-blue-950 hover:text-white transition-colors'
      >
        Visit Website
      </Link>
      <div className='flex items-center gap-3'>
        <ProfileDropdown />
      </div>
    </header>
  );
}
