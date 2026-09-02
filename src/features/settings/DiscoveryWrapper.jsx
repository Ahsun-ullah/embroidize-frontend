'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { Button, Card, CardBody, CardHeader, Chip, Input } from '@heroui/react';
import Cookies from 'js-cookie';
import { Compass, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

// Both settings change how the catalogue is PRESENTED, never what it contains.
// Nothing here can hide a design, unpublish one, or affect a download — which is
// why the copy leans on what each number does rather than on warnings.
export default function DiscoveryWrapper({ settings }) {
  const router = useRouter();

  const effective = settings?.effective || {};
  const stored = settings?.stored || {};

  const [popularDays, setPopularDays] = useState(
    stored.popularWindowDays != null
      ? String(stored.popularWindowDays)
      : String(effective.popularWindowDays ?? 15),
  );
  const [rotationDays, setRotationDays] = useState(
    stored.adminChoiceRotationDays != null
      ? String(stored.adminChoiceRotationDays)
      : String(effective.adminChoiceRotationDays ?? 7),
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const p = Number(popularDays);
    if (!Number.isInteger(p) || p < 1 || p > 365) {
      ErrorToast(
        'Invalid window',
        'The popular window must be a whole number of days between 1 and 365.',
        3000,
      );
      return;
    }

    const r = Number(rotationDays);
    if (!Number.isInteger(r) || r < 1 || r > 365) {
      ErrorToast(
        'Invalid rotation',
        'The rotation must be a whole number of days between 1 and 365.',
        3000,
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
          popularWindowDays: p,
          adminChoiceRotationDays: r,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save');

      SuccessToast(
        'Saved',
        p !== Number(effective.popularWindowDays)
          ? 'Saved. Popular is being recalculated over the new window — it can take a minute to settle.'
          : 'Discovery settings updated.',
        4000,
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
        <h1 className='flex items-center gap-2 text-2xl font-bold'>
          <Compass size={22} /> Discovery
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          How the Popular and Embroidize Choice rows decide what to show. These
          only change the order designs appear in — nothing here publishes,
          hides or deletes anything.
        </p>
      </div>

      <div className='flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600'>
        <Info size={16} className='mt-0.5 shrink-0' />
        <div>
          <p>
            Currently live:{' '}
            <Chip size='sm' variant='flat' className='bg-gray-900 text-white'>
              Popular = last {effective.popularWindowDays ?? 15} days
            </Chip>{' '}
            <Chip size='sm' variant='flat' className='bg-gray-900 text-white'>
              Choice reshuffles every {effective.adminChoiceRotationDays ?? 7}{' '}
              days
            </Chip>
          </p>
        </div>
      </div>

      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='font-semibold'>Popular window</CardHeader>
        <CardBody className='gap-3'>
          <p className='text-xs text-gray-500'>
            A design counts as popular based on how many times it was downloaded
            in this many recent days — not on its all-time total. That is what
            lets newer designs reach the Popular row at all: a lifetime count
            only ever grows, so the same few designs would sit at the top
            forever. A shorter window reacts faster and looks livelier, a longer
            one is steadier. This single number drives the Popular row on the
            homepage, the Popular tab on the products page, and the Most Popular
            sort — they can no longer disagree with each other.
          </p>
          <Input
            type='number'
            min={1}
            max={365}
            value={popularDays}
            onValueChange={setPopularDays}
            endContent={
              <span className='text-sm text-gray-400'>
                day{popularDays === '1' ? '' : 's'}
              </span>
            }
            description='Counts refresh hourly. Changing this recalculates them straight away.'
          />
        </CardBody>
      </Card>

      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='font-semibold'>
          Embroidize Choice rotation
        </CardHeader>
        <CardBody className='gap-3'>
          <p className='text-xs text-gray-500'>
            How often the Embroidize Choice designs are reshuffled into a new
            order. Your picks are never changed by this — nothing is added or
            removed automatically, and the toggle on a product stays the only
            way in or out. It only decides the order they appear in, so designs
            you picked months ago rotate back to the front instead of staying
            buried behind the ones you picked most recently.
          </p>
          <Input
            type='number'
            min={1}
            max={365}
            value={rotationDays}
            onValueChange={setRotationDays}
            endContent={
              <span className='text-sm text-gray-400'>
                day{rotationDays === '1' ? '' : 's'}
              </span>
            }
            description='Everyone sees the same order within a period, so the row stays consistent between page loads and across pagination.'
          />
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
