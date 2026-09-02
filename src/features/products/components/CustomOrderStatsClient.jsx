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

  // One tile per lifecycle status (plus Total), in lifecycle order, with a
  // grayscale ramp for the distribution bar — meaning comes from labels +
  // position, never hue (brand rule).
  const LIFECYCLE = [
    { key: 'pending_review', label: 'Pending Review', icon: Clock, shade: 'bg-gray-900' },
    { key: 'awaiting_payment', label: 'Awaiting Payment', icon: Hourglass, shade: 'bg-gray-800' },
    { key: 'paid', label: 'Paid', icon: Banknote, shade: 'bg-gray-700' },
    { key: 'in_progress', label: 'In Progress', icon: Loader, shade: 'bg-gray-600' },
    { key: 'delivered', label: 'Delivered', icon: PackageCheck, shade: 'bg-gray-500' },
    { key: 'in_revision', label: 'In Revision', icon: RotateCcw, shade: 'bg-gray-400' },
    { key: 'completed', label: 'Completed', icon: CheckCircle, shade: 'bg-gray-300' },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle, shade: 'bg-gray-200' },
    { key: 'expired', label: 'Expired', icon: Hourglass, shade: 'bg-gray-100' },
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

  const distributionItems = LIFECYCLE.map((s) => ({
    label: s.label,
    value: counts[s.key] ?? 0,
    shade: s.shade,
  }));

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

      {/* Monthly collected trend + quote funnel */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
        <MonthlyTrendCard trend={stats.monthlyTrend} />
        <FunnelCard funnel={stats.funnel} />
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
                if (!stats.total || !item.value) return null;
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

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// 12-month collected-revenue bars. Single series, so the title carries
// identity (no legend); grayscale ink per brand; value on hover, direct label
// only on the best month (selective labeling).
function MonthlyTrendCard({ trend }) {
  const months = Array.isArray(trend) ? trend : [];
  if (months.length === 0) return null;
  const max = Math.max(...months.map((m) => m.total), 0);
  const year12 = months.reduce((a, m) => a + m.total, 0);
  const BAR_MAX_PX = 80;

  return (
    <Card className='border border-gray-200 dark:border-gray-800 shadow-none'>
      <CardBody className='p-4 space-y-3'>
        <div className='flex items-baseline justify-between gap-2'>
          <span className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
            Collected per month
          </span>
          <span className='text-xs text-gray-500'>
            {money(year12)} last 12 months
          </span>
        </div>

        {max <= 0 ? (
          <p className='text-sm text-gray-400'>
            No payments recorded in the last 12 months.
          </p>
        ) : (
          <div className='flex items-end gap-[2px] pt-6'>
            {months.map((m) => {
              const [yy, mm] = m.month.split('-');
              const label = `${MONTH_SHORT[Number(mm) - 1]} ${yy}`;
              const h = max > 0 ? Math.round((m.total / max) * BAR_MAX_PX) : 0;
              const isPeak = m.total === max && m.total > 0;
              return (
                <div
                  key={m.month}
                  className='group relative flex flex-1 flex-col items-center'
                >
                  <span className='pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white dark:text-gray-900'>
                    {label} · {money(m.total)}
                  </span>
                  {isPeak && (
                    <span className='mb-0.5 text-[9px] font-semibold text-gray-600 dark:text-gray-300'>
                      {money(m.total)}
                    </span>
                  )}
                  <div
                    className={`w-full max-w-[22px] rounded-t ${
                      m.total > 0
                        ? 'bg-gray-900 group-hover:bg-gray-600 dark:bg-gray-100 dark:group-hover:bg-gray-400'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                    style={{ height: `${m.total > 0 ? Math.max(h, 3) : 2}px` }}
                  />
                  <span className='mt-1 text-[9px] text-gray-400'>
                    {MONTH_SHORT[Number(mm) - 1]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Screen-reader / no-hover fallback for the bar values. */}
        <table className='sr-only'>
          <caption>Collected revenue per month, last 12 months</caption>
          <tbody>
            {months.map((m) => (
              <tr key={m.month}>
                <th scope='row'>{m.month}</th>
                <td>{money(m.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

// Quote → payment funnel: shows whether pricing / follow-up loses orders.
function FunnelCard({ funnel }) {
  if (!funnel) return null;
  const rate = Number(funnel.conversionRate) || 0;
  const fmtHours = (h) =>
    !h ? '—' : h < 48 ? `${h}h` : `${Math.round(h / 24)}d`;

  const items = [
    { label: 'Quotes sent', value: funnel.quoted ?? 0 },
    { label: 'Paid', value: funnel.converted ?? 0 },
    { label: 'Avg time to quote', value: fmtHours(funnel.avgHoursToQuote) },
    { label: 'Avg quote → paid', value: fmtHours(funnel.avgHoursToPay) },
  ];

  return (
    <Card className='border border-gray-200 dark:border-gray-800 shadow-none'>
      <CardBody className='p-4 space-y-3'>
        <div className='flex items-baseline justify-between gap-2'>
          <span className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
            Quote conversion
          </span>
          <span className='text-lg font-bold text-gray-900 dark:text-gray-100'>
            {rate}%
          </span>
        </div>

        <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800'>
          <div
            className='h-2 rounded-full bg-gray-900 dark:bg-gray-100'
            style={{ width: `${Math.min(rate, 100)}%` }}
          />
        </div>

        <div className='grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4'>
          {items.map((it) => (
            <div key={it.label} className='flex flex-col'>
              <span className='text-[11px] text-gray-400'>{it.label}</span>
              <span className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                {it.value}
              </span>
            </div>
          ))}
        </div>

        {(funnel.lostCount ?? 0) > 0 && (
          <p className='border-t border-gray-100 dark:border-gray-800 pt-2 text-xs text-gray-500'>
            <span className='font-semibold text-gray-700 dark:text-gray-300'>
              {money(funnel.lostValue)}
            </span>{' '}
            in {funnel.lostCount} unconverted quotes (cancelled or expired
            without payment).
          </p>
        )}
      </CardBody>
    </Card>
  );
}
