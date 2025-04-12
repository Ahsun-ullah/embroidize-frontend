'use client';

import { useEffect } from 'react';

const Pagination = ({ data, currentPage, setCurrentPage, perPageData }) => {
  const handleClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const totalPages = Math.ceil(data?.length / perPageData);
  const visiblePages = 15;

  useEffect(() => {
    if (currentPage < 0) {
      setCurrentPage(0);
    } else if (currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= visiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
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
        className={
          pageNumber === currentPage + 1
            ? 'active bg-blue-100  border rounded-[5px] py-[3px] px-[10px] cursor-pointer'
            : 'button'
        }
        onClick={() => handleClick(pageNumber - 1)}
        role='button'
        tabIndex={0}
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
            className='button'
            onClick={handlePrevPage}
            role='button'
            tabIndex={0}
          >
            &laquo; Previous
          </li>
        )}
        {renderPageNumbers()}
        {currentPage < totalPages - 1 && (
          <li
            className='button'
            onClick={handleNextPage}
            role='button'
            tabIndex={0}
          >
            Next &raquo;
          </li>
        )}
      </ul>
    </div>
  );
};

export default Pagination;
