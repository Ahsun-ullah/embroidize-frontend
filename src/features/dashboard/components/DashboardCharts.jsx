// 'use client';

// import {
//   CartesianGrid,
//   Legend,
//   Line,
//   LineChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from 'recharts';

// export default function DashboardCharts({
//   userData,
//   downloadData,
//   locationData,
// }) {
//   return (
//     <>
//       <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
//         {/* New User Registrations Chart */}
//         <div className='w-full h-96 bg-white p-4 rounded-lg shadow-md'>
//           <h2 className='text-lg font-semibold mb-4'>New User Registrations</h2>
//           <ResponsiveContainer width='100%' height='100%'>
//             <LineChart
//               data={userData}
//               margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
//             >
//               <CartesianGrid strokeDasharray='3 3' />
//               <XAxis dataKey='date' />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line
//                 type='monotone'
//                 dataKey='value'
//                 stroke='#8884d8'
//                 activeDot={{ r: 8 }}
//                 name='New Users'
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Product Downloads Chart */}
//         <div className='w-full h-96 bg-white p-4 rounded-lg shadow-md'>
//           <h2 className='text-lg font-semibold mb-4'>Product Downloads</h2>
//           <ResponsiveContainer width='100%' height='100%'>
//             <LineChart
//               data={downloadData}
//               margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
//             >
//               <CartesianGrid strokeDasharray='3 3' />
//               <XAxis dataKey='date' />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line
//                 type='monotone'
//                 dataKey='value'
//                 stroke='#82ca9d'
//                 activeDot={{ r: 8 }}
//                 name='Downloads'
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//       {/* User Location Distribution */}
//       <div className='w-100 h-96 bg-white p-4 rounded-lg shadow-md mt-8'>
//         <h2 className='text-lg font-semibold mb-4'>Users by Country</h2>
//         <ResponsiveContainer width='100%' height='100%'>
//           <LineChart
//             data={locationData}
//             margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
//           >
//             <CartesianGrid strokeDasharray='3 3' />
//             <XAxis dataKey='country' />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Line
//               type='monotone'
//               dataKey='value'
//               stroke='#ff7f50'
//               name='Users'
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </>
//   );
// }
'use client';

import React from 'react';
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

/**
 * Same layout & chart types as provided (3 LineCharts)
 * — just more polished visuals, better UX, and safe defaults.
 */

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

/** Minimal card shell (Tailwind only) */
const ChartCard = ({ title, children }) => (
  <div
    className="w-full h-96 rounded-2xl bg-white shadow-lg shadow-black/5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
    role="region"
    aria-label={title}
  >
    <div className="flex items-center justify-between px-4 pt-4">
      <h2 className="text-base md:text-lg font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">
        {title}
      </h2>
    </div>
    <div className="h-[calc(24rem-3.25rem)] px-2 pb-2">{children}</div>
  </div>
);

/** Subtle tooltip */
const CustomTooltip = ({ active, label, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-black/10 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur dark:bg-neutral-900/95 dark:text-neutral-100">
      {label && <div className="mb-1 font-medium">{label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
          <span className="font-medium">{p.name ?? p.dataKey}:</span>
          <span>{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

/** Graceful empty state */
const EmptyState = ({ message = 'No data available' }) => (
  <div className="flex h-full items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
    {message}
  </div>
);

export default function DashboardCharts({ userData = [], downloadData = [], locationData = [] }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* New User Registrations */}
        <ChartCard title="New User Registrations">
          {userData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userData} margin={{ top: 10, right: 12, left: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradUsers" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                <XAxis
                  dataKey="date"
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
                <Legend wrapperStyle={{ paddingTop: 8 }} iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="New Users"
                  stroke="url(#gradUsers)"
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
        <ChartCard title="Product Downloads">
          {downloadData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={downloadData} margin={{ top: 10, right: 12, left: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradDownloads" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                <XAxis
                  dataKey="date"
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
                <Legend wrapperStyle={{ paddingTop: 8 }} iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Downloads"
                  stroke="url(#gradDownloads)"
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

      {/* Users by Country - keep as LineChart per your original */}
      <div className="mt-8">
        <ChartCard title="Users by Country">
          {locationData.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={locationData} margin={{ top: 10, right: 12, left: 6, bottom: 10 }}>
                <defs>
                  <linearGradient id="gradCountry" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.95} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                <XAxis
                  dataKey="country"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  height={46}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  width={44}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 8 }} iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Users"
                  stroke="url(#gradCountry)"
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
