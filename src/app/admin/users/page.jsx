import UsersTableWrapper from '@/features/users/UsersTableWrapper';
import { getUsers } from '@/lib/apis/protected/users';

export default async function AllUsersListPage() {
  const usersResponse = await getUsers();
  const { data: users } = usersResponse;

  const columns = [
    { name: 'ID', uid: 'id' },
    { name: 'NAME', uid: 'name' },
    { name: 'EMAIL', uid: 'email' },
    { name: 'DOWNLOAD', uid: 'downloadHistory' },
    { name: 'Registration Date', uid: 'createdAt' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  console.log('object', users);

  return (
    <div className='flex flex-col gap-3'>
      <UsersTableWrapper
        initialData={users ?? []}
        columns={columns}
        searchableFieldsName={['name', 'createdAt', 'email']}
      />
    </div>
  );
}
