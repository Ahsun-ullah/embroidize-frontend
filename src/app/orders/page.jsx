import MyOrdersList from '@/features/customOrders/MyOrdersList';

export const metadata = {
  title: 'My Custom Orders | Embroidize',
  robots: { index: false, follow: false },
};

// Guest-facing My Orders — works with either a login token or a magic-link
// order session. Registered users can also use /user/custom-order.
export default function OrdersPage() {
  return (
    <div className='mx-auto max-w-3xl px-4 py-10'>
      <h1 className='mb-6 text-2xl font-bold'>My Custom Orders</h1>
      <MyOrdersList />
    </div>
  );
}
