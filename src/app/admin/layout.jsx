'use client';

export const dynamic = 'force-dynamic';

import { AuthProvider } from '@/lib/providers/AuthProvider';
import { useState } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AuthProvider
      protectedRoutes={['/admin']}
      exactProtectedRoutes={[]}
      loginPath='/auth/login'
      defaultRedirect='/'
    >
      <div className='min-h-screen bg-slate-50'>
        <AdminHeader isCollapsed={isCollapsed} />
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* main content area */}
        <div
          className={`
            pt-16
            transition-all
            ${isCollapsed ? 'pl-16' : 'pl-64'}
          `}
        >
          <main className='px-4 md:px-6 py-6 mb-16'>{children}</main>
          <p className='text-center pb-4'>
            All rights reserved © Embroidize 2024
          </p>
        </div>
      </div>
    </AuthProvider>
  );
}
