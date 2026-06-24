'use client';

import { clearFinanceToken } from '@/lib/financeLock';
import { Button } from '@heroui/react';
import { LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Thin banner shown on unlocked Financial pages with an instant re-lock.
export function FinanceUnlockedBar() {
  const router = useRouter();

  const lockNow = () => {
    clearFinanceToken();
    router.refresh();
  };

  return (
    <div className='flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2'>
      <span className='inline-flex items-center gap-1.5 text-xs text-gray-500'>
        <LockKeyhole size={13} className='text-gray-400' />
        Financial section unlocked for this session
      </span>
      <Button size='sm' variant='flat' onPress={lockNow}>
        Lock now
      </Button>
    </div>
  );
}
