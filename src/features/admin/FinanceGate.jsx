'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { setFinanceToken } from '@/lib/financeLock';
import { Button, Card, CardBody, Input } from '@heroui/react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Cookies from 'js-cookie';

// Password screen shown when the Financial section is locked. On success it
// stores the elevation token in a session cookie and refreshes the route, so
// the server component re-runs and renders the real page.
export function FinanceGate({ title = 'Financial' }) {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!passcode.trim()) return;
    setIsSubmitting(true);
    try {
      const token = Cookies.get('token');
      const apiUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
        process.env.NEXT_PUBLIC_BASE_API_URL;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/admin/finance/unlock`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ passcode }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result?.message || 'Incorrect password');
      }

      setFinanceToken(result?.data?.token);
      setPasscode('');
      router.refresh();
    } catch (err) {
      ErrorToast('Locked', err.message || 'Incorrect password', 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex min-h-[60vh] items-center justify-center'>
      <Card className='w-full max-w-sm border border-gray-200 dark:border-gray-800 shadow-none'>
        <CardBody className='p-8'>
          <div className='flex flex-col items-center text-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900'>
              <Lock size={20} />
            </div>
            <h2 className='mt-4 text-lg font-bold text-gray-900 dark:text-gray-100'>
              {title} is locked
            </h2>
            <p className='mt-1 text-sm text-gray-500'>
              Enter the Financial password to view this section.
            </p>
          </div>

          <form onSubmit={handleSubmit} className='mt-6 space-y-3'>
            <Input
              type='password'
              autoFocus
              placeholder='Financial password'
              value={passcode}
              onValueChange={setPasscode}
              isDisabled={isSubmitting}
            />
            <Button
              type='submit'
              className='w-full bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              isLoading={isSubmitting}
              isDisabled={!passcode.trim()}
            >
              Unlock
            </Button>
          </form>

          <p className='mt-4 text-center text-xs text-gray-400'>
            Stays unlocked until you close the browser or click “Lock now”.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
