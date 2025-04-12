'use client';
import GlobalLoadingPage from '@/components/Common/GlobalLoadingPage';
import UsersTableWrapper from '@/features/users/UsersTableWrapper';
import { useAllUsersQuery } from '@/lib/redux/admin/users/userSlice';

export default function AllUsersListPage() {
  const { data: users, isLoading: usersIsloading } = useAllUsersQuery();

  const columns = [
    { name: 'ID', uid: 'id' },
    { name: 'NAME', uid: 'name' },
    { name: 'EMAIL', uid: 'email' },
    { name: 'STATUS', uid: 'status' },
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
          searchableFieldsName={['name', 'status', 'email']}
        />
      )}
    </div>
  );
}
