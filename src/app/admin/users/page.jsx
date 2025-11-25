import UsersTableWrapper from '@/features/users/UsersTableWrapper';
import { getUsers } from '@/lib/apis/protected/users';

export default async function AllUsersListPage({ searchParams }) {
  // 1. Extract params from URL
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search || '';
  const minDownloads = searchParams?.minDownloads || '';
  const startDate = searchParams?.startDate || '';
  const endDate = searchParams?.endDate || '';

  // 2. Fetch data with filters
  const usersResponse = await getUsers(
    page,
    10,
    search,
    minDownloads,
    startDate,
    endDate,
  );
  const { data: users, pagination } = usersResponse;

  const columns = [
    { name: 'ID', uid: 'id' },
    { name: 'NAME', uid: 'name' },
    { name: 'EMAIL', uid: 'email' },
    { name: 'DOWNLOAD', uid: 'downloadHistory' },
    { name: 'Registration Date', uid: 'createdAt' },
    { name: 'ACTIONS', uid: 'actions' },
  ];


  return (
    <div className='flex flex-col gap-3'>

      <UsersTableWrapper
        initialData={users ?? []}
        pagination={pagination} // Pass pagination from server
        columns={columns}
      />
    </div>
  );
}
