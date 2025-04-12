import LoadingSpinner from '@/components/Common/LoadingSpinner';
import UsersTableWrapper from '@/features/users/UsersTableWrapper';
import { Suspense } from 'react';

export default async function AllUsersListPage() {
  const users = await getUsers();

  const columns = [
    { name: 'ID', uid: 'id' },
    { name: 'NAME', uid: 'name' },
    { name: 'EMAIL', uid: 'email' },
    { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div className='flex flex-col gap-3'>
      <Suspense fallback={<LoadingSpinner />}>
        <UsersTableWrapper
          initialData={users?.data}
          columns={columns}
          pageSize={5}
          searchableFieldsName={['name', 'status', 'email']}
        />
      </Suspense>
    </div>
  );
}
