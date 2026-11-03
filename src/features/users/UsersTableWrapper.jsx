'use client';
import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import UserTable from '@/components/Common/Table';
import ExportFieldsModal from '@/features/admin/ExportFieldsModal';
import UserTimelineModal from '@/features/users/UserTimelineModal';
import ZohoPushModal from '@/features/users/ZohoPushModal';
import BehaviourFilters, {
  BEHAVIOUR_NUMBER_KEYS,
  CHECKOUT_LABELS,
  CHECKOUT_OPTIONS,
  MARKETING_LABELS,
  MARKETING_OPTIONS,
  EVER_DOWNLOADED_OPTIONS,
  SIGNUP_CHANNEL_LABELS,
  SIGNUP_CHANNEL_OPTIONS,
  SUB_STATE_LABELS,
  SUB_STATE_OPTIONS,
  matchingPreset,
} from '@/features/users/BehaviourFilters';
import SavedSegmentsMenu from '@/features/users/SavedSegmentsMenu';
import {
  readUserFilters,
  userFiltersToQuery,
} from '@/features/users/userFilters';
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
  useDisclosure,
} from '@heroui/react';
import { Download, Search, Send, X } from 'lucide-react';
import AddCreditsModal from '@/features/admin/AddCreditsModal';
import GrantAccessModal from '@/features/admin/GrantAccessModal';
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ─── Filter options ───────────────────────────────────────────────────────────

const PLAN_OPTIONS = [
  ['', 'All'],
  ['free', 'Free'],
  ['premium', 'Premium'],
];
const PROVIDER_OPTIONS = [
  ['', 'All'],
  ['local', 'Email'],
  ['google', 'Google'],
  ['apple', 'Apple'],
];
const VERIFIED_OPTIONS = [
  ['', 'All'],
  ['yes', 'Verified'],
  ['no', 'Not verified'],
];
const CREDITS_OPTIONS = [
  ['', 'All'],
  ['has', 'Has credits now'],
  ['ever', 'Ever bought credits'],
  ['never', 'Never bought credits'],
];
const ACTIVITY_OPTIONS = [
  ['', 'Any time'],
  ['7', 'Downloaded in last 7 days'],
  ['30', 'Downloaded in last 30 days'],
  ['90', 'Downloaded in last 90 days'],
];
const SORT_OPTIONS = [
  ['', 'Newest first'],
  ['oldest', 'Oldest first'],
];

const labelOf = (options, value) =>
  options.find(([v]) => v === (value || ''))?.[1] || 'All';

// Text inputs wait for a pause in typing before they reload the page.
const TEXT_FILTERS = [
  'search',
  'country',
  'minDownloads',
  'maxDownloads',
  ...BEHAVIOUR_NUMBER_KEYS,
];

// ─── Export fields ────────────────────────────────────────────────────────────

const isoDay = (d) => {
  if (!d) return '';
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? '' : t.toISOString().slice(0, 10);
};

const providerName = (p) => {
  const v = p || 'local';
  return v === 'local' ? 'Email' : v.charAt(0).toUpperCase() + v.slice(1);
};

const planBilling = (plan) => {
  if (!plan) return '';
  if (plan.type === 'one-time' || !plan.billingInterval) return 'One-time';
  const i = plan.billingInterval;
  return `${i.charAt(0).toUpperCase()}${i.slice(1)}ly`;
};

const gatewayName = (g) =>
  g ? g.charAt(0).toUpperCase() + g.slice(1) : '';

