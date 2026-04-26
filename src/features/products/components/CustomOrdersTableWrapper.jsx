'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Chip,
  Divider,
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
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from '@heroui/react';
import { Download, Eye, Mail, Search, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { startTransition, useState } from 'react';

const STATUS_CHIP_COLOR = {
  pending: 'warning',
  'in-progress': 'primary',
  completed: 'success',
  cancelled: 'danger',
};

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function DetailRow({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className='flex flex-col gap-0.5'>
      <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>
        {label}
      </span>
      <span className='text-sm text-gray-900 dark:text-gray-100'>{value}</span>
    </div>
  );
}

function getToken() {
  const tokenCookie = document.cookie
    .split('; ')
    .find((r) => r.startsWith('token='));
  return tokenCookie ? tokenCookie.split('=').slice(1).join('=') : undefined;
}

export default function CustomOrdersTableWrapper({
  initialData,
  pagination,
  columns,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || '',
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all',
  );

  // View details modal
  const {
    isOpen: isViewModalOpen,
    onOpen: onViewModalOpen,
    onOpenChange: onViewModalChange,
  } = useDisclosure();
  const [viewOrder, setViewOrder] = useState(null);

  // Delete modal
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteChange,
  } = useDisclosure();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status update modal
  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onOpenChange: onStatusChange,
  } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Contact customer modal
  const {
    isOpen: isContactOpen,
    onOpen: onContactOpen,
    onOpenChange: onContactChange,
  } = useDisclosure();
  const [contactOrder, setContactOrder] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Image lightbox
  const {
    isOpen: isLightboxOpen,
    onOpen: onLightboxOpen,
    onOpenChange: onLightboxChange,
  } = useDisclosure();
  const [lightboxUrl, setLightboxUrl] = useState('');

  const handleSearch = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
      params.set('page', '1');
    } else params.delete('search');
    router.push(`?${params.toString()}`);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    const params = new URLSearchParams(searchParams.toString());
    if (status !== 'all') params.set('status', status);
    else params.delete('status');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleViewDetails = (order) => {
    setViewOrder(order);
    onViewModalOpen();
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNotes(order.adminNotes || '');
    setEstimatedPrice(order.estimatedPrice || '');
    onStatusOpen();
  };

  const handleContactCustomer = (order) => {
    setContactOrder(order);
    setEmailSubject(`Re: Your Custom Order ${order.orderNumber}`);
    setEmailMessage('');
    onContactOpen();
  };

  const handleDelete = (id) => {
    setSelectedOrderId(id);
    onDeleteOpen();
  };

  const openLightbox = (url) => {
    setLightboxUrl(url);
    onLightboxOpen();
  };

  const sendCustomerEmail = async () => {
    if (!contactOrder || !emailMessage.trim()) {
      ErrorToast('Error', 'Message cannot be empty', 3000);
      return;
    }
    setIsSendingEmail(true);
    try {
      const token = getToken();
      const apiUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
        process.env.NEXT_PUBLIC_BASE_API_URL;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(
        `${apiUrl}/admin/orders/custom/${contactOrder._id}/contact`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: emailMessage,
            subject: emailSubject || undefined,
          }),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to send email');
      SuccessToast(
        'Success',
        result?.message || 'Email sent successfully!',
        3000,
      );
      onContactChange(false);
      setContactOrder(null);
      setEmailSubject('');
      setEmailMessage('');
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to send email', 3000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const token = getToken();
      const apiUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
        process.env.NEXT_PUBLIC_BASE_API_URL;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(
        `${apiUrl}/admin/orders/custom/${selectedOrder._id}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: newStatus,
            adminNotes: adminNotes || undefined,
            estimatedPrice: estimatedPrice
              ? parseFloat(estimatedPrice)
              : undefined,
          }),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update order');
      SuccessToast(
        'Success',
        result?.message || 'Order updated successfully!',
        3000,
      );
      startTransition(() => {
        router.refresh();
        onStatusChange(false);
        setSelectedOrder(null);
      });
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to update order', 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedOrderId) return;
    setIsDeleting(true);
    try {
      const token = getToken();
      const apiUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
        process.env.NEXT_PUBLIC_BASE_API_URL;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(
        `${apiUrl}/admin/orders/custom/${selectedOrderId}`,
        { method: 'DELETE', headers },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to delete order');
      SuccessToast(
        'Success',
        result?.message || 'Order deleted successfully!',
        3000,
      );
      startTransition(() => {
        router.refresh();
        onDeleteChange(false);
      });
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to delete order', 3000);
    } finally {
      setIsDeleting(false);
      setSelectedOrderId(null);
    }
  };

  const renderCell = (order, columnKey) => {
    switch (columnKey) {
      case 'preview': {
        const ref = order.designReference;
        if (!ref?.url) {
          return (
            <div className='w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-gray-300'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
          );
        }
        const isImage = ref.mimetype?.startsWith('image/');
        if (isImage) {
          return (
            <button
              type='button'
              onClick={() => openLightbox(ref.url)}
              className='w-12 h-12 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black/20'
              title='Click to enlarge'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ref.url}
                alt={ref.originalName || 'design'}
                className='w-full h-full object-cover'
              />
            </button>
          );
        }
        return (
          <a
            href={ref.url}
            target='_blank'
            rel='noopener noreferrer'
            className='w-12 h-12 rounded-lg bg-red-50 border border-red-200 hover:border-red-400 flex items-center justify-center transition-colors'
            title={ref.originalName || 'Download file'}
          >
            <svg
              className='w-5 h-5 text-red-400'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z' />
            </svg>
          </a>
        );
      }

      case 'orderNumber':
        return (
          <div className='font-mono font-semibold text-sm'>
            {order.orderNumber}
          </div>
        );

      case 'name':
        return (
          <div>
            <div className='text-sm font-medium'>{order.name}</div>
            <div className='text-xs text-gray-500'>{order.email}</div>
          </div>
        );

      case 'size':
        return (
          <div className='text-sm'>
            {order?.sizeWidth && order?.sizeHeight
              ? `${order.sizeWidth} × ${order.sizeHeight} ${order.sizeUnit || ''}`
              : '—'}
          </div>
        );

      case 'fileFormat':
        return order.fileFormat ? (
          <span className='uppercase text-xs font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'>
            {order.fileFormat}
          </span>
        ) : (
          <span className='text-gray-400 text-xs'>—</span>
        );

      case 'turnaround':
        return <div className='text-sm'>{order.turnaround || '—'}</div>;

      case 'status':
        return (
          <Chip
            color={STATUS_CHIP_COLOR[order.status] || 'default'}
            size='sm'
            variant='flat'
            className='capitalize'
          >
            {order.status}
          </Chip>
        );

      case 'createdAt':
        return (
          <div className='text-sm'>
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        );

      case 'actions':
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size='sm' variant='light'>
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
                  />
                </svg>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label='Order actions'>
              <DropdownItem
                key='view'
                startContent={<Eye size={16} />}
                onClick={() => handleViewDetails(order)}
              >
                View Details
              </DropdownItem>
              <DropdownItem
                key='delete'
                className='text-danger'
                color='danger'
                startContent={<Trash2 size={16} />}
                onClick={() => handleDelete(order._id)}
              >
                Delete Order
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );

      default:
        return order[columnKey];
    }
  };

  // Derived values for the view modal
  const isImageRef = viewOrder?.designReference?.mimetype?.startsWith('image/');
  console.log(viewOrder);
  const sizeText =
    viewOrder?.sizeWidth && viewOrder?.sizeHeight
      ? `${viewOrder.sizeWidth} × ${viewOrder.sizeHeight} ${viewOrder.sizeUnit || ''}`
      : '—';

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Custom Orders</h1>
        <div className='text-sm text-gray-600'>
          Total: {pagination.total} orders
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <Input
          isClearable
          placeholder='Search by order number, name, or email...'
          startContent={<Search size={18} />}
          value={searchValue}
          onValueChange={setSearchValue}
          onClear={() => handleSearch('')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch(searchValue);
          }}
          className='flex-1'
        />
        <Dropdown>
          <DropdownTrigger>
            <Button variant='flat' className='capitalize min-w-[140px]'>
              Status: {statusFilter}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label='Status filter'
            selectedKeys={[statusFilter]}
            onAction={(k) => handleStatusFilter(k)}
          >
            <DropdownItem key='all'>All</DropdownItem>
            <DropdownItem key='pending'>Pending</DropdownItem>
            <DropdownItem key='in-progress'>In Progress</DropdownItem>
            <DropdownItem key='completed'>Completed</DropdownItem>
            <DropdownItem key='cancelled'>Cancelled</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Table */}
      <Table aria-label='Custom orders table'>
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={initialData} emptyContent='No orders found'>
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className='flex justify-center'>
        <Pagination
          total={pagination.totalPages}
          initialPage={pagination.page}
          onChange={handlePageChange}
          showControls
          isCompact
          showShadow
        />
      </div>

      {/* ─── Image Lightbox ─── */}
      <Modal
        isOpen={isLightboxOpen}
        onOpenChange={onLightboxChange}
        size='4xl'
        backdrop='blur'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='text-sm font-semibold'>
                Design Reference
              </ModalHeader>
              <ModalBody className='p-2'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightboxUrl}
                  alt='Design reference'
                  className='w-full rounded-lg object-contain max-h-[70vh]'
                />
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Close
                </Button>
                <a href={lightboxUrl} target='_blank' rel='noopener noreferrer'>
                  <Button color='primary' startContent={<Download size={16} />}>
                    Download
                  </Button>
                </a>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ─── View Details Modal ─── */}
      <Modal
        isOpen={isViewModalOpen}
        onOpenChange={onViewModalChange}
        backdrop='blur'
        size='3xl'
        scrollBehavior='inside'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex items-center justify-between gap-3 pr-10'>
                <div className='flex items-center gap-3 min-w-0'>
                  <Eye size={20} className='shrink-0 text-gray-500' />
                  <div className='min-w-0'>
                    <p className='text-base font-bold'>Order Details</p>
                    <p className='text-xs font-mono text-gray-400'>
                      {viewOrder?.orderNumber}
                    </p>
                  </div>
                </div>
                {viewOrder?.status && (
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[viewOrder.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {viewOrder.status}
                  </span>
                )}
              </ModalHeader>

              <ModalBody className='gap-5'>
                {/* Design reference */}
                {viewOrder?.designReference?.url && (
                  <div>
                    <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>
                      Design Reference
                    </p>
                    {isImageRef ? (
                      <div
                        className='relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 cursor-zoom-in'
                        onClick={() =>
                          openLightbox(viewOrder.designReference.url)
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={viewOrder.designReference.url}
                          alt={
                            viewOrder.designReference.originalName ||
                            'Design reference'
                          }
                          className='w-full max-h-72 object-contain'
                        />
                        <div className='absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center'>
                          <span className='opacity-0 hover:opacity-100 transition-opacity bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg'>
                            Click to enlarge
                          </span>
                        </div>
                        <a
                          href={viewOrder.designReference.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          onClick={(e) => e.stopPropagation()}
                          className='absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/70 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors'
                        >
                          <Download size={13} />
                          Download
                        </a>
                      </div>
                    ) : (
                      <a
                        href={viewOrder.designReference.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors group'
                      >
                        <div className='w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0'>
                          <svg
                            className='w-5 h-5 text-red-500'
                            fill='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z' />
                          </svg>
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='text-sm font-semibold text-gray-800 truncate'>
                            {viewOrder.designReference.originalName}
                          </p>
                          {viewOrder.designReference.size && (
                            <p className='text-xs text-gray-500'>
                              {(
                                viewOrder.designReference.size /
                                1024 /
                                1024
                              ).toFixed(2)}{' '}
                              MB
                            </p>
                          )}
                        </div>
                        <Download
                          size={16}
                          className='shrink-0 text-gray-400 group-hover:text-gray-700 transition-colors'
                        />
                      </a>
                    )}
                  </div>
                )}

                <Divider />

                {/* Customer */}
                <div>
                  <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3'>
                    Customer
                  </p>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <DetailRow label='Name' value={viewOrder?.name} />
                    <DetailRow label='Email' value={viewOrder?.email} />
                    <DetailRow
                      label='Submitted'
                      value={
                        viewOrder?.createdAt
                          ? new Date(viewOrder.createdAt).toLocaleString(
                              'en-US',
                              {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )
                          : null
                      }
                    />
                    <DetailRow
                      label='Confirmation Email'
                      value={
                        viewOrder?.emailSent
                          ? 'Sent'
                          : 'Not sent — may need follow-up'
                      }
                    />
                  </div>
                </div>

                <Divider />

                {/* Order specs */}
                <div>
                  <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3'>
                    Order Specifications
                  </p>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <DetailRow
                      label='File Format'
                      value={viewOrder?.fileFormat || 'Not specified'}
                    />
                    <DetailRow
                      label='Turnaround'
                      value={viewOrder?.turnaround || 'Not specified'}
                    />
                    <DetailRow
                      label='Complexity'
                      value={viewOrder?.complexity || 'Not specified'}
                    />
                    <DetailRow
                      label='Size'
                      value={sizeText || 'Not specified'}
                    />
                  </div>
                  {viewOrder?.details && (
                    <div className='mt-4'>
                      <DetailRow
                        label='Additional Details'
                        value={viewOrder.details}
                      />
                    </div>
                  )}
                </div>

                {/* Admin section */}
                {(viewOrder?.estimatedPrice != null ||
                  viewOrder?.adminNotes) && (
                  <>
                    <Divider />
                    <div>
                      <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3'>
                        Admin
                      </p>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {viewOrder?.estimatedPrice != null && (
                          <DetailRow
                            label='Estimated Price'
                            value={`$${viewOrder.estimatedPrice}`}
                          />
                        )}
                        {viewOrder?.adminNotes && (
                          <DetailRow
                            label='Notes'
                            value={viewOrder.adminNotes}
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </ModalBody>

              <ModalFooter className='gap-2'>
                <Button
                  variant='flat'
                  startContent={<Mail size={16} />}
                  onPress={() => {
                    onClose();
                    handleContactCustomer(viewOrder);
                  }}
                >
                  Contact Customer
                </Button>
                <Button
                  color='primary'
                  startContent={<Eye size={16} />}
                  onPress={() => {
                    onClose();
                    handleStatusUpdate(viewOrder);
                  }}
                >
                  Update Status
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ─── Contact Customer Modal ─── */}
      <Modal
        isOpen={isContactOpen}
        onOpenChange={onContactChange}
        backdrop='blur'
        size='2xl'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className='flex items-center gap-2'>
                  <Mail size={20} />
                  Contact Customer
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <div className='bg-gray-50 dark:bg-gray-900 p-3 rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold'>
                        {contactOrder?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className='font-semibold'>{contactOrder?.name}</p>
                        <p className='text-sm text-gray-600'>
                          {contactOrder?.email}
                        </p>
                        <p className='text-xs font-mono text-gray-500 mt-1'>
                          Order: {contactOrder?.orderNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Input
                    label='Subject'
                    placeholder='Email subject'
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                  <Textarea
                    label='Message'
                    placeholder='Write your message...'
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    minRows={6}
                    isRequired
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  isLoading={isSendingEmail}
                  onPress={sendCustomerEmail}
                  startContent={!isSendingEmail && <Mail size={16} />}
                >
                  Send Email
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ─── Status Update Modal ─── */}
      <Modal
        isOpen={isStatusOpen}
        onOpenChange={onStatusChange}
        backdrop='blur'
        size='2xl'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Update Order Status</ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm font-semibold mb-1'>Order Number</p>
                    <p className='font-mono text-sm text-gray-600'>
                      {selectedOrder?.orderNumber}
                    </p>
                  </div>
                  <Select
                    label='Status'
                    placeholder='Select status'
                    selectedKeys={[newStatus]}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <SelectItem key='pending' value='pending'>
                      Pending
                    </SelectItem>
                    <SelectItem key='in-progress' value='in-progress'>
                      In Progress
                    </SelectItem>
                    <SelectItem key='completed' value='completed'>
                      Completed
                    </SelectItem>
                    <SelectItem key='cancelled' value='cancelled'>
                      Cancelled
                    </SelectItem>
                  </Select>
                  <Input
                    type='number'
                    label='Estimated Price (Optional)'
                    placeholder='Enter price'
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    startContent={<span className='text-sm'>$</span>}
                  />
                  <Textarea
                    label='Admin Notes (Optional)'
                    placeholder='Add internal notes...'
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    minRows={3}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  isLoading={isUpdating}
                  onPress={updateOrderStatus}
                >
                  Update Order
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ─── Delete Confirmation Modal ─── */}
      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteChange}
        backdrop='blur'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirm Deletion</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete this custom order? This action
                  is permanent and cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='danger'
                  isLoading={isDeleting}
                  onPress={confirmDelete}
                >
                  Delete Order
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
