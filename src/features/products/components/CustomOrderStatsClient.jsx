'use client';

import { Card, CardBody } from '@heroui/react';
import {
  CalendarClock,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Loader,
  Receipt,
  TrendingUp,
  XCircle,
} from 'lucide-react';

// Brand rule: Embroidize admin UI is black & white only — accents are grayscale,
// never colored. Status meaning is carried by labels + position, not hue.
const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

export function CustomOrderStatsClient({ stats }) {
  const revenue = stats.revenue || {
    total: 0,
    completed: 0,
    avg: 0,
    pricedCount: 0,
  };

  // Headline metrics — the numbers that were previously buried in the DB.
  const headline = [
    {
      title: 'Completed Revenue',
      value: money(revenue.completed),
      hint: `${stats.completed} completed orders`,
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

  const statCards = [
    { title: 'Total', value: stats.total, icon: FileText },
    { title: 'Pending', value: stats.pending, icon: Clock },
    { title: 'In Progress', value: stats.inProgress, icon: Loader },
    { title: 'Completed', value: stats.completed, icon: CheckCircle },
    { title: 'Cancelled', value: stats.cancelled, icon: XCircle },
  ];

  // Grayscale shades so the stacked bar stays readable while on-brand.
  const distributionItems = [
    { label: 'Pending', value: stats.pending, shade: 'bg-gray-900' },
    { label: 'In Progress', value: stats.inProgress, shade: 'bg-gray-600' },
    { label: 'Completed', value: stats.completed, shade: 'bg-gray-400' },
    { label: 'Cancelled', value: stats.cancelled, shade: 'bg-gray-300' },
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

      {/* Status counts */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className='border border-gray-200 dark:border-gray-800 shadow-none hover:border-gray-400 dark:hover:border-gray-600 transition-colors'
            >
              <CardBody className='p-3 sm:p-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900'>
                    <Icon className='h-5 w-5 text-gray-700 dark:text-gray-300' />
                  </div>
                  <div className='flex flex-col'>
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

      {/* Status distribution + data-quality footnotes */}
      {stats.total > 0 && (
        <Card className='border border-gray-200 dark:border-gray-800 shadow-none'>
          <CardBody className='p-4 space-y-3'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
                Status distribution
              </span>
              <span className='text-xs text-gray-500'>
                {stats.total} orders
              </span>
            </div>

            <div className='w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 flex overflow-hidden'>
              {distributionItems.map((item) => {
                if (!item.value || stats.total === 0) return null;
                const width = (item.value / stats.total) * 100;
                return (
                  <div
                    key={item.label}
                    className={`${item.shade} h-2`}
                    style={{ width: `${width}%` }}
                  />
                );
              })}
            </div>

            <div className='flex flex-wrap gap-3'>
              {distributionItems.map((item) => {
                if (!stats.total) return null;
                const percentage = ((item.value / stats.total) * 100).toFixed(
                  1,
                );
                return (
                  <div
                    key={item.label}
                    className='flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300'
                  >
                    <span className={`h-2 w-2 rounded-full ${item.shade}`} />
                    <span className='font-medium'>{item.label}</span>
                    <span className='text-gray-400'>
                      ({item.value} · {percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Lightweight data-quality signals */}
            <div className='flex flex-wrap gap-4 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500'>
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
          </CardBody>
        </Card>
      )}
    </div>
  );
}
