'use client';
import { Spinner } from '@heroui/react';
import Cookies from 'js-cookie';
import { SIGNUP_CHANNEL_LABELS } from '@/features/users/BehaviourFilters';
import { useEffect, useState } from 'react';

const pct = (part, whole) => (whole ? `${Math.round((part / whole) * 1000) / 10}%` : '—');

function Table({ head, children, minWidth = 480 }) {
  return (
    <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white'>
      <table className='w-full text-sm' style={{ minWidth }}>
        <thead className='bg-gray-50 text-left text-xs uppercase text-gray-500'>
          <tr>
            {head.map(([label, right]) => (
              <th key={label} className={`px-4 py-2 ${right ? 'text-right' : ''}`}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const Empty = ({ cols, text = 'Nothing in this period yet.' }) => (
  <tr>
    <td className='px-4 py-3 text-gray-500' colSpan={cols}>
      {text}
    </td>
  </tr>
);

function UpgradeCard({ title, hint, s }) {
  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4'>
      <div className='text-xs font-medium text-gray-500'>{title}</div>
      <div className='mt-1 text-2xl font-bold text-gray-900'>{s.users} users</div>
      <div className='mt-2 grid grid-cols-2 gap-2 text-sm'>
        <div>
          <div className='font-semibold'>
            {s.paidWithin24h} <span className='text-xs font-normal text-gray-500'>({pct(s.paidWithin24h, s.users)})</span>
          </div>
          <div className='text-xs text-gray-500'>paid within 24 hours</div>
        </div>
        <div>
          <div className='font-semibold'>
            {s.paidWithin7d} <span className='text-xs font-normal text-gray-500'>({pct(s.paidWithin7d, s.users)})</span>
          </div>
          <div className='text-xs text-gray-500'>paid within 7 days</div>
        </div>
      </div>
      <div className='mt-2 text-xs text-gray-500'>{hint}</div>
    </div>
  );
}

/**
 * Plan per button, time to pay, signup channel → payment and limit → upgrade.
 * GET /admin/tracking/insights.
 */
export default function TrackingInsights({ days }) {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState((s) => ({ ...s, loading: true, error: '' }));
      try {
        const token = Cookies.get('token');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/tracking/insights?days=${days}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Could not load insights.');
        if (!cancelled) setState({ loading: false, error: '', data: json.data });
      } catch (err) {
        if (!cancelled)
          setState({ loading: false, error: err.message || 'Could not load insights.', data: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  const d = state.data;
  if (state.loading && !d)
    return (
      <div className='flex justify-center py-6'>
        <Spinner size='sm' />
      </div>
    );
  if (state.error) return <p className='text-sm text-red-600'>{state.error}</p>;
  if (!d) return null;

  const t = d.timeToPay;
  const later = t.total.paid - (t.total.under1h || 0);

  return (
    <>
      <section className='flex flex-col gap-3'>
        <h2 className='text-lg font-semibold'>Did a refusal lead to an upgrade?</h2>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <UpgradeCard
            title='Hit a download limit'
            hint='Of the users refused by a daily or plan limit, how many paid (any button) soon after.'
            s={d.limitUpgrades.limitHit}
          />
          <UpgradeCard
            title='Refused a premium design'
            hint='Of the free users refused a premium download, how many paid soon after.'
            s={d.limitUpgrades.premiumBlocked}
          />
        </div>
      </section>

      <section className='flex flex-col gap-3'>
        <h2 className='text-lg font-semibold'>How long people take to pay</h2>
        <Table
          head={[['Button'], ['Paid', 1], ...t.buckets.map((b) => [b.label, 1])]}
          minWidth={640}
        >
          {t.bySource.length === 0 && <Empty cols={2 + t.buckets.length} />}
          {t.bySource.map((r) => (
            <tr key={r.source} className='border-t border-gray-100'>
              <td className='px-4 py-2 font-medium'>{r.source}</td>
              <td className='px-4 py-2 text-right'>{r.paid}</td>
              {t.buckets.map((b) => (
                <td key={b.key} className='px-4 py-2 text-right'>
                  {r[b.key]}
                  <span className='ml-1 text-xs text-gray-500'>{pct(r[b.key], r.paid)}</span>
                </td>
              ))}
            </tr>
          ))}
          {t.bySource.length > 0 && (
            <tr className='border-t border-gray-200 bg-gray-50 font-semibold'>
              <td className='px-4 py-2'>All buttons</td>
              <td className='px-4 py-2 text-right'>{t.total.paid}</td>
              {t.buckets.map((b) => (
                <td key={b.key} className='px-4 py-2 text-right'>
                  {t.total[b.key]}
                  <span className='ml-1 text-xs font-normal text-gray-500'>
                    {pct(t.total[b.key], t.total.paid)}
                  </span>
                </td>
              ))}
            </tr>
          )}
        </Table>
        <p className='text-xs text-gray-500'>
          Measured from the first checkout start to the payment. {later} of {t.total.paid}{' '}
          payments ({pct(later, t.total.paid)}) came an hour or more later: people who left the
          checkout and came back. That group is the most any reminder email (Creem&apos;s or
          ours) could have won back; it also includes people who returned on their own.
        </p>
      </section>

      <section className='flex flex-col gap-3'>
        <h2 className='text-lg font-semibold'>Which plan each button sells</h2>
        <Table head={[['Button'], ['Plan'], ['Checkouts started', 1], ['Paid', 1], ['Rate', 1]]}>
          {d.planByButton.length === 0 && <Empty cols={5} />}
          {d.planByButton.map((r) => (
            <tr key={`${r.source}-${r.plan}`} className='border-t border-gray-100'>
              <td className='px-4 py-2 font-medium'>{r.source}</td>
              <td className='px-4 py-2'>{r.plan}</td>
              <td className='px-4 py-2 text-right'>{r.started}</td>
              <td className='px-4 py-2 text-right'>{r.paid}</td>
              <td className='px-4 py-2 text-right'>{pct(r.paid, r.started)}</td>
            </tr>
          ))}
        </Table>
        <p className='text-xs text-gray-500'>Events, not users.</p>
      </section>

      <section className='flex flex-col gap-3'>
        <h2 className='text-lg font-semibold'>Where buyers first came from</h2>
        <Table head={[['Came from'], ['Started checkout', 1], ['Paid', 1], ['Rate', 1]]}>
          {d.signupChannels.length === 0 && <Empty cols={4} />}
          {d.signupChannels.map((c) => (
            <tr key={c.channel} className='border-t border-gray-100'>
              <td className='px-4 py-2 font-medium'>
                {SIGNUP_CHANNEL_LABELS[c.channel] || c.channel}
              </td>
              <td className='px-4 py-2 text-right'>{c.startedUsers}</td>
              <td className='px-4 py-2 text-right'>{c.paidUsers}</td>
              <td className='px-4 py-2 text-right'>{pct(c.paidUsers, c.startedUsers)}</td>
            </tr>
          ))}
        </Table>
        <p className='text-xs text-gray-500'>
          Users who started a checkout or paid in this period, by the channel saved at signup.
          Paid counts any payment, including ones without a start in the period.
        </p>
      </section>
    </>
  );
}