// Everything the Users export can write. `default` marks the fields pre-ticked
// the first time; after that the admin's last choice is remembered.
const USER_EXPORT_FIELDS = [
  // Customer
  { key: 'name', label: 'Name', group: 'Customer', default: true, get: (u) => u.name },
  { key: 'email', label: 'Email', group: 'Customer', default: true, get: (u) => u.email },
  { key: 'phone', label: 'Phone', group: 'Customer', get: (u) => u.phone },
  { key: 'country', label: 'Country', group: 'Customer', default: true, get: (u) => u.country || u.ipInfo?.country },
  { key: 'state', label: 'State', group: 'Customer', get: (u) => u.state },
  { key: 'city', label: 'City', group: 'Customer', get: (u) => u.city },
  { key: 'zip', label: 'ZIP', group: 'Customer', get: (u) => u.zip },
  { key: 'userId', label: 'User ID', group: 'Customer', get: (u) => u._id },

  // Account
  { key: 'joined', label: 'Joined', group: 'Account', default: true, get: (u) => isoDay(u.createdAt) },
  { key: 'signupVia', label: 'Signup via', group: 'Account', default: true, get: (u) => providerName(u.provider) },
  { key: 'emailVerified', label: 'Email verified', group: 'Account', get: (u) => !!u.isEmailVerified },
  { key: 'accountStatus', label: 'Account status', group: 'Account', get: (u) => (u.status === 'blocked' ? 'Blocked' : 'Active') },
  { key: 'ipCountry', label: 'Signup country (IP)', group: 'Account', get: (u) => u.ipInfo?.country },
  { key: 'ipCity', label: 'Signup city (IP)', group: 'Account', get: (u) => u.ipInfo?.city },
  { key: 'ipRegion', label: 'Signup region (IP)', group: 'Account', get: (u) => u.ipInfo?.region },

  // Plan
  { key: 'tier', label: 'Free / Premium', group: 'Plan', default: true, get: (u) => (u.isSubscribed ? 'Premium' : 'Free') },
  { key: 'planName', label: 'Plan', group: 'Plan', default: true, get: (u) => u.subscription?.plan?.name },
  { key: 'billing', label: 'Billing', group: 'Plan', get: (u) => planBilling(u.subscription?.plan) },
  { key: 'price', label: 'Plan price', group: 'Plan', get: (u) => u.subscription?.plan?.price },
  { key: 'subStatus', label: 'Subscription status', group: 'Plan', get: (u) => u.subscription?.status?.replace('_', ' ') },
  { key: 'gateway', label: 'Payment provider', group: 'Plan', get: (u) => gatewayName(u.subscription?.gateway) },
  { key: 'cancelling', label: 'Cancels at period end', group: 'Plan', get: (u) => (u.subscription ? !!u.subscription.cancelAtPeriodEnd : '') },
  { key: 'subscribed', label: 'Subscribed', group: 'Plan', get: (u) => isoDay(u.subscription?.subscribedAt) },
  { key: 'periodEnd', label: 'Renews / expires', group: 'Plan', get: (u) => isoDay(u.subscription?.periodEndDate) },

  // Usage
  { key: 'downloads', label: 'Total downloads', group: 'Usage', default: true, get: (u) => u.downloadCount ?? 0 },
  { key: 'lastDownload', label: 'Last download', group: 'Usage', default: true, get: (u) => isoDay(u.lastDownloadAt) },
  { key: 'periodDownloads', label: 'Downloads this period', group: 'Usage', get: (u) => (u.subscription ? u.subscription.periodDownloads ?? 0 : '') },
  { key: 'credits', label: 'Download credits', group: 'Usage', get: (u) => u.downloadCredits ?? 0 },
  { key: 'creditsExpire', label: 'Credits expire', group: 'Usage', get: (u) => isoDay(u.creditsExpireAt) },
  { key: 'creditsEver', label: 'Ever bought credits', group: 'Usage', get: (u) => !!u.creditsEverGranted },

  // Behaviour: counted over the window chosen in the filters (default 30 days)
  { key: 'windowDays', label: 'Window (days)', group: 'Behaviour', get: (u) => u.activity?.windowDays },
  { key: 'windowDownloads', label: 'Downloads in window', group: 'Behaviour', default: true, get: (u) => u.activity?.downloads ?? 0 },
  { key: 'windowDownloadDays', label: 'Download days in window', group: 'Behaviour', default: true, get: (u) => u.activity?.downloadDays ?? 0 },
  { key: 'windowFree', label: 'Free downloads in window', group: 'Behaviour', get: (u) => u.activity?.freeDownloads ?? 0 },
  { key: 'subState', label: 'Subscription state', group: 'Behaviour', default: true, get: (u) => SUB_STATE_LABELS[u.subscriptionState] || '' },
  { key: 'designViews', label: 'Design views in window', group: 'Behaviour', get: (u) => u.activity?.designViews ?? 0 },
  { key: 'pricingViews', label: 'Pricing visits in window', group: 'Behaviour', get: (u) => u.activity?.pricingViews ?? 0 },
  { key: 'checkoutState', label: 'Checkout in window', group: 'Behaviour', get: (u) => CHECKOUT_LABELS[u.activity?.checkoutState] ?? '' },
  { key: 'lastCheckoutStart', label: 'Last checkout started', group: 'Behaviour', get: (u) => isoDay(u.activity?.lastCheckoutStart) },
  { key: 'limitHits', label: 'Limit hits in window', group: 'Behaviour', get: (u) => u.activity?.limitHits ?? 0 },
  { key: 'premiumBlocked', label: 'Premium tries in window', group: 'Behaviour', get: (u) => u.activity?.premiumBlocked ?? 0 },
  { key: 'lastSeen', label: 'Last seen', group: 'Behaviour', get: (u) => isoDay(u.lastSeenAt) },
  { key: 'lastLogin', label: 'Last sign-in', group: 'Behaviour', get: (u) => isoDay(u.lastLoginAt) },

  // Email
  { key: 'marketingState', label: 'Offer emails', group: 'Email', get: (u) => MARKETING_LABELS[u.marketingState] || '' },
  { key: 'marketingEmailable', label: 'Can receive offers', group: 'Email', get: (u) => !!u.marketingEmailable },

  // Signup source (first touch, saved when the account was created)
  { key: 'signupChannel', label: 'Came from', group: 'Signup source', get: (u) => SIGNUP_CHANNEL_LABELS[u.signupChannel] || 'Not recorded' },
  { key: 'utmSource', label: 'UTM source', group: 'Signup source', get: (u) => u.signupSource?.utmSource || '' },
  { key: 'utmMedium', label: 'UTM medium', group: 'Signup source', get: (u) => u.signupSource?.utmMedium || '' },
  { key: 'utmCampaign', label: 'UTM campaign', group: 'Signup source', get: (u) => u.signupSource?.utmCampaign || '' },
  { key: 'referrer', label: 'Referring site', group: 'Signup source', get: (u) => u.signupSource?.referrer || '' },
  { key: 'landing', label: 'First page', group: 'Signup source', get: (u) => u.signupSource?.landing || '' },
];

