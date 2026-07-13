'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import Cookies from 'js-cookie';
import { Download, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

const WINDOW_OPTIONS = [
  { value: '1d', label: 'Every 24 hours (1d)' },
  { value: '2d', label: 'Every 2 days (2d)' },
  { value: '3d', label: 'Every 3 days (3d)' },
  { value: '1w', label: 'Every week (1w)' },
  { value: '2w', label: 'Every 2 weeks (2w)' },
  { value: '1m', label: 'Every month (1m)' },
];

function windowLabel(w) {
  return WINDOW_OPTIONS.find((o) => o.value === w)?.label || w;
}

export default function DownloadLimitsWrapper({ settings }) {
  const router = useRouter();

  const effective = settings?.effective || {};
  const stored = settings?.stored || {};

  const [limit, setLimit] = useState(
    stored.freeDownloadLimit != null
      ? String(stored.freeDownloadLimit)
      : String(effective.freeDownloadLimit ?? 5)
  );
  const [window_, setWindow] = useState(
    stored.freeDownloadWindow || effective.freeDownloadWindow || '1d'
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const n = Number(limit);
    if (!Number.isInteger(n) || n < 1 || n > 1000) {
      ErrorToast(
        'Invalid limit',
        'The limit must be a whole number between 1 and 1000.',
        3000
      );
      return;
    }

    setIsSaving(true);
    try {
      const token = Cookies.get('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase()}/admin/settings/app`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          freeDownloadLimit: n,
          freeDownloadWindow: window_,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save');

      SuccessToast(
        'Saved',
        'Free download limit updated. The change is live immediately.',
        3000
      );
      router.refresh();
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to save settings', 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='max-w-2xl space-y-6'>
      <div>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <Download size={22} /> Free Download Limits
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          How many designs a registered free user can download before waiting
          for the next window. Applies everywhere — enforcement, the user
          dashboard, and public pricing copy — as soon as you save.
        </p>
      </div>

      {/* Currently live values */}
      <div className='flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600'>
        <Info size={16} className='mt-0.5 shrink-0' />
        <div>
          <p>
            Currently live:{' '}
            <Chip size='sm' variant='flat' className='bg-gray-900 text-white'>
              {effective.freeDownloadLimit} downloads ·{' '}
              {windowLabel(effective.freeDownloadWindow)}
            </Chip>
          </p>
          <p className='mt-1 text-gray-400'>
            Free downloads reset together, in a fixed window that starts at the
            user&apos;s first download of the cycle. Lowering the limit
            mid-window is safe — users over the new limit simply see 0
            remaining until their window resets.
          </p>
        </div>
      </div>

      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='font-semibold'>Downloads per window</CardHeader>
        <CardBody>
          <Input
            type='number'
            min={1}
            max={1000}
            value={limit}
            onValueChange={setLimit}
            description='Whole number between 1 and 1000.'
          />
        </CardBody>
      </Card>

      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='font-semibold'>Reset window</CardHeader>
        <CardBody>
          <Select
            aria-label='Reset window'
            selectedKeys={[window_]}
            onSelectionChange={(keys) => {
              const v = Array.from(keys)[0];
              if (v) setWindow(v);
            }}
            disallowEmptySelection
          >
            {WINDOW_OPTIONS.map((o) => (
              <SelectItem key={o.value}>{o.label}</SelectItem>
            ))}
          </Select>
        </CardBody>
      </Card>

      <div className='flex justify-end'>
        <Button
          className='bg-gray-900 text-white'
          isLoading={isSaving}
          onPress={handleSave}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
