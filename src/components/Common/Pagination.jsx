'use client';

import { useRouter } from 'next/navigation';

const Pagination = ({
  data,
  currentPage,
  setCurrentPage,
  perPageData,
  totalCount,
}) => {
  const totalPages = Math.ceil(totalCount / perPageData);
  const visiblePages = 5;

  const router = useRouter();

  const handleClick = (pageNumber) => {
    router.push(`/products?page=${pageNumber}`);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      router.push(`/products?page=${currentPage - 1}`);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      router.push(`/products?page=${currentPage + 1}`);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= visiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i + 1);
      }
    } else {
      const halfVisiblePages = Math.floor(visiblePages / 2);
      let startPage = currentPage - halfVisiblePages;
      let endPage = currentPage + halfVisiblePages;

      if (startPage < 0) {
        startPage = 0;
        endPage = visiblePages - 1;
      } else if (endPage >= totalPages) {
        startPage = totalPages - visiblePages;
        endPage = totalPages - 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i + 1);
      }
    }

    return pageNumbers.map((pageNumber) => (
      <li
        key={pageNumber}
        className={`${
          pageNumber === currentPage + 1
            ? 'active bg-blue-100 border rounded-[5px] py-[3px] px-[10px] cursor-pointer'
            : 'button cursor-pointer'
        }`}
        onClick={() => handleClick(pageNumber - 1)}
        role='button'
        tabIndex={0}
        aria-label={`Go to page ${pageNumber}`}
      >
        {pageNumber}
      </li>
    ));
  };

  return (
    <div className='mt-16 me-5 text-lg'>
      <ul className='flex justify-end gap-2'>
        {currentPage > 0 && (
          <li
            className='button cursor-pointer'
            onClick={handlePrevPage}
            role='button'
            tabIndex={0}
            aria-label='Go to previous page'
          >
            &laquo; Previous
          </li>
        )}
        {renderPageNumbers()}
        {currentPage < totalPages - 1 && (
          <li
            className='button cursor-pointer'
            onClick={handleNextPage}
            role='button'
            tabIndex={0}
            aria-label='Go to next page'
          >
            Next &raquo;
          </li>
        )}
      </ul>
    </div>
  );
};

export default Pagination;
