'use client';
import UserTable from '@/components/Common/Table';
import { VerticalDotsIcon } from '@/components/icons';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input, 
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  User,
} from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function UsersTableWrapper({
  initialData,
  columns,
  pagination, // Received from server
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Modal Handlers ---
  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  // --- Filter State ---
  // Initialize from URL so filters persist on refresh
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    minDownloads: searchParams.get('minDownloads') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  });

  // --- Filter Logic ---
  const updateURL = (newFilters, newPage = 1) => {
    const params = new URLSearchParams(searchParams);

    // Update params based on state
    if (newFilters.search) params.set('search', newFilters.search);
    else params.delete('search');

    if (newFilters.minDownloads)
      params.set('minDownloads', newFilters.minDownloads);
    else params.delete('minDownloads');

    if (newFilters.startDate) params.set('startDate', newFilters.startDate);
    else params.delete('startDate');

    if (newFilters.endDate) params.set('endDate', newFilters.endDate);
    else params.delete('endDate');

    // Always reset to page 1 when filtering
    params.set('page', newPage.toString());

    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Debounce could be added here for text search
    updateURL(newFilters);
  };

  const onPageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // --- Render Cell ---
  const renderCell = useCallback((user, columnKey) => {
    const cellValue = user[columnKey];
    switch (columnKey) {
      case 'name':
        return (
          <User
            avatarProps={{ radius: 'lg', src: user.avatar }}
            name={user.fullName || user.name || cellValue} // Uses the aggregated fullName
          >
            {user.email}
          </User>
        );
      case 'createdAt':
        return <>{new Date(user.createdAt).toISOString().split('T')[0]}</>;
      case 'email':
        return <a href={`mailto:${user.email}`}>{user.email}</a>;
      case 'downloadHistory':
        // The backend now returns 'downloadCount' field
        return (
          <div className='pl-4'>
            {user.downloadCount ?? user.downloadHistory?.length}
          </div>
        );
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
  }, []);

  // --- Custom Filter Bar ---
  const topContent = (
    <div className='flex flex-col gap-4 mb-4'>
      <div className='flex flex-wrap gap-3 items-end justify-center relative'>
        <Input
          isClearable
          className='w-full sm:max-w-[30%]'
          placeholder='Search name or email...'
          value={filters.search}
          onValueChange={(val) => handleFilterChange('search', val)}
          onClear={() => handleFilterChange('search', '')}
        />
        <Input
          type='number'
          className='w-full sm:max-w-[20%]'
          placeholder='Min Downloads'
          value={filters.minDownloads}
          onValueChange={(val) => handleFilterChange('minDownloads', val)}
        />
        <Input
          type='date'
          className='w-full sm:max-w-[20%]'
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
        />
        <Input
          type='date'
          className='w-full sm:max-w-[20%]'
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
        />

        <button
          className='text-red-400 hover:text-gray-600 transition-opacity font-extrabold absolute top-0 right-0 mt-1 mr-1'
          onClick={() => {
            const newFilters = { ...filters, startDate: '', endDate: '' };
            setFilters(newFilters);
            updateURL(newFilters);
          }}
          title='Clear dates'
        >
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className='flex justify-between items-center mx-6'>
        <h1 className='text-2xl font-bold mb-4'>All Users</h1>
        <div className='mb-4 font-semibold text-lg'>
          Found {pagination?.total} results
        </div>
      </div>

      {/* Pass topContent (Filter Bar) to your Table component */}
      <UserTable
        data={initialData} // Direct data from server (no local slice)
        columns={columns}
        renderCell={renderCell}
        pagination={pagination} // Pass full pagination object
        onPageChange={onPageChange}
        topContent={topContent} // Pass the filter inputs
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalContent>
          <ModalHeader>📍 User Info</ModalHeader>
          <ModalBody className='text-sm space-y-2'>
            {/* Render User details here */}
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
