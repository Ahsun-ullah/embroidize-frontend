'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp contact settings.
//
// One number, one pre-filled message, and an off switch. The button on the site
// renders only while a number is saved here — clearing the field is how you
// turn it off, and it takes effect on the next page load with no deploy.
//
// This is click-to-chat, not the WhatsApp Business API: it opens the customer's
// own WhatsApp app with a message ready to send. Nothing is sent automatically
// and nothing arrives back in this dashboard — replies land in WhatsApp on the
// phone that owns the number.
// ─────────────────────────────────────────────────────────────────────────────

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

// Deliberately unfinished. A complete sentence ("Hi, I have a question.") gets
// sent as-is by a fair number of people, and you learn nothing from it — this
// one leaves their thumb mid-thought so they say what they actually want.
const DEFAULT_MESSAGE = 'Hi Embroidize! I need help with';

export default function WhatsAppSettingsWrapper({ settings }) {
  const router = useRouter();
  const stored = settings?.stored || {};

  const [number, setNumber] = useState(stored.whatsappNumber || '');
  const [message, setMessage] = useState(stored.whatsappMessage || '');
  const [saving, setSaving] = useState(false);

  // What the customer will actually open. Shown live so a wrong country code is
  // obvious here rather than after someone taps it on the site.
  const digits = number.replace(/[^0-9]/g, '');
  const preview = digits
    ? `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`
    : '';

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
          whatsappNumber: digits,
          whatsappMessage: message,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save');

      SuccessToast(
        'Saved',
        digits
          ? 'The WhatsApp button is live on the site.'
          : 'The WhatsApp button is now hidden.',
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
        <h1 className='text-xl font-bold text-gray-900'>WhatsApp</h1>
        <p className='mt-1 max-w-2xl text-sm text-gray-500'>
          Shows a WhatsApp button in the bottom-left corner of every customer
          page. Tapping it opens WhatsApp with your number and a message ready
          to send — you reply from your phone as normal.
        </p>
      </div>

      <div className='rounded-2xl bg-white p-4 shadow-sm sm:p-6'>
        <label className='mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'>
          WhatsApp number
        </label>
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder='8801712345678'
          inputMode='tel'
          className='w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm'
        />
        <p className='mt-1.5 text-xs text-gray-500'>
          Country code first, no <strong>+</strong>, no spaces or dashes — that
          is the only form WhatsApp links accept. Spaces and symbols you type
          here are stripped automatically.{' '}
          <strong>Leave it empty to hide the button.</strong>
        </p>

        <label className='mb-1 mt-5 block text-xs font-bold uppercase tracking-wide text-gray-500'>
          Pre-filled message <span className='font-normal normal-case'>(optional)</span>
        </label>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={DEFAULT_MESSAGE}
          className='w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm'
        />
        <p className='mt-1.5 text-xs text-gray-500'>
          Sits in the customer&apos;s message box before they send. Keep it
          short and leave it unfinished — a complete sentence just gets sent
          back at you with nothing in it.
        </p>
        {message !== DEFAULT_MESSAGE && (
          <button
            type='button'
            onClick={() => setMessage(DEFAULT_MESSAGE)}
            className='mt-2 text-xs font-semibold text-gray-600 underline underline-offset-2 hover:text-black'
          >
            Use the suggested message
          </button>
        )}

        {preview && (
          <div className='mt-5 rounded-xl bg-gray-50 p-4'>
            <p className='text-xs font-bold uppercase tracking-wide text-gray-500'>
              This is what the button opens
            </p>
            <p className='mt-1 break-all text-xs text-gray-700'>{preview}</p>
            <a
              href={preview}
              target='_blank'
              rel='noopener noreferrer'
              className='mt-3 inline-block rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50'
            >
              Test it now →
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

      <div className='rounded-2xl bg-white p-4 shadow-sm sm:p-6'>
        <p className='text-sm font-bold text-gray-900'>What this does not do</p>
        <ul className='mt-2 space-y-1.5 text-sm text-gray-600'>
          <li>
            · Messages do not appear in this dashboard — they arrive in WhatsApp
            on the phone that owns the number.
          </li>
          <li>
            · Nothing is sent automatically. Receipts, payment details and
            reminders still go by email.
          </li>
          <li>
            · The customer sees your number, so use the one you are happy to
            publish.
          </li>
        </ul>
      </div>
    </div>
  );
}
