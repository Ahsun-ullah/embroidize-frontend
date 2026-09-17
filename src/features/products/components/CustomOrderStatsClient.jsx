'use client';

import { Card, CardBody } from '@heroui/react';
import {
  Banknote,
  CalendarClock,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Hourglass,
  Image as ImageIcon,
  Loader,
  PackageCheck,
  Receipt,
  RotateCcw,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// Brand rule: Embroidize admin UI is black & white only — accents are grayscale,
// never colored. Status meaning is carried by labels + position, not hue.
const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

export function CustomOrderStatsClient({ stats }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Clicking a status tile filters the orders table below to that status
  // (Total clears the filter) — same URL params the table's dropdown sets.
  const filterByStatus = (statusKey) => {
    const params = new URLSearchParams(searchParams.toString());
    if (statusKey) params.set('status', statusKey);
    else params.delete('status');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const revenue = stats.revenue || {
    total: 0,
    collected: 0,
    collectedCount: 0,
    avg: 0,
    pricedCount: 0,
  };
  const collected = revenue.collected ?? revenue.completed ?? 0;

  // Full lifecycle counts. Older API builds only sent the 4 aliases — fall
  // back to those so the tiles never show blanks during a mixed deploy.
  const counts = stats.statusCounts || {
    pending_review: stats.pending ?? 0,
    in_progress: stats.inProgress ?? 0,
    completed: stats.completed ?? 0,
    cancelled: stats.cancelled ?? 0,
  };

  // Headline metrics — the numbers that were previously buried in the DB.
  const headline = [
    {
      title: 'Collected Revenue',
      value: money(collected),
      hint: `${revenue.collectedCount ?? 0} paying orders`,
      icon: DollarSign,
    },
    {
      title: 'Total Quoted',
      value: money(revenue.total),
      hint: `${revenue.pricedCount} priced orders`,
      icon: Receipt,
    },
    {
      title: 'Avg Ticket',
      value: money(revenue.avg),
      hint: 'per priced order',
      icon: TrendingUp,
    },
    {
      title: 'Last 30 Days',
      value: stats.last30Days ?? 0,
      hint: 'new orders',
      icon: CalendarClock,
    },
  ];

  // One tile per lifecycle status (plus Total), in lifecycle order.
  const LIFECYCLE = [
    { key: 'pending_review', label: 'Pending Review', icon: Clock },
    { key: 'awaiting_payment', label: 'Awaiting Payment', icon: Hourglass },
    { key: 'paid', label: 'Paid', icon: Banknote },
    { key: 'in_progress', label: 'In Progress', icon: Loader },
    { key: 'delivered', label: 'Delivered', icon: PackageCheck },
    { key: 'in_revision', label: 'In Revision', icon: RotateCcw },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle },
    { key: 'expired', label: 'Expired', icon: Hourglass },
  ];

  const statCards = [
    { title: 'Total', value: stats.total, icon: FileText, statusKey: null },
    ...LIFECYCLE.map((s) => ({
      title: s.label,
      value: counts[s.key] ?? 0,
      icon: s.icon,
      statusKey: s.key,
    })),
  ];

  return (
    <div className='space-y-4'>
      {/* Headline / revenue metrics */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {headline.map((m) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.title}
              className='border border-gray-200 dark:border-gray-800 shadow-none'
            >
              <CardBody className='p-4'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex flex-col'>
                    <span className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                      {m.title}
                    </span>
                    <span className='mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100'>
                      {m.value}
                    </span>
                    <span className='mt-0.5 text-xs text-gray-400'>
                      {m.hint}
                    </span>
                  </div>
                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900'>
                    <Icon size={18} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Status counts — click a tile to filter the table to that status */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              isPressable
              onPress={() => filterByStatus(stat.statusKey)}
              title={
                stat.statusKey
                  ? `Show ${stat.title} orders`
                  : 'Show all orders'
              }
              className='border border-gray-200 dark:border-gray-800 shadow-none hover:border-gray-400 dark:hover:border-gray-600 transition-colors'
            >
              <CardBody className='p-3 sm:p-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900'>
                    <Icon className='h-5 w-5 text-gray-700 dark:text-gray-300' />
                  </div>
                  <div className='flex flex-col items-start'>
                    <span className='text-xs font-medium text-gray-500'>
                      {stat.title}
                    </span>
                    <span className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                      {stat.value}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Data-quality signals. The monthly-collected chart, quote-conversion
          funnel and status-distribution bar that used to sit here were dropped
          (user, 2026-09-17): the status tiles above already carry the counts,
          and computing the other two forced the stats endpoint to load every
          order document on each page view. */}
      {stats.total > 0 && (
        <div className='flex flex-wrap gap-4 text-xs text-gray-500'>
          <span className='inline-flex items-center gap-1.5'>
            <ImageIcon size={13} className='text-gray-400' />
            {stats.withFiles ?? 0} with design files
          </span>
          {(stats.emailNotSent ?? 0) > 0 && (
            <span className='inline-flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300'>
              <XCircle size={13} className='text-gray-400' />
              {stats.emailNotSent} missing confirmation email
            </span>
          )}
        </div>
      )}
    </div>
  );
}
