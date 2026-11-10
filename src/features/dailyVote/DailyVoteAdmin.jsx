'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import VoteCountdown from '@/components/Common/DailyVote/VoteCountdown';
import {
  SITE_URL,
  votePageUrl,
  voteShareImageUrl,
} from '@/lib/apis/public/dailyVote';
import Cookies from 'js-cookie';
import { Check, Copy, Download, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

// Admin → Marketing → Daily Free Vote.
//   - switch the vote on/off
//   - see today's race live
//   - pick today's or tomorrow's free design by hand (overrides the vote)
//   - copy ready-made posts + preview images for the Facebook page and group

const BASE = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

async function api(path, { method = 'GET', body } = {}) {
  const token = Cookies.get('token');
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(json?.message || `Request failed (${res.status})`);
  return json;
}

const Thumb = ({ p, size = 48 }) =>
  p?.image?.url ? (
    <Image
      src={p.image.url}
      alt={p.name || ''}
      width={size}
      height={size}
      className='rounded-lg border bg-white object-contain'
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className='rounded-lg border bg-gray-100'
    />
  );

function CopyBox({ title, text, imageUrl, imageName }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this text', text);
    }
  };
  return (
    <div className='rounded-2xl border bg-white p-4'>
      <div className='mb-2 flex items-center justify-between gap-2'>
        <p className='font-bold'>{title}</p>
        <div className='flex gap-2'>
          {imageUrl && (
            <a
              href={imageUrl}
              download={imageName}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-semibold hover:bg-gray-50'
            >
              <Download className='h-4 w-4' /> Image
            </a>
          )}
          <button
            type='button'
            onClick={copy}
            className='inline-flex items-center gap-1 rounded-lg bg-black px-3 py-1.5 text-sm font-semibold text-white'
          >
            {copied ? (
              <Check className='h-4 w-4' />
            ) : (
              <Copy className='h-4 w-4' />
            )}{' '}
            {copied ? 'Copied' : 'Copy text'}
          </button>
        </div>
      </div>
      <pre className='whitespace-pre-wrap rounded-xl bg-gray-50 p-3 font-sans text-sm text-gray-800'>
        {text}
      </pre>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=''
          className='mt-3 w-full max-w-md rounded-xl border'
          loading='lazy'
        />
      )}
    </div>
  );
}

function PickForm({ label, onSubmit }) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <form
      className='mt-3 flex gap-2'
      onSubmit={async (e) => {
        e.preventDefault();
        if (!value.trim()) return;
        setBusy(true);
        const ok = await onSubmit(value.trim());
        setBusy(false);
        if (ok) setValue('');
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='SKU, slug or product id'
        className='min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm'
      />
      <button
        disabled={busy}
        className='rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white disabled:opacity-50'
      >
        {busy ? 'Saving…' : label}
      </button>
    </form>
  );
}

