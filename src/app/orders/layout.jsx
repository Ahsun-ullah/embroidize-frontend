import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { Divider } from '@heroui/react';

// Public chrome for the customer order hub (guest-accessible — no AuthProvider
// gating here; access is enforced per-request via order sessions).
export default function OrdersLayout({ children }) {
  return (
    <>
      <Header />
      <Divider />
      <main className='min-h-[60vh]'>{children}</main>
      <Footer />
    </>
  );
}
