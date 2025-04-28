'use client';
import UserTable from '@/components/Common/Table';
import { VerticalDotsIcon } from '@/components/icons';
import { userStatusColor } from '@/utils/colorStatus/page';
import { capitalize } from '@/utils/functions/page';
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from '@heroui/react';
import { useCallback, useState } from 'react';

export default function UsersTableWrapper({
  initialData,
  columns,
  pageSize,
  searchableFieldsName,
}) {
  const [filteredData, setFilteredData] = useState(initialData);

  const filterData = useCallback(
    (value) => {
      try {
        if (!value) {
          setFilteredData(initialData);
          return;
        }

        const filtered = initialData.filter((user) => {
          const availableFields = searchableFieldsName.filter(
            (field) =>
              user.hasOwnProperty(field) &&
              user[field] !== undefined &&
              user[field] !== null,
          );
          return availableFields.some((field) =>
            user[field].toString().toLowerCase().includes(value.toLowerCase()),
          );
        });
        setFilteredData(filtered);
      } catch (error) {
        console.error('Error filtering data:', error);
        setFilteredData(initialData);
      }
    },
    [initialData, searchableFieldsName],
  );

  const renderCell = useCallback((user, columnKey) => {
    try {
      const cellValue = user[columnKey];

      switch (columnKey) {
        case 'name':
          return (
            <User
              avatarProps={{ radius: 'lg', src: user.avatar }}
              name={cellValue}
            >
              {user.name}
            </User>
          );
        case 'status':
          return (
            <Chip
              className='capitalize'
              color={userStatusColor[user.status]}
              size='sm'
              variant='flat'
            >
              {capitalize(user.status)}
            </Chip>
          );

        case 'email':
          return <a href={`mailto:${user.email}`}>{user.email}</a>;

        case 'id':
          return <span>{user._id}</span>;
        case 'actions':
          return (
            <div className='relative flex justify-center items-center gap-2'>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size='sm' variant='light'>
                    <VerticalDotsIcon className='text-default-300' />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key='delete' onPress={() => {}}>
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    } catch (error) {
      console.error(`Error rendering cell ${columnKey}:`, error);
      return <span>Error</span>;
    }
  }, []);

  return (
    <>
      <div className='flex justify-between items-center'>
        <h1>All Users</h1>
      </div>
      <UserTable
        data={filteredData}
        columns={columns}
        pageSize={pageSize}
        renderCell={renderCell}
        searchableFieldsName={searchableFieldsName}
        onSearchChange={filterData}
      />
    </>
  );
}
