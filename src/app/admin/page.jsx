import MostDownloadedProducts from '@/features/dashboard/components/MostDownloadedProducts';

export default function AdminDashboard({ searchParams }) {
  return (
    <div className='dashboard p-6'>
      <h1 className='text-xl font-bold mb-2'>Welcome to the Admin Dashboard</h1>
      <p className='text-medium font-semibold mb-6'>
        This is where you can manage users, view reports, and adjust settings.
      </p>
      <MostDownloadedProducts searchParams={searchParams} />
    </div>
  );
}
