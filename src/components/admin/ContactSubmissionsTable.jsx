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
} from '@heroui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function ContactSubmissionsTable({ columns }) {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

      const headers = new Headers({
      'Content-Type': 'application/json'
      });

      if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/contact`,
      {
        headers: headers
      }
      );
      const data = await response.json();
      console.log(data);
      setSubmissions(data?.data || []);
    };

    fetchSubmissions();
  }, []);

  const handleOpenModal = (submission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
    setIsModalOpen(false);
  };

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const onSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const onPageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) =>
      Object.values(submission).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [submissions, searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredSubmissions.slice(start, end);
  }, [filteredSubmissions, page, rowsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredSubmissions.length / rowsPerPage);
  }, [filteredSubmissions.length, rowsPerPage]);

  const renderCell = useCallback((submission, columnKey) => {
    try {
      const cellValue = submission[columnKey];

      switch (columnKey) {
        case 'createdAt': {
          const createdAt = new Date(submission.createdAt);
          const formattedDate = createdAt.toISOString().split('T')[0];
          return <>{formattedDate}</>;
        }
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
                    onPress={() => handleOpenModal(submission)}
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
      <UserTable
        data={paginatedData}
        columns={columns}
        pageSize={rowsPerPage}
        renderCell={renderCell}
        onSearchChange={onSearchChange}
        pagination={{ totalPages: totalPages, currentPage: page }}
        onPageChange={onPageChange}
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalContent>
          <ModalHeader>Submission Details</ModalHeader>
          <ModalBody className='text-sm space-y-2'>
            <div className='flex justify-between gap-4'>
              <span className='font-semibold'>Name:</span>
              <span className='text-right'>{selectedSubmission?.name}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span className='font-semibold'>Email:</span>
              <span className='text-right'>{selectedSubmission?.email}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span className='font-semibold'>Phone:</span>
              <span className='text-right'>{selectedSubmission?.phone}</span>
            </div>
            <div className='flex flex-col gap-2'>
              <span className='font-semibold'>Description:</span>
              <p>{selectedSubmission?.description}</p>
            </div>
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
