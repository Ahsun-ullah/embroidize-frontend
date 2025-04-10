'use client';
import CategorySelect from '@/components/Common/CategorySelect';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';

export default function UserLayout({ children }) {
  return (
    <>
      <Header />
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
