'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const Pagination = ({ totalPages, perPage }) => {
  const searchParams = useSearchParams();
  const [visiblePages, setVisiblePages] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      setVisiblePages(window.innerWidth < 768 ? 4 : 5); // Reduced visible pages on mobile
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentPerPage = parseInt(searchParams.get('limit') || perPage || '20', 10);

  const createQueryString = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page);
    params.set('limit', currentPerPage);
    return params.toString();
  };

  const getPageNumbers = () => {
    const pages = [];
    const half = Math.floor(visiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + visiblePages - 1, totalPages);

    if (end - start + 1 < visiblePages) {
      start = Math.max(end - visiblePages + 1, 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className='flex justify-center items-center gap-3 mt-4 text-base md:text-lg font-bold'>
      {currentPage > 1 && (
        <Link
          href={`?${createQueryString(currentPage - 1)}`}
          className='px-3 py-1 rounded hover:bg-gray-200 transition'
        >
          ‹
        </Link>
      )}

      {getPageNumbers().map((page, i) =>
        page === '...' ? (
          <span key={i} className='px-1 text-gray-500'>
            ..
          </span>
        ) : (
          <Link
            key={page}
            href={`?${createQueryString(page)}`}
            className={`px-3 py-1 rounded border ${
              currentPage === page
                ? 'bg-black text-white shadow-sm'
                : 'hover:bg-gray-100'
            }`}
          >
            {page}
          </Link>
        ),
      )}

      {currentPage < totalPages && (
        <Link
          href={`?${createQueryString(currentPage + 1)}`}
          className='px-3 py-1 rounded hover:bg-gray-200 transition'
        >
          ›
        </Link>
      )}
    </div>
  );
};

export default Pagination;
