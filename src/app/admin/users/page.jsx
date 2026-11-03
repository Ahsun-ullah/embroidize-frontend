import UsersTableWrapper from '@/features/users/UsersTableWrapper';
import { readUserFilters } from '@/features/users/userFilters';
import { getUsers } from '@/lib/apis/protected/users';

export default async function AllUsersListPage({ searchParams }) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const filters = readUserFilters(params);

  const { data: users, pagination, stats } = await getUsers(page, 10, filters);

  const columns = [
    { name: 'ID', uid: 'id' },
    { name: 'NAME', uid: 'name' },
    { name: 'EMAIL', uid: 'email' },
    { name: 'PLAN', uid: 'plan' },
    { name: 'DOWNLOAD', uid: 'downloadCount' },
    { name: `LAST ${Math.min(Number(filters.window) || 30, 730)} DAYS`, uid: 'activity' },
    { name: 'SUBSCRIPTION', uid: 'subscriptionState' },
    { name: 'SIGNUP VIA', uid: 'provider' },
    { name: 'Registration Date', uid: 'createdAt' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div className='flex flex-col gap-3'>
      <UsersTableWrapper
        initialData={users ?? []}
        pagination={pagination}
        stats={stats}
        columns={columns}
      />
    </div>
  );
}
