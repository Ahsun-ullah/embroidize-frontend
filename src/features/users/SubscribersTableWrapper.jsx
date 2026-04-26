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
import { AlertTriangle, Ban, DollarSign, Edit, Eye, RotateCcw, Search, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CHIP = {
  active: 'success',
  canceled: 'danger',
  past_due: 'warning',
  incomplete: 'default',
  trialing: 'primary',
  expired: 'danger',
};

const STATUS_BADGE = {
  active: 'bg-green-100 text-green-800',
  canceled: 'bg-red-100 text-red-800',
  past_due: 'bg-yellow-100 text-yellow-800',
  incomplete: 'bg-gray-100 text-gray-700',
  trialing: 'bg-blue-100 text-blue-800',
  expired: 'bg-red-50 text-red-600',
};

const PER_PAGE = 15;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  const row = document.cookie.split('; ').find((r) => r.startsWith('token='));
  return row ? row.split('=').slice(1).join('=') : undefined;
}

function apiBase() {
  return process.env.NEXT_PUBLIC_BASE_API_URL_PROD || process.env.NEXT_PUBLIC_BASE_API_URL;
}

function authHeaders() {
  const token = getToken();
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

function fmt(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function quotaLabel(used, limit) {
  if (limit == null) return `${used} / ∞`;
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return `${used} / ${limit} (${pct}%)`;
}

function QuotaBar({ used, limit }) {
  if (limit == null) return <span className='text-sm text-gray-500'>Unlimited</span>;
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-400' : 'bg-green-500';
  return (
    <div className='w-full'>
      <div className='flex justify-between text-xs text-gray-500 mb-1'>
        <span>{used} used</span>
        <span>{limit} limit</span>
      </div>
      <div className='h-1.5 w-full bg-gray-200 rounded-full overflow-hidden'>
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, color, sub }) {
  return (
    <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-1'>
      <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>{label}</span>
      <span className={`text-2xl font-bold ${color || 'text-gray-900 dark:text-white'}`}>{value}</span>
      {sub && <span className='text-xs text-gray-400'>{sub}</span>}
    </div>
  );
}

function DetailRow({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className='flex flex-col gap-0.5'>
      <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>{label}</span>
      <span className='text-sm text-gray-900 dark:text-gray-100 break-all'>{value}</span>
    </div>
  );
}

function AuditActionBadge({ action }) {
  const map = {
    cancel_immediately: { label: 'Cancelled Immediately', color: 'bg-red-100 text-red-700' },
    cancel_at_period_end: { label: 'Cancel at Period End', color: 'bg-orange-100 text-orange-700' },
    update_quota: { label: 'Quota Updated', color: 'bg-blue-100 text-blue-700' },
    update_status: { label: 'Status Updated', color: 'bg-yellow-100 text-yellow-700' },
    refund: { label: 'Refund Issued', color: 'bg-purple-100 text-purple-700' },
    reset_downloads: { label: 'Downloads Reset', color: 'bg-green-100 text-green-700' },
  };
  const { label, color } = map[action] || { label: action, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{label}</span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubscribersTableWrapper({ subscribers, stats, revenue }) {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // View details modal
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewChange } = useDisclosure();
  const [viewUser, setViewUser] = useState(null);
  const [viewTab, setViewTab] = useState('details'); // 'details' | 'audit'
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Adjust quotas modal
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditChange } = useDisclosure();
  const [editUser, setEditUser] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editDownloadCount, setEditDownloadCount] = useState('');
  const [editDailyCount, setEditDailyCount] = useState('');
  const [editPeriodEnd, setEditPeriodEnd] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Cancel modal
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onOpenChange: onCancelChange } = useDisclosure();
  const [cancelUser, setCancelUser] = useState(null);
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Refund modal
  const { isOpen: isRefundOpen, onOpen: onRefundOpen, onOpenChange: onRefundChange } = useDisclosure();
  const [refundUser, setRefundUser] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = subscribers;
    if (statusFilter !== 'all') {
      list = list.filter((u) => u.subscription?.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.subscription?.planId?.name?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [subscribers, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleStatusFilter = (val) => { setStatusFilter(val); setPage(1); };

  // ── View modal ─────────────────────────────────────────────────────────────

  const handleView = async (user) => {
    setViewUser(user);
    setViewTab('details');
    setAuditLogs([]);
    onViewOpen();
  };

  const loadAuditLog = async (userId) => {
    setAuditLoading(true);
    try {
      const res = await fetch(`${apiBase()}/admin/users/${userId}/subscription/audit-log`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setAuditLogs(data?.data?.logs || []);
    } catch {
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const switchTab = (tab, user) => {
    setViewTab(tab);
    if (tab === 'audit' && auditLogs.length === 0) {
      loadAuditLog(user._id);
    }
  };

  // ── Edit modal ─────────────────────────────────────────────────────────────

  const handleEdit = (user) => {
    setEditUser(user);
    setEditStatus('');
    setEditDownloadCount(String(user.subscription?.downloadCount ?? ''));
    setEditDailyCount(String(user.subscription?.dailyDownloadCount ?? ''));
    setEditPeriodEnd('');
    onEditOpen();
  };

  const saveSubscription = async () => {
    if (!editUser) return;
    setIsUpdating(true);
    try {
      const body = {};
      if (editStatus) body.status = editStatus;
      if (editDownloadCount !== '') body.downloadCount = parseInt(editDownloadCount, 10);
      if (editDailyCount !== '') body.dailyDownloadCount = parseInt(editDailyCount, 10);
      if (editPeriodEnd) body.periodEndDate = new Date(editPeriodEnd).toISOString();

      const res = await fetch(`${apiBase()}/admin/users/${editUser._id}/subscription`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update subscription');

      SuccessToast('Success', 'Subscription updated successfully!', 3000);
      onEditChange(false);
      router.refresh();
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to update subscription', 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const resetDownloads = async (user) => {
    try {
      const res = await fetch(`${apiBase()}/admin/users/${user._id}/subscription`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ downloadCount: 0, dailyDownloadCount: 0 }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to reset');
      SuccessToast('Success', 'Download counts reset to 0.', 3000);
      router.refresh();
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to reset downloads', 3000);
    }
  };

  // ── Cancel modal ───────────────────────────────────────────────────────────

  const handleCancel = (user) => {
    setCancelUser(user);
    setCancelImmediately(false);
    setCancelReason('');
    onCancelOpen();
  };

  const confirmCancel = async () => {
    if (!cancelUser) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`${apiBase()}/admin/users/${cancelUser._id}/subscription/cancel`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ cancelImmediately, reason: cancelReason }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to cancel subscription');
      SuccessToast('Success', result.message || 'Subscription cancelled.', 3000);
      onCancelChange(false);
      router.refresh();
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to cancel subscription', 3000);
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Refund modal ───────────────────────────────────────────────────────────

  const handleRefund = (user) => {
    setRefundUser(user);
    setRefundAmount('');
    setRefundReason('');
    onRefundOpen();
  };

  const confirmRefund = async () => {
    if (!refundUser) return;
    setIsRefunding(true);
    try {
      const body = { reason: refundReason };
      if (refundAmount) {
        // Convert dollars to cents
        body.amount = Math.round(parseFloat(refundAmount) * 100);
      }

      const res = await fetch(`${apiBase()}/admin/users/${refundUser._id}/subscription/refund`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to process refund');
      SuccessToast('Success', result.message || 'Refund processed.', 4000);
      onRefundChange(false);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to process refund', 3000);
    } finally {
      setIsRefunding(false);
    }
  };

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns = [
    { uid: 'user', name: 'USER' },
    { uid: 'plan', name: 'PLAN' },
    { uid: 'status', name: 'STATUS' },
    { uid: 'downloads', name: 'DOWNLOADS (PERIOD)' },
    { uid: 'daily', name: 'DAILY' },
    { uid: 'periodEnd', name: 'RENEWS / EXPIRES' },
    { uid: 'joined', name: 'JOINED' },
    { uid: 'actions', name: 'ACTIONS' },
  ];

  const renderCell = (user, key) => {
    const sub = user.subscription;
    const plan = sub?.planId;

    switch (key) {
      case 'user':
        return (
          <div className='flex items-center gap-3'>
            {user.profile_image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profile_image.url} alt={user.name} className='w-9 h-9 rounded-full object-cover shrink-0' />
            ) : (
              <div className='w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shrink-0'>
                {(user.name || user.email || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className='min-w-0'>
              <p className='text-sm font-semibold truncate'>{user.name || '—'}</p>
              <p className='text-xs text-gray-500 truncate'>{user.email}</p>
            </div>
          </div>
        );

      case 'plan':
        return plan ? (
          <div>
            <p className='text-sm font-semibold'>{plan.name}</p>
            <p className='text-xs text-gray-500 capitalize'>
              {plan.type === 'one-time' ? 'One-time' : `${plan.billingInterval}ly`} · ${plan.price}
            </p>
          </div>
        ) : <span className='text-gray-400 text-xs'>—</span>;

      case 'status':
        return (
          <Chip color={STATUS_CHIP[sub?.status] || 'default'} size='sm' variant='flat' className='capitalize'>
            {sub?.status?.replace('_', ' ') || '—'}
            {sub?.cancelAtPeriodEnd && <span className='ml-1 text-[10px] opacity-70'>(cancels)</span>}
          </Chip>
        );

      case 'downloads': {
        const used = sub?.downloadCount ?? 0;
        const limit = plan?.downloadLimit ?? null;
        return (
          <div className='min-w-[120px]'>
            <p className='text-xs font-mono text-gray-700 dark:text-gray-300 mb-1'>{quotaLabel(used, limit)}</p>
            <QuotaBar used={used} limit={limit} />
          </div>
        );
      }

      case 'daily': {
        const used = sub?.dailyDownloadCount ?? 0;
        const limit = plan?.dailyLimit ?? null;
        return (
          <div className='min-w-[100px]'>
            <p className='text-xs font-mono text-gray-700 dark:text-gray-300 mb-1'>{quotaLabel(used, limit)}</p>
            <QuotaBar used={used} limit={limit} />
          </div>
        );
      }

      case 'periodEnd':
        return (
          <div className='text-sm'>
            {sub?.periodEndDate ? (
              <>
                <p>{fmt(sub.periodEndDate)}</p>
                {sub.cancelAtPeriodEnd && (
                  <p className='text-xs text-red-500 mt-0.5'>Cancels at period end</p>
                )}
              </>
            ) : <span className='text-gray-400'>—</span>}
          </div>
        );

      case 'joined':
        return <div className='text-sm text-gray-600'>{fmt(user.createdAt)}</div>;

      case 'actions':
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size='sm' variant='light'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                    d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z' />
                </svg>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label='Subscriber actions'>
              <DropdownItem key='view' startContent={<Eye size={16} />} onClick={() => handleView(user)}>
                View Details
              </DropdownItem>
              <DropdownItem key='edit' startContent={<Edit size={16} />} onClick={() => handleEdit(user)}>
                Adjust Quotas
              </DropdownItem>
              <DropdownItem key='reset' startContent={<RotateCcw size={16} />} onClick={() => resetDownloads(user)}>
                Reset Download Counts
              </DropdownItem>
              <DropdownItem
                key='cancel'
                startContent={<Ban size={16} />}
                className='text-danger'
                color='danger'
                onClick={() => handleCancel(user)}
              >
                Cancel Subscription
              </DropdownItem>
              <DropdownItem
                key='refund'
                startContent={<DollarSign size={16} />}
                onClick={() => handleRefund(user)}
              >
                Issue Refund
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );

      default:
        return null;
    }
  };

  const v = viewUser;
  const vs = v?.subscription;
  const vp = vs?.planId;

  return (
    <div className='space-y-6'>

      {/* ── Stats ── */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
        <StatCard label='Total' value={stats.total} />
        <StatCard label='Active' value={stats.active} color='text-green-600' />
        <StatCard label='Trialing' value={stats.trialing} color='text-blue-600' />
        <StatCard label='Past Due' value={stats.pastDue} color='text-yellow-600' />
        <StatCard label='Cancelled' value={stats.canceled} color='text-red-500' />
        <StatCard label='Expired' value={stats.expired} color='text-gray-500' />
      </div>

      {/* ── Revenue Dashboard ── */}
      {revenue && (
        <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5'>
          <div className='flex items-center gap-2 mb-4'>
            <TrendingUp size={18} className='text-indigo-500' />
            <h2 className='text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide'>Revenue Overview</h2>
          </div>
          <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-5'>
            <StatCard label='MRR' value={`$${revenue.mrr}`} color='text-indigo-600' />
            <StatCard label='ARR' value={`$${revenue.arr}`} color='text-indigo-500' />
            <StatCard label='Active Subs' value={revenue.totalActive} color='text-green-600' />
            <StatCard label='New This Month' value={revenue.newThisMonth} color='text-blue-600' />
            <StatCard label='Cancelled (Month)' value={revenue.canceledThisMonth} color='text-red-500' />
            <StatCard label='Churn Rate' value={`${revenue.churnRate}%`} color='text-orange-500' />
          </div>
          {revenue.revenueByPlan?.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>Revenue by Plan</p>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
                {revenue.revenueByPlan.map((p) => (
                  <div key={p.name} className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                    <div>
                      <p className='text-sm font-semibold'>{p.name}</p>
                      <p className='text-xs text-gray-400'>{p.count} subscriber{p.count !== 1 ? 's' : ''}</p>
                    </div>
                    <span className='text-sm font-bold text-indigo-600'>${p.revenue.toFixed(2)}/mo</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Header + Filters ── */}
      <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Subscribers</h1>
          <p className='text-sm text-gray-500 mt-0.5'>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
          <Input
            isClearable
            placeholder='Search name, email, or plan…'
            startContent={<Search size={16} />}
            value={search}
            onValueChange={handleSearch}
            onClear={() => handleSearch('')}
            className='sm:w-64'
          />
          <Dropdown>
            <DropdownTrigger>
              <Button variant='flat' className='capitalize min-w-[130px]'>
                Status: {statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ')}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label='Status filter' selectedKeys={[statusFilter]} onAction={(k) => handleStatusFilter(k)}>
              <DropdownItem key='all'>All</DropdownItem>
              <DropdownItem key='active'>Active</DropdownItem>
              <DropdownItem key='trialing'>Trialing</DropdownItem>
              <DropdownItem key='past_due'>Past Due</DropdownItem>
              <DropdownItem key='canceled'>Canceled</DropdownItem>
              <DropdownItem key='expired'>Expired</DropdownItem>
              <DropdownItem key='incomplete'>Incomplete</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* ── Table ── */}
      <Table aria-label='Subscribers table' removeWrapper>
        <TableHeader columns={columns}>
          {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
        </TableHeader>
        <TableBody items={paginated} emptyContent={
          <div className='flex flex-col items-center gap-2 py-12 text-gray-400'>
            <Users size={36} strokeWidth={1.5} />
            <p className='text-sm'>No subscribers found</p>
          </div>
        }>
          {(item) => (
            <TableRow key={item._id}>
              {(colKey) => <TableCell>{renderCell(item, colKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className='flex justify-center'>
          <Pagination total={totalPages} page={page} onChange={setPage} showControls isCompact showShadow />
        </div>
      )}

      {/* ── View Details Modal ── */}
      <Modal isOpen={isViewOpen} onOpenChange={onViewChange} backdrop='blur' size='3xl' scrollBehavior='inside'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex items-center justify-between gap-3 pr-10'>
                <div className='flex items-center gap-3'>
                  {v?.profile_image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.profile_image.url} alt={v.name} className='w-10 h-10 rounded-full object-cover' />
                  ) : (
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-white font-bold'>
                      {(v?.name || v?.email || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className='text-base font-bold'>{v?.name || '(no name)'}</p>
                    <p className='text-xs text-gray-400'>{v?.email}</p>
                  </div>
                </div>
                {vs?.status && (
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[vs.status] || 'bg-gray-100 text-gray-700'}`}>
                    {vs.status.replace('_', ' ')}
                  </span>
                )}
              </ModalHeader>

              {/* Tabs */}
              <div className='flex border-b border-gray-200 dark:border-gray-700 px-6'>
                {['details', 'audit'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => switchTab(tab, v)}
                    className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                      viewTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'audit' ? 'Audit Log' : 'Details'}
                  </button>
                ))}
              </div>

              <ModalBody className='gap-5'>
                {viewTab === 'details' ? (
                  <>
                    {/* Plan */}
                    <div>
                      <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3'>Subscription Plan</p>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <DetailRow label='Plan Name' value={vp?.name} />
                        <DetailRow label='Type' value={vp?.type === 'one-time' ? 'One-time payment' : `Recurring — ${vp?.billingInterval}ly`} />
                        <DetailRow label='Price' value={vp?.price != null ? `$${vp.price}` : null} />
                        <DetailRow label='Download Limit' value={vp?.downloadLimit != null ? String(vp.downloadLimit) : 'Unlimited'} />
                        <DetailRow label='Daily Limit' value={vp?.dailyLimit != null ? String(vp.dailyLimit) : 'Unlimited'} />
                        {vp?.features?.length > 0 && (
                          <div className='col-span-2 flex flex-col gap-0.5'>
                            <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Features</span>
                            <ul className='text-sm text-gray-800 dark:text-gray-200 list-disc list-inside space-y-0.5'>
                              {vp.features.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <Divider />

                    {/* Usage */}
                    <div>
                      <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3'>Usage</p>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                        <div>
                          <p className='text-xs text-gray-400 mb-1'>Period Downloads</p>
                          <p className='text-sm font-mono mb-1'>{quotaLabel(vs?.downloadCount ?? 0, vp?.downloadLimit ?? null)}</p>
                          <QuotaBar used={vs?.downloadCount ?? 0} limit={vp?.downloadLimit ?? null} />
                        </div>
                        <div>
                          <p className='text-xs text-gray-400 mb-1'>Daily Downloads</p>
                          <p className='text-sm font-mono mb-1'>{quotaLabel(vs?.dailyDownloadCount ?? 0, vp?.dailyLimit ?? null)}</p>
                          <QuotaBar used={vs?.dailyDownloadCount ?? 0} limit={vp?.dailyLimit ?? null} />
                        </div>
                        <DetailRow label='Last Daily Reset' value={fmtDateTime(vs?.lastDailyResetDate)} />
                        <DetailRow label='Total Downloads (all time)' value={v?.downloadCount != null ? String(v.downloadCount) : null} />
                      </div>
                    </div>

                    <Divider />

                    {/* Billing */}
                    <div>
                      <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3'>Billing</p>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <DetailRow label='Period End' value={fmtDateTime(vs?.periodEndDate)} />
                        <DetailRow label='Cancel at Period End' value={vs?.cancelAtPeriodEnd ? 'Yes' : 'No'} />
                        <DetailRow label='Stripe Subscription ID' value={vs?.stripeSubscriptionId} />
                        <DetailRow label='Stripe Customer ID' value={vs?.stripeCustomerId} />
                        <DetailRow label='Subscription Since' value={fmtDateTime(vs?.createdAt)} />
                      </div>
                    </div>

                    <Divider />

                    {/* Account */}
                    <div>
                      <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3'>Account</p>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <DetailRow label='Name' value={v?.name} />
                        <DetailRow label='Email' value={v?.email} />
                        <DetailRow label='Phone' value={v?.phone} />
                        <DetailRow label='Email Verified' value={v?.isEmailVerified ? 'Yes' : 'No'} />
                        <DetailRow label='Account Status' value={v?.status} />
                        <DetailRow label='Role' value={v?.role} />
                        <DetailRow label='Registered' value={fmtDateTime(v?.createdAt)} />
                        {v?.ipInfo?.country && <DetailRow label='Country' value={v.ipInfo.country} />}
                        {v?.ipInfo?.city && <DetailRow label='City' value={v.ipInfo.city} />}
                        {(v?.address_line_1 || v?.city) && (
                          <DetailRow
                            label='Address'
                            value={[v.address_line_1, v.address_line_2, v.city, v.state, v.zip, v.country]
                              .filter(Boolean).join(', ')}
                          />
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Audit Log Tab */
                  <div>
                    {auditLoading ? (
                      <div className='flex justify-center py-10 text-gray-400 text-sm'>Loading audit log…</div>
                    ) : auditLogs.length === 0 ? (
                      <div className='flex flex-col items-center py-10 text-gray-400 gap-2'>
                        <AlertTriangle size={28} strokeWidth={1.5} />
                        <p className='text-sm'>No audit log entries for this user</p>
                      </div>
                    ) : (
                      <div className='space-y-3'>
                        {auditLogs.map((log) => (
                          <div key={log._id} className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2'>
                            <div className='flex items-start justify-between gap-2 flex-wrap'>
                              <AuditActionBadge action={log.action} />
                              <span className='text-xs text-gray-400'>{fmtDateTime(log.createdAt)}</span>
                            </div>
                            {log.adminId && (
                              <p className='text-xs text-gray-500'>
                                By: <span className='font-medium text-gray-700 dark:text-gray-300'>{log.adminId.name || log.adminId.email}</span>
                              </p>
                            )}
                            {log.note && (
                              <p className='text-xs text-gray-600 dark:text-gray-400 italic'>"{log.note}"</p>
                            )}
                            {log.action === 'refund' && log.after?.amount && (
                              <p className='text-xs font-medium text-purple-600'>
                                Amount: ${(log.after.amount / 100).toFixed(2)} · ID: {log.after.refundId}
                              </p>
                            )}
                            {(log.before && Object.keys(log.before).length > 0) && (
                              <details className='text-xs text-gray-400 cursor-pointer'>
                                <summary className='hover:text-gray-600'>Show before/after</summary>
                                <div className='mt-1 grid grid-cols-2 gap-2'>
                                  <div>
                                    <p className='font-semibold mb-1'>Before</p>
                                    <pre className='text-[10px] bg-white dark:bg-gray-900 p-2 rounded border overflow-auto'>
                                      {JSON.stringify(log.before, null, 2)}
                                    </pre>
                                  </div>
                                  <div>
                                    <p className='font-semibold mb-1'>After</p>
                                    <pre className='text-[10px] bg-white dark:bg-gray-900 p-2 rounded border overflow-auto'>
                                      {JSON.stringify(log.after, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>

              <ModalFooter>
                <Button variant='light' onPress={onClose}>Close</Button>
                <Button color='danger' variant='flat' startContent={<Ban size={16} />} onPress={() => { onClose(); handleCancel(v); }}>
                  Cancel Sub
                </Button>
                <Button color='primary' startContent={<Edit size={16} />} onPress={() => { onClose(); handleEdit(v); }}>
                  Edit Subscription
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Adjust Quotas Modal ── */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditChange} backdrop='blur' size='md'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div>
                  <p className='font-bold'>Adjust Download Quotas</p>
                  <p className='text-xs text-gray-400 font-normal mt-0.5'>{editUser?.name} · {editUser?.email}</p>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3'>
                    <p className='text-xs text-blue-700 dark:text-blue-300'>
                      These are app-level counters only — Stripe does not track downloads.
                      Use this to grant extra quota, fix a wrong count, or manually reset usage.
                      To cancel the subscription, use the <strong>Cancel Subscription</strong> action instead.
                    </p>
                  </div>

                  <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 space-y-1'>
                    <p>Plan: <strong className='text-gray-700 dark:text-gray-300'>{editUser?.subscription?.planId?.name || '—'}</strong></p>
                    <p>Download limit: <strong className='text-gray-700 dark:text-gray-300'>{editUser?.subscription?.planId?.downloadLimit ?? 'Unlimited'}</strong></p>
                    <p>Daily limit: <strong className='text-gray-700 dark:text-gray-300'>{editUser?.subscription?.planId?.dailyLimit ?? 'Unlimited'}</strong></p>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <Input
                      type='number'
                      label='Period Downloads Used'
                      placeholder='0'
                      value={editDownloadCount}
                      onChange={(e) => setEditDownloadCount(e.target.value)}
                      min='0'
                      description='Current period count'
                    />
                    <Input
                      type='number'
                      label='Daily Downloads Used'
                      placeholder='0'
                      value={editDailyCount}
                      onChange={(e) => setEditDailyCount(e.target.value)}
                      min='0'
                      description="Today's count"
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>Cancel</Button>
                <Button color='primary' isLoading={isUpdating} onPress={saveSubscription}>
                  Save Quotas
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Cancel Subscription Modal ── */}
      <Modal isOpen={isCancelOpen} onOpenChange={onCancelChange} backdrop='blur' size='md'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div>
                  <p className='font-bold text-red-600'>Cancel Subscription</p>
                  <p className='text-xs text-gray-400 font-normal mt-0.5'>{cancelUser?.name} · {cancelUser?.email}</p>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3'>
                    <p className='text-xs text-red-700 dark:text-red-300 font-medium'>
                      This action is synced with Stripe. The subscription will be cancelled for real.
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <p className='text-sm font-medium'>Cancellation type</p>
                    <div className='flex flex-col gap-2'>
                      <label className='flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'>
                        <input
                          type='radio'
                          name='cancelType'
                          checked={!cancelImmediately}
                          onChange={() => setCancelImmediately(false)}
                          className='mt-0.5'
                        />
                        <div>
                          <p className='text-sm font-medium'>At period end (recommended)</p>
                          <p className='text-xs text-gray-500'>User retains access until their current billing period ends</p>
                        </div>
                      </label>
                      <label className='flex items-start gap-3 p-3 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10'>
                        <input
                          type='radio'
                          name='cancelType'
                          checked={cancelImmediately}
                          onChange={() => setCancelImmediately(true)}
                          className='mt-0.5'
                        />
                        <div>
                          <p className='text-sm font-medium text-red-600'>Immediately</p>
                          <p className='text-xs text-gray-500'>Access is revoked right now. Consider issuing a refund separately.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Textarea
                    label='Reason (optional)'
                    placeholder='e.g. User requested cancellation via support ticket #123'
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    minRows={2}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>Go Back</Button>
                <Button color='danger' isLoading={isCancelling} onPress={confirmCancel}>
                  {cancelImmediately ? 'Cancel Immediately' : 'Schedule Cancellation'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Refund Modal ── */}
      <Modal isOpen={isRefundOpen} onOpenChange={onRefundChange} backdrop='blur' size='md'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div>
                  <p className='font-bold'>Issue Refund</p>
                  <p className='text-xs text-gray-400 font-normal mt-0.5'>{refundUser?.name} · {refundUser?.email}</p>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3'>
                    <p className='text-xs text-blue-700 dark:text-blue-300'>
                      Refunds the most recent invoice payment via Stripe. Leave the amount empty for a full refund.
                    </p>
                  </div>

                  <Input
                    type='number'
                    label='Refund Amount (USD)'
                    placeholder='Leave empty for full refund'
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    min='0'
                    step='0.01'
                    startContent={<span className='text-gray-400 text-sm'>$</span>}
                    description='Partial refund amount in dollars (e.g. 4.99)'
                  />

                  <Textarea
                    label='Reason (optional)'
                    placeholder='e.g. Duplicate charge, service issue, etc.'
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    minRows={2}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>Cancel</Button>
                <Button color='primary' isLoading={isRefunding} onPress={confirmRefund}>
                  {refundAmount ? `Refund $${refundAmount}` : 'Full Refund'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
}
