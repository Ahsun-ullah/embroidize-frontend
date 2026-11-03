'use client';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
} from '@heroui/react';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'embroidize.zohoListKey';
const CHUNK = 500;

const readSaved = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
};
const save = (v) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, v);
  } catch {
    // Remembering the key is a convenience only.
  }
};

/**
 * Sends the users matching the current filters to a Zoho Campaigns list.
 * `loadRows(onProgress)` returns every matching user (the same walk the CSV
 * export uses); the backend skips anyone who may not receive offer emails.
 */
export default function ZohoPushModal({ isOpen, onClose, matchCount, filterSummary, loadRows }) {
  const [listKey, setListKey] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | loading | sending | done
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setListKey(readSaved());
      setPhase('idle');
      setResult(null);
      setError('');
    }
  }, [isOpen]);

  const busy = phase === 'loading' || phase === 'sending';

  const run = async () => {
    const key = listKey.trim();
    if (!key) return;
    save(key);
    setError('');
    setResult(null);
    try {
      setPhase('loading');
      const rows = await loadRows((n, total) => setProgress({ done: n, total: total || n }));
      const ids = rows.map((u) => u._id).filter(Boolean);
      setPhase('sending');
      setProgress({ done: 0, total: ids.length });
      const totals = { requested: 0, pushed: 0, skippedNoConsent: 0, failed: 0 };
      const token = Cookies.get('token');
      for (let i = 0; i < ids.length; i += CHUNK) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/zoho/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ listKey: key, userIds: ids.slice(i, i + CHUNK) }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Zoho push failed.');
        Object.keys(totals).forEach((k) => (totals[k] += json?.data?.[k] || 0));
        setProgress({ done: Math.min(i + CHUNK, ids.length), total: ids.length });
      }
      setResult(totals);
      setPhase('done');
    } catch (err) {
      setError(err.message || 'Zoho push failed.');
      setPhase('idle');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !busy && onClose()} size='md'>
      <ModalContent>
        <ModalHeader>Send to Zoho Campaigns</ModalHeader>
        <ModalBody className='text-sm'>
          <p className='text-gray-600'>
            Adds the <span className='font-semibold text-gray-900'>{matchCount}</span> users
            matching your filters to a Zoho list. Users who can&apos;t receive offer emails
            (unsubscribed, opted out, or EU/UK users who never opted in) are skipped.
          </p>
          {filterSummary?.length > 0 && (
            <p className='text-xs text-gray-500'>Filters: {filterSummary.join(' · ')}</p>
          )}
          <Input
            size='sm'
            label='Zoho list key'
            labelPlacement='outside'
            placeholder='From Zoho Campaigns → Contacts → the list → Setup'
            value={listKey}
            onValueChange={setListKey}
            isDisabled={busy}
          />
          <p className='text-xs text-gray-500'>
            Tip: make one Zoho list per segment (for example &quot;Checkout abandoners&quot;),
            then send that list a campaign from Zoho.
          </p>
          {busy && (
            <Progress
              size='sm'
              aria-label='Progress'
              label={phase === 'loading' ? 'Collecting users…' : 'Sending to Zoho…'}
              value={progress.total ? (progress.done / progress.total) * 100 : 0}
              showValueLabel
            />
          )}
          {result && (
            <div className='rounded-lg bg-gray-50 p-3 text-gray-700'>
              Sent <span className='font-semibold'>{result.pushed}</span> to Zoho.{' '}
              {result.skippedNoConsent} skipped (no consent)
              {result.failed ? `, ${result.failed} failed` : ''}.
            </div>
          )}
          {error && <p className='text-red-600'>{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={onClose} isDisabled={busy}>
            {phase === 'done' ? 'Close' : 'Cancel'}
          </Button>
          {phase !== 'done' && (
            <Button
              color='primary'
              onPress={run}
              isLoading={busy}
              isDisabled={!listKey.trim() || !matchCount}
            >
              Send to Zoho
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