export default function DailyVoteAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const json = await api('/admin/daily-vote');
      setData(json.data);
    } catch (e) {
      ErrorToast('Could not load', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  const act = async (fn, okTitle) => {
    try {
      const json = await fn();
      SuccessToast(okTitle, json?.message || 'Saved', 3000);
      await load();
      return true;
    } catch (e) {
      ErrorToast('Not saved', e.message);
      return false;
    }
  };

  if (!data) {
    return (
      <div className='p-6 text-gray-500'>
        {loading ? 'Loading…' : 'No data'}
      </div>
    );
  }

  const today = data.today?.product;
  const tomorrow = data.tomorrow?.product;
  const leader = data.tally?.[0];
  const hoursLeft = Math.max(
    0,
    Math.round((new Date(data.endsAt).getTime() - Date.now()) / 3600000),
  );

  const votePost = [
    '🧵 Which embroidery design do YOU want for FREE tomorrow?',
    '',
    'Vote for any premium design on Embroidize. The design with the most votes becomes FREE for everyone for 24 hours! One vote per member each day.',
    leader?.product
      ? `\n🏆 Leading right now: ${leader.product.name} (${leader.votes} votes)`
      : '',
    '',
    `👉 Vote here: ${votePageUrl()}`,
  ]
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n');

  const winnerPost = today
    ? [
        `🎉 Today's FREE embroidery design: ${today.name}!`,
        data.today?.source === 'votes' && data.today?.votes
          ? `You voted it #1 with ${data.today.votes} votes. Thank you!`
          : '',
        '',
        `⬇️ Download it free for the next 24 hours: ${SITE_URL}/product/${today.slug}`,
        '',
        `🗳️ Now vote for tomorrow's free design: ${votePageUrl()}`,
      ]
        .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
        .join('\n')
    : '';

  const lastCallPost = leader?.product
    ? [
        `⏰ About ${hoursLeft} hour${hoursLeft === 1 ? '' : 's'} left to vote!`,
        `${leader.product.name} is leading with ${leader.votes} votes. Will it be FREE tomorrow, or will your favorite catch up?`,
        '',
        `👉 ${votePageUrl()}`,
      ].join('\n')
    : '';

  return (
    <div className='space-y-6 p-4 sm:p-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold'>Daily Free Vote</h1>
          <p className='text-sm text-gray-500'>
            Members vote once a day for any premium design. The most-voted
            design is free the next day (UTC).
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <VoteCountdown endsAt={data.endsAt} label='Day ends in' />
          <button
            type='button'
            onClick={load}
            className='rounded-lg border p-2'
            aria-label='Refresh'
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <label className='flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-semibold'>
            <input
              type='checkbox'
              checked={data.enabled}
              onChange={(e) =>
                act(
                  () =>
                    api('/admin/daily-vote/settings', {
                      method: 'PUT',
                      body: { enabled: e.target.checked },
                    }),
                  'Updated',
                )
              }
            />
            {data.enabled ? 'Vote is ON' : 'Vote is OFF'}
          </label>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-4'>
        {[
          ['Votes today', data.totalVotes],
          ['Voters today', data.voters],
          ['Designs voted for', data.designs],
          ['Not counted (same IP)', data.uncountedVotes],
        ].map(([k, v]) => (
          <div key={k} className='rounded-2xl border bg-white p-4'>
            <p className='text-xs font-semibold uppercase text-gray-500'>{k}</p>
            <p className='mt-1 text-2xl font-extrabold'>{v ?? 0}</p>
          </div>
        ))}
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <div className='rounded-2xl border bg-white p-4'>
          <p className='text-xs font-semibold uppercase text-gray-500'>
            Free today ({data.day})
          </p>
          {today ? (
            <div className='mt-2 flex items-center gap-3'>
              <Thumb p={today} size={64} />
              <div>
                <a
                  href={`/product/${today.slug}`}
                  target='_blank'
                  rel='noreferrer'
                  className='font-bold hover:underline'
                >
                  {today.name}
                </a>
                <p className='text-xs text-gray-500'>
                  SKU {today.sku_code || '—'} ·{' '}
                  {data.today.source === 'votes'
                    ? `won with ${data.today.votes} of ${data.today.totalVotes} votes`
                    : data.today.source === 'admin'
                      ? 'picked by admin'
                      : 'no votes yesterday, picked automatically'}
                </p>
              </div>
            </div>
          ) : (
            <p className='mt-2 text-sm text-gray-500'>None</p>
          )}
          <PickForm
            label='Replace today'
            onSubmit={(product) =>
              act(
                () =>
                  api('/admin/daily-vote/free', {
                    method: 'PUT',
                    body: { day: 'today', product },
                  }),
                'Today updated',
              )
            }
          />
        </div>

        <div className='rounded-2xl border bg-white p-4'>
          <p className='text-xs font-semibold uppercase text-gray-500'>
            Free tomorrow
          </p>
          {tomorrow ? (
            <div className='mt-2 flex items-center gap-3'>
              <Thumb p={tomorrow} size={64} />
              <div className='flex-1'>
                <p className='font-bold'>{tomorrow.name}</p>
                <p className='text-xs text-amber-700'>
                  Picked by admin. Today&apos;s votes will NOT decide tomorrow.
                </p>
              </div>
              <button
                type='button'
                onClick={() =>
                  act(
                    () =>
                      api('/admin/daily-vote/free/tomorrow', {
                        method: 'DELETE',
                      }),
                    'Cleared',
                  )
                }
                className='rounded-lg border px-3 py-1.5 text-sm font-semibold'
              >
                Let the vote decide
              </button>
            </div>
          ) : (
            <p className='mt-2 text-sm text-gray-600'>
              Decided by today&apos;s vote.{' '}
              {leader?.product ? (
                <>
                  Leading: <b>{leader.product.name}</b> ({leader.votes} votes)
                </>
              ) : (
                'No votes yet. If nobody votes, the most-downloaded recent premium design is picked.'
              )}
            </p>
          )}
          <PickForm
            label='Pin tomorrow'
            onSubmit={(product) =>
              act(
                () =>
                  api('/admin/daily-vote/free', {
                    method: 'PUT',
                    body: { day: 'tomorrow', product },
                  }),
                'Tomorrow pinned',
              )
            }
          />
        </div>
      </div>

      <div className='rounded-2xl border bg-white p-4'>
        <p className='mb-3 font-bold'>Today&apos;s race</p>
        {data.tally?.length ? (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-xs uppercase text-gray-500'>
                  <th className='py-2'>#</th>
                  <th>Design</th>
                  <th>SKU</th>
                  <th className='text-right'>Votes</th>
                  <th className='text-right'>%</th>
                </tr>
              </thead>
              <tbody>
                {data.tally.map((r) => (
                  <tr key={r.product?._id || r.rank} className='border-t'>
                    <td className='py-2 font-bold'>{r.rank}</td>
                    <td>
                      <div className='flex items-center gap-2'>
                        <Thumb p={r.product} size={36} />
                        <span className='line-clamp-1'>
                          {r.product?.name || '(deleted design)'}
                        </span>
                      </div>
                    </td>
                    <td className='text-gray-500'>
                      {r.product?.sku_code || '—'}
                    </td>
                    <td className='text-right font-bold'>{r.votes}</td>
                    <td className='text-right text-gray-500'>{r.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className='text-sm text-gray-500'>No votes yet today.</p>
        )}
      </div>

      <div>
        <p className='mb-1 text-lg font-extrabold'>Announce it</p>
        <p className='mb-3 text-sm text-gray-500'>
          Copy the text and download the image, then post it on the Facebook
          page and in the group. Pasting the link alone also shows the preview
          image automatically.
        </p>
        <div className='grid gap-4 xl:grid-cols-2'>
          {winnerPost && (
            <CopyBox
              title="Morning: today's free design"
              text={winnerPost}
              imageUrl={voteShareImageUrl({ mode: 'winner', day: data.day })}
              imageName={`free-design-${data.day}.jpg`}
            />
          )}
          <CopyBox
            title='Vote now'
            text={votePost}
            imageUrl={voteShareImageUrl({ day: data.day })}
            imageName={`vote-${data.day}.jpg`}
          />
          {lastCallPost && (
            <CopyBox title='Evening: last call' text={lastCallPost} />
          )}
        </div>
      </div>

      <div className='rounded-2xl border bg-white p-4'>
        <p className='mb-3 font-bold'>Past free designs</p>
        {data.history?.length ? (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-xs uppercase text-gray-500'>
                  <th className='py-2'>Day</th>
                  <th>Design</th>
                  <th>How</th>
                  <th className='text-right'>Votes</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((h) => (
                  <tr key={h.day} className='border-t'>
                    <td className='py-2 whitespace-nowrap'>{h.day}</td>
                    <td>
                      <div className='flex items-center gap-2'>
                        <Thumb p={h.product} size={32} />
                        <span className='line-clamp-1'>
                          {h.product?.name || '(deleted design)'}
                        </span>
                      </div>
                    </td>
                    <td className='capitalize text-gray-500'>{h.source}</td>
                    <td className='text-right'>
                      {h.votes} / {h.totalVotes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className='text-sm text-gray-500'>Nothing yet.</p>
        )}
      </div>
    </div>
  );
}
