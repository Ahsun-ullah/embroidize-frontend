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

  const [isExporting, setIsExporting] = useState(false);

  const convertUsersToCSV = (users) => {
    const headers = ['Email', 'Name', 'Country', 'Date'];

    const escapeCSVValue = (value) => {
      const stringValue = value == null ? '' : String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const rows = users.map((user) => [
      escapeCSVValue(user.email),
      escapeCSVValue(user.name),
      escapeCSVValue(user.country),
      escapeCSVValue(user.date),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  };

  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.minDownloads)
        params.set('minDownloads', filters.minDownloads);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      params.set('export', 'true');

      const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
      if (!apiUrl) {
        throw new Error('Missing NEXT_PUBLIC_BASE_API_URL_PROD');
      }

      const token =
        localStorage.getItem('token') ||
        document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

      const headers = new Headers();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(`${apiUrl}/all-users?${params.toString()}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Export request failed with status ${response.status}`);
      }

      const result = await response.json();
      const users = result?.data?.users ?? [];

      if (!Array.isArray(users) || users.length === 0) {
        alert('No data found for export.');
        return;
      }

      const csv = convertUsersToCSV(users);
      const fileName =
        filters.startDate && filters.endDate
          ? `users-${filters.startDate}-to-${filters.endDate}.csv`
          : 'users-export.csv';

      downloadCSV(csv, fileName);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export users.');
    } finally {
      setIsExporting(false);
    }
  };

  // --- Custom Filter Bar ---
  const topContent = (
    <div className='mb-4'>
      <div className='flex flex-nowrap items-end gap-3 overflow-x-auto'>
        <Input
          isClearable
          className='min-w-[260px] flex-[2]'
          label='Search'
          labelPlacement='outside'
          placeholder='Search name or email...'
          value={filters.search}
          onValueChange={(val) => handleFilterChange('search', val)}
          onClear={() => handleFilterChange('search', '')}
        />

        <Input
          type='number'
          className='min-w-[180px] flex-1'
          label='Min Downloads'
          labelPlacement='outside'
          placeholder='Min Downloads'
          value={filters.minDownloads}
          onValueChange={(val) => handleFilterChange('minDownloads', val)}
        />

        <Input
          type='date'
          className='min-w-[180px] flex-1'
          label='Start Date'
          labelPlacement='outside'
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
        />

        <Input
          type='date'
          className='min-w-[180px] flex-1'
          label='End Date'
          labelPlacement='outside'
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
        />

        <Button
          className='min-w-fit'
          variant='flat'
          color='default'
          onClick={() => {
            const newFilters = {
              ...filters,
              search: '',
              minDownloads: '',
              startDate: '',
              endDate: '',
            };
            setFilters(newFilters);
            updateURL(newFilters);
          }}
        >
          Clear Filters
        </Button>

        <Button
          className='min-w-fit'
          color='primary'
          onPress={handleExport}
          isLoading={isExporting}
        >
          Export
        </Button>
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
        data={initialData}
        columns={columns}
        renderCell={renderCell}
        pagination={pagination}
        onPageChange={onPageChange}
        topContent={topContent}
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
