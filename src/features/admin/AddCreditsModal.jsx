'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { financeHeaders } from '@/lib/financeLock';
import Cookies from 'js-cookie';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Add download credits to a customer's wallet.
//
// Its own modal, not a mode of GrantAccessModal. Credits are a different
// product from a subscription — a quantity, with no plan, no period, no
// renewal and no row in UserSubscription — and running both through one form
// meant every credit sale started by answering questions about plans and
// billing periods that had nothing to do with it.
//
// Posts to POST /admin/users/:id/credits, which is likewise separate from the
// subscription grant endpoint.
// ─────────────────────────────────────────────────────────────────────────────

const CURRENCIES = ['USD', 'EUR', 'GBP'];

const METHOD_SUGGESTIONS = [
  'PayPal',
  'Payoneer',
  'Bank transfer',
  'Wise',
  'bKash',
  'Cash',
];

export default function AddCreditsModal({
  user,
  onClose,
  onAdded,
  // Prefilled from a credit request in the queue, so the number the customer
  // asked for is never retyped from memory.
  initialCreditAmount,
}) {
  const [creditAmount, setCreditAmount] = useState(
    initialCreditAmount ? String(initialCreditAmount) : '100',
  );
  const [addToBalance, setAddToBalance] = useState(true);
  const [expiresOn, setExpiresOn] = useState('');

  // Money actually received. Optional on purpose — comping credits must not
  // fabricate a row in the ledger the invoices are built from.
  const [recordPayment, setRecordPayment] = useState(true);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [method, setMethod] = useState('');
  const [methodDetail, setMethodDetail] = useState('');
  const [reference, setReference] = useState('');
  const [receivedAt, setReceivedAt] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const balance = user?.availableCredits ?? user?.balance ?? null;

  const submit = async () => {
    const n = parseInt(creditAmount, 10);
    if (!Number.isFinite(n) || n <= 0) {
      ErrorToast('Credits required', 'Enter how many credits to add.', 3000);
      return;
    }

    const body = { creditAmount: n, addToBalance, note };
    if (expiresOn) body.creditsExpireAt = new Date(expiresOn).toISOString();

    if (recordPayment) {
      const parsed = Number(amount);
      if (!Number.isFinite(parsed) || parsed < 0) {
        ErrorToast('Amount required', 'Enter the amount you received.', 3000);
        return;
      }
      if (!method.trim()) {
        ErrorToast('Method required', 'Enter how the payment was received.', 3000);
        return;
      }
      body.payment = {
        // Sent in cents so the server never has to reason about float money.
        amountCents: Math.round(parsed * 100),
        currency,
        method: method.trim(),
        methodDetail: methodDetail.trim() || undefined,
        reference: reference.trim() || undefined,
        receivedAt: receivedAt ? new Date(receivedAt).toISOString() : undefined,
      };
    }

    setSaving(true);
    try {
      const token = Cookies.get('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/users/${user._id}/credits`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...financeHeaders(),
          },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || 'Could not add credits');
      }

      SuccessToast('Credits added', data?.message || '', 6000);
      onAdded?.(data?.data);
      onClose?.();
    } catch (err) {
      ErrorToast('Could not add credits', err.message, 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl'
      >
        <div className='mb-4 flex items-start justify-between gap-4'>
          <div>
            <h2 className='text-lg font-bold text-gray-900'>Add download credits</h2>
            <p className='mt-0.5 text-sm text-gray-500'>
              {user?.name || user?.email}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label='Close'
            className='rounded-lg px-2 text-2xl leading-none text-gray-400 hover:text-gray-700'
          >
            ×
          </button>
        </div>

        <p className='mb-5 rounded-lg bg-gray-100 px-3 py-2 text-xs leading-relaxed text-gray-700'>
          Credits are prepaid premium downloads, kept entirely separate from
          subscriptions — this does not touch any plan this customer has. They
          are only spent on premium designs while there is no active
          subscription.
          {balance != null && (
            <>
              {' '}
              Current balance: <strong>{balance}</strong>.
            </>
          )}
        </p>

        <div className='grid gap-3 sm:grid-cols-2'>
          <div>
            <label className='mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'>
              Credits to add
            </label>
            <input
              type='number'
              min='1'
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
            />
            <label className='mt-2 flex items-center gap-2 text-xs text-gray-700'>
              <input
                type='checkbox'
                checked={addToBalance}
                onChange={(e) => setAddToBalance(e.target.checked)}
              />
              Add to their existing balance
            </label>
            {!addToBalance && (
              <p className='mt-1 text-xs text-red-600'>
                Their balance will be REPLACED with this number.
              </p>
            )}
          </div>

          <div>
            <label className='mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'>
              Expires <span className='font-normal normal-case'>(optional)</span>
            </label>
            <input
              type='date'
              value={expiresOn}
              onChange={(e) => setExpiresOn(e.target.value)}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
            />
            <p className='mt-1 text-xs text-gray-500'>
              Leave empty and the credits never expire.
            </p>
          </div>
        </div>

        {/* Payment received */}
        <div className='mt-6 rounded-xl border border-gray-200 p-4'>
          <label className='flex items-center gap-2 text-sm font-bold text-gray-900'>
            <input
              type='checkbox'
              checked={recordPayment}
              onChange={(e) => setRecordPayment(e.target.checked)}
            />
            Record a payment for these credits
          </label>
          <p className='mt-1 text-xs text-gray-500'>
            Creates the receipt and emails it to the customer. Untick if you are
            comping credits or correcting a balance with no money involved.
          </p>

          {recordPayment && (
            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              <div>
                <label className='mb-1 block text-xs font-semibold text-gray-600'>
                  Amount
                </label>
                <div className='flex gap-2'>
                  <input
                    type='number'
                    step='0.01'
                    min='0'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='5.00'
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className='rounded-lg border border-gray-300 px-2 py-2 text-sm'
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className='mb-1 block text-xs font-semibold text-gray-600'>
                  Method
                </label>
                {/* Free text with suggestions — a new method can be typed in
                    directly, no code change needed. */}
                <input
                  list='credit-payment-methods'
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  placeholder='PayPal'
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                />
                <datalist id='credit-payment-methods'>
                  {METHOD_SUGGESTIONS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className='mb-1 block text-xs font-semibold text-gray-600'>
                  Detail <span className='font-normal text-gray-400'>(optional)</span>
                </label>
                <input
                  value={methodDetail}
                  onChange={(e) => setMethodDetail(e.target.value)}
                  placeholder='amara@example.com'
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                />
              </div>

              <div>
                <label className='mb-1 block text-xs font-semibold text-gray-600'>
                  Reference <span className='font-normal text-gray-400'>(optional)</span>
                </label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder='8XY44821PL993'
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                />
              </div>

              <div>
                <label className='mb-1 block text-xs font-semibold text-gray-600'>
                  Received on
                </label>
                <input
                  type='date'
                  value={receivedAt}
                  onChange={(e) => setReceivedAt(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                />
              </div>
            </div>
          )}
        </div>

        <label className='mb-1 mt-4 block text-xs font-bold uppercase tracking-wide text-gray-500'>
          Internal note
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder='e.g. 100 credits for $5, paid by PayPal'
          className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
        />
        <p className='mt-1 text-xs text-gray-400'>
          Saved to the credit history{recordPayment ? ' and the receipt' : ''}.
        </p>

        <div className='mt-6 flex justify-end gap-2'>
          <button
            onClick={onClose}
            className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className='rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50'
          >
            {saving ? 'Adding…' : 'Add credits'}
          </button>
        </div>
      </div>
    </div>
  );
}
