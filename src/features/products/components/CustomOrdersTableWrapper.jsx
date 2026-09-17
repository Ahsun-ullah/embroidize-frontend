'use client';

// The admin custom-orders table. This file is deliberately small: it renders
// the toolbar, the rows and the pagination, and nothing else. Every dialog and
// mutation handler lives in OrderDialogs, which is pulled in with next/dynamic
// the first time an action is picked — before this split the whole screen was
// one 3.1k-line client component whose twelve modals shipped on first paint.

import {
  STATUS_BADGE,
  STATUS_LABELS,
  STATUS_ORDER,
  agingInfo,
  isOptimizableImage,
  money,
  quoteExpiryDays,
} from '@/features/customOrders/admin/shared';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import {
  Banknote,
  CreditCard,
  Download,
  Eye,
  FileText,
  Globe,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  MoreVertical,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  Undo2,
  Upload,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, use, useState } from 'react';

const OrderDialogs = dynamic(
  () => import('@/features/customOrders/admin/OrderDialogs'),
  { ssr: false },
);

// Six columns of substance instead of thirteen. Nothing was dropped — the
// specs, the money and the dates are grouped into the cell they belong to, so
// the table stops scrolling sideways and starts being scannable.
const COLUMNS = [
  { uid: 'design', name: 'Image' },
  { uid: 'order', name: 'Order' },
  { uid: 'customer', name: 'Customer' },
  { uid: 'country', name: 'Country' },
  { uid: 'spec', name: 'Specification' },
  { uid: 'money', name: 'Money' },
  { uid: 'status', name: 'Status' },
  { uid: 'actions', name: 'Actions' },
];

const PAYMENT_TAG_LABELS = {
  all: 'All',
  untagged: 'Untagged (paid)',
  tagged: 'Tagged',
};

