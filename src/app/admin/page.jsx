import DashboardCharts from '@/features/dashboard/components/DashboardCharts';
import { getDownloadStats, getUsers } from '@/lib/apis/protected/users';
import { getProducts } from '@/lib/apis/public/products';

export default async function AdminDashboard({ searchParams }) {
  // Fetch all users for chart data
  const usersResponse = await getUsers();
  const allUsers = usersResponse?.data || [];

  // Fetch all download stats for chart data
  const allDownloadStatsResponse = await getDownloadStats(1, 10000);
  const allDownloadStats = allDownloadStatsResponse?.data || [];

  // 🔁 Fetch from server with search + pagination
  const allProducts = await getProducts('', 1, 20);

  // Process user data for chart
  const userDataForChart = allUsers.reduce((acc, user) => {
    const date = new Date(user?.createdAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const formattedUserData = Object.keys(userDataForChart)
    .map((date) => ({
      date,
      value: userDataForChart[date],
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Process download data for chart from allUsers' downloadHistory
  const downloadDataForChart = allUsers.reduce((acc, user) => {
    if (user.downloadHistory && Array.isArray(user.downloadHistory)) {
      user.downloadHistory.forEach((download) => {
        if (download.downloadedAt) {
          const date = new Date(download.downloadedAt)
            .toISOString()
            .split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
        } else {
          console.warn(
            'Skipping download entry due to missing downloadedAt:',
            download,
          );
        }
      });
    }
    return acc;
  }, {});

  const formattedDownloadData = Object.keys(downloadDataForChart)
    .map((date) => ({
      date,
      value: downloadDataForChart[date],
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group users by country (from ipInfo)
  const userCountryData = allUsers.reduce((acc, user) => {
    const country = user.ipInfo?.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  const formattedCountryData = Object.entries(userCountryData)
    .map(([country, count]) => ({
      country,
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className='dashboard p-6'>
      <h1 className='text-xl font-bold mb-2'>Welcome to the Admin Dashboard</h1>
      <p className='text-medium font-semibold mb-6'>
        This is where you can manage users, view reports, and adjust settings.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <div className='bg-white rounded shadow p-4 flex flex-col items-center'>
          <span className='text-2xl font-bold'>{allProducts?.totalCount}</span>
          <span className='text-gray-500 mt-2'>Total Products</span>
        </div>
        <div className='bg-white rounded shadow p-4 flex flex-col items-center'>
          <span className='text-2xl font-bold'>{allUsers.length}</span>
          <span className='text-gray-500 mt-2'>Total Users</span>
        </div>
        <div className='bg-white rounded shadow p-4 flex flex-col items-center'>
          <span className='text-2xl font-bold'>{allDownloadStats.length}</span>
          <span className='text-gray-500 mt-2'>Total Downloads</span>
        </div>
        <div className='bg-white rounded shadow p-4 flex flex-col items-center'>
          <span className='text-2xl font-bold'>
            {formattedCountryData.length}
          </span>
          <span className='text-gray-500 mt-2'>Countries</span>
        </div>
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
