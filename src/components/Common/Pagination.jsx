'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const Pagination = ({ totalPages }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current page and limit from URL or use defaults
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const perPageData = parseInt(searchParams.get('limit') || '20', 10);

  const visiblePages = 5;

  const handleClick = (pageNumber) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', pageNumber.toString());
    newParams.set('limit', perPageData.toString());
    router.push(`?${newParams.toString()}`);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handleClick(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handleClick(currentPage + 1);
    }
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
      <li
        key={page}
        onClick={() => handleClick(page)}
        className={`${
          page === currentPage
            ? 'active bg-blue-100 border rounded-[5px] py-[3px] px-[10px] cursor-pointer'
            : 'button cursor-pointer'
        }`}
        role='button'
        tabIndex={0}
        aria-label={`Go to page ${page}`}
      >
        {page}
      </li>
    ));
  };

  return (
    <div className='mt-16 me-5 text-lg'>
      <ul className='flex justify-end gap-2'>
        {currentPage === 1 ? (
          ''
        ) : (
          <li
            onClick={handlePrevPage}
            className='cursor-pointer px-3 py-1 button rounded'
            role='button'
            tabIndex={0}
            aria-label='Previous page'
          >
            &laquo;
          </li>
        )}

        {renderPageNumbers()}

        {currentPage === totalPages ? (
          ''
        ) : (
          <li
            onClick={handleNextPage}
            className='cursor-pointer px-3 py-1 button rounded'
            role='button'
            tabIndex={0}
            aria-label='Next page'
          >
            &raquo;
          </li>
        )}
      </ul>
    </div>
  );
};

export default Pagination;
