'use client';
import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { Switch } from '@heroui/react';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

/**
 * "Email me new designs and offers" switch on the account page. Backed by
 * PATCH /user/marketing. Turning it on also clears an earlier unsubscribe.
 */
export default function MarketingPreference() {
  const { data: user, refetch } = useUserInfoQuery();
  const current = user?.marketingOptIn === true && !user?.unsubscribedAt;
  const [on, setOn] = useState(current);
  const [saving, setSaving] = useState(false);

  useEffect(() => setOn(current), [current]);

  if (!user?._id) return null;

  const change = async (next) => {
    setOn(next);
    setSaving(true);
    try {
      const token = Cookies.get('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/user/marketing`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ optIn: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Could not save your choice.');
      SuccessToast('Saved', json?.message || 'Saved.', 3000);
      refetch();
    } catch (err) {
      setOn(!next);
      ErrorToast('Error', err.message || 'Could not save your choice.', 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='mt-6 flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4'>
      <div>
        <div className='font-semibold text-gray-900'>Design offers by email</div>
        <div className='text-sm text-gray-500'>
          New designs, member deals and occasional discounts. Receipts and account
          emails are sent either way.
        </div>
      </div>
      <Switch
        aria-label='Design offers by email'
        isSelected={on}
        isDisabled={saving}
        onValueChange={change}
      />
    </div>
  );
}
