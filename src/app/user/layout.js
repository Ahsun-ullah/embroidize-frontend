// 'use client';
import CategorySelect from '@/components/Common/CategorySelect';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import { Divider } from '@heroui/react';

export default function UserLayout({ children }) {
  return (
    <>
      <Header />
      <Divider />
      <div className='text-black h-12 flex items-center justify-center bg-white'>
        <div>
          <CategorySelect />
        </div>
      </div>
      <main className='admin-content'>{children}</main>
      <Footer />
    </>
  );
}