// A small monochrome pill. Everything on this screen is black-and-white by
// brand rule, so emphasis comes from ink weight, never hue.
function Pill({ children, tone = 'light', title }) {
  const tones = {
    solid: 'bg-gray-900 text-white',
    light: 'bg-gray-100 text-gray-600',
    outline: 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200',
  };
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium leading-4 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// 40px thumbnail. These are the customer's original uploads — full-resolution
// artwork — so they go through next/image and come down as ~40px WebP instead
// of the multi-megabyte originals the old table put straight in an <img>.
function DesignThumb({ order, onOpen }) {
  const ref = order.designReference;

  // console.log(order);

  if (!ref?.url) {
    return (
      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 ring-1 ring-inset ring-gray-200'>
        <span className='text-[10px] font-medium text-gray-300'>—</span>
      </div>
    );
  }

  if (!ref.mimetype?.startsWith('image/')) {
    return (
      <a
        href={ref.url}
        target='_blank'
        rel='noopener noreferrer'
        title={ref.originalName || 'Download file'}
        className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 ring-1 ring-inset ring-gray-200 transition-colors hover:ring-gray-400'
      >
        <FileText size={15} className='text-gray-400' />
      </a>
    );
  }

  return (
    <button
      type='button'
      onClick={() => onOpen(ref.url)}
      title='Click to enlarge'
      className='block h-10 w-10 overflow-hidden rounded-lg ring-1 ring-inset ring-gray-200 transition-all hover:ring-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900'
    >
      {isOptimizableImage(ref.url) ? (
        <Image
          src={ref.url}
          alt={ref.originalName || 'design'}
          width={40}
          height={40}
          quality={75}
          className='h-10 w-10 object-cover'
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={ref.url}
          alt={ref.originalName || 'design'}
          loading='lazy'
          decoding='async'
          className='h-10 w-10 object-cover'
        />
      )}
    </button>
  );
}

function NeedsActionBadge({ promise, active }) {
  const count = use(promise)?.stats?.needsActionCount ?? 0;
  if (!count) return null;
  return (
    <span
      className={`ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-bold ${
        active ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
      }`}
    >
      {count}
    </span>
  );
}

export default function CustomOrdersTableWrapper({
  initialData,
  pagination,
  needsActionPromise = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || '',
  );
  const statusFilter = searchParams.get('status') || 'all';
  const paymentTagFilter = searchParams.get('paymentTag') || 'all';
  const needsActionActive = searchParams.get('needsAction') === '1';

  // The only dialog state the table keeps: what was asked for, and whether the
  // dialog bundle has been needed yet. `nonce` lets the same action fire twice
  // in a row on the same row.
  const [request, setRequest] = useState(null);
  const [dialogsLoaded, setDialogsLoaded] = useState(false);
  const act = (kind, order, url) => {
    setDialogsLoaded(true);
    setRequest({ kind, order, url, nonce: Date.now() });
  };

  const setParam = (mutate) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (value) =>
    setParam((p) => (value ? p.set('search', value) : p.delete('search')));

  const handleStatusFilter = (status) =>
    setParam((p) =>
      status !== 'all' ? p.set('status', status) : p.delete('status'),
    );

  const handlePaymentTagFilter = (tag) =>
    setParam((p) =>
      tag !== 'all' ? p.set('paymentTag', tag) : p.delete('paymentTag'),
    );

  const toggleNeedsAction = () =>
    setParam((p) =>
      needsActionActive ? p.delete('needsAction') : p.set('needsAction', '1'),
    );

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const renderCell = (order, columnKey) => {
    switch (columnKey) {
      case 'design':
        return (
          <DesignThumb
            order={order}
            onOpen={(u) => act('lightbox', order, u)}
          />
        );

      case 'order':
        return (
          <div className='min-w-[112px]'>
            <button
              type='button'
              onClick={() => act('view', order)}
              className='font-mono text-[13px] font-semibold text-gray-900 underline-offset-2 hover:underline'
            >
              {order.orderNumber}
            </button>
            <div className='mt-0.5 text-[11px] text-gray-400'>
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        );

      case 'customer': {
        const repeat = Number(order.customerOrderCount) || 1;
        return (
          <div className='min-w-[170px] max-w-[230px]'>
            <div className='flex items-center gap-1.5'>
              <span className='truncate text-[13px] font-medium text-gray-900'>
                {order.name}
              </span>
              {repeat > 1 && (
                <Pill
                  tone='solid'
                  title={`Repeat customer — ${repeat} orders, ${money(order.customerLifetimeCollected)} lifetime`}
                >
                  ×{repeat}
                </Pill>
              )}
            </div>
            <div className='truncate text-[11px] text-gray-400'>
              {order.email}
            </div>
          </div>
        );
      }

      case 'country': {
        // There is no order.country — the origin is resolved from the client IP
        // at order creation and stored on ipInfo, with the two-letter code
        // already expanded to a full country name. City is the secondary line,
        // and a bare IP is the last resort for rows whose lookup failed.
        const country = order.ipInfo?.country;
        const city = order.ipInfo?.city;
        if (!country && !city && !order.ip) {
          return <span className='text-xs text-gray-300'>—</span>;
        }
        return (
          <div className='min-w-[110px]'>
            {country ? (
              <div className='flex items-center gap-1'>
                <Globe size={11} className='shrink-0 text-gray-400' />
                <span className='truncate text-[12px] font-medium text-gray-900'>
                  {country}
                </span>
              </div>
            ) : null}
            {city ? (
              <div className='truncate text-[11px] text-gray-400'>{city}</div>
            ) : null}
            {!country && !city ? (
              <span className='font-mono text-[11px] text-gray-400'>
                {order.ip}
              </span>
            ) : null}
          </div>
        );
      }

      case 'spec': {
        const size =
          order.sizeWidth || order.sizeHeight
            ? `${order.sizeWidth} × ${order.sizeHeight} ${order.sizeUnit || ''}`.trim()
            : order.finishedSize
              ? `${order.finishedSize} ${order.sizeUnit || ''}`.trim()
              : null;
        const fmt = order.machineFormat || order.fileFormat;
        const turnaround = order.rushOrder
          ? 'Rush (+$5)'
          : order.turnaround || null;
        if (!size && !fmt && !turnaround) {
          return <span className='text-xs text-gray-300'>—</span>;
        }
        return (
          <div className='flex min-w-[150px] flex-wrap items-center gap-1'>
            {fmt && <Pill tone='outline'>{String(fmt).toUpperCase()}</Pill>}
            {size && <span className='text-[12px] text-gray-600'>{size}</span>}
            {turnaround && (
              <span className='text-[11px] text-gray-400'>· {turnaround}</span>
            )}
          </div>
        );
      }

      case 'money': {
        const paid = Number(order.amountPaid) || 0;
        const quoted = Number(order.estimatedPrice) || 0;
        const budget = Number(order.preferredBudget) || 0;
        return (
          <div className='min-w-[104px]'>
            <div className='text-[13px] font-semibold text-gray-900'>
              {paid > 0 ? money(paid) : quoted > 0 ? money(quoted) : '—'}
              {paid > 0 && quoted > 0 && paid < quoted && (
                <span className='ml-1 text-[11px] font-normal text-gray-400'>
                  of {money(quoted)}
                </span>
              )}
            </div>
            <div className='mt-0.5 text-[11px] text-gray-400'>
              {paid > 0 ? 'collected' : quoted > 0 ? 'quoted' : null}
              {budget > 0 && (
                <span>
                  {paid > 0 || quoted > 0 ? ' · ' : ''}budget {money(budget)}
                </span>
              )}
            </div>
          </div>
        );
      }

      case 'status': {
        const untagged =
          Number(order.estimatedPrice) > 0 &&
          !(order.paymentChannel || '').trim();
        const revisionCount = order.revisions?.length || 0;
        const paidRevision =
          order.status === 'in_revision' && revisionCount > 2;
        const unread = Number(order.unreadCount) || 0;
        const overdue = agingInfo(order);
        const expiresIn = quoteExpiryDays(order);
        return (
          <div className='flex min-w-[168px] flex-col items-start gap-1'>
            <span
              className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold leading-5 ${
                STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-600'
              }`}
            >
              {STATUS_LABELS[order.status] || order.status}
            </span>
            <div className='flex flex-wrap items-center gap-1'>
              {unread > 0 && (
                <Pill tone='solid'>
                  <MessageSquare size={9} />
                  {unread} new
                </Pill>
              )}
              {overdue && <Pill tone='solid'>{overdue}</Pill>}
              {expiresIn != null && (
                <Pill tone='outline'>
                  {expiresIn > 0
                    ? `Expires in ${expiresIn}d`
                    : 'Expiring today'}
                  {order.reminderSentAt ? ' · reminded' : ''}
                </Pill>
              )}
              {paidRevision && <Pill tone='outline'>Paid revision</Pill>}
              {revisionCount > 0 &&
                ['delivered', 'in_revision', 'completed'].includes(
                  order.status,
                ) && <Pill>{Math.min(revisionCount, 2)}/2 revisions</Pill>}
              {untagged && <Pill tone='outline'>Untagged</Pill>}
              {order.estimatedDelivery && (
                <Pill title='Promised delivery'>
                  ETA {order.estimatedDelivery}
                </Pill>
              )}
            </div>
          </div>
        );
      }

      case 'actions': {
        // Only surface the actions that make sense for this order's status.
        const hasPrice = Number(order.estimatedPrice) > 0;
        const hasFiles = order.deliveryFiles?.length > 0;
        const canQuote = [
          'pending_review',
          'awaiting_payment',
          'expired',
          'cancelled',
        ].includes(order.status);
        const canRequestPayment = ![
          'pending_review',
          'cancelled',
          'expired',
        ].includes(order.status);
        const canDeliver = [
          'paid',
          'in_progress',
          'in_revision',
          'delivered',
          'completed',
        ].includes(order.status);

        return (
          <Dropdown placement='bottom-end'>
            <DropdownTrigger>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                aria-label='Order actions'
              >
                <MoreVertical size={16} className='text-gray-500' />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label='Order actions'
              onAction={(key) => act(String(key), order)}
            >
              <DropdownItem key='view' startContent={<Eye size={15} />}>
                View Details
              </DropdownItem>
              <DropdownItem
                key='messages'
                startContent={<MessageSquare size={15} />}
              >
                Messages
              </DropdownItem>
              {canQuote ? (
                <DropdownItem
                  key='quote'
                  startContent={<CreditCard size={15} />}
                >
                  {['awaiting_payment', 'expired', 'cancelled'].includes(
                    order.status,
                  )
                    ? 'Re-quote / Update Price'
                    : 'Set Price & Request Payment'}
                </DropdownItem>
              ) : null}
              {canRequestPayment ? (
                <DropdownItem
                  key='payment-request'
                  startContent={<Send size={15} />}
                >
                  {order.paymentOptions?.length
                    ? 'Request Extra Payment'
                    : 'Request Payment (Stripe Link)'}
                </DropdownItem>
              ) : null}
              {canRequestPayment ? (
                <DropdownItem
                  key='record-payment'
                  startContent={<Banknote size={15} />}
                >
                  Record Payment (PayPal / Manual)
                </DropdownItem>
              ) : null}
              {canRequestPayment ? (
                <DropdownItem
                  key='offer-payment'
                  startContent={<Send size={15} />}
                >
                  {order.paymentOptions?.length
                    ? 'Payment Options (sent)'
                    : 'Offer Payment Options'}
                </DropdownItem>
              ) : null}
              {Number(order.amountPaid) > 0 ? (
                <DropdownItem
                  key='record-refund'
                  startContent={<Undo2 size={15} />}
                >
                  Record Refund
                </DropdownItem>
              ) : null}
              {canDeliver ? (
                <DropdownItem key='deliver' startContent={<Upload size={15} />}>
                  {hasFiles ? 'Upload New Version' : 'Upload Delivery ZIP'}
                </DropdownItem>
              ) : null}
              {hasFiles ? (
                <DropdownItem
                  key='download-delivery'
                  startContent={<Download size={15} />}
                >
                  Download Delivery ZIP
                </DropdownItem>
              ) : null}
              {hasPrice ? (
                <DropdownItem
                  key='view-invoice'
                  startContent={<FileText size={15} />}
                >
                  View Invoice
                </DropdownItem>
              ) : null}
              {hasPrice ? (
                <DropdownItem
                  key='email-invoice'
                  startContent={<Mail size={15} />}
                >
                  Email Invoice
                </DropdownItem>
              ) : null}
              <DropdownItem
                key='resend-access'
                startContent={<LinkIcon size={15} />}
              >
                Resend Access Link
              </DropdownItem>
              <DropdownItem
                key='delete'
                className='text-danger'
                color='danger'
                startContent={<Trash2 size={15} />}
              >
                Delete Order
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      }

      default:
        return order[columnKey];
    }
  };

  const filtersActive =
    needsActionActive ||
    statusFilter !== 'all' ||
    paymentTagFilter !== 'all' ||
    Boolean(searchParams.get('search'));

  return (
    <div className='rounded-2xl border border-gray-200 bg-white'>
      {/* ─── Toolbar ─── */}
      <div className='flex flex-wrap items-center gap-2 border-b border-gray-100 p-3'>
      <span className='ml-auto text-xs text-gray-400'>
        {pagination.total} order{pagination.total === 1 ? '' : 's'}
      </span>
        <Input
          isClearable
          size='sm'
          radius='md'
          placeholder='Search order number, name or email'
          startContent={<Search size={15} className='text-gray-400' />}
          value={searchValue}
          onValueChange={setSearchValue}
          onClear={() => {
            setSearchValue('');
            handleSearch('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch(searchValue);
          }}
          classNames={{ inputWrapper: 'bg-gray-50 shadow-none' }}
          className='min-w-[200px] flex-1'
        />

        <Button
          size='sm'
          variant={needsActionActive ? 'solid' : 'bordered'}
          className={
            needsActionActive
              ? 'bg-gray-900 text-white'
              : 'border-gray-200 text-gray-700'
          }
          startContent={<SlidersHorizontal size={14} />}
          endContent={
            needsActionPromise ? (
              <Suspense fallback={null}>
                <NeedsActionBadge
                  promise={needsActionPromise}
                  active={needsActionActive}
                />
              </Suspense>
            ) : null
          }
          onPress={toggleNeedsAction}
        >
          Needs action
        </Button>

        <Dropdown placement='bottom-end'>
          <DropdownTrigger>
            <Button
              size='sm'
              variant='bordered'
              className='border-gray-200 text-gray-700'
            >
              {statusFilter === 'all'
                ? 'Status'
                : STATUS_LABELS[statusFilter] || statusFilter}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label='Status filter'
            selectedKeys={[statusFilter]}
            selectionMode='single'
            onAction={(k) => handleStatusFilter(String(k))}
          >
            <DropdownItem key='all'>All statuses</DropdownItem>
            {STATUS_ORDER.map((s) => (
              <DropdownItem key={s}>{STATUS_LABELS[s]}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown placement='bottom-end'>
          <DropdownTrigger>
            <Button
              size='sm'
              variant='bordered'
              className='border-gray-200 text-gray-700'
            >
              {paymentTagFilter === 'all'
                ? 'Payment tag'
                : PAYMENT_TAG_LABELS[paymentTagFilter]}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label='Payment tag filter'
            selectedKeys={[paymentTagFilter]}
            selectionMode='single'
            onAction={(k) => handlePaymentTagFilter(String(k))}
          >
            <DropdownItem key='all'>All</DropdownItem>
            <DropdownItem key='untagged'>Untagged (paid)</DropdownItem>
            <DropdownItem key='tagged'>Tagged</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {filtersActive && (
          <Button
            size='sm'
            variant='light'
            className='text-gray-500'
            onPress={() => router.push('?')}
          >
            Clear
          </Button>
        )}
      </div>

      {/* ─── Rows ─── */}
      <Table
        aria-label='Custom orders'
        removeWrapper
        isCompact
        classNames={{
          th: 'bg-white text-[10px] font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100 rounded-none',
          td: 'py-2.5 align-top',
          tr: 'border-b border-gray-50 last:border-b-0 hover:bg-gray-50/70',
        }}
      >
        <TableHeader columns={COLUMNS}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={initialData}
          emptyContent={
            <span className='text-sm text-gray-400'>No orders found</span>
          }
        >
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ─── Pagination ─── */}
      {pagination.totalPages > 1 && (
        <div className='flex justify-center border-t border-gray-100 p-3'>
          <Pagination
            total={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            showControls
            isCompact
            variant='light'
            classNames={{ cursor: 'bg-gray-900 text-white' }}
          />
        </div>
      )}

      {/* Mounted on the first row action, never on first paint. */}
      {dialogsLoaded && (
        <OrderDialogs request={request} onHandled={() => setRequest(null)} />
      )}
    </div>
  );
}
