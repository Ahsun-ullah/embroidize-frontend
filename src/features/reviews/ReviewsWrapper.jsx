'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import Pagination from '@/components/Common/Pagination';
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  useDisclosure,
} from '@heroui/react';
import { ExternalLink, Mail, Search, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

function getToken() {
  const row = document.cookie.split('; ').find((r) => r.startsWith('token='));
  return row ? row.split('=').slice(1).join('=') : undefined;
}

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

function authHeaders() {
  const token = getToken();
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function Stars({ value = 0 }) {
  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={
            n <= value
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }
        />
      ))}
    </div>
  );
}

export default function ReviewsWrapper({
  items,
  pagination,
  initialSearch = '',
  initialRating = '',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [reviews, setReviews] = useState(items || []);
  const [search, setSearch] = useState(initialSearch);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // "Ask customer to update their review" email composer
  const {
    isOpen: isEmailOpen,
    onOpen: onEmailOpen,
    onOpenChange: onEmailOpenChange,
  } = useDisclosure();
  const [emailTarget, setEmailTarget] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Keep local rows in sync when the server sends a new page/filter.
  useEffect(() => {
    setReviews(items || []);
  }, [items]);

  // On first open of the page, mark all unseen reviews as seen so the dashboard
  // "new" badge clears. We intentionally do NOT refresh, so the NEW tags stay
  // visible in this view — the admin can still see what arrived since last time.
  const markedRef = useRef(false);
  useEffect(() => {
    if (markedRef.current) return;
    markedRef.current = true;
    fetch(`${apiBase()}/admin/reviews/mark-seen`, {
      method: 'POST',
      headers: authHeaders(),
    }).catch(() => {});
  }, []);

  const pushQuery = (next) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
      else params.delete(k);
    });
    // any filter change resets to page 1
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    pushQuery({ search: search.trim() });
  };

  const onRatingChange = (e) => {
    pushQuery({ rating: e.target.value });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${apiBase()}/reviews/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to delete review');
      setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      SuccessToast('Success', 'Review deleted.', 3000);
      onOpenChange(false);
      setDeleteTarget(null);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to delete review', 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEmailModal = (item) => {
    const productName = item.productId?.name || 'your design';
    const customerName = item.userId?.name || 'there';
    setEmailTarget(item);
    setEmailSubject(`We've updated ${productName} — take another look`);
    setEmailMessage(
      `Hi ${customerName},\n\n` +
        `We've made some improvements to "${productName}" based on your feedback. ` +
        `We'd love for you to take another look and update your review if you're happy with the changes.\n\n` +
        `Thank you for helping us improve!`,
    );
    onEmailOpen();
  };

  const sendUpdateRequest = async () => {
    if (!emailTarget) return;
    setIsSending(true);
    try {
      const res = await fetch(
        `${apiBase()}/admin/reviews/${emailTarget._id}/request-update`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            subject: emailSubject.trim(),
            message: emailMessage.trim(),
          }),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to send email');
      SuccessToast(
        'Email sent',
        `Update request sent to ${emailTarget.userId?.email || 'the customer'}.`,
        3000,
      );
      onEmailOpenChange(false);
      setEmailTarget(null);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to send email', 3000);
    } finally {
      setIsSending(false);
    }
  };

  const columns = [
    { uid: 'product', name: 'PRODUCT' },
    { uid: 'customer', name: 'CUSTOMER' },
    { uid: 'rating', name: 'RATING' },
    { uid: 'review', name: 'REVIEW' },
    { uid: 'date', name: 'DATE' },
    { uid: 'actions', name: 'ACTIONS' },
  ];

  const renderCell = (item, key) => {
    const product = item.productId || {};
    const user = item.userId || {};
    switch (key) {
      case 'product':
        return (
          <div className='flex items-center gap-2 min-w-[180px]'>
            {product.image?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image.url}
                alt={product.name || 'product'}
                className='w-10 h-10 rounded object-cover shrink-0'
              />
            )}
            <div className='flex flex-col'>
              <span className='text-sm font-medium line-clamp-2'>
                {product.name || '—'}
              </span>
              {item.adminSeen === false && (
                <Chip size='sm' color='danger' variant='flat' className='mt-1 w-fit'>
                  NEW
                </Chip>
              )}
            </div>
          </div>
        );
      case 'customer':
        return (
          <div className='text-xs'>
            <p className='font-medium'>{user.name || 'User'}</p>
            {user.email && <p className='text-gray-500'>{user.email}</p>}
          </div>
        );
      case 'rating':
        return <Stars value={item.rating} />;
      case 'review':
        return (
          <div className='max-w-[280px]'>
            <p className='text-xs text-gray-700 line-clamp-3'>
              {item.reviewText?.trim() ? item.reviewText : '— (no text)'}
            </p>
            {item.images?.length > 0 && (
              <div className='flex gap-1 mt-1'>
                {item.images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.public_id}
                    src={img.url}
                    alt='review'
                    className='w-8 h-8 rounded object-cover'
                  />
                ))}
              </div>
            )}
            {item.isEdited && (
              <span className='text-[10px] text-gray-400'>(edited)</span>
            )}
          </div>
        );
      case 'date':
        return (
          <span className='text-xs text-gray-500'>
            {formatDate(item.createdAt)}
          </span>
        );
      case 'actions':
        return (
          <div className='flex items-center gap-1'>
            {product.slug && (
              <Tooltip content='Open product page'>
                <Button
                  isIconOnly
                  size='sm'
                  variant='light'
                  as={Link}
                  href={`/product/${product.slug}`}
                  target='_blank'
                  aria-label='Open product page'
                >
                  <ExternalLink size={15} />
                </Button>
              </Tooltip>
            )}
            {user.email && (
              <Tooltip content='Ask customer to update review'>
                <Button
                  isIconOnly
                  size='sm'
                  variant='light'
                  onPress={() => openEmailModal(item)}
                  aria-label='Ask customer to update review'
                >
                  <Mail size={15} />
                </Button>
              </Tooltip>
            )}
            <Tooltip content='Delete review' color='danger'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                color='danger'
                onPress={() => {
                  setDeleteTarget(item);
                  onOpen();
                }}
                aria-label='Delete review'
              >
                <Trash2 size={15} />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Manage Reviews</h1>
        <p className='text-sm text-gray-500 mt-0.5'>
          {pagination?.total ?? reviews.length} review
          {(pagination?.total ?? reviews.length) !== 1 ? 's' : ''} total
        </p>
      </div>

      <div className='flex items-end gap-3 flex-wrap'>
        <form onSubmit={onSearchSubmit} className='flex items-end gap-2'>
          <Input
            label='Search'
            placeholder='Product, customer or review text…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-72'
            size='sm'
          />
          <Button type='submit' color='primary' startContent={<Search size={16} />}>
            Search
          </Button>
        </form>

        <Select
          label='Rating'
          size='sm'
          className='w-40'
          selectedKeys={initialRating ? [String(initialRating)] : []}
          onChange={onRatingChange}
        >
          <SelectItem key=''>All ratings</SelectItem>
          <SelectItem key='5'>★★★★★ (5)</SelectItem>
          <SelectItem key='4'>★★★★ (4)</SelectItem>
          <SelectItem key='3'>★★★ (3)</SelectItem>
          <SelectItem key='2'>★★ (2)</SelectItem>
          <SelectItem key='1'>★ (1)</SelectItem>
        </Select>
      </div>

      <Table aria-label='Reviews' removeWrapper>
        <TableHeader columns={columns}>
          {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
        </TableHeader>
        <TableBody
          items={reviews}
          emptyContent={
            <div className='py-12 text-center text-gray-400 text-sm'>
              No reviews found.
            </div>
          }
        >
          {(item) => (
            <TableRow key={item._id}>
              {(colKey) => <TableCell>{renderCell(item, colKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pagination?.pages > 1 && (
        <div className='flex items-center justify-center mt-6'>
          <Pagination
            perPageData={pagination.limit}
            totalPages={pagination.pages}
          />
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop='blur' size='md'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Review</ModalHeader>
              <ModalBody>
                <p className='text-sm'>
                  Permanently delete this{' '}
                  <strong>{deleteTarget?.rating}-star</strong> review
                  {deleteTarget?.userId?.name
                    ? ` by ${deleteTarget.userId.name}`
                    : ''}
                  {deleteTarget?.productId?.name
                    ? ` on “${deleteTarget.productId.name}”`
                    : ''}
                  ?
                </p>
                {deleteTarget?.reviewText?.trim() && (
                  <p className='text-xs text-gray-500 mt-2 italic border-l-2 border-gray-200 pl-2'>
                    “{deleteTarget.reviewText}”
                  </p>
                )}
                <p className='text-xs text-gray-500 mt-2'>
                  This also removes the review&apos;s images and recalculates the
                  product&apos;s rating. This cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button color='danger' isLoading={isDeleting} onPress={confirmDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Ask Customer to Update Review Modal ── */}
      <Modal
        isOpen={isEmailOpen}
        onOpenChange={onEmailOpenChange}
        backdrop='blur'
        size='lg'
        scrollBehavior='inside'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Ask customer to update review
                <span className='text-xs font-normal text-gray-500'>
                  To {emailTarget?.userId?.name || 'customer'}
                  {emailTarget?.userId?.email
                    ? ` · ${emailTarget.userId.email}`
                    : ''}
                  {emailTarget?.productId?.name
                    ? ` · on “${emailTarget.productId.name}”`
                    : ''}
                </span>
              </ModalHeader>
              <ModalBody>
                <Input
                  label='Subject'
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  size='sm'
                />
                <Textarea
                  label='Message'
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  minRows={6}
                />
                <p className='text-xs text-gray-500'>
                  An “Update Your Review” button linking straight to this
                  product&apos;s review section is added to the email
                  automatically.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  isLoading={isSending}
                  isDisabled={!emailSubject.trim() || !emailMessage.trim()}
                  onPress={sendUpdateRequest}
                >
                  Send Email
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
