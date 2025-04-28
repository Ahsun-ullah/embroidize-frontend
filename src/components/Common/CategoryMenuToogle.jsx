'use client';

import { Divider } from '@heroui/react';
import { useState } from 'react';
import CategoryMenu from './CategoryMenu';

const CategoryMenuToogle = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className='sm:flex items-center gap-x-2 text-base font-semibold text-gray-700'>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className='flex items-center gap-2 text-gray-800'
        >
          {isMobileMenuOpen ? (
            <i className='ri-menu-2-line' />
          ) : (
            <i className='ri-menu-3-line' />
          )}
          <span className='hidden sm:flex'>Categories</span>
        </button>
      </div>

      {/* Conditionally show CategoryMenu */}
      {isMobileMenuOpen && (
        <>
          <div className='bg-white'>
            <CategoryMenu isMobileMenuOpen={isMobileMenuOpen} />
          </div>
          <Divider className='bg-gray-300' />
        </>
      )}
    </>
  );
};

export default CategoryMenuToogle;
