export const dynamic = 'force-dynamic';

import DashboardCharts from '@/features/dashboard/components/DashboardCharts';
import { getCustomOrderCount } from '@/lib/apis/protected/customOrders';
import { getNewReviewCount } from '@/lib/apis/protected/adminReviews';
import { getDashboardStatsAPI } from '@/lib/apis/protected/users';
import { getProducts } from '@/lib/apis/public/products';
import Link from 'next/link';

export default async function AdminDashboard() {
  // 1. Fetch Aggregated Stats from Backend (Fast)
  const stats = await getDashboardStatsAPI();
  const { total: customOrderTotal } = await getCustomOrderCount();
  const newReviewCount = await getNewReviewCount();

  // 2. Fetch Product Count (keep existing logic or create similar aggregated endpoint)
  const productsResponse = await getProducts('', 1, 1);
  const totalProducts = productsResponse?.totalCount || 0;

  if (!stats) {
    return <div>Error loading dashboard data.</div>;
  }

  const {
    totalUsers,
    totalDownloads,
    formattedUserData,
    formattedCountryData,
    formattedDownloadData,
  } = stats;

  return (
    <div className='dashboard p-6'>
      <h1 className='text-xl font-bold mb-2'>Welcome to the Admin Dashboard</h1>
      <p className='text-medium font-semibold mb-6'>
        This is where you can manage users, view reports, and adjust settings.
      </p>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8'>
        <div className='bg-white rounded shadow p-4 flex flex-col items-center'>
          <span className='text-2xl font-bold'>{totalProducts}</span>
          <span className='text-gray-500 mt-2'>Total Products</span>
        </div>
        <div className='bg-white rounded shadow p-4 flex flex-col items-center'>
          <span className='text-2xl font-bold'>{totalUsers}</span>
          <span className='text-gray-500 mt-2'>Total Users</span>
        </div>
        <div className='bg-white rounded shadow p-4 flex flex-col items-center'>
          <span className='text-2xl font-bold'>{totalDownloads}</span>
          <span className='text-gray-500 mt-2'>Total Downloads</span>
        </div>
        <div className='bg-white rounded shadow p-4 flex flex-col items-center'>
          <span className='text-2xl font-bold'>
            {formattedCountryData?.length || 0}
          </span>
          <span className='text-gray-500 mt-2'>Top Countries</span>
        </div>
        <Link
          href='/admin/custom-orders'
          className='bg-white rounded shadow p-4 flex flex-col items-center'
        >
          <span className='text-2xl font-bold'>
            {customOrderTotal || 0}
          </span>
          <span className='text-gray-500 mt-2'>Custom Orders</span>
        </Link>

        <Link
          href='/admin/reviews'
          className='relative bg-white rounded shadow p-4 flex flex-col items-center'
        >
          {newReviewCount > 0 && (
            <span className='absolute top-2 right-2 flex h-3 w-3'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-3 w-3 bg-red-500'></span>
            </span>
          )}
          <span className='text-2xl font-bold'>{newReviewCount || 0}</span>
          <span className='text-gray-500 mt-2'>New Reviews</span>
        </Link>
      </div>

      <div className='mb-8'>
        <DashboardCharts
          userData={formattedUserData}
          downloadData={formattedDownloadData}
          locationData={formattedCountryData}
        />
      </div>
    </div>
  );
}
