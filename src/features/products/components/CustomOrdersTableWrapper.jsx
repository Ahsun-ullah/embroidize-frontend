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
import {
  Copy,
  CreditCard,
  Download,
  Eye,
  Globe,
  Link as LinkIcon,
  Mail,
  MapPin,
  Search,
  Send,
  Trash2,
  Upload,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { startTransition, useState } from 'react';

// New order lifecycle (spec §2). Keys match the backend ORDER_STATUSES enum.
const STATUS_LABELS = {
  pending_review: 'Pending Review',
  awaiting_payment: 'Awaiting Payment',
  paid: 'Paid',
  in_progress: 'In Progress',
  delivered: 'Delivered',
  in_revision: 'In Revision',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const STATUS_CHIP_COLOR = {
  pending_review: 'warning',
  awaiting_payment: 'secondary',
  paid: 'primary',
  in_progress: 'primary',
  delivered: 'success',
  in_revision: 'warning',
  completed: 'success',
  cancelled: 'danger',
  expired: 'default',
};

const STATUS_BADGE = {
  pending_review: 'bg-yellow-100 text-yellow-800',
  awaiting_payment: 'bg-purple-100 text-purple-800',
  paid: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  in_revision: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  expired: 'bg-gray-200 text-gray-600',
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

// Builds a "City, Region, Country" string from an ipInfo payload, dropping empty parts.
function formatLocation(ipInfo) {
  if (!ipInfo) return '';
  return [ipInfo.city, ipInfo.region, ipInfo.country]
    .filter((v) => typeof v === 'string' && v.trim())
    .join(', ');
}

function getToken() {
  const tokenCookie = document.cookie
    .split('; ')
    .find((r) => r.startsWith('token='));
  return tokenCookie ? tokenCookie.split('=').slice(1).join('=') : undefined;
}

// Financial elevation token — required by the gated custom-order endpoints.
function getFinanceToken() {
  const c = document.cookie
    .split('; ')
    .find((r) => r.startsWith('finance_elev='));
  return c ? c.split('=').slice(1).join('=') : undefined;
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
  const [paymentTagFilter, setPaymentTagFilter] = useState(
    searchParams.get('paymentTag') || 'all',
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
  const [paymentChannel, setPaymentChannel] = useState('');
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

  // Quote (set price & request payment) modal
  const {
    isOpen: isQuoteOpen,
    onOpen: onQuoteOpen,
    onOpenChange: onQuoteChange,
  } = useDisclosure();
  const [quoteOrder, setQuoteOrder] = useState(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [isQuoting, setIsQuoting] = useState(false);

  // Deliver (upload ZIP) modal
  const {
    isOpen: isDeliverOpen,
    onOpen: onDeliverOpen,
    onOpenChange: onDeliverChange,
  } = useDisclosure();
  const [deliverOrder, setDeliverOrder] = useState(null);
  const [deliverFile, setDeliverFile] = useState(null);
  const [isDelivering, setIsDelivering] = useState(false);
  const [downloadingDelivery, setDownloadingDelivery] = useState(false);

  // Manual payment request (direct Stripe checkout link) modal
  const {
    isOpen: isPayReqOpen,
    onOpen: onPayReqOpen,
    onOpenChange: onPayReqChange,
  } = useDisclosure();
  const [payReqOrder, setPayReqOrder] = useState(null);
  const [payReqAmount, setPayReqAmount] = useState('');
  const [payReqNote, setPayReqNote] = useState('');
  const [payReqUrl, setPayReqUrl] = useState('');
  const [isPayRequesting, setIsPayRequesting] = useState(false);

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

  const handlePaymentTagFilter = (tag) => {
    setPaymentTagFilter(tag);
    const params = new URLSearchParams(searchParams.toString());
    if (tag !== 'all') params.set('paymentTag', tag);
    else params.delete('paymentTag');
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
    setPaymentChannel(order.paymentChannel || '');
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
      const financeToken = getFinanceToken();
      if (financeToken) headers['x-finance-elevation'] = financeToken;
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

  // Shared auth headers for the finance-gated admin endpoints.
  const adminHeaders = (json = true) => {
    const headers = json ? { 'Content-Type': 'application/json' } : {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const financeToken = getFinanceToken();
    if (financeToken) headers['x-finance-elevation'] = financeToken;
    return headers;
  };

  const apiBase = () =>
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL;

  const handleQuote = (order) => {
    setQuoteOrder(order);
    setQuoteAmount(order.estimatedPrice > 0 ? String(order.estimatedPrice) : '');
    onQuoteOpen();
  };

  const submitQuote = async () => {
    const amount = parseFloat(quoteAmount);
    if (!quoteOrder || isNaN(amount) || amount <= 0) {
      ErrorToast('Error', 'Enter a valid positive amount', 3000);
      return;
    }
    setIsQuoting(true);
    try {
      const res = await fetch(
        `${apiBase()}/admin/orders/custom/${quoteOrder._id}/quote`,
        {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify({ amount }),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to set price');
      SuccessToast('Success', result?.message || 'Price set and customer notified.', 4000);
      startTransition(() => {
        router.refresh();
        onQuoteChange(false);
        setQuoteOrder(null);
      });
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to set price', 4000);
    } finally {
      setIsQuoting(false);
    }
  };

  const handlePayRequest = (order) => {
    setPayReqOrder(order);
    setPayReqAmount('');
    setPayReqNote('');
    setPayReqUrl('');
    onPayReqOpen();
  };

  const submitPayRequest = async () => {
    const amount = parseFloat(payReqAmount);
    if (!payReqOrder || isNaN(amount) || amount <= 0) {
      ErrorToast('Error', 'Enter a valid positive amount', 3000);
      return;
    }
    setIsPayRequesting(true);
    try {
      const res = await fetch(
        `${apiBase()}/admin/orders/custom/${payReqOrder._id}/payment-request`,
        {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify({ amount, note: payReqNote.trim() || undefined }),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to create payment link');
      setPayReqUrl(result?.data?.url || '');
      SuccessToast('Success', result?.message || 'Payment link created.', 5000);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to create payment link', 4000);
    } finally {
      setIsPayRequesting(false);
    }
  };

  const copyPayLink = async () => {
    try {
      await navigator.clipboard.writeText(payReqUrl);
      SuccessToast('Copied', 'Payment link copied to clipboard', 2500);
    } catch {
      ErrorToast('Error', 'Copy failed — select and copy the link manually', 3000);
    }
  };

  const handleDeliver = (order) => {
    setDeliverOrder(order);
    setDeliverFile(null);
    onDeliverOpen();
  };

  const submitDelivery = async () => {
    if (!deliverOrder || !deliverFile) {
      ErrorToast('Error', 'Choose a .zip file to upload', 3000);
      return;
    }
    if (!deliverFile.name.toLowerCase().endsWith('.zip')) {
      ErrorToast('Error', 'Delivery must be a single .zip containing all formats', 3000);
      return;
    }
    setIsDelivering(true);
    try {
      const fd = new FormData();
      fd.append('deliveryZip', deliverFile);
      const res = await fetch(
        `${apiBase()}/admin/orders/custom/${deliverOrder._id}/file`,
        { method: 'POST', headers: adminHeaders(false), body: fd },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to upload delivery');
      SuccessToast('Success', result?.message || 'Delivery uploaded and customer notified.', 4000);
      startTransition(() => {
        router.refresh();
        onDeliverChange(false);
        setDeliverOrder(null);
        setDeliverFile(null);
      });
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to upload delivery', 4000);
    } finally {
      setIsDelivering(false);
    }
  };

  // "Customer lost the email" — send a fresh single-use access link.
  const resendAccessLink = async (order) => {
    try {
      const res = await fetch(
        `${apiBase()}/admin/orders/custom/${order._id}/resend-access`,
        { method: 'POST', headers: adminHeaders() },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to send link');
      SuccessToast('Link sent', result?.message || `Access link emailed to ${order.email}`, 4000);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to send link', 4000);
    }
  };

  // Download a delivery ZIP to verify what went up (defaults to latest version).
  const downloadDelivery = async (order, version) => {
    setDownloadingDelivery(true);
    try {
      const qs = version ? `?version=${version}` : '';
      const res = await fetch(
        `${apiBase()}/admin/orders/custom/${order._id}/download${qs}`,
        { headers: adminHeaders(false) },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Download failed');
      }
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const filename = match?.[1] || `embroidize-${order.orderNumber}.zip`;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      ErrorToast('Error', err.message || 'Download failed', 4000);
    } finally {
      setDownloadingDelivery(false);
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
      const financeToken = getFinanceToken();
      if (financeToken) headers['x-finance-elevation'] = financeToken;
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
            paymentChannel: paymentChannel.trim(),
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
      const financeToken = getFinanceToken();
      if (financeToken) headers['x-finance-elevation'] = financeToken;
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

      case 'origin': {
        const country = order?.ipInfo?.country;
        const city = order?.ipInfo?.city;
        if (!country && !city && !order?.ip) {
          return <span className='text-gray-400 text-xs'>—</span>;
        }
        return (
          <div className='flex flex-col gap-0.5 min-w-[120px]'>
            {country && (
              <span className='inline-flex items-center gap-1 text-xs font-semibold text-gray-800'>
                <Globe size={12} className='text-gray-400' />
                {country}
              </span>
            )}
            {city && <span className='text-xs text-gray-500'>{city}</span>}
            {!country && !city && order?.ip && (
              <span className='font-mono text-[11px] text-gray-500'>
                {order.ip}
              </span>
            )}
          </div>
        );
      }

      case 'size':
        return (
          <div className='text-sm'>
            {order?.sizeWidth || order?.sizeHeight
              ? `${order.sizeWidth} × ${order.sizeHeight} ${order.sizeUnit || ''}`.trim()
              : order?.finishedSize
                ? `${order.finishedSize} ${order.sizeUnit || ''}`.trim()
                : '—'}
          </div>
        );

      case 'fileFormat': {
        const fmt = order.machineFormat || order.fileFormat;
        return fmt ? (
          <span className='uppercase text-xs font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'>
            {fmt}
          </span>
        ) : (
          <span className='text-gray-400 text-xs'>—</span>
        );
      }

      case 'turnaround':
        return (
          <div className='text-sm'>
            {order.rushOrder ? 'Rush (+$5)' : order.turnaround || '—'}
          </div>
        );
      case 'preferredBudget':
        return (
          <div className='text-sm text-center'>
            {`$${order.preferredBudget || 0}`}
          </div>
        );

      case 'status': {
        // Priced order with no payment channel yet → flag it so it can be tagged.
        const untagged =
          Number(order.estimatedPrice) > 0 &&
          !(order.paymentChannel || '').trim();
        return (
          <div className='flex flex-col items-start gap-1'>
            <Chip
              color={STATUS_CHIP_COLOR[order.status] || 'default'}
              size='sm'
              variant='flat'
            >
              {STATUS_LABELS[order.status] || order.status}
            </Chip>
            {untagged && (
              <Chip
                size='sm'
                variant='flat'
                className='bg-gray-200 text-gray-700 text-[10px]'
              >
                Untagged
              </Chip>
            )}
          </div>
        );
      }

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
                key='quote'
                startContent={<CreditCard size={16} />}
                onClick={() => handleQuote(order)}
              >
                {['awaiting_payment', 'expired', 'cancelled'].includes(order.status)
                  ? 'Re-quote / Update Price'
                  : 'Set Price & Request Payment'}
              </DropdownItem>
              <DropdownItem
                key='payment-request'
                startContent={<Send size={16} />}
                onClick={() => handlePayRequest(order)}
              >
                Request Payment (Stripe Link)
              </DropdownItem>
              <DropdownItem
                key='deliver'
                startContent={<Upload size={16} />}
                onClick={() => handleDeliver(order)}
              >
                {order.deliveryFiles?.length > 0 ? 'Upload New Version' : 'Upload Delivery ZIP'}
              </DropdownItem>
              {order.deliveryFiles?.length > 0 ? (
                <DropdownItem
                  key='download-delivery'
                  startContent={<Download size={16} />}
                  onClick={() => downloadDelivery(order)}
                >
                  Download Delivery ZIP
                </DropdownItem>
              ) : null}
              <DropdownItem
                key='resend-access'
                startContent={<LinkIcon size={16} />}
                onClick={() => resendAccessLink(order)}
              >
                Resend Access Link
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
              Status:{' '}
              {statusFilter === 'all'
                ? 'all'
                : STATUS_LABELS[statusFilter] || statusFilter}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label='Status filter'
            selectedKeys={[statusFilter]}
            onAction={(k) => handleStatusFilter(k)}
          >
            <DropdownItem key='all'>All</DropdownItem>
            <DropdownItem key='pending_review'>Pending Review</DropdownItem>
            <DropdownItem key='awaiting_payment'>Awaiting Payment</DropdownItem>
            <DropdownItem key='paid'>Paid</DropdownItem>
            <DropdownItem key='in_progress'>In Progress</DropdownItem>
            <DropdownItem key='delivered'>Delivered</DropdownItem>
            <DropdownItem key='in_revision'>In Revision</DropdownItem>
            <DropdownItem key='completed'>Completed</DropdownItem>
            <DropdownItem key='cancelled'>Cancelled</DropdownItem>
            <DropdownItem key='expired'>Expired</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown>
          <DropdownTrigger>
            <Button variant='flat' className='capitalize min-w-[170px]'>
              Payment:{' '}
              {paymentTagFilter === 'untagged'
                ? 'Untagged (paid)'
                : paymentTagFilter === 'tagged'
                  ? 'Tagged'
                  : 'all'}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label='Payment tag filter'
            selectedKeys={[paymentTagFilter]}
            onAction={(k) => handlePaymentTagFilter(k)}
          >
            <DropdownItem key='all'>All</DropdownItem>
            <DropdownItem key='untagged'>Untagged (paid)</DropdownItem>
            <DropdownItem key='tagged'>Tagged</DropdownItem>
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
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[viewOrder.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {STATUS_LABELS[viewOrder.status] || viewOrder.status}
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

                {/* Origin / Location — only renders if any IP data was captured */}
                {(viewOrder?.ip || viewOrder?.ipInfo) && (
                  <>
                    <Divider />
                    <div>
                      <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5'>
                        <MapPin size={13} className='text-gray-400' />
                        Origin
                      </p>

                      {/* Hero block: country + city, prominent */}
                      {(viewOrder?.ipInfo?.country ||
                        viewOrder?.ipInfo?.city) && (
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-4'>
                          <div className='w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center shrink-0'>
                            <Globe size={18} />
                          </div>
                          <div className='min-w-0'>
                            <p className='text-sm font-bold text-gray-900 dark:text-gray-100 truncate'>
                              {formatLocation(viewOrder.ipInfo) || '—'}
                            </p>
                            {viewOrder?.ipInfo?.timezone && (
                              <p className='text-xs text-gray-500'>
                                {viewOrder.ipInfo.timezone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {viewOrder?.ip && (
                          <DetailRow
                            label='IP Address'
                            value={
                              <span className='font-mono text-sm'>
                                {viewOrder.ip}
                              </span>
                            }
                          />
                        )}
                        <DetailRow
                          label='Postal'
                          value={viewOrder?.ipInfo?.postal}
                        />
                        <DetailRow
                          label='Region'
                          value={viewOrder?.ipInfo?.region}
                        />
                        <DetailRow
                          label='Org / ISP'
                          value={viewOrder?.ipInfo?.org}
                        />
                        <DetailRow
                          label='Coordinates'
                          value={viewOrder?.ipInfo?.loc}
                        />
                      </div>
                    </div>
                  </>
                )}

                <Divider />

                {/* Order specs */}
                <div>
                  <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3'>
                    Order Specifications
                  </p>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <DetailRow
                      label='Machine Format'
                      value={
                        viewOrder?.machineFormat ||
                        viewOrder?.fileFormat ||
                        'Not specified'
                      }
                    />
                    <DetailRow
                      label='Design Type'
                      value={
                        viewOrder?.designType ||
                        viewOrder?.complexity ||
                        'Not specified'
                      }
                    />
                    <DetailRow
                      label='Fabric / Garment'
                      value={viewOrder?.fabricType || 'Not specified'}
                    />
                    <DetailRow
                      label='Finished Size'
                      value={
                        viewOrder?.finishedSize || sizeText || 'Not specified'
                      }
                    />
                    <DetailRow
                      label='Preferred Budget'
                      value={
                        viewOrder?.preferredBudget != null
                          ? `$${viewOrder.preferredBudget}`
                          : 'Not specified'
                      }
                    />
                    <DetailRow
                      label='Rush Order'
                      value={viewOrder?.rushOrder ? 'Yes (+$5)' : 'No'}
                    />
                    {viewOrder?.turnaround && (
                      <DetailRow
                        label='Turnaround'
                        value={viewOrder.turnaround}
                      />
                    )}
                  </div>
                  {(viewOrder?.specialInstructions || viewOrder?.details) && (
                    <div className='mt-4'>
                      <DetailRow
                        label='Special Instructions'
                        value={
                          viewOrder.specialInstructions || viewOrder.details
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Payment & delivery */}
                {(viewOrder?.paidAt ||
                  viewOrder?.stripeSessionId ||
                  viewOrder?.deliveryFiles?.length > 0) && (
                  <>
                    <Divider />
                    <div>
                      <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3'>
                        Payment &amp; Delivery
                      </p>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {viewOrder?.paidAt && (
                          <DetailRow
                            label='Paid At'
                            value={new Date(viewOrder.paidAt).toLocaleString()}
                          />
                        )}
                        {viewOrder?.stripePaymentIntentId && (
                          <DetailRow
                            label='Stripe Payment Intent'
                            value={
                              <span className='font-mono text-xs'>
                                {viewOrder.stripePaymentIntentId}
                              </span>
                            }
                          />
                        )}
                        {viewOrder?.stripeSessionId && (
                          <DetailRow
                            label='Stripe Session'
                            value={
                              <span className='font-mono text-xs'>
                                {viewOrder.stripeSessionId}
                              </span>
                            }
                          />
                        )}
                        {viewOrder?.deliveredAt && (
                          <DetailRow
                            label='Delivered At'
                            value={new Date(viewOrder.deliveredAt).toLocaleString()}
                          />
                        )}
                        {viewOrder?.deliveryFiles?.length > 0 && (
                          <DetailRow
                            label='Delivery File'
                            value={`v${Math.max(...viewOrder.deliveryFiles.map((f) => f.version))} — ${viewOrder.deliveryFiles[viewOrder.deliveryFiles.length - 1].originalName}`}
                          />
                        )}
                        {viewOrder?.revisions?.length > 0 && (
                          <DetailRow
                            label='Revisions Requested'
                            value={viewOrder.revisions.length}
                          />
                        )}
                      </div>
                      {viewOrder?.revisions?.length > 0 && (
                        <div className='mt-3 space-y-2'>
                          {viewOrder.revisions.map((r, i) => (
                            <div
                              key={i}
                              className='rounded-lg bg-gray-50 dark:bg-gray-900 p-3 text-sm'
                            >
                              <p className='text-xs text-gray-400 mb-1'>
                                Revision #{i + 1} ·{' '}
                                {new Date(r.requestedAt).toLocaleString()}
                              </p>
                              <p className='whitespace-pre-wrap'>{r.notes}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Admin section */}
                {(viewOrder?.estimatedPrice != null ||
                  viewOrder?.paymentChannel ||
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
                        {viewOrder?.paymentChannel && (
                          <DetailRow
                            label='Payment Channel'
                            value={viewOrder.paymentChannel}
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

              <ModalFooter className='flex-wrap gap-2'>
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
                  variant='flat'
                  startContent={<CreditCard size={16} />}
                  onPress={() => {
                    onClose();
                    handleQuote(viewOrder);
                  }}
                >
                  Set Price
                </Button>
                <Button
                  variant='flat'
                  startContent={<Upload size={16} />}
                  onPress={() => {
                    onClose();
                    handleDeliver(viewOrder);
                  }}
                >
                  Upload ZIP
                </Button>
                {viewOrder?.deliveryFiles?.length > 0 && (
                  <Button
                    variant='flat'
                    isLoading={downloadingDelivery}
                    startContent={<Download size={16} />}
                    onPress={() => downloadDelivery(viewOrder)}
                  >
                    Download ZIP
                  </Button>
                )}
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
                    description='Admin override — any status can be set. This never emails the customer; use "Set Price" for quoting and "Upload ZIP" for delivery (those notify them).'
                    selectedKeys={[newStatus]}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {Object.keys(STATUS_LABELS).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s] || s}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    type='number'
                    label='Estimated Price (Optional)'
                    placeholder='Enter price'
                    description='Note: this only records the number. To quote the customer (email + payment link), use the "Set Price & Request Payment" action instead.'
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    startContent={<span className='text-sm'>$</span>}
                  />
                  <Input
                    label='Payment Channel (Optional)'
                    placeholder='e.g. embroidize stripe, saklain paypal, etsy'
                    description='Type how you received the money. The income breakdown groups amounts by this exact text — reuse the same wording to keep a total together.'
                    value={paymentChannel}
                    onChange={(e) => setPaymentChannel(e.target.value)}
                  />
                  <Textarea
                    label='Admin Notes (Optional)'
                    placeholder='Any internal notes about this order'
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

      {/* ─── Quote (Set Price & Request Payment) Modal ─── */}
      <Modal isOpen={isQuoteOpen} onOpenChange={onQuoteChange} backdrop='blur'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className='flex items-center gap-2'>
                  <CreditCard size={20} />
                  Set Price &amp; Request Payment
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <div className='bg-gray-50 dark:bg-gray-900 p-3 rounded-lg'>
                    <p className='font-semibold'>{quoteOrder?.name}</p>
                    <p className='text-sm text-gray-600'>{quoteOrder?.email}</p>
                    <p className='text-xs font-mono text-gray-500 mt-1'>
                      Order: {quoteOrder?.orderNumber}
                    </p>
                    {quoteOrder?.preferredBudget != null && (
                      <p className='text-xs text-gray-500 mt-1'>
                        Customer&apos;s preferred budget: ${quoteOrder.preferredBudget}
                      </p>
                    )}
                  </div>
                  <Input
                    type='number'
                    label='Price (USD)'
                    placeholder='e.g. 25'
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    startContent={<span className='text-sm'>$</span>}
                    autoFocus
                  />
                  <p className='text-xs text-gray-500'>
                    The order moves to <strong>Awaiting Payment</strong> and the
                    customer gets an email with this price and a secure Stripe
                    checkout link. Payment confirmation arrives via webhook and
                    tags the income channel as “Stripe” automatically.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  isLoading={isQuoting}
                  onPress={submitQuote}
                >
                  Set Price &amp; Notify
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ─── Manual Payment Request (direct Stripe link) Modal ─── */}
      <Modal isOpen={isPayReqOpen} onOpenChange={onPayReqChange} backdrop='blur'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className='flex items-center gap-2'>
                  <Send size={20} />
                  Request Payment (Stripe Link)
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <div className='bg-gray-50 dark:bg-gray-900 p-3 rounded-lg'>
                    <p className='font-semibold'>{payReqOrder?.name}</p>
                    <p className='text-sm text-gray-600'>{payReqOrder?.email}</p>
                    <p className='text-xs font-mono text-gray-500 mt-1'>
                      Order: {payReqOrder?.orderNumber}
                    </p>
                  </div>

                  {!payReqUrl ? (
                    <>
                      <Input
                        type='number'
                        label='Amount (USD)'
                        placeholder='e.g. 10'
                        value={payReqAmount}
                        onChange={(e) => setPayReqAmount(e.target.value)}
                        startContent={<span className='text-sm'>$</span>}
                        autoFocus
                      />
                      <Textarea
                        label='Note (optional)'
                        placeholder='e.g. Extra revision fee — 3rd revision on this order'
                        value={payReqNote}
                        onChange={(e) => setPayReqNote(e.target.value)}
                        maxRows={3}
                      />
                      <p className='text-xs text-gray-500'>
                        Creates a direct Stripe checkout link — the customer just
                        clicks and pays, no order page needed. The link is emailed
                        to them automatically and shown here to copy. The order
                        status doesn&apos;t change until Stripe confirms payment.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className='bg-gray-50 dark:bg-gray-900 p-3 rounded-lg'>
                        <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>
                          Payment link (valid 24 hours)
                        </p>
                        <p className='text-xs font-mono break-all select-all'>
                          {payReqUrl}
                        </p>
                      </div>
                      <p className='text-xs text-gray-500'>
                        The link was emailed to {payReqOrder?.email}. You can also
                        copy it and send it yourself. If it expires unpaid, just
                        create a new one from this same action.
                      </p>
                    </>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  {payReqUrl ? 'Done' : 'Cancel'}
                </Button>
                {!payReqUrl ? (
                  <Button
                    color='primary'
                    isLoading={isPayRequesting}
                    onPress={submitPayRequest}
                  >
                    Create &amp; Email Link
                  </Button>
                ) : (
                  <Button
                    color='primary'
                    startContent={<Copy size={16} />}
                    onPress={copyPayLink}
                  >
                    Copy Link
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ─── Deliver (Upload ZIP) Modal ─── */}
      <Modal isOpen={isDeliverOpen} onOpenChange={onDeliverChange} backdrop='blur'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className='flex items-center gap-2'>
                  <Upload size={20} />
                  Upload Delivery ZIP
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <div className='bg-gray-50 dark:bg-gray-900 p-3 rounded-lg'>
                    <p className='font-semibold'>{deliverOrder?.name}</p>
                    <p className='text-xs font-mono text-gray-500 mt-1'>
                      Order: {deliverOrder?.orderNumber}
                    </p>
                  </div>

                  <input
                    type='file'
                    accept='.zip'
                    onChange={(e) => setDeliverFile(e.target.files?.[0] || null)}
                    className='block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-800'
                  />
                  {deliverFile && (
                    <p className='text-xs text-gray-600'>
                      {deliverFile.name} ({(deliverFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}

                  {/* Current file + verify download */}
                  {deliverOrder?.deliveryFiles?.length > 0 && (
                    <div className='rounded-lg border border-gray-200 dark:border-gray-800'>
                      <p className='px-3 pt-2 text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                        Current file (will be replaced)
                      </p>
                      {[...deliverOrder.deliveryFiles]
                        .sort((a, b) => b.version - a.version)
                        .map((f) => (
                          <div
                            key={f.version}
                            className='flex items-center justify-between px-3 py-2 text-sm'
                          >
                            <div className='min-w-0'>
                              <span className='font-semibold'>v{f.version}</span>{' '}
                              <span className='truncate text-gray-600'>{f.originalName}</span>
                              <span className='ml-1 text-xs text-gray-400'>
                                {(f.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                            <Button
                              size='sm'
                              variant='light'
                              isLoading={downloadingDelivery}
                              startContent={<Download size={13} />}
                              onPress={() => downloadDelivery(deliverOrder, f.version)}
                            >
                              Verify
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}

                  <p className='text-xs text-gray-500'>
                    One .zip containing all machine formats. Uploading{' '}
                    <strong>replaces the previous file</strong> — the old ZIP is
                    deleted from storage and the customer always downloads this
                    latest one. The order moves to <strong>Delivered</strong>{' '}
                    and the customer is emailed their download link.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  isLoading={isDelivering}
                  isDisabled={!deliverFile}
                  onPress={submitDelivery}
                >
                  Upload &amp; Deliver
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
