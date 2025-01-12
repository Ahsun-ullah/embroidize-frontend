'use client';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed ? (
          <Link href={'/admin'} className="sidebar-text">
            <Image src={'/twitter-bird-logo-pictures-0.png'} alt='logo' width={50} height={50} />
          </Link>
        ) : (
          '*'
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="collapse-btn"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      <ul>
        <li>
          <Link href="/admin">
            {!isCollapsed ? (
              <span className="sidebar-text">Dashboard</span>
            ) : (
              '*'
            )}
          </Link>
        </li>
        <li>
          <Link href="/admin/users">Users</Link>
        </li>
        <li>
          <Link href="/admin/settings">Settings</Link>
        </li>
        <li>
          <Link href="/admin/reports">Reports</Link>
        </li>
      </ul>
    </div>
  );
}
