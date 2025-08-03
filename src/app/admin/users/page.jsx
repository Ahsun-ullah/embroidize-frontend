'use client';
import GlobalLoadingPage from '@/components/Common/GlobalLoadingPage';
import UsersTableWrapper from '@/features/users/UsersTableWrapper';
import { useAllUsersQuery } from '@/lib/redux/admin/users/userSlice';

export default function AllUsersListPage() {
  const { data: users, isLoading: usersIsloading } = useAllUsersQuery();

  console.log('user', users);

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
      {usersIsloading ? (
        <GlobalLoadingPage />
      ) : (
        <UsersTableWrapper
          initialData={users?.data ?? []}
          columns={columns}
          pageSize={5}
          searchableFieldsName={['name', 'createdAt', 'email']}
        />
      )}
    </div>
  );
}
