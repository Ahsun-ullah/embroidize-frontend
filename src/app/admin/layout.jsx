'use client';
import { useState } from 'react';
import AdminFooter from '../../components/admin/AdminFooter';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="admin-layout">
      <AdminHeader isCollapsed={isCollapsed} />
      <AdminSidebar setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed} />
      <div className={`admin-main ${isCollapsed ? 'collapsed' : ''}`}>
        <main className="admin-content">{children}</main>
      </div>
      <AdminFooter isCollapsed={isCollapsed} />
    </div>
  );
}