const EXPORT_PAGE_SIZE = 500;

async function fetchUserPages(query, onPage) {
  const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
  const token = Cookies.get('token');
  const rows = [];
  let page = 1;
  let totalPages = 1;
  do {
    const params = new URLSearchParams(query);
    params.set('page', String(page));
    params.set('perPage', String(EXPORT_PAGE_SIZE));
    const res = await fetch(`${apiUrl}/all-users?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`Export failed (status ${res.status}).`);
    const json = await res.json();
    rows.push(...(json?.data?.users || []));
    totalPages = json?.data?.pagination?.totalPages || 1;
    onPage(rows.length, json?.data?.pagination?.total);
    page += 1;
  } while (page <= totalPages);
  return rows;
}

function FilterDropdown({ label, value, options, onChange, active }) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          size='sm'
          variant={active ? 'solid' : 'flat'}
          className={active ? 'bg-black text-white' : ''}
        >
          {label}: {labelOf(options, value)}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`${label} filter`}
        selectionMode='single'
        selectedKeys={[value || 'any']}
        onAction={(k) => onChange(k === 'any' ? '' : String(k))}
      >
        {options.map(([v, l]) => (
          <DropdownItem key={v || 'any'}>{l}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

export default function UsersTableWrapper({
  initialData,
  columns,
  pagination, // Received from server
  stats,
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

  // --- Filters ---
  // The URL is the source of truth (the server page reads it). Text inputs keep
  // a local draft so typing stays smooth, then sync after a short pause.
  const filters = useMemo(() => readUserFilters(searchParams), [searchParams]);
  const [drafts, setDrafts] = useState(() => {
    const d = {};
    TEXT_FILTERS.forEach((k) => (d[k] = filters[k] || ''));
    return d;
  });

  const pushFilters = useCallback(
    (changes) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(changes).forEach(([k, v]) => {
        if (v != null && String(v) !== '') params.set(k, String(v));
        else params.delete(k);
      });
      // Always back to page 1 when the set of rows changes.
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleFilterChange = (key, value) => pushFilters({ [key]: value });

  // Debounce text drafts into the URL.
  const draftTimer = useRef(null);
  const draftPending = useRef(false);
  const setDraft = (key, value) => {
    setDrafts((prev) => ({ ...prev, [key]: value }));
    clearTimeout(draftTimer.current);
    draftPending.current = true;
    draftTimer.current = setTimeout(() => {
      draftPending.current = false;
      pushFilters({ [key]: value });
    }, 400);
  };
  useEffect(() => () => clearTimeout(draftTimer.current), []);

  // Keep drafts in step when the URL changes from elsewhere (back button), but
  // never while the admin is mid-typing: the URL lags the input by the debounce.
  useEffect(() => {
    if (draftPending.current) return;
    setDrafts((prev) => {
      const next = { ...prev };
      let changed = false;
      TEXT_FILTERS.forEach((k) => {
        const v = filters[k] || '';
        if (next[k] !== v) {
          next[k] = v;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [filters]);

  const clearFilters = () => {
    clearTimeout(draftTimer.current);
    draftPending.current = false;
    const changes = {};
    Object.keys(filters).forEach((k) => {
      if (k !== 'blocked') changes[k] = '';
    });
    const emptyDrafts = {};
    TEXT_FILTERS.forEach((k) => (emptyDrafts[k] = ''));
    setDrafts(emptyDrafts);
    pushFilters(changes);
  };

  const onPageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // --- Active vs Blocked view ---
  const blockedView = searchParams.get('blocked') === '1';
  const setBlockedView = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set('blocked', '1');
    else params.delete('blocked');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const [blockConfirm, setBlockConfirm] = useState(null);
  const [timelineUser, setTimelineUser] = useState(null);
  const {
    isOpen: isZohoOpen,
    onOpen: onZohoOpen,
    onClose: onZohoClose,
  } = useDisclosure();
  const [isBlocking, setIsBlocking] = useState(false);

  // ── Manual "Grant / Extend Access" ────────────────────────────────────────
  // Plans are fetched lazily on first open (including inactive ones, since a
  // hidden "Custom Access" plan is the usual target for a manual grant).
  const [grantUser, setGrantUser] = useState(null);
  // Credits are sold separately from subscriptions, but the FIRST credit sale
  // to someone is made here: they are not on the Credit Customers page yet,
  // because that page lists people who already hold or held credits.
  const [creditUser, setCreditUser] = useState(null);
  const [grantPlans, setGrantPlans] = useState([]);

  // Plans feed both the Plan filter and the Grant Access modal (inactive ones
  // included: a hidden "Custom Access" plan is the usual target for a grant).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = Cookies.get('token');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/subscription-plans`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setGrantPlans(data?.data?.plans || []);
      } catch {
        // Non-fatal: no plan filter, and the grant modal blocks submission.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGrantClick = useCallback((user) => setGrantUser(user), []);

  const performBlock = useCallback(
    async (user) => {
      if (!user) return;
      const isBlocked = user.status === 'blocked';
      setIsBlocking(true);
      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];
        const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
        const res = await fetch(`${apiUrl}/admin/users/${user._id}/block`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ blocked: !isBlocked }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Action failed');
        SuccessToast(
          'Success',
          isBlocked ? 'User unblocked.' : 'User blocked.',
          3000,
        );
        router.refresh();
      } catch (err) {
        ErrorToast('Error', err.message || 'Action failed', 3000);
      } finally {
        setIsBlocking(false);
        setBlockConfirm(null);
      }
    },
    [router],
  );

  // Both block and unblock ask for confirmation first.
  const handleBlockClick = useCallback((user) => {
    setBlockConfirm(user);
  }, []);

  // --- Render Cell ---
  const renderCell = useCallback((user, columnKey) => {
    const cellValue = user[columnKey];
    switch (columnKey) {
      case 'name':
        return (
          <div className='flex items-center gap-2'>
            <User
              avatarProps={{ radius: 'lg', src: user.avatar }}
              name={user.fullName || user.name || cellValue} // Uses the aggregated fullName
            >
              {user.email}
            </User>
            {user.status === 'blocked' && (
              <span className='rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700'>
                Blocked
              </span>
            )}
          </div>
        );
      case 'createdAt':
        return <>{new Date(user.createdAt).toISOString().split('T')[0]}</>;
      case 'plan': {
        const credits =
          user.downloadCredits > 0 &&
          (!user.creditsExpireAt || new Date(user.creditsExpireAt) > new Date())
            ? user.downloadCredits
            : 0;
        return (
          <div className='flex flex-col items-start gap-1'>
            {user.isSubscribed ? (
              <span className='rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800'>
                {user.subscription?.plan?.name || 'Premium'}
              </span>
            ) : (
              <span className='rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600'>
                Free
              </span>
            )}
            {credits > 0 && (
              <span className='text-[11px] text-gray-500'>
                {credits} credit{credits !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        );
      }
      case 'email':
        return <a href={`mailto:${user.email}`}>{user.email}</a>;
      case 'downloadCount':
        // The backend now returns 'downloadCount' field
        return (
          <div className='pl-4'>
            {user.downloadCount}
          </div>
        );
      case 'provider': {
        // How the account was created: 'local' = direct email+password;
        // anything else is a social provider (google now, more later —
        // unknown providers render capitalized automatically).
        const provider = user.provider || 'local';
        const isSocial = provider !== 'local';
        const label = isSocial
          ? provider.charAt(0).toUpperCase() + provider.slice(1)
          : 'Email';
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isSocial ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <i
              className={isSocial ? `ri-${provider}-fill` : 'ri-mail-line'}
              aria-hidden='true'
            />
            {label}
          </span>
        );
      }
      case 'activity': {
        const a = user.activity || {};
        return (
          <div className='flex flex-col text-xs'>
            <span className='font-semibold text-gray-900'>
              {a.downloads ?? 0} download{a.downloads === 1 ? '' : 's'}
            </span>
            <span className='text-gray-500'>
              {a.downloadDays ?? 0} day{a.downloadDays === 1 ? '' : 's'} · {a.freeDownloads ?? 0} free
            </span>
            <span className='text-gray-400'>
              Last: {user.lastDownloadAt ? isoDay(user.lastDownloadAt) : 'never'}
            </span>
            {(a.designViews > 0 || a.pricingViews > 0) && (
              <span className='text-gray-500'>
                {a.designViews ?? 0} views · {a.pricingViews ?? 0} pricing
              </span>
            )}
            {(a.checkoutState === 'abandoned' || a.limitHits > 0 || a.premiumBlocked > 0) && (
              <span className='font-semibold text-amber-700'>
                {[
                  a.checkoutState === 'abandoned' ? 'Abandoned checkout' : '',
                  a.limitHits > 0 ? `${a.limitHits} limit hits` : '',
                  a.premiumBlocked > 0 ? `${a.premiumBlocked} premium tries` : '',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            )}
          </div>
        );
      }
      case 'subscriptionState': {
        const st = user.subscriptionState;
        const tone =
          st === 'active'
            ? 'bg-green-100 text-green-800'
            : st === 'cancelling' || st === 'payment_failed'
              ? 'bg-amber-100 text-amber-800'
              : st === 'lapsed'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600';
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>
            {SUB_STATE_LABELS[st] || '—'}
          </span>
        );
      }
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
                <DropdownItem
                  key='timeline'
                  onPress={() => setTimelineUser(user)}
                >
                  Activity timeline
                </DropdownItem>
                {/* Manual payments: convert any user into a subscriber. Lives
                    here as well as on the Subscribers page because a first-time
                    manual customer is not a subscriber yet, so this is where
                    you find them. */}
                <DropdownItem
                  key='grant-access'
                  onPress={() => handleGrantClick(user)}
                >
                  Grant / Extend Access
                </DropdownItem>
                {/* A different product, not a variant of the one above: a
                    quantity of downloads with no plan and no renewal. */}
                <DropdownItem
                  key='add-credits'
                  onPress={() => setCreditUser(user)}
                >
                  Add Download Credits
                </DropdownItem>
                <DropdownItem
                  key='block'
                  className={user.status === 'blocked' ? '' : 'text-danger'}
                  color={user.status === 'blocked' ? 'default' : 'danger'}
                  onPress={() => handleBlockClick(user)}
                >
                  {user.status === 'blocked' ? 'Unblock user' : 'Block user'}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, [handleBlockClick, handleGrantClick]);

  // --- Export ---
  const {
    isOpen: isExportOpen,
    onOpen: onExportOpen,
    onOpenChange: onExportChange,
  } = useDisclosure();

  const planOptions = useMemo(
    () => [['', 'All plans'], ...grantPlans.map((p) => [String(p._id), p.name])],
    [grantPlans],
  );

  // Human summary of the current view, for the export dialog.
  const filterSummary = useMemo(() => {
    const f = filters;
    const parts = [];
    if (f.blocked === '1') parts.push('Blocked users');
    if (f.search) parts.push(`Search "${f.search}"`);
    if (f.plan) parts.push(labelOf(PLAN_OPTIONS, f.plan));
    if (f.planId) {
      const name = planOptions.find(([v]) => v === f.planId)?.[1];
      parts.push(`Plan: ${name || 'selected plan'}`);
    }
    if (f.provider) parts.push(`Signup: ${labelOf(PROVIDER_OPTIONS, f.provider)}`);
    if (f.verified) parts.push(labelOf(VERIFIED_OPTIONS, f.verified));
    if (f.credits) parts.push(labelOf(CREDITS_OPTIONS, f.credits));
    if (f.activeWithin) parts.push(labelOf(ACTIVITY_OPTIONS, f.activeWithin));
    if (f.country) parts.push(`Country "${f.country}"`);
    if (f.minDownloads) parts.push(`≥ ${f.minDownloads} downloads`);
    if (f.maxDownloads) parts.push(`≤ ${f.maxDownloads} downloads`);
    if (f.startDate || f.endDate)
      parts.push(`Joined ${f.startDate || '…'} to ${f.endDate || '…'}`);
    const preset = matchingPreset(f);
    if (preset) parts.push(`Preset: ${preset.label}`);
    const win = `in ${f.window || 30} days`;
    if (f.winMin) parts.push(`≥ ${f.winMin} downloads ${win}`);
    if (f.winMax) parts.push(`≤ ${f.winMax} downloads ${win}`);
    if (f.daysMin) parts.push(`≥ ${f.daysMin} download days ${win}`);
    if (f.daysMax) parts.push(`≤ ${f.daysMax} download days ${win}`);
    if (f.freeMin) parts.push(`≥ ${f.freeMin} free downloads ${win}`);
    if (f.inactiveDays) parts.push(`No download for ${f.inactiveDays} days`);
    if (f.everDownloaded)
      parts.push(labelOf(EVER_DOWNLOADED_OPTIONS, f.everDownloaded));
    if (f.subState)
      parts.push(`Subscription: ${labelOf(SUB_STATE_OPTIONS, f.subState)}`);
    if (f.viewsMin) parts.push(`≥ ${f.viewsMin} design views ${win}`);
    if (f.pricingMin) parts.push(`≥ ${f.pricingMin} pricing visits ${win}`);
    if (f.limitHitsMin) parts.push(`≥ ${f.limitHitsMin} limit hits ${win}`);
    if (f.premiumMin) parts.push(`≥ ${f.premiumMin} premium tries ${win}`);
    if (f.checkout) parts.push(`Checkout: ${labelOf(CHECKOUT_OPTIONS, f.checkout)}`);
    if (f.notSeenDays) parts.push(`Not on site for ${f.notSeenDays} days`);
    if (f.marketing) parts.push(`Offer emails: ${labelOf(MARKETING_OPTIONS, f.marketing)}`);
    if (f.signupChannel)
      parts.push(`Came from: ${labelOf(SIGNUP_CHANNEL_OPTIONS, f.signupChannel)}`);
    if (f.utmCampaign) parts.push(`Campaign "${f.utmCampaign}"`);
    return parts;
  }, [filters, planOptions]);

  // The filters as a query string (what a saved segment stores). Blocked view
  // is a tab, not a filter, so it stays out.
  const segmentQuery = useMemo(() => {
    const rest = { ...filters };
    delete rest.blocked;
    return userFiltersToQuery(rest).toString();
  }, [filters]);

  const openSegment = useCallback(
    (query) => {
      const params = new URLSearchParams(query);
      if (blockedView) params.set('blocked', '1');
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [router, blockedView],
  );

  const hasNarrowingFilter = Object.keys(filters).some(
    (k) => k !== 'sort' && k !== 'blocked',
  );

  // "All" = every user, active and blocked, with no filters.
  const allCount = stats?.totalUsers ?? pagination?.total ?? 0;

  const loadExportRows = useCallback(
    async (scope, onProgress) => {
      if (scope === 'all') {
        const sortOnly = filters.sort ? { sort: filters.sort } : {};
        const active = await fetchUserPages(userFiltersToQuery(sortOnly), (n) =>
          onProgress(n, allCount),
        );
        const blocked = await fetchUserPages(
          userFiltersToQuery({ ...sortOnly, blocked: '1' }),
          (n) => onProgress(active.length + n, allCount),
        );
        return [...active, ...blocked];
      }
      return fetchUserPages(userFiltersToQuery(filters), (n, total) =>
        onProgress(n, total ?? pagination?.total ?? n),
      );
    },
    [filters, allCount, pagination?.total],
  );

  // --- Custom Filter Bar ---
  const topContent = (
    <div className='mb-4 flex flex-col gap-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex gap-2'>
          <Button
            size='sm'
            variant={!blockedView ? 'solid' : 'flat'}
            className={!blockedView ? 'bg-black text-white' : ''}
            onPress={() => setBlockedView(false)}
          >
            Active Users
          </Button>
          <Button
            size='sm'
            variant={blockedView ? 'solid' : 'flat'}
            className={blockedView ? 'bg-black text-white' : ''}
            onPress={() => setBlockedView(true)}
          >
            Blocked Users
          </Button>
        </div>
        <div className='flex flex-wrap gap-2'>
          <SavedSegmentsMenu
            page='users'
            currentQuery={segmentQuery}
            onOpen={openSegment}
          />
          {hasNarrowingFilter && (
            <Button
              size='sm'
              variant='light'
              startContent={<X size={14} />}
              onPress={clearFilters}
            >
              Clear filters
            </Button>
          )}
          <Button
            size='sm'
            color='primary'
            variant='flat'
            startContent={<Download size={16} />}
            onPress={onExportOpen}
          >
            Export
          </Button>
          <Button
            size='sm'
            variant='flat'
            startContent={<Send size={14} />}
            onPress={onZohoOpen}
          >
            Send to Zoho
          </Button>
        </div>
      </div>

      <Input
        isClearable
        size='sm'
        className='w-full sm:max-w-md'
        placeholder='Search name or email…'
        startContent={<Search size={16} className='text-gray-400' />}
        value={drafts.search}
        onValueChange={(val) => setDraft('search', val)}
        onClear={() => setDraft('search', '')}
      />

      <div className='flex flex-wrap items-center gap-2'>
        <FilterDropdown
          label='Plan'
          value={filters.plan}
          options={PLAN_OPTIONS}
          active={!!filters.plan}
          onChange={(v) => pushFilters({ plan: v, ...(v === 'free' ? { planId: '' } : {}) })}
        />
        {grantPlans.length > 0 && filters.plan !== 'free' && (
          <FilterDropdown
            label='Premium plan'
            value={filters.planId}
            options={planOptions}
            active={!!filters.planId}
            onChange={(v) => handleFilterChange('planId', v)}
          />
        )}
        <FilterDropdown
          label='Signup via'
          value={filters.provider}
          options={PROVIDER_OPTIONS}
          active={!!filters.provider}
          onChange={(v) => handleFilterChange('provider', v)}
        />
        <FilterDropdown
          label='Email'
          value={filters.verified}
          options={VERIFIED_OPTIONS}
          active={!!filters.verified}
          onChange={(v) => handleFilterChange('verified', v)}
        />
        <FilterDropdown
          label='Credits'
          value={filters.credits}
          options={CREDITS_OPTIONS}
          active={!!filters.credits}
          onChange={(v) => handleFilterChange('credits', v)}
        />
        <FilterDropdown
          label='Activity'
          value={filters.activeWithin}
          options={ACTIVITY_OPTIONS}
          active={!!filters.activeWithin}
          onChange={(v) => handleFilterChange('activeWithin', v)}
        />
        <FilterDropdown
          label='Sort'
          value={filters.sort}
          options={SORT_OPTIONS}
          active={false}
          onChange={(v) => handleFilterChange('sort', v)}
        />
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
        <Input
          size='sm'
          label='Country'
          labelPlacement='outside'
          placeholder='e.g. US or Germany'
          value={drafts.country}
          onValueChange={(val) => setDraft('country', val)}
        />
        <Input
          size='sm'
          type='number'
          min={0}
          label='Min downloads'
          labelPlacement='outside'
          placeholder='0'
          value={drafts.minDownloads}
          onValueChange={(val) => setDraft('minDownloads', val)}
        />
        <Input
          size='sm'
          type='number'
          min={0}
          label='Max downloads'
          labelPlacement='outside'
          placeholder='Any'
          value={drafts.maxDownloads}
          onValueChange={(val) => setDraft('maxDownloads', val)}
        />
        <Input
          size='sm'
          type='date'
          label='Joined from'
          labelPlacement='outside'
          value={filters.startDate || ''}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
        />
        <Input
          size='sm'
          type='date'
          label='Joined to'
          labelPlacement='outside'
          value={filters.endDate || ''}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
        />
      </div>

      <BehaviourFilters
        filters={filters}
        drafts={drafts}
        setDraft={setDraft}
        pushFilters={pushFilters}
      />
    </div>
  );

  return (
    <>
      <div className='flex justify-between items-center mx-6'>
        <h1 className='text-2xl font-bold mb-4'>
          {blockedView ? 'Blocked Users' : 'All Users'}
        </h1>
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

      <ExportFieldsModal
        isOpen={isExportOpen}
        onOpenChange={onExportChange}
        title='Export users'
        fields={USER_EXPORT_FIELDS}
        filteredCount={pagination?.total ?? 0}
        allCount={allCount}
        loadRows={loadExportRows}
        filterSummary={filterSummary}
        filenameBase='users'
        storageKey='embroidize.usersExport.fields'
      />

      <ZohoPushModal
        isOpen={isZohoOpen}
        onClose={onZohoClose}
        matchCount={pagination?.total ?? 0}
        filterSummary={filterSummary}
        loadRows={(onProgress) => loadExportRows('filtered', onProgress)}
      />

      {timelineUser && (
        <UserTimelineModal
          user={timelineUser}
          onClose={() => setTimelineUser(null)}
        />
      )}

      {creditUser && (
        <AddCreditsModal
          user={creditUser}
          onClose={() => setCreditUser(null)}
          onAdded={() => router.refresh()}
        />
      )}

      {/* Grant / Extend Access — manual payments */}
      {grantUser && (
        <GrantAccessModal
          user={grantUser}
          plans={grantPlans}
          onClose={() => setGrantUser(null)}
          onGranted={() => router.refresh()}
        />
      )}

      {/* Block / unblock confirmation */}
      <Modal
        isOpen={!!blockConfirm}
        onClose={() => !isBlocking && setBlockConfirm(null)}
        size='sm'
      >
        <ModalContent>
          {(() => {
            const isUnblock = blockConfirm?.status === 'blocked';
            const who = blockConfirm?.name || blockConfirm?.email;
            return (
              <>
                <ModalHeader>
                  {isUnblock ? 'Unblock user?' : 'Block user?'}
                </ModalHeader>
                <ModalBody className='text-sm text-gray-600'>
                  {isUnblock ? (
                    <>
                      Unblock{' '}
                      <span className='font-semibold text-gray-900'>{who}</span>?
                      They&apos;ll be able to log in and download again, and
                      return to the active users list.
                    </>
                  ) : (
                    <>
                      Block{' '}
                      <span className='font-semibold text-gray-900'>{who}</span>?
                      They won&apos;t be able to log in or download, and
                      they&apos;ll move to the Blocked list. You can unblock them
                      anytime.
                    </>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant='light'
                    onPress={() => setBlockConfirm(null)}
                    isDisabled={isBlocking}
                  >
                    Cancel
                  </Button>
                  <Button
                    color={isUnblock ? 'primary' : 'danger'}
                    isLoading={isBlocking}
                    onPress={() => performBlock(blockConfirm)}
                  >
                    {isUnblock ? 'Unblock user' : 'Block user'}
                  </Button>
                </ModalFooter>
              </>
            );
          })()}
        </ModalContent>
      </Modal>

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
