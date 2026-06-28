'use client';

import { Pagination as HeroPagination, Spinner } from '@heroui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

const Pagination = ({ totalPages, perPageData }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const defaultPerPage = perPageData || 20;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentPerPage = parseInt(
    searchParams.get('limit') || String(defaultPerPage),
    10,
  );

  const onPageChange = useCallback(
    (newPage) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        // Page 1 is the default — keep it out of the URL so the clean URL
        // stays the canonical one (no ?page=1 duplicate).
        if (newPage <= 1) params.delete('page');
        else params.set('page', String(newPage));

        // Only keep an explicit limit when it differs from the page default,
        // so the default view doesn't generate a ?limit=20 duplicate.
        if (!currentPerPage || currentPerPage === defaultPerPage) {
          params.delete('limit');
        } else {
          params.set('limit', String(currentPerPage));
        }

        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [router, pathname, searchParams, currentPerPage, defaultPerPage],
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
