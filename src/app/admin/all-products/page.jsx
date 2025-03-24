import LoadingSpinner from '@/components/Common/LoadingSpinner';
import UserTableWrapper from '@/features/products/components/UserTableWrapper';
import { Suspense } from 'react';

const getProducts = async () => {
  const data = [
    {
      _id: 16345,
      name: 'John Doe',
      age: 30,
      role: 'Admin',
      team: 'Team A',
      email: 'john@example.com',
      status: 'active',
    },
    {
      _id: 2,
      name: 'Jane Smith',
      age: 25,
      role: 'User',
      team: 'Team B',
      email: 'jane@example.com',
      status: 'paused',
    },
    {
      _id: 3,
      name: 'Sarah Brown',
      age: 40,
      role: 'Manager',
      team: 'Team C',
      email: 'sarah@example.com',
      status: 'vacation',
    },
    {
      _id: 4,
      name: 'Michael Johnson',
      age: 32,
      role: 'Admin',
      team: 'Team A',
      email: 'michael@example.com',
      status: 'active',
    },
    {
      _id: 5,
      name: 'Emily Davis',
      age: 29,
      role: 'User',
      team: 'Team B',
      email: 'emily@example.com',
      status: 'paused',
    },
    {
      _id: 6,
      name: 'David Wilson',
      age: 35,
      role: 'Manager',
      team: 'Team C',
      email: 'david@example.com',
      status: 'active',
    },
  ];
  return data;
};

export default async function AllProductsListPage() {
  const data = await getProducts();

  console.log(data);

  const columns = [
    { name: 'ID', uid: 'id' },
    { name: 'NAME', uid: 'name', sortable: true },
    { name: 'AGE', uid: 'age', sortable: true },
    { name: 'ROLE', uid: 'role', sortable: true },
    { name: 'TEAM', uid: 'team' },
    { name: 'EMAIL', uid: 'email' },
    { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div className='flex flex-col gap-3'>
      <Suspense fallback={<LoadingSpinner />}>
        <UserTableWrapper
          initialData={data}
          columns={columns}
          pageSize={5}
          searchableFieldsName={['name', 'status', 'email', 'age']}
        />
      </Suspense>
    </div>
  );
}
