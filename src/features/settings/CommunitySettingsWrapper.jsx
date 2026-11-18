'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Facebook community group settings.
//
// One link drives three placements: the footer on every page, a section on the
// homepage (after the designs, before the footer) and a button in the welcome
// email for new sign-ups. Clearing the link hides all three.
// ─────────────────────────────────────────────────────────────────────────────

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

export default function CommunitySettingsWrapper({ settings }) {
  const router = useRouter();
  const stored = settings?.stored || {};

  const [url, setUrl] = useState(stored.facebookGroupUrl || '');
  const [members, setMembers] = useState(stored.facebookGroupMembers || '');
  const [saving, setSaving] = useState(false);

  const trimmedUrl = url.trim();
  const trimmedMembers = members.trim();
  const headline = trimmedMembers
    ? `Join ${trimmedMembers} embroiderers in our Facebook group`
    : 'Join our Facebook group';
  const footerText = trimmedMembers
    ? `Join our community (${trimmedMembers} members)`
    : 'Join our community';

  const save = async () => {
    setSaving(true);
    try {
      const token = Cookies.get('token');
      const res = await fetch(`${apiBase()}/admin/settings/app`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          facebookGroupUrl: trimmedUrl,
          facebookGroupMembers: trimmedMembers,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save');

      SuccessToast(
        'Saved',
        trimmedUrl
          ? 'The Facebook group invite is live on the site and in the welcome email.'
          : 'The Facebook group invite is now hidden everywhere.',
        4000,
      );
      router.refresh();
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to save', 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='rounded-2xl bg-white p-4 shadow-sm sm:p-6'>
        <h1 className='text-xl font-bold text-gray-900'>Community</h1>
        <p className='mt-1 max-w-2xl text-sm text-gray-500'>
          Invites customers to your Facebook group in three places: the footer
          of every page, a section on the homepage (after the designs, before
          the footer), and a button in the welcome email new sign-ups receive.
        </p>
      </div>

      <div className='rounded-2xl bg-white p-4 shadow-sm sm:p-6'>
        <label className='mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'>
          Facebook group link
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder='https://www.facebook.com/groups/yourgroup'
          inputMode='url'
          className='w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm'
        />
        <p className='mt-1.5 text-xs text-gray-500'>
          The full link to the group, starting with https://.{' '}
          <strong>Leave it empty to hide the invite everywhere.</strong>
        </p>

        <label className='mb-1 mt-5 block text-xs font-bold uppercase tracking-wide text-gray-500'>
          Member count <span className='font-normal normal-case'>(optional)</span>
        </label>
        <input
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          placeholder='10,000+'
          maxLength={20}
          className='w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2.5 text-sm'
        />
        <p className='mt-1.5 text-xs text-gray-500'>
          Shown exactly as you type it, e.g. <strong>10,000+</strong> or{' '}
          <strong>10k+</strong>. Only use a number the group has actually
          reached. Leave it empty and the copy says “Join our community” with
          no number.
        </p>

        {trimmedUrl && (
          <div className='mt-5 space-y-3 rounded-xl bg-gray-50 p-4'>
            <p className='text-xs font-bold uppercase tracking-wide text-gray-500'>
              What customers will see
            </p>
            <p className='text-sm text-gray-700'>
              <span className='font-semibold'>Footer:</span> {footerText}
            </p>
            <p className='text-sm text-gray-700'>
              <span className='font-semibold'>Homepage &amp; welcome email:</span>{' '}
              {headline}
            </p>
            <a
              href={trimmedUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-block rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50'
            >
              Test the link →
            </a>
          </div>
        )}

        <button
          type='button'
          onClick={save}
          disabled={saving}
          className='mt-6 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50'
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
