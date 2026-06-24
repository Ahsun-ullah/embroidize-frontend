'use client';

import {
  Card,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { Wallet } from 'lucide-react';

// Temporary reconciliation tool: shows how much was collected per PayPal
// account, parsed from the `paypal` mention inside each order's admin notes.
// Brand rule: grayscale only — no color accents.
const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

const SPECIAL_LABELS = new Set(['Unnamed PayPal', 'Other / Untagged']);

export function PaypalSummaryClient({ summary }) {
  const accounts = summary?.accounts || [];
  const grandTotal = summary?.grandTotal || 0;
  const orderCount = summary?.orderCount || 0;

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
                PayPal breakdown
              </p>
              <p className='text-xs text-gray-400'>
                {orderCount} priced orders · all statuses
              </p>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
              Grand total
            </p>
            <p className='text-xl font-bold text-gray-900 dark:text-gray-100'>
              {money(grandTotal)}
            </p>
          </div>
        </div>

        {accounts.length === 0 ? (
          <p className='text-sm text-gray-400'>
            No priced orders yet. Add an Estimated Price (and a PayPal name in
            the notes) to see totals here.
          </p>
        ) : (
          <Table
            aria-label='PayPal account totals'
            removeWrapper
            className='min-w-full'
          >
            <TableHeader>
              <TableColumn>PAYPAL ACCOUNT</TableColumn>
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
          Account names are read from each order&apos;s admin notes — the word
          before <span className='font-mono text-gray-500'>paypal</span> (e.g.{' '}
          <span className='font-mono text-gray-500'>saklain paypal</span>), or an
          explicit <span className='font-mono text-gray-500'>paypal: Name</span>.
          Plain <span className='font-mono text-gray-500'>paypal</span> → Unnamed
          PayPal; priced orders with no paypal note → Other / Untagged. Names are
          matched exactly, so fix typos in the notes to merge buckets.
        </p>
      </CardBody>
    </Card>
  );
}
