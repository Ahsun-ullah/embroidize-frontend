'use client';

import { statusMeta } from './ordersApi';

export default function OrderStatusChip({ status, className = '' }) {
  const meta = statusMeta(status);
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${meta.className} ${className}`}
    >
      {meta.label}
    </span>
  );
}
