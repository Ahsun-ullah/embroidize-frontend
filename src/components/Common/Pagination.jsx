'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const Pagination = ({ totalPages, perPage }) => {
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentPerPage = parseInt(
    searchParams.get('limit') || perPage || '20',
    10,
  );

  const visiblePages = 5;

  // Helper to build URLs with updated page number
  const buildPageHref = (pageNumber) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    params.set('limit', currentPerPage.toString());
    return `?${params.toString()}`;
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= visiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const half = Math.floor(visiblePages / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + visiblePages - 1);

      if (end - start < visiblePages - 1) {
        start = Math.max(1, end - visiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers.map((page) => (
      <li key={page}>
        <Link
          href={buildPageHref(page)}
          className={`${
            page === currentPage
              ? 'active bg-blue-100 border rounded px-3 py-1 text-center items-center justify-center flex'
              : 'bg-black text-white px-3 py-1 rounded hover:bg-gray-100 hover:text-black text-center items-center justify-center flex'
          }`}
          aria-label={`Go to page ${page}`}
        >
          {page}
        </Link>
      </li>
    ));
  };

  return (
    <nav className='mt-16 me-5 text-lg' aria-label='Pagination'>
      <ul className='flex justify-end gap-2'>
        {currentPage > 1 && (
          <li>
            <Link
              href={buildPageHref(currentPage - 1)}
              className='bg-black text-white px-3 py-1 rounded hover:bg-gray-100 hover:text-black text-center items-center justify-center flex'
              aria-label='Previous page'
            >
              &laquo;
            </Link>
          </li>
        )}

        {renderPageNumbers()}

        {currentPage < totalPages && (
          <li>
            <Link
              href={buildPageHref(currentPage + 1)}
              className='bg-black text-white px-3 py-1 rounded hover:bg-gray-100 hover:text-black text-center items-center justify-center flex'
              aria-label='Next page'
            >
              &raquo;
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
