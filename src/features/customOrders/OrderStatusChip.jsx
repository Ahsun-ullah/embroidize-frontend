'use client';

import { statusMeta } from './ordersApi';

// Grayscale chip restyles for dark surfaces (checkout page). Opt-in via the
// `dark` prop so admin/user lists keep the light STATUS_META styling.
const DARK_STATUS_CLASS = {
  pending_review: 'bg-white/10 text-zinc-300 border-white/20',
  awaiting_payment: 'bg-white text-black border-white',
  paid: 'bg-white/15 text-white border-white/30',
  in_progress: 'bg-white/15 text-white border-white/30',
  delivered: 'bg-white text-black border-white',
  in_revision: 'bg-white/10 text-zinc-200 border-white/25',
  completed: 'bg-white/10 text-zinc-400 border-white/15',
  cancelled: 'bg-white/5 text-zinc-500 border-white/10 line-through',
  expired: 'bg-white/5 text-zinc-500 border-white/10',
};

export default function OrderStatusChip({ status, className = '', dark = false }) {
  const meta = statusMeta(status);
  const tone = dark
    ? DARK_STATUS_CLASS[status] || 'bg-white/10 text-zinc-300 border-white/20'
    : meta.className;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${tone} ${className}`}
    >
      {meta.label}
    </span>
  );
}
