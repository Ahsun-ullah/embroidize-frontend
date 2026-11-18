'use client';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export const BILLING_OPTIONS = [
  ['', 'Any'],
  ['month', 'Monthly'],
  ['year', 'Yearly'],
  ['week', 'Weekly'],
  ['one_time', 'One-time / lifetime'],
];

export const EXCLUDE_BILLING_OPTIONS = [
  ['', 'Nobody'],
  ['year', 'Current yearly members'],
  ['month', 'Current monthly members'],
  ['week', 'Current weekly members'],
  ['one_time', 'Current one-time / lifetime members'],
];

const INCLUDE_EXCLUDE = [
  ['', 'Only these'],
  ['1', 'Everyone except these'],
];

const labelOf = (options, value) =>
  options.find(([v]) => v === (value || ''))?.[1] || options[0][1];

function Select({ label, value, options, onChange }) {
  return (
    <div className='flex flex-col gap-1.5'>
      <span className='text-xs text-foreground'>{label}</span>
      <Dropdown>
        <DropdownTrigger>
          <Button
            size='sm'
            variant={value ? 'solid' : 'flat'}
            className={`justify-start ${value ? 'bg-black text-white' : ''}`}
          >
            <span className='truncate'>{labelOf(options, value)}</span>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={`${label} filter`}
          selectionMode='single'
          selectedKeys={[value || 'any']}
          onAction={(k) => onChange(k === 'any' ? '' : String(k))}
          className='max-h-80 overflow-y-auto'
        >
          {options.map(([v, l]) => (
            <DropdownItem key={v || 'any'}>{l}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}

// Coupon codes and offers that have actually been used, for the dropdowns.
export function useCampaignOptions() {
  const [options, setOptions] = useState({ coupons: [], offers: [] });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = Cookies.get('token');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/campaigns/options`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setOptions({
            coupons: data?.data?.coupons || [],
            offers: data?.data?.offers || [],
          });
        }
      } catch {
        // Non-fatal: the "any coupon" / "any offer" choices still work.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return options;
}

export function couponOptionList(coupons) {
  return [
    ['', 'Off'],
    ['any', 'Used any coupon'],
    ['none', 'Never used a coupon'],
    ...coupons.map((c) => [c.code, `${c.code}${c.name ? ` — ${c.name}` : ''} (${c.count})`]),
  ];
}

export function offerOptionList(offers) {
  return [['', 'Off'], ['any', 'Bought any offer'], ...offers.map((o) => [o.id, o.name])];
}

/**
 * "Billing & campaigns" block of the admin Users filters. These keys are not
 * touched by the behaviour presets, so exclusions stay put while the admin
 * switches between segments.
 */
export default function CampaignFilters({ filters, pushFilters, options }) {
  const couponOptions = couponOptionList(options.coupons);
  const offerOptions = offerOptionList(options.offers);

  // The usual list for a promo send: keep yearly members, past coupon buyers
  // and offer buyers out of it.
  const applyStandardExclusions = () =>
    pushFilters({
      excludeBilling: 'year',
      coupon: 'any',
      couponExclude: '1',
      offer: 'any',
      offerExclude: '1',
    });

  return (
    <div className='flex flex-col gap-3 rounded-xl border border-gray-200 p-3'>
      <div className='flex flex-wrap items-start justify-between gap-2'>
        <div className='flex flex-col gap-1'>
          <span className='text-sm font-semibold text-gray-900'>Billing &amp; campaigns</span>
          <span className='text-xs text-gray-500'>
            Coupons and offers count every purchase ever made with them. Purchases
            from before coupon tracking existed appear once the backfill has run.{' '}
            <Link href='/admin/coupons' className='underline'>
              Coupons &amp; Offers report
            </Link>
          </span>
        </div>
        <Button size='sm' variant='bordered' onPress={applyStandardExclusions}>
          Exclude yearly, coupon &amp; offer buyers
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7'>
        <Select
          label='Current billing'
          value={filters.billing}
          options={BILLING_OPTIONS}
          onChange={(v) => pushFilters({ billing: v })}
        />
        <Select
          label='Exclude'
          value={filters.excludeBilling}
          options={EXCLUDE_BILLING_OPTIONS}
          onChange={(v) => pushFilters({ excludeBilling: v })}
        />
        <Select
          label='Coupon'
          value={filters.coupon}
          options={couponOptions}
          onChange={(v) => pushFilters({ coupon: v, ...(v ? {} : { couponExclude: '' }) })}
        />
        <Select
          label='Coupon match'
          value={filters.couponExclude}
          options={INCLUDE_EXCLUDE}
          onChange={(v) => pushFilters({ couponExclude: v })}
        />
        <Select
          label='Offer'
          value={filters.offer}
          options={offerOptions}
          onChange={(v) => pushFilters({ offer: v, ...(v ? {} : { offerExclude: '' }) })}
        />
        <Select
          label='Offer match'
          value={filters.offerExclude}
          options={INCLUDE_EXCLUDE}
          onChange={(v) => pushFilters({ offerExclude: v })}
        />
        <Select
          label='"No download for" also counts'
          value={filters.inactiveIncludeNever}
          options={[
            ['', 'Only past downloaders'],
            ['1', 'Never-downloaded too'],
          ]}
          onChange={(v) => pushFilters({ inactiveIncludeNever: v })}
        />
      </div>
    </div>
  );
}
