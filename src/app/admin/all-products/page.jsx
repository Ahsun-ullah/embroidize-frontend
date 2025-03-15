import React from 'react';
import UserTable from '../../../components/Common/Table';

const AllProductsListPage = () => {
  const INITIAL_VISIBLE_COLUMNS = ['name', 'role', 'status', 'actions'];

  const statusOptions = [
    { name: 'Active', uid: 'active' },
    { name: 'Paused', uid: 'paused' },
    { name: 'Vacation', uid: 'vacation' },
  ];

  const columns = [
    { name: 'ID', uid: 'id', sortable: true },
    { name: 'NAME', uid: 'name', sortable: true },
    { name: 'AGE', uid: 'age', sortable: true },
    { name: 'ROLE', uid: 'role', sortable: true },
    { name: 'TEAM', uid: 'team' },
    { name: 'EMAIL', uid: 'email' },
    { name: 'STATUS', uid: 'status', sortable: true },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div>
      <UserTable />
    </div>
  );
};

export default AllProductsListPage;
