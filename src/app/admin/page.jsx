import DashboardCharts from '@/features/dashboard/components/DashboardCharts';
import { getCustomOrderStats } from '@/lib/apis/protected/customOrders';
import { getDashboardStatsAPI } from '@/lib/apis/protected/users';
import { getProducts } from '@/lib/apis/public/products';
import Link from 'next/link';

export default async function AdminDashboard() {
  // 1. Fetch Aggregated Stats from Backend (Fast)
  const stats = await getDashboardStatsAPI();
  const { stats: customOrderStats } = await getCustomOrderStats();

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

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
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
            {customOrderStats?.total || 0}
          </span>
          <span className='text-gray-500 mt-2'>Custom Orders</span>
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
