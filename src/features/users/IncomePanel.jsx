'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  openStatementShell,
  renderStatement,
  renderStatementError,
} from '@/features/admin/statement';
import { Button, Input } from '@heroui/react';
import { FileText, RefreshCw, Settings2, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// Subscription income for a chosen period: gross (excl. VAT), processing fees,
// refunds and net, plus a period-by-period breakdown. Backed by
// GET /admin/subscriptions/income. All periods are UTC, matching the backend.
//
// Source follows the page's provider filter, so one control drives the whole
// page. Stripe fees are the exact amounts Stripe reported; Creem fees are
// estimated from the rate set here; manual payments carry no fee.
// ─────────────────────────────────────────────────────────────────────────────

const MODES = [
  { key: 'all', label: 'All time' },
  { key: 'year', label: 'Year' },
  { key: 'month', label: 'Month' },
  { key: 'range', label: 'Date range' },
];

const SOURCES = ['creem', 'stripe', 'manual', 'all'];

const pad = (n) => String(n).padStart(2, '0');
const utcToday = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};
const utcMonth = () => utcToday().slice(0, 7);
const lastDayOfMonth = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return `${ym}-${pad(new Date(Date.UTC(y, m, 0)).getUTCDate())}`;
};

const money = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const providerLabel = (p) =>
  ({ all: 'All sources', stripe: 'Stripe', creem: 'Creem', manual: 'Manual' })[
    p
  ] || p;

// "2026-10" → "Oct 2026", "2026-10-04" → "Oct 4", "2026" → "2026"
function periodLabel(key, short = false) {
  const [y, m, d] = key.split('-').map(Number);
  if (!m) return String(y);
  const date = new Date(Date.UTC(y, m - 1, d || 1));
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    ...(d ? { day: 'numeric' } : { year: short ? '2-digit' : 'numeric' }),
  });
}

