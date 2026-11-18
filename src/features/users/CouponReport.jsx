'use client';

import {
  Button,
  Chip,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const usd = (n) => `$${(Number(n) || 0).toFixed(2)}`;
const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

function Stat({ label, value, hint }) {
  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4' title={hint}>
      <p className='text-xs uppercase tracking-wide text-gray-500'>{label}</p>
      <p className='mt-1 text-xl font-bold text-gray-900'>{value}</p>
    </div>
  );
}

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Coupons & Offers — what each campaign actually brought in, from the amounts
 * Creem charged (never from plan prices).
 */
export default function CouponReport({ report, from, to }) {
  const router = useRouter();
  const [range, setRange] = useState({ from: from || '', to: to || '' });
  const [selected, setSelected] = useState('all');

  const groups = useMemo(() => report?.groups || [], [report]);
  const buyers = useMemo(
    () =>
      (report?.buyers || []).filter((b) => selected === 'all' || b.group === selected),
    [report, selected],
  );
  const current =
    selected === 'all' ? report?.overall : groups.find((g) => g.key === selected);

  const applyRange = (next) => {
    const qs = new URLSearchParams();
    if (next.from) qs.set('from', next.from);
    if (next.to) qs.set('to', next.to);
    router.push(`/admin/coupons${qs.toString() ? `?${qs}` : ''}`);
  };

  const exportCsv = () => {
    const header = [
      'Purchased', 'Name', 'Email', 'Country', 'Plan', 'Billing', 'Coupon', 'Coupon name',
      'Coupon type', 'Coupon duration', 'Currency', 'List price', 'Discount', 'Tax', 'Paid',
      'Refunded', 'Est. Creem fee', 'Net', 'Still subscribed', 'Creem order', 'Creem transaction',
    ];
    const rows = buyers.map((b) => [
      day(b.purchasedAt), b.name, b.email, b.country, b.planName, b.billingInterval,
      b.couponCode || '', b.couponName || '', b.couponType || '', b.couponDuration || '',
      b.currency, b.list, b.discount, b.tax, b.paid, b.refunded, b.fee, b.net,
      b.stillActive ? 'yes' : 'no', b.creemOrderId || '', b.creemTransactionId || '',
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `coupons-${selected === 'all' ? 'all' : selected.replace(/[^a-z0-9]+/gi, '-')}-${day(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!report) {
    return (
      <div className='rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600'>
        The report could not be loaded. Try again in a moment.
      </div>
    );
  }

  return (
    <div className='space-y-5'>
      <div className='flex flex-wrap items-end justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4'>
        <div>
          <h1 className='text-xl font-bold text-gray-900'>Coupons &amp; Offers</h1>
          <p className='mt-1 max-w-2xl text-xs text-gray-500'>
            First payments made with a coupon or an offer, using the amounts Creem
            actually charged. Net = paid − tax − refunds − estimated Creem fee (
            {report.fee?.percent}% + {usd((report.fee?.fixedCents || 0) / 100)}). Renewals
            are ordinary income and are not counted here. Refunds update after an income
            sync (opening Subscribers → Income runs one).
            {report.trackedSince &&
              ` Earliest purchase on record: ${day(report.trackedSince)}.`}
          </p>
        </div>
        <div className='flex flex-wrap items-end gap-2'>
          <Input
            type='date'
            size='sm'
            label='From'
            labelPlacement='outside'
            value={range.from}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            className='w-40'
          />
          <Input
            type='date'
            size='sm'
            label='To'
            labelPlacement='outside'
            value={range.to}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            className='w-40'
          />
          <Button size='sm' className='bg-black text-white' onPress={() => applyRange(range)}>
            Apply
          </Button>
          {(from || to) && (
            <Button
              size='sm'
              variant='flat'
              onPress={() => {
                setRange({ from: '', to: '' });
                applyRange({});
              }}
            >
              All time
            </Button>
          )}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className='rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600'>
          No coupon or offer purchases are recorded{from || to ? ' in this range' : ''} yet.
          Purchases made before coupon tracking existed (e.g. the Halloween coupon)
          appear after <code>scripts/backfillSubscriptionPurchases.ts --yes</code> has
          been run on the server.
        </div>
      ) : (
        <>
          <div className='flex flex-wrap gap-2'>
            <Button
              size='sm'
              radius='full'
              variant={selected === 'all' ? 'solid' : 'bordered'}
              className={selected === 'all' ? 'bg-black text-white' : ''}
              onPress={() => setSelected('all')}
            >
              All campaigns
            </Button>
            {groups.map((g) => (
              <Button
                key={g.key}
                size='sm'
                radius='full'
                variant={selected === g.key ? 'solid' : 'bordered'}
                className={selected === g.key ? 'bg-black text-white' : ''}
                onPress={() => setSelected(g.key)}
              >
                {g.kind === 'offer' ? 'Offer · ' : ''}
                {g.label} ({g.purchases})
              </Button>
            ))}
          </div>

          {current && (
            <div className='grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8'>
              <Stat label='Buyers' value={current.buyers} />
              <Stat label='Still subscribed' value={current.stillActive} hint='Still has access through the subscription they bought with the coupon' />
              <Stat label='List price' value={usd(current.list)} hint='What these purchases would have cost without the coupon (excl. tax)' />
              <Stat label='Discount given' value={usd(current.discount)} />
              <Stat label='Paid' value={usd(current.paid)} hint='Charged to customers, tax included' />
              <Stat label='Tax' value={usd(current.tax)} hint='Collected and remitted by Creem (merchant of record) — not your income' />
              <Stat label={`Refunded (${current.refundedCount})`} value={usd(current.refunded)} />
              <Stat label='Net to you' value={usd(current.net)} hint='Paid − tax − refunds − estimated Creem fee' />
            </div>
          )}

          <div className='flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              {buyers.length} purchase{buyers.length === 1 ? '' : 's'}
            </p>
            <Button size='sm' variant='flat' startContent={<Download size={14} />} onPress={exportCsv}>
              Export CSV
            </Button>
          </div>

          <Table aria-label='Coupon purchases' removeWrapper className='rounded-xl border border-gray-200 bg-white'>
            <TableHeader>
              <TableColumn>DATE</TableColumn>
              <TableColumn>CUSTOMER</TableColumn>
              <TableColumn>PLAN</TableColumn>
              <TableColumn>COUPON / OFFER</TableColumn>
              <TableColumn className='text-right'>LIST</TableColumn>
              <TableColumn className='text-right'>DISCOUNT</TableColumn>
              <TableColumn className='text-right'>PAID</TableColumn>
              <TableColumn className='text-right'>REFUNDED</TableColumn>
              <TableColumn className='text-right'>NET</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody items={buyers}>
              {(b) => (
                <TableRow key={`${b.creemOrderId || ''}-${b.userId}-${b.purchasedAt}`}>
                  <TableCell className='whitespace-nowrap text-sm'>{day(b.purchasedAt)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/users?search=${encodeURIComponent(b.email)}`}
                      className='text-sm font-medium hover:underline'
                    >
                      {b.name || b.email}
                    </Link>
                    <p className='text-xs text-gray-500'>{b.email}</p>
                  </TableCell>
                  <TableCell className='text-sm'>
                    {b.planName || '—'}
                    {b.billingInterval && (
                      <span className='text-xs text-gray-500'> · {b.billingInterval}ly</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {b.couponCode ? (
                      <span className='rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs'>{b.couponCode}</span>
                    ) : (
                      <span className='text-xs text-gray-500'>code not reported</span>
                    )}
                    {b.couponDuration && b.couponDuration !== 'once' && (
                      <p className='text-xs text-gray-500'>applies {b.couponDuration}</p>
                    )}
                  </TableCell>
                  <TableCell className='text-right font-mono text-sm'>{usd(b.list)}</TableCell>
                  <TableCell className='text-right font-mono text-sm'>−{usd(b.discount)}</TableCell>
                  <TableCell className='text-right font-mono text-sm'>{usd(b.paid)}</TableCell>
                  <TableCell className='text-right font-mono text-sm'>{b.refunded > 0 ? usd(b.refunded) : '—'}</TableCell>
                  <TableCell className='text-right font-mono text-sm font-semibold'>{usd(b.net)}</TableCell>
                  <TableCell>
                    <Chip size='sm' variant='flat'>
                      {b.refunded >= b.paid && b.paid > 0
                        ? 'Refunded'
                        : b.stillActive
                          ? 'Subscribed'
                          : 'Ended'}
                    </Chip>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
