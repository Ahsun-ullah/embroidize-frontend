'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import UserTable from '@/components/Common/Table';
import { VerticalDotsIcon } from '@/components/icons';
import {
  Button,
  Chip,
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
  Textarea,
} from '@heroui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

// Read the admin token from the cookie the same way the rest of the admin UI does.
function authHeaders() {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='))
    ?.split('=')[1];
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ContactSubmissionsTable({ columns }) {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reply modal state
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`${API_BASE}/contact`, {
          headers: authHeaders(),
        });
        const data = await response.json();
        setSubmissions(data?.data || []);
      } catch (err) {
        console.error('Failed to load contact submissions:', err);
        ErrorToast('Error', 'Could not load contact submissions', 3000);
      }
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

  // ── Reply ────────────────────────────────────────────────────────────────
  const handleOpenReply = (submission) => {
    setReplyTarget(submission);
    setReplySubject('Re: Your message to Embroidize');
    setReplyMessage('');
    setIsReplyOpen(true);
  };

  const handleCloseReply = () => {
    if (isSending) return;
    setIsReplyOpen(false);
    setReplyTarget(null);
    setReplySubject('');
    setReplyMessage('');
  };

  const sendReply = async () => {
    if (!replyTarget) return;
    if (!replyMessage.trim()) {
      ErrorToast('Error', 'Please write a reply message', 3000);
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch(
        `${API_BASE}/contact/${replyTarget._id}/reply`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            subject: replySubject,
            message: replyMessage,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || 'Failed to send reply');
      }

      const updated = result?.data;
      // Reflect the new replied state in the list without a full refetch.
      if (updated?._id) {
        setSubmissions((prev) =>
          prev.map((s) => (s._id === updated._id ? updated : s)),
        );
        if (selectedSubmission?._id === updated._id) {
          setSelectedSubmission(updated);
        }
      }

      SuccessToast('Sent', `Reply emailed to ${replyTarget.email}`, 3000);
      setIsReplyOpen(false);
      setReplyTarget(null);
      setReplySubject('');
      setReplyMessage('');
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to send reply', 4000);
    } finally {
      setIsSending(false);
    }
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
        String(value).toLowerCase().includes(searchQuery.toLowerCase()),
      ),
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
        case 'status':
          return submission.repliedAt ? (
            <Chip size='sm' variant='flat' color='success'>
              Replied
            </Chip>
          ) : (
            <Chip size='sm' variant='flat' color='warning'>
              Pending
            </Chip>
          );
        case 'actions':
          return (
            <div className='relative flex justify-center items-center gap-2'>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size='sm' variant='light'>
                    <VerticalDotsIcon className='text-default-300' />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label='Submission actions'>
                  <DropdownItem
                    key='more-info'
                    onPress={() => handleOpenModal(submission)}
                  >
                    More Info
                  </DropdownItem>
                  <DropdownItem
                    key='reply'
                    onPress={() => handleOpenReply(submission)}
                  >
                    {submission.repliedAt ? 'Reply Again' : 'Reply'}
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

      {/* Submission details */}
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

            {selectedSubmission?.repliedAt && (
              <div className='flex justify-between gap-4 items-center pt-1'>
                <span className='font-semibold'>Last reply:</span>
                <Chip size='sm' variant='flat' color='success'>
                  {formatDateTime(selectedSubmission.repliedAt)}
                </Chip>
              </div>
            )}

            {selectedSubmission?.replies?.length > 0 && (
              <div className='flex flex-col gap-2 pt-2 border-t border-gray-100'>
                <span className='font-semibold'>Reply history:</span>
                {selectedSubmission.replies.map((r, i) => (
                  <div
                    key={i}
                    className='bg-gray-50 rounded-lg p-3 space-y-1'
                  >
                    <p className='text-xs text-gray-400'>
                      {formatDateTime(r.sentAt)} · {r.subject}
                    </p>
                    <p className='text-sm whitespace-pre-wrap'>{r.message}</p>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant='light' onPress={handleCloseModal}>
              Close
            </Button>
            <Button
              color='primary'
              onPress={() => {
                handleCloseModal();
                handleOpenReply(selectedSubmission);
              }}
            >
              Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reply composer */}
      <Modal isOpen={isReplyOpen} onClose={handleCloseReply} size='2xl'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-0.5'>
            <span>Reply to {replyTarget?.name}</span>
            <span className='text-xs font-normal text-gray-400'>
              {replyTarget?.email}
            </span>
          </ModalHeader>
          <ModalBody className='space-y-3'>
            {/* Original message for context */}
            {replyTarget?.description && (
              <div className='bg-gray-50 border-l-4 border-gray-200 rounded-lg p-3'>
                <p className='text-xs uppercase tracking-wide text-gray-400 mb-1'>
                  Original message
                </p>
                <p className='text-sm text-gray-600 whitespace-pre-wrap'>
                  {replyTarget.description}
                </p>
              </div>
            )}

            <Input
              label='Subject'
              value={replySubject}
              onValueChange={setReplySubject}
              variant='bordered'
            />
            <Textarea
              label='Your reply'
              placeholder='Write your reply to the customer…'
              value={replyMessage}
              onValueChange={setReplyMessage}
              minRows={6}
              variant='bordered'
            />
            <p className='text-xs text-gray-400'>
              Sent from Embroidize. Replies go to support@embroidize.com.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='light'
              onPress={handleCloseReply}
              isDisabled={isSending}
            >
              Cancel
            </Button>
            <Button
              color='primary'
              onPress={sendReply}
              isLoading={isSending}
              isDisabled={!replyMessage.trim()}
            >
              Send Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
