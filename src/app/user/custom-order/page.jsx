import MyOrdersList from '@/features/customOrders/MyOrdersList';

export const metadata = {
  title: 'My Custom Orders | Embroidize',
  robots: { index: false, follow: false },
};

// Registered users' My Orders — lives under /user so it gets the existing
// AuthProvider gating from user/layout.js. Guests use /orders instead.
export default function UserCustomOrdersPage() {
  return (
    <div className='mx-auto max-w-3xl px-4 py-10'>
      <h1 className='mb-6 text-2xl font-bold'>My Custom Orders</h1>
      <MyOrdersList />
    </div>
  );
}
