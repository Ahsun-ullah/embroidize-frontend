'use client';

import { Crown, Gift, HardDriveDownload, Ticket, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// How each stored tier is spoken about in the admin UI. 'legacy' is deliberately
// visible rather than folded into a real tier: those rows were recorded before
// downloads carried tier information, and there is no honest way to place them
// (see src/scripts/backfillDownloadTiers.ts in the backend).
const USER_TIER_LABELS = {
  subscription: 'Subscribers',
  subscription_est: 'Subscribers (est.)',
  credit: 'Credit packs',
  free: 'Free tier',
  free_est: 'Free tier (est.)',
  admin: 'Admin (staff)',
  legacy: 'Before tracking',
};

// The _est tiers were inferred from subscription dates after the fact, not
// recorded as the download happened. They are shown as their own rows so an
// estimate is never mistaken for a measurement, and paired with their real twin
// in the headline figures so the tiles still answer "how many in total".
const ESTIMATED_TIERS = new Set(['subscription_est', 'free_est']);
const TIER_TWINS = {
  subscription: ['subscription', 'subscription_est'],
  free: ['free', 'free_est'],
};

const PRODUCT_TIER_LABELS = {
  premium: 'Premium designs',
  free: 'Free designs',
  legacy: 'Before tracking',
};

const USER_TIER_ORDER = [
  'subscription',
  'subscription_est',
  'credit',
  'free',
  'free_est',
  'admin',
  'legacy',
];
const PRODUCT_TIER_ORDER = ['premium', 'free', 'legacy'];

const pct = (part, whole) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : '0%';

export default function DownloadBreakdownPanel({ breakdown }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeUserTier = searchParams.get('userTier') || '';
  const activeProductTier = searchParams.get('productTier') || '';

  const totals = breakdown?.totals || {
    downloads: 0,
    uniqueUsers: 0,
    uniqueProducts: 0,
  };
  const byUserTier = breakdown?.byUserTier || [];
  const byProductTier = breakdown?.byProductTier || [];
  const matrix = breakdown?.matrix || [];

  const userTierRow = (tier) => byUserTier.find((r) => r.tier === tier) || {};

  // A headline figure covers a tier AND its estimated twin, so "By subscribers"
  // is the whole answer rather than only the part recorded since stamping began.
  const tierGroup = (tier) => {
    const members = TIER_TWINS[tier] || [tier];
    const downloads = members.reduce(
      (sum, t) => sum + (userTierRow(t).downloads || 0),
      0,
    );
    const users = members.reduce(
      (sum, t) => sum + (userTierRow(t).uniqueUsers || 0),
      0,
    );
    const estimated = members
      .filter((t) => ESTIMATED_TIERS.has(t))
      .reduce((sum, t) => sum + (userTierRow(t).downloads || 0), 0);
    return { downloads, users, estimated, param: members.join(',') };
  };
  const productTierRow = (tier) =>
    byProductTier.find((r) => r.tier === tier) || {};
  const cell = (userTier, productTier) =>
    matrix.find(
      (m) => m.userTier === userTier && m.productTier === productTier,
    )?.downloads || 0;

  // Every tier control writes to the same URL params the table below reads, so
  // one click narrows the cards and the product grid together.
  const setFilters = (next) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `?${qs}` : window.location.pathname);
  };

  // Clicking the tier you are already filtered to clears it — the tile doubles
  // as the "off" switch, so there is no dead-end state.
  const toggleUserTier = (tier) =>
    setFilters({ userTier: activeUserTier === tier ? '' : tier });
  // Headline figures filter to the whole group they totalled (real + estimated).
  const toggleUserTierGroup = (tier) => {
    const { param } = tierGroup(tier);
    setFilters({ userTier: activeUserTier === param ? '' : param });
  };
  const toggleProductTier = (tier) =>
    setFilters({ productTier: activeProductTier === tier ? '' : tier });
  const toggleCell = (userTier, productTier) =>
    setFilters(
      activeUserTier === userTier && activeProductTier === productTier
        ? { userTier: '', productTier: '' }
        : { userTier, productTier },
    );

  const hasTierFilter = !!(activeUserTier || activeProductTier);

  // Tiers with nothing in them are hidden rather than shown as zero rows: admin
  // and legacy are usually empty and would otherwise crowd out the real answer.
  const visibleUserTiers = USER_TIER_ORDER.filter(
    (t) => (userTierRow(t).downloads || 0) > 0 || activeUserTier === t,
  );
  const visibleProductTiers = PRODUCT_TIER_ORDER.filter(
    (t) => (productTierRow(t).downloads || 0) > 0 || activeProductTier === t,
  );

  const tiles = [
    {
      key: 'total',
      label: 'Total downloads',
      value: totals.downloads,
      sub: `${totals.uniqueUsers} users · ${totals.uniqueProducts} designs`,
      icon: HardDriveDownload,
      onClick: hasTierFilter ? () => setFilters({ userTier: '', productTier: '' }) : null,
      active: !hasTierFilter,
    },
{
      key: 'subscription',
      label: 'By subscribers',
      value: tierGroup('subscription').downloads,
      sub: `${pct(tierGroup('subscription').downloads, totals.downloads)} · ${
        tierGroup('subscription').users
      } subscribers${
        tierGroup('subscription').estimated
          ? ` · ${tierGroup('subscription').estimated.toLocaleString()} est.`
          : ''
      }`,
      icon: Crown,
      onClick: () => toggleUserTierGroup('subscription'),
      active: activeUserTier === tierGroup('subscription').param,
    },
    {
      key: 'free',
      label: 'By free users',
      value: tierGroup('free').downloads,
      sub: `${pct(tierGroup('free').downloads, totals.downloads)} · ${
        tierGroup('free').users
      } users${
        tierGroup('free').estimated
          ? ` · ${tierGroup('free').estimated.toLocaleString()} est.`
          : ''
      }`,
      icon: Users,
      onClick: () => toggleUserTierGroup('free'),
      active: activeUserTier === tierGroup('free').param,
    },
    {
      key: 'credit',
      label: 'By credits',
      value: userTierRow('credit').downloads || 0,
      sub: `${pct(userTierRow('credit').downloads || 0, totals.downloads)} · ${
        userTierRow('credit').uniqueUsers || 0
      } users`,
      icon: Ticket,
      onClick: () => toggleUserTier('credit'),
      active: activeUserTier === 'credit',
    },
    {
      key: 'premium',
      label: 'Premium files',
      value: productTierRow('premium').downloads || 0,
      sub: `${pct(productTierRow('premium').downloads || 0, totals.downloads)} · ${
        productTierRow('premium').uniqueProducts || 0
      } designs`,
      icon: Crown,
      onClick: () => toggleProductTier('premium'),
      active: activeProductTier === 'premium',
    },
    {
      key: 'freeFiles',
      label: 'Free files',
      value: productTierRow('free').downloads || 0,
      sub: `${pct(productTierRow('free').downloads || 0, totals.downloads)} · ${
        productTierRow('free').uniqueProducts || 0
      } designs`,
      icon: Gift,
      onClick: () => toggleProductTier('free'),
      active: activeProductTier === 'free',
    },
  ];

  const hasEstimated = [...ESTIMATED_TIERS].some(
    (t) => (userTierRow(t).downloads || 0) > 0,
  );
  const legacyUsers = userTierRow('legacy').downloads || 0;
  const legacyProducts = productTierRow('legacy').downloads || 0;

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6'>
      <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
        <div>
          <h2 className='text-lg font-bold'>Download breakdown</h2>
          <p className='text-xs text-gray-500 mt-0.5'>
            Who downloaded, and what kind of design they took. Click any figure
            to filter the designs below.
          </p>
        </div>

        {hasTierFilter && (
          <button
            onClick={() => setFilters({ userTier: '', productTier: '' })}
            className='text-xs font-semibold text-gray-600 hover:text-black border border-gray-300 rounded-md px-3 py-1.5'
          >
            Clear tier filter
            {activeUserTier ? ` · ${USER_TIER_LABELS[activeUserTier]}` : ''}
            {activeProductTier
              ? ` · ${PRODUCT_TIER_LABELS[activeProductTier]}`
              : ''}
          </button>
        )}
      </div>

      {/* Headline figures */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
        {tiles.map(({ key, label, value, sub, icon: Icon, onClick, active }) => (
          <button
            key={key}
            type='button'
            onClick={onClick || undefined}
            disabled={!onClick}
            className={`text-left rounded-lg border p-3 transition-all ${
              active
                ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                : 'border-gray-200 bg-gray-50 hover:border-gray-400'
            } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className='flex items-center gap-1.5 mb-1'>
              <Icon
                size={13}
                className={active ? 'text-gray-300' : 'text-gray-400'}
              />
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  active ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
            <div className='text-2xl font-bold leading-none'>
              {(value || 0).toLocaleString()}
            </div>
            <div
              className={`text-[11px] mt-1 ${
                active ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {sub}
            </div>
          </button>
        ))}
      </div>

      {/* Cross-tab: the two questions answered together, because "free-tier user
          took a premium design" (only possible via credits) is its own answer. */}
      {totals.downloads > 0 && (
        <div className='mt-5 overflow-x-auto'>
          <table className='w-full text-sm border-collapse'>
            <thead>
              <tr className='text-left'>
                <th className='py-2 pr-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500'>
                  Downloader
                </th>
                {visibleProductTiers.map((pt) => (
                  <th
                    key={pt}
                    className='py-2 px-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500'
                  >
                    {PRODUCT_TIER_LABELS[pt]}
                  </th>
                ))}
                <th className='py-2 pl-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500'>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleUserTiers.map((ut) => (
                <tr key={ut} className='border-t border-gray-100'>
                  <td className='py-2 pr-3 font-medium'>
                    <button
                      type='button'
                      onClick={() => toggleUserTier(ut)}
                      className={`hover:underline ${
                        activeUserTier === ut ? 'font-bold' : ''
                      } ${ESTIMATED_TIERS.has(ut) ? 'italic text-gray-600' : ''}`}
                      title={
                        ESTIMATED_TIERS.has(ut)
                          ? 'Inferred from subscription dates after the fact, not recorded at download time'
                          : undefined
                      }
                    >
                      {USER_TIER_LABELS[ut]}
                    </button>
                    <span className='text-gray-400 font-normal ml-1.5 text-xs'>
                      {userTierRow(ut).uniqueUsers || 0} users
                    </span>
                  </td>
                  {visibleProductTiers.map((pt) => {
                    const value = cell(ut, pt);
                    const isActive =
                      activeUserTier === ut && activeProductTier === pt;
                    return (
                      <td key={pt} className='py-2 px-3 text-right tabular-nums'>
                        <button
                          type='button'
                          onClick={() => toggleCell(ut, pt)}
                          className={`px-2 py-0.5 rounded ${
                            isActive
                              ? 'bg-gray-900 text-white font-bold'
                              : 'hover:bg-gray-100'
                          } ${value === 0 ? 'text-gray-300' : ''}`}
                        >
                          {value.toLocaleString()}
                        </button>
                      </td>
                    );
                  })}
                  <td className='py-2 pl-3 text-right font-bold tabular-nums'>
                    {(userTierRow(ut).downloads || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className='border-t-2 border-gray-200'>
                <td className='py-2 pr-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500'>
                  Total
                </td>
                {visibleProductTiers.map((pt) => (
                  <td
                    key={pt}
                    className='py-2 px-3 text-right font-bold tabular-nums'
                  >
                    {(productTierRow(pt).downloads || 0).toLocaleString()}
                  </td>
                ))}
                <td className='py-2 pl-3 text-right font-bold tabular-nums'>
                  {(totals.downloads || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {hasEstimated && (
        <p className='mt-3 text-[11px] text-gray-500 leading-relaxed'>
          <span className='font-semibold'>(est.) rows are inferred,</span> not
          measured: those downloads predate tier tracking, so each was matched
          against whether the downloader held a subscription covering that date.
          It is wrong for anyone who lapsed and resubscribed, and blind to
          anything before the oldest surviving subscription record. Rows stamped
          as they happened carry no “(est.)”.
        </p>
      )}

      {(legacyUsers > 0 || legacyProducts > 0) && (
        <p className='mt-3 text-[11px] text-gray-500 leading-relaxed'>
          <span className='font-semibold'>Before tracking:</span> downloads
          recorded before this breakdown existed did not store who took them.
          {legacyUsers > 0
            ? ` ${legacyUsers.toLocaleString()} download(s) have no downloader tier`
            : ''}
          {legacyUsers > 0 && legacyProducts > 0 ? ' and' : ''}
          {legacyProducts > 0
            ? ` ${legacyProducts.toLocaleString()} have no design tier`
            : ''}
          . They are shown separately rather than guessed into a bucket. Narrow
          the date range to a period after tracking started for a clean split.
        </p>
      )}

      {totals.downloads === 0 && (
        <p className='mt-4 text-sm text-gray-400'>
          No downloads recorded in this date range.
        </p>
      )}
    </div>
  );
}
