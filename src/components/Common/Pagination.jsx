'use client';

import { Pagination as HeroPagination, Spinner } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

const Pagination = ({ totalPages, perPageData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentPerPage = parseInt(
    searchParams.get('limit') || String(perPageData),
    10,
  );

  const onPageChange = useCallback(
    (newPage) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(newPage));
        params.set('limit', String(currentPerPage));
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams, currentPerPage],
  );

  if (totalPages <= 1) return null;

  return (
    <div className='flex flex-col items-center gap-2 mt-4'>
      <HeroPagination
        showControls
        showShadow
        color='primary'
        page={currentPage}
        total={totalPages}
        onChange={onPageChange}
        isDisabled={isPending}
      />

      {/* Loading indicator below pagination */}
      {isPending && (
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <Spinner size='sm' color='primary' />
          <span>Loading page data...</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;
