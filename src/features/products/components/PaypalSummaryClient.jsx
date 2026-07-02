'use client';

import { getFinanceToken } from '@/lib/financeLock';
import {
  Card,
  CardBody,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { Wallet } from 'lucide-react';
import { useState } from 'react';

// Income reconciliation: shows how much was collected per payment channel
// (the structured `paymentChannel` on each priced order, with a legacy fallback
// to the old admin-notes paypal parsing). Brand rule: grayscale only.
const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

const SPECIAL_LABELS = new Set([
  'Unnamed PayPal',
  'Other / Untagged',
  'Untagged',
]);

function getToken() {
  const row = document.cookie.split('; ').find((r) => r.startsWith('token='));
  return row ? row.split('=').slice(1).join('=') : undefined;
}

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

function authHeaders() {
  const h = {};
  const token = getToken();
  const finance = getFinanceToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (finance) h['x-finance-elevation'] = finance;
  return h;
}

// Local YYYY-MM-DD (avoids UTC off-by-one from toISOString).
const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

// Returns { startDate, endDate } for a preset (both '' = all time).
function presetRange(preset) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  switch (preset) {
    case 'this-month':
      start.setDate(1);
      return { startDate: fmt(start), endDate: fmt(end) };
    case 'last-month': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: fmt(s), endDate: fmt(e) };
    }
    case 'last-30':
      start.setDate(now.getDate() - 29);
      return { startDate: fmt(start), endDate: fmt(end) };
    case 'this-year':
      return { startDate: `${now.getFullYear()}-01-01`, endDate: fmt(end) };
    default:
      return { startDate: '', endDate: '' };
  }
}

const PRESETS = [
  { label: 'This month', value: 'this-month' },
  { label: 'Last month', value: 'last-month' },
  { label: 'Last 30d', value: 'last-30' },
  { label: 'This year', value: 'this-year' },
  { label: 'All', value: 'all' },
];

export function PaypalSummaryClient({ summary }) {
  const [data, setData] = useState(summary || {});
  const [loading, setLoading] = useState(false);
  const [activePreset, setActivePreset] = useState('all');
  const [range, setRange] = useState({ startDate: '', endDate: '' });

  const accounts = data?.accounts || [];
  const grandTotal = data?.grandTotal || 0;
  const orderCount = data?.orderCount || 0;

  const fetchSummary = async (startDate, endDate) => {
    setLoading(true);
    try {
      const url = new URL(`${apiBase()}/admin/orders/custom/paypal-summary`);
      if (startDate) url.searchParams.set('startDate', startDate);
      if (endDate) url.searchParams.set('endDate', endDate);
      const res = await fetch(url.toString(), { headers: authHeaders() });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to load');
      setData(result.data || { accounts: [], grandTotal: 0, orderCount: 0 });
    } catch (err) {
      console.error('Income summary fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setActivePreset(preset);
    const { startDate, endDate } = presetRange(preset);
    setRange({ startDate, endDate });
    fetchSummary(startDate, endDate);
  };

  const onManualDate = (key, val) => {
    setActivePreset('custom');
    const next = { ...range, [key]: val };
    setRange(next);
    fetchSummary(next.startDate, next.endDate);
  };

  return (
    <Card className='border border-gray-200 dark:border-gray-800 shadow-none'>
      <CardBody className='p-4 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900'>
              <Wallet size={16} />
            </div>
            <div>
              <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                Income by channel
              </p>
              <p className='text-xs text-gray-400'>
                {orderCount} priced orders
                {activePreset !== 'all' ? ' · filtered' : ' · all time'}
              </p>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
              {activePreset === 'all' ? 'Grand total' : 'Total in range'}
            </p>
            <p className='text-xl font-bold text-gray-900 dark:text-gray-100'>
              {money(grandTotal)}
            </p>
          </div>
        </div>

        {/* Date filter bar */}
        <div className='flex flex-wrap items-center gap-3 justify-between'>
          <div className='flex flex-wrap gap-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1'>
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type='button'
                onClick={() => applyPreset(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activePreset === p.value
                    ? 'bg-white dark:bg-neutral-600 text-black dark:text-white shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className='flex items-center gap-2'>
            <Input
              type='date'
              size='sm'
              aria-label='Start date'
              className='w-36'
              value={range.startDate}
              onChange={(e) => onManualDate('startDate', e.target.value)}
            />
            <span className='text-gray-400'>-</span>
            <Input
              type='date'
              size='sm'
              aria-label='End date'
              className='w-36'
              value={range.endDate}
              onChange={(e) => onManualDate('endDate', e.target.value)}
            />
            {loading && <Spinner size='sm' />}
          </div>
        </div>

        {accounts.length === 0 ? (
          <p className='text-sm text-gray-400'>
            No priced orders in this range. Add an Estimated Price and a Payment
            Channel to an order to see totals here.
          </p>
        ) : (
          <Table
            aria-label='Income by channel'
            removeWrapper
            className='min-w-full'
          >
            <TableHeader>
              <TableColumn>CHANNEL</TableColumn>
              <TableColumn className='text-center'>ORDERS</TableColumn>
              <TableColumn className='text-right'>TOTAL</TableColumn>
              <TableColumn className='text-right'>SHARE</TableColumn>
            </TableHeader>
            <TableBody>
              {accounts.map((a) => {
                const share = grandTotal
                  ? ((a.total / grandTotal) * 100).toFixed(1)
                  : '0.0';
                const isSpecial = SPECIAL_LABELS.has(a.name);
                return (
                  <TableRow key={a.name}>
                    <TableCell>
                      <span
                        className={
                          isSpecial
                            ? 'text-sm italic text-gray-500'
                            : 'text-sm font-medium capitalize text-gray-900 dark:text-gray-100'
                        }
                      >
                        {a.name}
                      </span>
                    </TableCell>
                    <TableCell className='text-center text-sm text-gray-600 dark:text-gray-300'>
                      {a.orders}
                    </TableCell>
                    <TableCell className='text-right text-sm font-semibold text-gray-900 dark:text-gray-100'>
                      {money(a.total)}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <div className='h-1.5 w-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden'>
                          <div
                            className='h-1.5 bg-gray-700 dark:bg-gray-300'
                            style={{ width: `${share}%` }}
                          />
                        </div>
                        <span className='w-10 text-xs text-gray-400'>
                          {share}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* How it works */}
        <p className='text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3'>
          Totals are grouped by each order&apos;s{' '}
          <span className='font-mono text-gray-500'>Payment Channel</span> (set
          when you price the order). Reuse the same channel name to keep its total
          together. Older orders without a channel fall back to the PayPal name in
          their notes, or show as <span className='italic'>Untagged</span>.
        </p>
      </CardBody>
    </Card>
  );
}
