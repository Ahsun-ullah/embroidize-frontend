'use client';
import UserTable from '@/components/Common/Table';
import { VerticalDotsIcon } from '@/components/icons';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  User,
} from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

export default function UsersTableWrapper({
  initialData,
  columns,
  searchableFieldsName,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const onSearchChange = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      setPage(1);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const onPageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return initialData.slice(start, end);
  }, [initialData, page, rowsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(initialData.length / rowsPerPage);
  }, [initialData.length, rowsPerPage]);

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

        case 'createdAt': {
          const createdAt = new Date(user.createdAt);
          const formattedDate = createdAt.toISOString().split('T')[0];
          return <>{formattedDate}</>;
        }

        case 'email':
          return <a href={`mailto:${user.email}`}>{user.email}</a>;
        case 'downloadHistory':
          return <>{user?.downloadHistory?.length}</>;

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
                  <DropdownItem
                    key='more-info'
                    onPress={() => handleOpenModal(user)}
                  >
                    More Info
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
        data={paginatedData}
        columns={columns}
        pageSize={rowsPerPage}
        renderCell={renderCell}
        searchableFieldsName={searchableFieldsName}
        onSearchChange={onSearchChange}
        pagination={{ totalPages: totalPages, currentPage: page }}
        onPageChange={onPageChange}
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalContent>
          <ModalHeader>📍 IP Info</ModalHeader>
          <ModalBody className='text-sm space-y-2'>
            {Object.entries(selectedUser?.ipInfo || {}).map(([key, value]) => (
              <div key={key} className='flex justify-between gap-4'>
                <span className='font-semibold'>{key}:</span>
                <span className='text-right'>{String(value)}</span>
              </div>
            ))}
          </ModalBody>

          <ModalFooter>
            <Button onPress={handleCloseModal} color='primary'>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
