import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { AuthProvider } from '@/lib/providers/AuthProvider';
import { Divider } from '@heroui/react';
import { Suspense } from 'react';

export default function UserLayout({ children }) {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <Divider />
      <AuthProvider
        protectedRoutes={['/admin', '/user']}
        exactProtectedRoutes={[]}
        loginPath='/auth/login'
        defaultRedirect='/'
      >
        <main className='admin-content'>{children}</main>
      </AuthProvider>
      <Footer />
    </>
  );
}
