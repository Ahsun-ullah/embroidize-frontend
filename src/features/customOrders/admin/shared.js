// Shared vocabulary for the admin custom-orders screen. Lives outside both the
// table shell and the dialog bundle so the lazily-loaded dialogs don't drag the
// table's constants back into the initial chunk (or vice versa).

export const STATUS_LABELS = {
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

export const STATUS_ORDER = [
  'pending_review',
  'awaiting_payment',
  'paid',
  'in_progress',
  'delivered',
  'in_revision',
  'completed',
  'cancelled',
  'expired',
];

// Brand rule: Embroidize admin UI is black & white. Status is carried by INK
// WEIGHT, not hue — the darker the pill, the more it wants the admin's hands.
// (This replaced the old yellow/purple/blue/green/red palette.)
export const STATUS_BADGE = {
  pending_review: 'bg-gray-900 text-white',
  awaiting_payment: 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300',
  paid: 'bg-gray-800 text-white',
  in_progress: 'bg-gray-700 text-white',
  delivered: 'bg-gray-200 text-gray-900',
  in_revision: 'bg-gray-900 text-white',
  completed: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200',
  cancelled: 'bg-gray-100 text-gray-400',
  expired: 'bg-gray-100 text-gray-400',
};

export function DetailRow({ label, value }) {
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
export function formatLocation(ipInfo) {
  if (!ipInfo) return '';
  return [ipInfo.city, ipInfo.region, ipInfo.country]
    .filter((v) => typeof v === 'string' && v.trim())
    .join(', ');
}

export function getToken() {
  const tokenCookie = document.cookie
    .split('; ')
    .find((r) => r.startsWith('token='));
  return tokenCookie ? tokenCookie.split('=').slice(1).join('=') : undefined;
}

// Financial elevation token — required by the gated custom-order endpoints.
export function getFinanceToken() {
  const c = document.cookie
    .split('; ')
    .find((r) => r.startsWith('finance_elev='));
  return c ? c.split('=').slice(1).join('=') : undefined;
}

// Shared auth headers for the finance-gated admin endpoints.
export const adminHeaders = (json = true) => {
  const headers = json ? { 'Content-Type': 'application/json' } : {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const financeToken = getFinanceToken();
  if (financeToken) headers['x-finance-elevation'] = financeToken;
  return headers;
};

export const apiBase = () =>
  process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
  process.env.NEXT_PUBLIC_BASE_API_URL;

// Promised turnaround in hours, keyed by the order form's options. Used only
// for the admin-side "overdue" hint — customers never see these chips.
const TURNAROUND_HOURS = {
  'Rush (2–4h)': 4,
  'Standard (4–8h)': 8,
  'Next Day': 24,
};
// Mirrors EXPIRE_AFTER_DAYS in the backend lifecycle cron.
const QUOTE_EXPIRES_AFTER_DAYS = 7;

const hoursSince = (d) => (Date.now() - new Date(d).getTime()) / 36e5;
const fmtWait = (h) => (h < 48 ? `${Math.round(h)}h` : `${Math.round(h / 24)}d`);

// Returns an "admin is late" hint for a row, or null when on track:
// pending_review = customer waiting on a quote; paid/in_progress = work
// overdue vs the promised turnaround; in_revision = revision waiting.
export function agingInfo(order) {
  if (order.status === 'pending_review') {
    const h = hoursSince(order.createdAt);
    return h >= 4 ? `Quote due · waiting ${fmtWait(h)}` : null;
  }
  if (['paid', 'in_progress'].includes(order.status)) {
    const limit = order.rushOrder
      ? 4
      : TURNAROUND_HOURS[order.turnaround] || 24;
    const h = hoursSince(order.paidAt || order.updatedAt || order.createdAt);
    return h > limit ? `Overdue · waiting ${fmtWait(h)}` : null;
  }
  if (order.status === 'in_revision' && order.revisions?.length) {
    const h = hoursSince(order.revisions[order.revisions.length - 1].requestedAt);
    return h > 24 ? `Revision waiting ${fmtWait(h)}` : null;
  }
  return null;
}

// Days until an unpaid quote auto-expires (matches the lifecycle cron).
export function quoteExpiryDays(order) {
  if (order.status !== 'awaiting_payment' || !order.quotedAt) return null;
  const expiresAt =
    new Date(order.quotedAt).getTime() +
    QUOTE_EXPIRES_AFTER_DAYS * 24 * 36e5;
  return Math.ceil((expiresAt - Date.now()) / (24 * 36e5));
}

// next/image can only optimize hosts listed in next.config.js remotePatterns.
// Design references land in DO Spaces today, but older//edge rows may carry a
// URL from somewhere else — those fall back to a plain lazy <img> rather than
// throwing at runtime.
const OPTIMIZABLE_HOSTS = [
  'embroidize-assets.nyc3.cdn.digitaloceanspaces.com',
  'embroidize-assets.nyc3.digitaloceanspaces.com',
  'res.cloudinary.com',
  'embroidize.com',
  'www.embroidize.com',
];

export function isOptimizableImage(url) {
  try {
    return OPTIMIZABLE_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

export const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;
