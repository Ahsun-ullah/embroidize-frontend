'use client';
import Link from 'next/link';

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="collapse-btn"
      >
        {isCollapsed ? '→' : '←'}
      </button>
      <ul>
        <li>
          <Link href="/admin">
            {' '}
            *{!isCollapsed && <span className="sidebar-text">Dashboard</span>}
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
