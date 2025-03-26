import LoadingSpinner from '@/components/Common/LoadingSpinner';
import UsersTableWrapper from '@/features/users/UsersTableWrapper';
import { Suspense } from 'react';

const getUsers = async () => {
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
    {
      _id: 7,
      name: 'Lisa Martinez',
      age: 28,
      role: 'User',
      team: 'Team A',
      email: 'lisa@example.com',
      status: 'active',
    },
    {
      _id: 8,
      name: 'Robert Taylor',
      age: 45,
      role: 'Manager',
      team: 'Team B',
      email: 'robert@example.com',
      status: 'vacation',
    },
    {
      _id: 9,
      name: 'Anna Lee',
      age: 33,
      role: 'Admin',
      team: 'Team C',
      email: 'anna@example.com',
      status: 'active',
    },
    {
      _id: 10,
      name: 'Thomas Green',
      age: 27,
      role: 'User',
      team: 'Team B',
      email: 'thomas@example.com',
      status: 'paused',
    },
    {
      _id: 11,
      name: 'Kelly White',
      age: 38,
      role: 'Manager',
      team: 'Team A',
      email: 'kelly@example.com',
      status: 'active',
    },
    {
      _id: 12,
      name: 'James Carter',
      age: 31,
      role: 'Admin',
      team: 'Team C',
      email: 'james@example.com',
      status: 'paused',
    },
    {
      _id: 13,
      name: 'Megan Adams',
      age: 26,
      role: 'User',
      team: 'Team A',
      email: 'megan@example.com',
      status: 'active',
    },
    {
      _id: 14,
      name: 'Brian Evans',
      age: 39,
      role: 'Manager',
      team: 'Team B',
      email: 'brian@example.com',
      status: 'vacation',
    },
    {
      _id: 15,
      name: 'Sophie Clark',
      age: 34,
      role: 'Admin',
      team: 'Team A',
      email: 'sophie@example.com',
      status: 'active',
    },
    {
      _id: 16,
      name: 'Oliver King',
      age: 29,
      role: 'User',
      team: 'Team C',
      email: 'oliver@example.com',
      status: 'paused',
    },
    {
      _id: 17,
      name: 'Rachel Moore',
      age: 42,
      role: 'Manager',
      team: 'Team A',
      email: 'rachel@example.com',
      status: 'active',
    },
    {
      _id: 18,
      name: 'Daniel Scott',
      age: 36,
      role: 'Admin',
      team: 'Team B',
      email: 'daniel@example.com',
      status: 'vacation',
    },
    {
      _id: 19,
      name: 'Laura Hill',
      age: 24,
      role: 'User',
      team: 'Team C',
      email: 'laura@example.com',
      status: 'active',
    },
    {
      _id: 20,
      name: 'Peter Baker',
      age: 37,
      role: 'Manager',
      team: 'Team B',
      email: 'peter@example.com',
      status: 'paused',
    },
    {
      _id: 21,
      name: 'Grace Turner',
      age: 31,
      role: 'Admin',
      team: 'Team A',
      email: 'grace@example.com',
      status: 'active',
    },
  ];
  return data;
};

export default async function AllUsersListPage() {
  const data = await getUsers();

  const columns = [
    { name: 'ID', uid: 'id' },
    { name: 'NAME', uid: 'name' },
    { name: 'AGE', uid: 'age' },
    { name: 'ROLE', uid: 'role' },
    { name: 'TEAM', uid: 'team' },
    { name: 'EMAIL', uid: 'email' },
    { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div className='flex flex-col gap-3'>
      <Suspense fallback={<LoadingSpinner />}>
        <UsersTableWrapper
          initialData={data}
          columns={columns}
          pageSize={10}
          searchableFieldsName={['name', 'status', 'email', 'age']}
        />
      </Suspense>
    </div>
  );
}
