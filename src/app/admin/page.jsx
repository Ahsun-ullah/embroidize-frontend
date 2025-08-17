import DashboardCharts from '@/features/dashboard/components/DashboardCharts';
import { getDownloadStats, getUsers } from '@/lib/apis/protected/users';

export default async function AdminDashboard({ searchParams }) {
  const page = parseInt(searchParams.page || '1', 10);
  const perPage = parseInt(searchParams.perPage || '10', 10);

  // Fetch all users for chart data
  const usersResponse = await getUsers();
  const allUsers = usersResponse?.data || [];

  console.log('allUsers', allUsers);

  // Fetch all download stats for chart data (assuming API can handle large perPage)
  const allDownloadStatsResponse = await getDownloadStats(1, 10000); // Fetch a large number of items
  const allDownloadStats = allDownloadStatsResponse?.data || [];

  console.log('allDownloadStats', allDownloadStats);

  // Process user data for chart
  const userDataForChart = allUsers.reduce((acc, user) => {
    const date = new Date(user?.createdAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const formattedUserData = Object.keys(userDataForChart).map((date) => ({
    date,
    value: userDataForChart[date],
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Process download data for chart from allUsers' downloadHistory
  const downloadDataForChart = allUsers.reduce((acc, user) => {
    if (user.downloadHistory && Array.isArray(user.downloadHistory)) {
      user.downloadHistory.forEach(download => {
        if (download.downloadedAt) {
          const date = new Date(download.downloadedAt).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1; // Count each download event
        } else {
          console.warn('Skipping download entry due to missing downloadedAt:', download);
        }
      });
    }
    return acc;
  }, {});

  const formattedDownloadData = Object.keys(downloadDataForChart).map(
    (date) => ({
      date,
      value: downloadDataForChart[date],
    }),
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className='dashboard p-6'>
      <h1 className='text-xl font-bold mb-2'>Welcome to the Admin Dashboard</h1>
      <p className='text-medium font-semibold mb-6'>
        This is where you can manage users, view reports, and adjust settings.
      </p>
      <div className='mb-8'>
        <DashboardCharts
          userData={formattedUserData}
          downloadData={formattedDownloadData}
        />
      </div>
    </div>
  );
}
