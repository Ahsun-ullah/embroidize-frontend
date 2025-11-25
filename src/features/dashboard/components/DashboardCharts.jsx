'use client';

import { DateRangePicker } from '@heroui/react'; // Assuming you use HeroUI based on previous code
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/** Compact number formatter */
const formatNumber = (n) =>
  new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n ?? 0);

/** Smart date label formatter */
const formatDateLabel = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
  }).format(d);
};

/** Minimal card shell */
const ChartCard = ({ title, children, action }) => (
  <div
    className='w-full h-96 rounded-2xl bg-white shadow-lg shadow-black/5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 relative'
    role='region'
    aria-label={title}
  >
    <div className='flex items-center justify-between px-4 pt-4'>
      <h2 className='text-base md:text-lg font-semibold tracking-tight text-neutral-800 dark:text-neutral-100'>
        {title}
      </h2>
      {action && <div>{action}</div>}
    </div>
    <div className='h-[calc(24rem-3.25rem)] px-2 pb-2'>{children}</div>
  </div>
);

/** Subtle tooltip */
const CustomTooltip = ({ active, label, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className='rounded-lg border border-black/10 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur dark:bg-neutral-900/95 dark:text-neutral-100 z-50'>
      {label && (
        <div className='mb-1 font-medium'>{formatDateLabel(label)}</div>
      )}
      {payload.map((p) => (
        <div key={p.dataKey} className='flex items-center gap-2'>
          <span
            className='inline-block h-2.5 w-2.5 rounded-full'
            style={{ background: p.color }}
          />
          <span className='font-medium'>{p.name ?? p.dataKey}:</span>
          <span>{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

/** Graceful empty state */
const EmptyState = ({ message = 'No data available' }) => (
  <div className='flex h-full items-center justify-center text-sm text-neutral-500 dark:text-neutral-400'>
    {message}
  </div>
);

export default function DashboardCharts({
  userData = [],
  downloadData = [],
  locationData = [],
}) {
  const [filter, setFilter] = useState('all'); 
  const [customRange, setCustomRange] = useState(null);

  // --- Filtering Logic ---
  const filterDataByDate = (data) => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let startDate = new Date();

    if (filter === 'all') return data;


    // Preset filters
    switch (filter) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      default:
        return data;
    }

    return data.filter((item) => new Date(item.date) >= startDate);
  };

  const filteredUserData = useMemo(
    () => filterDataByDate(userData),
    [userData, filter, customRange],
  );
  const filteredDownloadData = useMemo(
    () => filterDataByDate(downloadData),
    [downloadData, filter, customRange],
  );

  // --- Limit Country Data (Top 15) ---
  const topLocationData = useMemo(() => {
    return locationData
      .sort((a, b) => b.value - a.value) // Ensure sorted by highest count
      .slice(0, 15);
  }, [locationData]);

  // --- Filter Controls UI ---
  const FilterControls = () => (
    <div className='flex flex-wrap gap-2 mb-6 items-center'>
      <div className='flex bg-gray-100 dark:bg-neutral-800 rounded-lg p-1'>
        {['1m', '3m', '6m', 'all'].map((key) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              setCustomRange(null);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filter === key
                ? 'bg-white dark:bg-neutral-600 text-black dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>

    </div>
  );

  return (
    <>
      <FilterControls />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* New User Registrations */}
        <ChartCard title='New User Registrations'>
          {filteredUserData.length === 0 ? (
            <EmptyState message='No users found for this period' />
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart
                data={filteredUserData}
                margin={{ top: 10, right: 12, left: 6, bottom: 0 }}
              >
                <defs>
                  <linearGradient id='gradUsers' x1='0' y1='0' x2='1' y2='0'>
                    <stop offset='0%' stopColor='#6366f1' stopOpacity={0.9} />
                    <stop offset='100%' stopColor='#8b5cf6' stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' strokeOpacity={0.4} />
                <XAxis
                  dataKey='date'
                  tickFormatter={formatDateLabel}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  width={44}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 8 }} iconType='circle' />
                <Line
                  type='monotone'
                  dataKey='value'
                  name='New Users'
                  stroke='url(#gradUsers)'
                  strokeWidth={1.5}
                  dot={{ r: 2.5 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Product Downloads */}
        <ChartCard title='Product Downloads'>
          {filteredDownloadData.length === 0 ? (
            <EmptyState message='No downloads found for this period' />
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart
                data={filteredDownloadData}
                margin={{ top: 10, right: 12, left: 6, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id='gradDownloads'
                    x1='0'
                    y1='0'
                    x2='1'
                    y2='0'
                  >
                    <stop offset='0%' stopColor='#10b981' stopOpacity={0.9} />
                    <stop offset='100%' stopColor='#22c55e' stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' strokeOpacity={0.4} />
                <XAxis
                  dataKey='date'
                  tickFormatter={formatDateLabel}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  width={44}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 8 }} iconType='circle' />
                <Line
                  type='monotone'
                  dataKey='value'
                  name='Downloads'
                  stroke='url(#gradDownloads)'
                  strokeWidth={1.5}
                  dot={{ r: 2.5 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Users by Country (Top 15) */}
      <div className='mt-8'>
        <ChartCard title='Users by Country (Top 15)'>
          {topLocationData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart
                data={topLocationData}
                margin={{ top: 10, right: 12, left: 6, bottom: 10 }}
              >
                <defs>
                  <linearGradient id='gradCountry' x1='0' y1='0' x2='1' y2='0'>
                    <stop offset='0%' stopColor='#f59e0b' stopOpacity={0.95} />
                    <stop
                      offset='100%'
                      stopColor='#f97316'
                      stopOpacity={0.95}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' strokeOpacity={0.4} />
                <XAxis
                  dataKey='country'
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  height={46}
                  tick={{ fontSize: 10 }} // Smaller font for country names
                />
                <YAxis
                  tickFormatter={formatNumber}
                  width={44}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 8 }} iconType='circle' />
                <Line
                  type='monotone'
                  dataKey='value'
                  name='Users'
                  stroke='url(#gradCountry)'
                  strokeWidth={1.5}
                  dot={{ r: 2.5 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </>
  );
}
