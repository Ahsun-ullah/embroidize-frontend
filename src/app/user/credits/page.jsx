'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { openInvoice } from '@/features/admin/invoice';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';


const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

const money = (cents, currency = 'USD') => {
  const v = (Number(cents) || 0) / 100;
  return currency === 'USD' ? `$${v.toFixed(2)}` : `${currency} ${v.toFixed(2)}`;
};

const apiBase = () => process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export default function MyCreditsPage() {
  const [data, setData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async (nextPage) => {
    const token = Cookies.get('token');
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [creditRes, invoiceRes] = await Promise.all([
        fetch(`${apiBase()}/me/credits?page=${nextPage}&limit=25`, { headers }),
        fetch(`${apiBase()}/me/invoices`, { headers }),
      ]);
      const creditJson = await creditRes.json();
      if (!creditRes.ok) {
        throw new Error(creditJson?.error?.message || 'Could not load your credits');
      }
      setData(creditJson?.data || null);

      // Receipts are a nice-to-have next to the balance: a failure here must
      // not blank out the page that tells them what they can still download.
      if (invoiceRes.ok) {
        const invoiceJson = await invoiceRes.json();
        setInvoices(invoiceJson?.data?.invoices || []);
        setCustomer(invoiceJson?.data?.customer || null);
      }
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load your credits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const printReceipt = (invoice) => {
    const ok = openInvoice({ invoice, customer: customer || {} });
    if (!ok) {
      ErrorToast(
        'Pop-up blocked',
        'Allow pop-ups for this site to open your receipt.',
        5000,
      );
    }
  };

  if (loading && !data) {
    return (
      <div className='mx-auto max-w-5xl px-6 py-10'>
        <p className='text-sm text-gray-500'>Loading your credits…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className='mx-auto max-w-5xl px-6 py-10'>
        <div className='rounded-2xl bg-white p-4 shadow-sm sm:p-6'>
          <p className='text-sm font-semibold text-gray-900'>{error}</p>
          <button
            onClick={() => load(page)}
            className='mt-4 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white'
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const balance = data?.balance ?? 0;
  const expired = data?.creditsExpired;
  const expiresAt = data?.creditsExpireAt;
  const totals = data?.totals || {};
  const purchases = data?.purchases || [];
  const events = data?.events || [];
  const spends = data?.spends || [];
  const spendMeta = data?.spendMeta || {};
  const neverHadCredits = !purchases.length && !events.length && balance === 0;

  return (
    <div className='container space-y-6 px-4 py-8 sm:px-6'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>My download credits</h1>
          <p className='mt-1 text-sm text-gray-500'>
            One credit takes one premium design. Free designs never use a credit.
          </p>
        </div>
        <Link
          href='/user/my-plan'
          className='text-sm text-gray-600 underline underline-offset-4 hover:text-black'
        >
          Back to my plan
        </Link>
      </div>

      {neverHadCredits ? (
        <div className='rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8'>
          <p className='text-lg font-bold text-gray-900'>
            You don&apos;t have any credits yet
          </p>
          <p className='mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-600'>
            Credits are prepaid downloads — a way to get premium designs without
            a subscription. Tell us how many you need and we&apos;ll send you
            payment details.
          </p>
          <Link
            href='/subscriptions?pay=credits'
            className='mt-5 inline-block rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-900'
          >
            Ask about credits
          </Link>
        </div>
      ) : (
        <>
          {/* ── Balance ── */}
          <div className='rounded-2xl bg-white p-4 shadow-sm sm:p-6'>
            <div className='flex flex-wrap items-start justify-between gap-6'>
              <div>
                <p className='text-xs font-bold uppercase tracking-widest text-gray-500'>
                  Credits left
                </p>
                <p className='mt-2 text-5xl font-extrabold text-gray-900'>
                  {balance}
                </p>
                <p className='mt-2 max-w-md text-sm leading-relaxed text-gray-600'>
                  {expired
                    ? `Your ${data?.rawBalance} credit${data?.rawBalance === 1 ? '' : 's'} expired on ${fmtDate(expiresAt)}. Get in touch — we can extend them for you.`
                    : expiresAt
                      ? `Use them any time before ${fmtDate(expiresAt)}.`
                      : 'These never expire — use them whenever you like.'}
                </p>
              </div>

              <div className='flex w-full flex-col gap-2 sm:w-auto'>
                <Link
                  href='/subscriptions?pay=credits'
                  className='rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold text-white hover:bg-gray-900'
                >
                  Get more credits
                </Link>
                <Link
                  href='/products'
                  className='rounded-xl border border-gray-300 px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50'
                >
                  Browse designs
                </Link>
              </div>
            </div>

            <div className='mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3'>
              {[
                { label: 'Credits added', value: totals.added ?? 0 },
                { label: 'Credits used', value: totals.used ?? 0 },
                { label: 'Left to use', value: balance },
              ].map((t) => (
                <div key={t.label}>
                  <p className='text-xs font-bold uppercase tracking-wide text-gray-500'>
                    {t.label}
                  </p>
                  <p className='mt-1 text-xl font-bold text-gray-900'>{t.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Receipts ── */}
          <div className='rounded-2xl bg-white p-4 shadow-sm sm:p-6'>
            <h2 className='text-lg font-bold text-gray-900'>Payments & receipts</h2>
            <p className='mt-1 text-sm text-gray-500'>
              Every payment you&apos;ve made to us directly. Open a receipt to
              print or save it as a PDF.
            </p>

            {invoices.length === 0 ? (
              <p className='py-8 text-center text-sm text-gray-500'>
                No receipts yet.
              </p>
            ) : (
              <>
              {/* Phone: one card per receipt. The print button is the point of
                  this list, so it must never be behind a sideways scroll. */}
              <ul className='mt-4 space-y-3 md:hidden'>
                {invoices.map((inv) => (
                  <li key={inv.id} className='rounded-xl border border-gray-200 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <p className='text-sm font-semibold text-gray-900'>
                        {inv.description}
                      </p>
                      <p className='shrink-0 text-sm font-bold text-gray-900'>
                        {money(Math.round(inv.amount * 100), inv.currency)}
                      </p>
                    </div>
                    <p className='mt-1 text-xs text-gray-500'>
                      {fmtDate(inv.date)}
                      {inv.manualMethod ? ` · ${inv.manualMethod}` : ''}
                    </p>
                    <p className='mt-0.5 text-xs text-gray-400'>{inv.number}</p>
                    <button
                      onClick={() => printReceipt(inv)}
                      className='mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50'
                    >
                      View / print
                    </button>
                  </li>
                ))}
              </ul>

              <div className='mt-4 hidden overflow-x-auto md:block'>
                <table className='w-full text-left text-sm'>
                  <thead>
                    <tr className='border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500'>
                      <th className='py-3 pr-4 font-bold'>Date</th>
                      <th className='py-3 pr-4 font-bold'>What you bought</th>
                      <th className='py-3 pr-4 font-bold'>Paid</th>
                      <th className='py-3 pr-4 font-bold'>Method</th>
                      <th className='py-3 pr-4 font-bold'>Receipt</th>
                      <th className='py-3 font-bold' />
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className='border-b border-gray-100'>
                        <td className='py-3 pr-4 text-gray-700'>
                          {fmtDate(inv.date)}
                        </td>
                        <td className='py-3 pr-4 font-medium text-gray-900'>
                          {inv.description}
                        </td>
                        <td className='py-3 pr-4 text-gray-700'>
                          {money(Math.round(inv.amount * 100), inv.currency)}
                        </td>
                        <td className='py-3 pr-4 text-gray-500'>
                          {inv.manualMethod || '—'}
                        </td>
                        <td className='py-3 pr-4 text-gray-500'>{inv.number}</td>
                        <td className='py-3 text-right'>
                          <button
                            onClick={() => printReceipt(inv)}
                            className='rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50'
                          >
                            View / print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>

          {/* ── Activity ── */}
          <div className='grid gap-6 lg:grid-cols-2'>
            <div className='rounded-2xl bg-white p-4 shadow-sm sm:p-6'>
              <h2 className='text-lg font-bold text-gray-900'>Credits added</h2>
              {events.length === 0 ? (
                <p className='py-8 text-center text-sm text-gray-500'>
                  Nothing yet.
                </p>
              ) : (
                <ul className='mt-4 divide-y divide-gray-100'>
                  {events.map((e) => (
                    <li key={e._id} className='py-3'>
                      <div className='flex items-baseline justify-between gap-3'>
                        <p className='text-sm font-semibold text-gray-900'>
                          {/* A correction REPLACED the balance rather than
                              adding to it — "+100" would be a lie about what
                              happened to their account. */}
                          {e.corrected
                            ? `Balance set to ${e.balanceAfter}`
                            : `+${e.added} credit${e.added === 1 ? '' : 's'}`}
                        </p>
                        <span className='shrink-0 whitespace-nowrap text-xs text-gray-500'>
                          {e.balanceAfter} total
                        </span>
                      </div>
                      <p className='mt-0.5 text-xs text-gray-500'>{fmtDate(e.at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className='rounded-2xl bg-white p-4 shadow-sm sm:p-6'>
              <div className='flex items-baseline justify-between'>
                <h2 className='text-lg font-bold text-gray-900'>
                  Designs you used credits on
                </h2>
                {spendMeta.total > 0 && (
                  <span className='text-xs text-gray-500'>
                    {spendMeta.total} total
                  </span>
                )}
              </div>

              {spends.length === 0 ? (
                <p className='py-8 text-center text-sm text-gray-500'>
                  You haven&apos;t spent a credit yet.
                </p>
              ) : (
                <>
                  <ul className='mt-4 divide-y divide-gray-100'>
                    {spends.map((s) => (
                      <li key={s._id} className='flex items-center gap-3 py-3'>
                        <div className='min-w-0 flex-1'>
                          {s.product?.slug ? (
                            <Link
                              href={`/product/${s.product.slug}`}
                              className='break-words text-sm font-semibold text-gray-900 hover:underline'
                            >
                              {s.product?.name || 'Design'}
                            </Link>
                          ) : (
                            <p className='break-words text-sm font-semibold text-gray-900'>
                              {s.product?.name || 'Design'}
                            </p>
                          )}
                          <p className='text-xs text-gray-500'>
                            {fmtDate(s.downloadedAt)}
                            {s.fileType ? ` · ${s.fileType.toUpperCase()}` : ''}
                          </p>
                        </div>
                        <span className='shrink-0 whitespace-nowrap text-xs font-semibold text-gray-500'>
                          −1 credit
                        </span>
                      </li>
                    ))}
                  </ul>

                  {spendMeta.totalPages > 1 && (
                    <div className='mt-4 flex items-center justify-between'>
                      <button
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className='rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40'
                      >
                        Previous
                      </button>
                      <span className='text-xs text-gray-500'>
                        Page {spendMeta.page} of {spendMeta.totalPages}
                      </span>
                      <button
                        disabled={page >= spendMeta.totalPages || loading}
                        onClick={() => setPage((p) => p + 1)}
                        className='rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40'
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <p className='pb-4 text-center text-xs text-gray-500'>
            Everything you download stays yours — you can re-download it any
            time from{' '}
            <Link href='/user/user-details' className='underline'>
              your downloads
            </Link>
            , free, even after your credits run out.
          </p>
        </>
      )}
    </div>
  );
}
