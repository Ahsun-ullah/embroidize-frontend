'use client';
import { Button, Spinner } from '@heroui/react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import TrackingSettings from './TrackingSettings';
import { useEffect, useState } from 'react';

const RANGES = [7, 30, 90, 180];

const pct = (part, whole) =>
  whole ? `${Math.round((part / whole) * 1000) / 10}%` : '—';

// Users page links that open each step's people, with the matching filters.
const usersLink = (params) => `/admin/users?${new URLSearchParams(params).toString()}`;

function Stat({ label, value, hint, href }) {
  const body = (
    <div className='rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-400'>
      <div className='text-xs font-medium text-gray-500'>{label}</div>
      <div className='mt-1 text-2xl font-bold text-gray-900'>{value}</div>
      {hint && <div className='mt-1 text-xs text-gray-500'>{hint}</div>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

/**
 * Admin overview of tracked behaviour: the subscription funnel (distinct
 * users per step), which buttons start checkouts, buying signals, and designs
 * that are viewed far more than they are downloaded.
 */
export default function TrackingOverview() {
  const [days, setDays] = useState(30);
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState((s) => ({ ...s, loading: true, error: '' }));
      try {
        const token = Cookies.get('token');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/tracking/overview?days=${days}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Could not load tracking data.');
        if (!cancelled) setState({ loading: false, error: '', data: json.data });
      } catch (err) {
        if (!cancelled)
          setState({ loading: false, error: err.message || 'Could not load tracking data.', data: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days, reload]);

  const d = state.data;
  const funnel = d?.funnel || [];
  const first = funnel[0]?.users || 0;
  const w = String(days);

  return (
    <div className='mx-6 flex flex-col gap-6 pb-10'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold'>User tracking</h1>
          <p className='text-sm text-gray-500'>
            Signed-in users only, from the day tracking went live. Click a number to open
            those users on the Users page.
          </p>
        </div>
        <div className='flex gap-2'>
          {RANGES.map((r) => (
            <Button
              key={r}
              size='sm'
              variant={r === days ? 'solid' : 'flat'}
              className={r === days ? 'bg-black text-white' : ''}
              onPress={() => setDays(r)}
            >
              {r} days
            </Button>
          ))}
        </div>
      </div>

      <TrackingSettings onBackfillDone={() => setReload((n) => n + 1)} />

      {state.loading && !d && (
        <div className='flex justify-center py-10'>
          <Spinner size='sm' />
        </div>
      )}
      {state.error && <p className='text-sm text-red-600'>{state.error}</p>}

      {d && (
        <>
          <section className='flex flex-col gap-3'>
            <h2 className='text-lg font-semibold'>Subscription funnel</h2>
            <div className='flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4'>
              {funnel.map((step, i) => {
                const prev = i > 0 ? funnel[i - 1].users : null;
                const width = first ? Math.max((step.users / first) * 100, 2) : 2;
                return (
                  <div key={step.step} className='flex flex-col gap-1'>
                    <div className='flex items-baseline justify-between text-sm'>
                      <span className='font-medium text-gray-900'>{step.label}</span>
                      <span className='text-gray-600'>
                        <span className='font-semibold text-gray-900'>{step.users}</span> users
                        {prev !== null && (
                          <span className='ml-2 text-xs text-gray-500'>
                            {pct(step.users, prev)} of previous step
                          </span>
                        )}
                      </span>
                    </div>
                    <div className='h-3 w-full rounded-full bg-gray-100'>
                      <div
                        className='h-3 rounded-full bg-gray-900'
                        style={{ width: `${Math.min(width, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <Stat
              label='Checkout abandoners'
              value={d.abandonedCheckouts}
              hint='Started a subscription checkout, did not pay'
              href={usersLink({ window: w, checkout: 'abandoned' })}
            />
            <Stat
              label='Hit a download limit'
              value={d.signals.limitHitters}
              hint='Users refused by a daily or plan limit'
              href={usersLink({ window: w, limitHitsMin: '1' })}
            />
            <Stat
              label='Tried a premium design'
              value={d.signals.premiumBlocked}
              hint='Free users refused a premium download'
              href={usersLink({ plan: 'free', window: w, premiumMin: '1' })}
            />
          </section>

          <section className='flex flex-col gap-3'>
            <h2 className='text-lg font-semibold'>Which buttons start checkouts</h2>
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white'>
              <table className='w-full min-w-[480px] text-sm'>
                <thead className='bg-gray-50 text-left text-xs uppercase text-gray-500'>
                  <tr>
                    <th className='px-4 py-2'>Source</th>
                    <th className='px-4 py-2 text-right'>Plan clicks</th>
                    <th className='px-4 py-2 text-right'>Checkouts started</th>
                    <th className='px-4 py-2 text-right'>Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {d.sources.length === 0 && (
                    <tr>
                      <td className='px-4 py-3 text-gray-500' colSpan={4}>
                        No checkouts in this period yet.
                      </td>
                    </tr>
                  )}
                  {d.sources.map((s) => (
                    <tr key={s.source} className='border-t border-gray-100'>
                      <td className='px-4 py-2 font-medium'>{s.source}</td>
                      <td className='px-4 py-2 text-right'>{s.planClicks}</td>
                      <td className='px-4 py-2 text-right'>{s.checkoutsStarted}</td>
                      <td className='px-4 py-2 text-right'>{s.checkoutsCompleted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className='text-xs text-gray-500'>
              Counts are events, not users. A payment is credited to the button of that
              user&apos;s latest checkout start. Credit packs are included.
            </p>
          </section>

          <section className='flex flex-col gap-3'>
            <h2 className='text-lg font-semibold'>Most viewed designs</h2>
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white'>
              <table className='w-full min-w-[560px] text-sm'>
                <thead className='bg-gray-50 text-left text-xs uppercase text-gray-500'>
                  <tr>
                    <th className='px-4 py-2'>Design</th>
                    <th className='px-4 py-2 text-right'>Views</th>
                    <th className='px-4 py-2 text-right'>Viewers</th>
                    <th className='px-4 py-2 text-right'>Downloads</th>
                    <th className='px-4 py-2 text-right'>Downloads per view</th>
                  </tr>
                </thead>
                <tbody>
                  {d.topViewed.length === 0 && (
                    <tr>
                      <td className='px-4 py-3 text-gray-500' colSpan={5}>
                        No design views tracked in this period yet.
                      </td>
                    </tr>
                  )}
                  {d.topViewed.map((p) => (
                    <tr key={p._id} className='border-t border-gray-100'>
                      <td className='px-4 py-2'>
                        {p.slug ? (
                          <Link
                            href={`/product/${p.slug}`}
                            target='_blank'
                            className='font-medium hover:underline'
                          >
                            {p.name}
                          </Link>
                        ) : (
                          p.name
                        )}
                        <span className='ml-2 text-xs text-gray-400'>
                          {p.isFree ? 'Free' : 'Premium'}
                        </span>
                      </td>
                      <td className='px-4 py-2 text-right'>{p.views}</td>
                      <td className='px-4 py-2 text-right'>{p.viewers}</td>
                      <td className='px-4 py-2 text-right'>{p.downloads}</td>
                      <td
                        className={`px-4 py-2 text-right ${
                          p.views >= 10 && p.conversion < 10 ? 'font-semibold text-amber-700' : ''
                        }`}
                      >
                        {p.conversion}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className='text-xs text-gray-500'>
              Highlighted: 10+ views but under 10% downloads per view. Those designs get attention
              but not downloads, so check their preview, files or tier.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