function timeAgo(iso) {
  if (!iso) return '';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} days ago`;
}

function SummaryCard({ label, value, sub, strong }) {
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-1 ${
        strong
          ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
          : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
      }`}
    >
      <span
        className={`text-xs font-semibold uppercase tracking-wide ${
          strong ? 'opacity-70' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
      <span className='text-2xl font-bold'>{value}</span>
      {sub && (
        <span className={`text-xs ${strong ? 'opacity-70' : 'text-gray-400'}`}>
          {sub}
        </span>
      )}
    </div>
  );
}

export default function IncomePanel({
  source,
  onSourceChange,
  apiBase,
  authHeaders,
}) {
  const [mode, setMode] = useState('month');
  const [year, setYear] = useState(String(new Date().getUTCFullYear()));
  const [month, setMonth] = useState(utcMonth());
  const [rangeFrom, setRangeFrom] = useState(`${utcMonth()}-01`);
  const [rangeTo, setRangeTo] = useState(utcToday());
  const [allTimeBy, setAllTimeBy] = useState('month'); // month | year

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [buildingStatement, setBuildingStatement] = useState(false);

  const [feeOpen, setFeeOpen] = useState(false);
  const [feePercent, setFeePercent] = useState('');
  const [feeFixed, setFeeFixed] = useState('');
  const [savingFee, setSavingFee] = useState(false);

  // The query the current controls describe.
  const query = useMemo(() => {
    if (mode === 'year') {
      return { from: `${year}-01-01`, to: `${year}-12-31`, groupBy: 'month' };
    }
    if (mode === 'month') {
      return { from: `${month}-01`, to: lastDayOfMonth(month), groupBy: 'day' };
    }
    if (mode === 'range') {
      const days =
        rangeFrom && rangeTo
          ? (Date.parse(rangeTo) - Date.parse(rangeFrom)) / 86400000
          : Infinity;
      return {
        from: rangeFrom,
        to: rangeTo,
        groupBy: days <= 62 ? 'day' : 'month',
      };
    }
    return { from: '', to: '', groupBy: allTimeBy };
  }, [mode, year, month, rangeFrom, rangeTo, allTimeBy]);

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setLoading(true);
      try {
        const url = new URL(`${apiBase()}/admin/subscriptions/income`);
        if (query.from) url.searchParams.set('from', query.from);
        if (query.to) url.searchParams.set('to', query.to);
        url.searchParams.set('groupBy', query.groupBy);
        url.searchParams.set('gateway', source || 'all');
        const res = await fetch(url.toString(), { headers: authHeaders() });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.message || 'Failed to load income');
        setData(result.data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load income');
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [apiBase, authHeaders, query, source],
  );

  useEffect(() => {
    load();
  }, [load]);

  // While the backend is importing payments, refresh quietly until it's done.
  const syncRunning = !!data?.sync?.running;
  useEffect(() => {
    if (!syncRunning) return undefined;
    const t = setInterval(() => load({ quiet: true }), 5000);
    return () => clearInterval(t);
  }, [syncRunning, load]);

  const startSync = async (full) => {
    setSyncing(true);
    try {
      const url = new URL(`${apiBase()}/admin/subscriptions/income/sync`);
      if (full) url.searchParams.set('full', '1');
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: authHeaders(),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || 'Sync failed to start');
      await load({ quiet: true });
    } catch (err) {
      ErrorToast('Error', err.message || 'Sync failed to start', 4000);
    } finally {
      setSyncing(false);
    }
  };

  const openFee = () => {
    setFeePercent(String(data?.fees?.creemFeePercent ?? 3.9));
    setFeeFixed(((data?.fees?.creemFeeFixedCents ?? 40) / 100).toFixed(2));
    setFeeOpen((v) => !v);
  };

  const saveFee = async () => {
    setSavingFee(true);
    try {
      const res = await fetch(
        `${apiBase()}/admin/subscriptions/income/settings`,
        {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({
            creemFeePercent: Number(feePercent),
            creemFeeFixedCents: Math.round(Number(feeFixed) * 100),
          }),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || 'Failed to save');
      SuccessToast('Saved', 'Creem fee updated', 3000);
      setFeeOpen(false);
      await load({ quiet: true });
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to save', 4000);
    } finally {
      setSavingFee(false);
    }
  };

  const periodText = useMemo(() => {
    if (mode === 'all') return 'All time';
    if (mode === 'year') return year;
    if (mode === 'month') return periodLabel(month);
    return `${rangeFrom || 'Start'} – ${rangeTo || 'Today'}`;
  }, [mode, year, month, rangeFrom, rangeTo]);

  const showStatement = async () => {
    // Open the window inside the click gesture — after an await it is blocked.
    const shell = openStatementShell();
    if (!shell) {
      ErrorToast('Popup blocked', 'Allow popups to view the statement', 4000);
      return;
    }
    setBuildingStatement(true);
    try {
      const url = new URL(`${apiBase()}/admin/subscriptions/statement`);
      if (query.from) url.searchParams.set('startDate', query.from);
      if (query.to) url.searchParams.set('endDate', query.to);
      url.searchParams.set('gateway', source || 'all');
      const res = await fetch(url.toString(), { headers: authHeaders() });
      const result = await res.json();
      if (!res.ok)
        throw new Error(result?.message || 'Failed to build statement');
      const { rows = [], summary = {} } = result?.data || {};
      renderStatement(shell, {
        title: `Subscriptions Statement · ${providerLabel(source || 'all')}`,
        periodLabel: `${periodText} (UTC)`,
        columns: [
          { key: 'date', label: 'Date' },
          { key: 'type', label: 'Type' },
          { key: 'gateway', label: 'Source' },
          { key: 'description', label: 'Description' },
          { key: 'customer', label: 'Customer' },
          { key: 'ref', label: 'Reference' },
          { key: 'amount', label: 'Amount', align: 'right' },
          { key: 'fee', label: 'Fee', align: 'right', format: 'money' },
          { key: 'net', label: 'Net', align: 'right', format: 'money' },
        ],
        rows: rows.map((r) => ({ ...r, gateway: providerLabel(r.gateway) })),
        totals: [
          {
            label: `Gross excl. VAT (${summary.count ?? 0} transactions)`,
            value: money(summary.gross),
          },
          { label: 'Processing fees', value: `−${money(summary.fees)}` },
          { label: 'Refunds', value: `−${money(summary.refunds)}` },
          { label: 'Net income', value: money(summary.net), strong: true },
        ],
      });
    } catch (err) {
      renderStatementError(shell, err.message);
      ErrorToast('Error', err.message || 'Failed to build statement', 4000);
    } finally {
      setBuildingStatement(false);
    }
  };

  const s = data?.summary;
  const periods = data?.periods || [];
  const showSourceColumns = (source || 'all') === 'all';
  const fees = data?.fees;
  const years = useMemo(() => {
    const now = new Date().getUTCFullYear();
    return Array.from({ length: now - 2022 }, (_, i) => String(now - i));
  }, []);
  const chartData = periods.map((p) => ({
    label: periodLabel(p.period, true),
    Gross: p.gross,
    Net: p.net,
  }));

  const selectCls =
    'h-8 rounded-lg border border-gray-200 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-900';

  return (
    <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-5'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Wallet size={18} className='text-gray-700 dark:text-gray-300' />
          <h2 className='text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide'>
            Income
          </h2>
          {/* Same filter as the subscriber table below — changing it here
              changes it there too. */}
          <div className='inline-flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700'>
            {SOURCES.map((g) => (
              <button
                key={g}
                type='button'
                onClick={() => onSourceChange?.(g)}
                className={`rounded-md px-2.5 py-0.5 text-xs ${
                  (source || 'all') === g
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {g === 'all' ? 'All' : providerLabel(g)}
              </button>
            ))}
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2 text-xs text-gray-400'>
          {syncRunning ? (
            <span>Updating from Stripe and Creem…</span>
          ) : data?.sync?.lastSyncAt ? (
            <span>Updated {timeAgo(data.sync.lastSyncAt)}</span>
          ) : null}
          <Button
            size='sm'
            variant='flat'
            isIconOnly
            aria-label='Refresh from Stripe and Creem'
            title='Refresh from Stripe and Creem'
            isLoading={syncing}
            isDisabled={syncRunning}
            onPress={() => startSync(false)}
          >
            {!syncing && <RefreshCw size={14} />}
          </Button>
          <Button
            size='sm'
            variant='flat'
            startContent={<Settings2 size={14} />}
            onPress={openFee}
          >
            Creem fee
          </Button>
          <Button
            size='sm'
            variant='flat'
            isLoading={buildingStatement}
            startContent={!buildingStatement && <FileText size={14} />}
            onPress={showStatement}
          >
            Statement
          </Button>
        </div>
      </div>

      {/* Creem fee setting */}
      {feeOpen && (
        <div className='flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800'>
          <Input
            size='sm'
            type='number'
            label='Creem fee %'
            className='w-32'
            min={0}
            step='0.1'
            value={feePercent}
            onChange={(e) => setFeePercent(e.target.value)}
          />
          <Input
            size='sm'
            type='number'
            label='Plus per payment ($)'
            className='w-40'
            min={0}
            step='0.01'
            value={feeFixed}
            onChange={(e) => setFeeFixed(e.target.value)}
          />
          <Button
            size='sm'
            color='default'
            className='bg-gray-900 text-white dark:bg-white dark:text-gray-900'
            isLoading={savingFee}
            onPress={saveFee}
          >
            Save
          </Button>
          <p className='text-[11px] text-gray-500'>
            Applied to every Creem payment, past and future. Stripe fees come
            from Stripe; manual payments have no fee.
          </p>
        </div>
      )}

      {/* Period controls */}
      <div className='flex flex-wrap items-center gap-2'>
        <div className='inline-flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700'>
          {MODES.map((m) => (
            <button
              key={m.key}
              type='button'
              onClick={() => setMode(m.key)}
              className={`rounded-md px-3 py-1 text-sm ${
                mode === m.key
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {mode === 'year' && (
          <select
            aria-label='Year'
            className={selectCls}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
        {mode === 'month' && (
          <input
            type='month'
            aria-label='Month'
            className={selectCls}
            value={month}
            max={utcMonth()}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
          />
        )}
        {mode === 'range' && (
          <>
            <input
              type='date'
              aria-label='From'
              className={selectCls}
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
            />
            <span className='text-gray-400'>–</span>
            <input
              type='date'
              aria-label='To'
              className={selectCls}
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
            />
          </>
        )}
        {mode === 'all' && (
          <select
            aria-label='Group by'
            className={selectCls}
            value={allTimeBy}
            onChange={(e) => setAllTimeBy(e.target.value)}
          >
            <option value='month'>By month</option>
            <option value='year'>By year</option>
          </select>
        )}
        <span className='text-xs text-gray-400'>Dates in UTC</span>
      </div>

      {error && (
        <p className='rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200'>
          {error}
        </p>
      )}
      {data?.sync?.lastError && (
        <p className='text-xs text-gray-500'>
          Last update had a problem: {data.sync.lastError}
        </p>
      )}
      {data?.sync?.neverSynced && syncRunning && (
        <p className='text-xs text-gray-500'>
          Importing your payment history for the first time. Numbers fill in as
          it runs.
        </p>
      )}

      {/* Summary */}
      <div
        className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${loading ? 'opacity-60' : ''}`}
      >
        <SummaryCard
          label='Gross'
          value={money(s?.gross)}
          sub={`${s?.payments ?? 0} payments · excl. VAT`}
        />
        <SummaryCard
          label='Processing fees'
          value={money(s?.fees)}
          sub={
            fees
              ? `Stripe exact · Creem ${fees.creemFeePercent}% + ${money(fees.creemFeeFixedCents / 100)}`
              : ' '
          }
        />
        <SummaryCard
          label='Refunds'
          value={money(s?.refunds)}
          sub={`${s?.refundCount ?? 0} refunds`}
        />
        <SummaryCard
          label='Net income'
          value={money(s?.net)}
          sub='Gross − fees − refunds'
          strong
        />
      </div>

      {/* Per-source split when looking at everything */}
      {showSourceColumns && data?.byGateway && (
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          {['stripe', 'creem', 'manual'].map((g) => {
            const t = data.byGateway[g];
            return (
              <div
                key={g}
                className='rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800'
              >
                <div className='mb-1 flex items-center justify-between'>
                  <span className='font-semibold'>{providerLabel(g)}</span>
                  <span className='font-bold'>{money(t.net)} net</span>
                </div>
                <div className='flex justify-between text-xs text-gray-500'>
                  <span>Gross {money(t.gross)}</span>
                  <span>Fees {money(t.fees)}</span>
                  <span>Refunds {money(t.refunds)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className='h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeOpacity={0.15} />
              <XAxis dataKey='label' tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) => `$${Math.round(v)}`}
              />
              <Tooltip formatter={(v) => money(v)} cursor={{ fillOpacity: 0.05 }} />
              <Bar dataKey='Gross' fill='#d1d5db' radius={[3, 3, 0, 0]} />
              <Bar dataKey='Net' fill='#111827' radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Period table */}
      <div className='overflow-x-auto'>
        <table className='w-full whitespace-nowrap text-sm'>
          <thead>
            <tr className='border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-400 dark:border-gray-700'>
              <th className='py-2 pr-3 font-semibold'>
                {query.groupBy === 'day'
                  ? 'Day'
                  : query.groupBy === 'year'
                    ? 'Year'
                    : 'Month'}
              </th>
              <th className='py-2 px-3 text-right font-semibold'>Gross</th>
              <th className='py-2 px-3 text-right font-semibold'>Fees</th>
              <th className='py-2 px-3 text-right font-semibold'>Refunds</th>
              <th className='py-2 px-3 text-right font-semibold'>Net</th>
              {showSourceColumns && (
                <>
                  <th className='py-2 px-3 text-right font-semibold'>Stripe net</th>
                  <th className='py-2 px-3 text-right font-semibold'>Creem net</th>
                  <th className='py-2 pl-3 text-right font-semibold'>Manual net</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {periods.length === 0 && (
              <tr>
                <td
                  colSpan={showSourceColumns ? 8 : 5}
                  className='py-6 text-center text-gray-400'
                >
                  {loading || syncRunning ? 'Loading…' : 'No income in this period'}
                </td>
              </tr>
            )}
            {[...periods].reverse().map((p) => (
              <tr
                key={p.period}
                className='border-b border-gray-100 dark:border-gray-800'
              >
                <td className='py-2 pr-3 font-medium'>{periodLabel(p.period)}</td>
                <td className='py-2 px-3 text-right'>{money(p.gross)}</td>
                <td className='py-2 px-3 text-right text-gray-500'>
                  {p.fees ? `−${money(p.fees)}` : money(0)}
                </td>
                <td className='py-2 px-3 text-right text-gray-500'>
                  {p.refunds ? `−${money(p.refunds)}` : money(0)}
                </td>
                <td className='py-2 px-3 text-right font-bold'>{money(p.net)}</td>
                {showSourceColumns && (
                  <>
                    <td className='py-2 px-3 text-right text-gray-500'>
                      {money(p.byGateway.stripe.net)}
                    </td>
                    <td className='py-2 px-3 text-right text-gray-500'>
                      {money(p.byGateway.creem.net)}
                    </td>
                    <td className='py-2 pl-3 text-right text-gray-500'>
                      {money(p.byGateway.manual.net)}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
          {periods.length > 1 && s && (
            <tfoot>
              <tr className='font-bold'>
                <td className='py-2 pr-3'>Total</td>
                <td className='py-2 px-3 text-right'>{money(s.gross)}</td>
                <td className='py-2 px-3 text-right'>−{money(s.fees)}</td>
                <td className='py-2 px-3 text-right'>−{money(s.refunds)}</td>
                <td className='py-2 px-3 text-right'>{money(s.net)}</td>
                {showSourceColumns && (
                  <>
                    <td className='py-2 px-3 text-right'>
                      {money(data.byGateway.stripe.net)}
                    </td>
                    <td className='py-2 px-3 text-right'>
                      {money(data.byGateway.creem.net)}
                    </td>
                    <td className='py-2 pl-3 text-right'>
                      {money(data.byGateway.manual.net)}
                    </td>
                  </>
                )}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Footnotes — only when they apply */}
      <div className='space-y-1 text-[11px] text-gray-400'>
        <p>
          Subscription payments only. Credit packs are on the Credit Customers
          page; custom orders have their own statement.
        </p>
        {data?.stripeFeesUnknown > 0 && (
          <p>
            {data.stripeFeesUnknown} Stripe payment(s) don&apos;t have their fee
            yet; it is filled in on the next update.
          </p>
        )}
        {data?.otherCurrencies?.length > 0 && (
          <p>
            Not included above (paid in other currencies):{' '}
            {data.otherCurrencies
              .map(
                (c) =>
                  `${c.currency} ${Number(c.net).toFixed(2)} net from ${c.payments} payment(s)`,
              )
              .join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
}
