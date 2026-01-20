'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
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

  // Delete modal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status update modal
  const {
    isOpen: isStatusModalOpen,
    onOpen: onStatusModalOpen,
    onOpenChange: onStatusModalChange,
  } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Contact customer modal
  const {
    isOpen: isContactModalOpen,
    onOpen: onContactModalOpen,
    onOpenChange: onContactModalChange,
  } = useDisclosure();
  const [contactOrder, setContactOrder] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSearch = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
      params.set('page', '1');
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    const params = new URLSearchParams(searchParams.toString());
    if (status !== 'all') {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  // Open status update modal
  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNotes(order.adminNotes || '');
    setEstimatedPrice(order.estimatedPrice || '');
    onStatusModalOpen();
  };

  // Open contact customer modal
  const handleContactCustomer = (order) => {
    setContactOrder(order);
    setEmailSubject(`Re: Your Custom Order ${order.orderNumber}`);
    setEmailMessage('');
    onContactModalOpen();
  };

  // Send email to customer
  const sendCustomerEmail = async () => {
    if (!contactOrder || !emailMessage.trim()) {
      ErrorToast('Error', 'Message cannot be empty', 3000);
      return;
    }

    setIsSendingEmail(true);

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      const apiUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
        process.env.NEXT_PUBLIC_BASE_API_URL;

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const body = {
        message: emailMessage,
        subject: emailSubject || undefined,
      };

      const res = await fetch(
        `${apiUrl}/admin/orders/custom/${contactOrder._id}/contact`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to send email');
      }

      SuccessToast(
        'Success',
        result?.message || 'Email sent successfully!',
        3000,
      );

      onContactModalChange(false);
      setContactOrder(null);
      setEmailSubject('');
      setEmailMessage('');
    } catch (error) {
      ErrorToast('Error', error.message || 'Failed to send email', 3000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Update order status API call
  const updateOrderStatus = async () => {
    if (!selectedOrder) return;

    setIsUpdating(true);

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      const apiUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
        process.env.NEXT_PUBLIC_BASE_API_URL;

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const body = {
        status: newStatus,
        adminNotes: adminNotes || undefined,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
      };

      const res = await fetch(
        `${apiUrl}/admin/orders/custom/${selectedOrder._id}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify(body),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to update order');
      }

      SuccessToast(
        'Success',
        result?.message || 'Order updated successfully!',
        3000,
      );

      startTransition(() => {
        router.refresh();
        onStatusModalChange(false);
        setSelectedOrder(null);
      });
    } catch (error) {
      ErrorToast('Error', error.message || 'Failed to update order', 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderCell = (order, columnKey) => {
    switch (columnKey) {
      case 'orderNumber':
        return (
          <div className='font-mono font-semibold text-sm'>
            {order.orderNumber}
          </div>
        );

      case 'name':
        return (
          <div className='text-base font-medium'>
            {order.name}
            <br />
            <div className='text-xs text-gray-500'>{order.email}</div>
          </div>
        );

      case 'size':
        return (
          <div className='text-sm'>
            {order.sizeWidth} × {order.sizeHeight} {order.sizeUnit}
          </div>
        );

      case 'fileFormat':
        return (
          <span className='uppercase text-xs font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'>
            {order.fileFormat}
          </span>
        );

      case 'turnaround':
        return <div className='text-sm capitalize'>{order.turnaround}</div>;

      case 'status':
        const statusColorMap = {
          pending: 'warning',
          'in-progress': 'primary',
          completed: 'success',
          cancelled: 'danger',
        };
        return (
          <Chip
            color={statusColorMap[order.status] || 'default'}
            size='sm'
            variant='flat'
            className='capitalize cursor-pointer'
            onClick={() => handleStatusUpdate(order)}
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
                onClick={() => router.push(`/admin/custom-orders/${order._id}`)}
              >
                View Details
              </DropdownItem>
              <DropdownItem
                key='contact'
                startContent={<Mail size={16} />}
                onClick={() => handleContactCustomer(order)}
              >
                Contact Customer
              </DropdownItem>
              {order.designReference?.url && (
                <DropdownItem
                  key='download'
                  startContent={<Download size={16} />}
                  onClick={() =>
                    window.open(order.designReference.url, '_blank')
                  }
                >
                  Download Reference
                </DropdownItem>
              )}
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

  const handleDelete = (id) => {
    setSelectedOrderId(id);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!selectedOrderId) return;

    setIsDeleting(true);

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      const apiUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
        process.env.NEXT_PUBLIC_BASE_API_URL;

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${apiUrl}/admin/orders/custom/${selectedOrderId}`,
        {
          method: 'DELETE',
          headers,
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to delete order');
      }

      SuccessToast(
        'Success',
        result?.message || 'Order deleted successfully!',
        3000,
      );

      startTransition(() => {
        router.refresh();
        onOpenChange(false);
      });
    } catch (error) {
      ErrorToast('Error', error.message || 'Failed to delete order', 3000);
    } finally {
      setIsDeleting(false);
      setSelectedOrderId(null);
    }
  };

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
            if (e.key === 'Enter') {
              handleSearch(searchValue);
            }
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
            onAction={(key) => handleStatusFilter(key)}
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

      {/* Contact Customer Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onOpenChange={onContactModalChange}
        backdrop='blur'
        size='2xl'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
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
                    placeholder='Write your message to the customer...'
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

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onOpenChange={onStatusModalChange}
        backdrop='blur'
        size='2xl'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Update Order Status
              </ModalHeader>
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
                    placeholder='Add internal notes about this order...'
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop='blur'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Confirm Deletion
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete this custom order? This action
                  can be undone later as it is a soft delete.
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
