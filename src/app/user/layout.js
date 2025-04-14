import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import { Divider } from '@heroui/react';

export default function UserLayout({ children }) {
  return (
    <>
      <Header />
      <Divider />
      <main className='admin-content'>{children}</main>
      <Footer />
    </>
  );
}
