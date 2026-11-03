'use client';
import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { Button, Input, Switch } from '@heroui/react';
import Cookies from 'js-cookie';
import { useCallback, useEffect, useRef, useState } from 'react';

const api = (path, init = {}) => {
  const token = Cookies.get('token');
  return fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
};

const when = (d) =>
  d
    ? new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

/**
 * Two admin controls on the User Tracking page: the abandoned-checkout
 * reminder email switch, and "Import past data" (the backfill).
 */
export default function TrackingSettings({ onBackfillDone }) {
  const [cfg, setCfg] = useState(null);
  const [delay, setDelay] = useState('1');
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api('/admin/tracking/settings');
      const json = await res.json();
      if (res.ok) {
        setCfg(json.data);
        setDelay(String(json.data.abandonedCheckoutDelayHours || 1));
      }
    } catch {
      // The rest of the page still works without these controls.
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // While a backfill runs, check back every few seconds.
  const running = cfg?.backfill?.running === true;
  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(async () => {
      await load();
    }, 4000);
    return () => clearInterval(t);
  }, [running, load]);

  // Refresh the numbers above once an import finishes.
  const wasRunning = useRef(false);
  useEffect(() => {
    if (wasRunning.current && !running) onBackfillDone?.();
    wasRunning.current = running;
  }, [running, onBackfillDone]);

  const save = async (changes) => {
    setSaving(true);
    try {
      const res = await api('/admin/tracking/settings', {
        method: 'PUT',
        body: JSON.stringify(changes),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Could not save.');
      setCfg(json.data);
      SuccessToast('Saved', 'Setting saved.', 2500);
    } catch (err) {
      ErrorToast('Error', err.message || 'Could not save.', 3000);
    } finally {
      setSaving(false);
    }
  };

  const startBackfill = async () => {
    setStarting(true);
    try {
      const res = await api('/admin/tracking/backfill', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Could not start.');
      SuccessToast('Started', 'Importing past data. This takes a minute or two.', 3500);
      await load();
    } catch (err) {
      ErrorToast('Error', err.message || 'Could not start.', 3500);
    } finally {
      setStarting(false);
    }
  };

  if (!cfg) return null;
  const s = cfg.backfill?.summary;

  return (
    <section className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
      <div className='flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <div className='font-semibold text-gray-900'>Abandoned-checkout reminder email</div>
            <div className='text-sm text-gray-500'>
              One email to someone who started subscribing and didn&apos;t pay. Only to users
              who can receive offer emails, at most once every 14 days per person.
            </div>
          </div>
          <Switch
            aria-label='Abandoned-checkout reminder email'
            isSelected={cfg.abandonedCheckoutEmails}
            isDisabled={saving || cfg.envKillSwitch}
            onValueChange={(v) => save({ abandonedCheckoutEmails: v })}
          />
        </div>
        <div className='flex items-end gap-2'>
          <Input
            size='sm'
            type='number'
            min={1}
            max={47}
            label='Send after (hours)'
            labelPlacement='outside'
            className='max-w-[160px]'
            value={delay}
            onValueChange={setDelay}
          />
          <Button
            size='sm'
            variant='flat'
            isDisabled={saving || String(cfg.abandonedCheckoutDelayHours) === delay}
            onPress={() => save({ abandonedCheckoutDelayHours: Number(delay) })}
          >
            Save
          </Button>
        </div>
        {cfg.envKillSwitch && (
          <p className='text-xs text-red-600'>
            Turned off on the server (ABANDONED_CHECKOUT_EMAILS=off), which overrides this switch.
          </p>
        )}
      </div>

      <div className='flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4'>
        <div>
          <div className='font-semibold text-gray-900'>Import past data</div>
          <div className='text-sm text-gray-500'>
            Fills the last 180 days from records you already have: payments, Stripe checkouts
            (including unpaid ones), estimated free-limit hits and &quot;last seen&quot;. Design
            views and pricing visits were never recorded, so those start from today. Safe to run
            again; it replaces its own earlier import.
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            size='sm'
            color='primary'
            onPress={startBackfill}
            isLoading={starting || running}
            isDisabled={running}
          >
            {running ? 'Importing…' : cfg.backfill?.at ? 'Import again' : 'Import past data'}
          </Button>
          {cfg.backfill?.at && !running && (
            <span className='text-xs text-gray-500'>Last run {when(cfg.backfill.at)}</span>
          )}
        </div>
        {s && !running && (
          <ul className='text-xs text-gray-600'>
            <li>{s.checkoutsCompleted} payments</li>
            <li>
              {s.checkoutsStartedStripe} Stripe checkouts started
              {s.checkoutsStartedInferred ? `, ${s.checkoutsStartedInferred} more inferred from payments` : ''}
            </li>
            <li>{s.limitHitsEstimated} free-limit days (estimated)</li>
            <li>{s.lastSeenFilled} users given a &quot;last seen&quot; date</li>
            {s.stripeError && <li className='text-amber-700'>Stripe not read: {s.stripeError}</li>}
          </ul>
        )}
        {cfg.backfill?.error && !running && (
          <p className='text-xs text-red-600'>Last import failed: {cfg.backfill.error}</p>
        )}
      </div>
    </section>
  );
}
