'use client';

import { useGetPublicProductCategoriesQuery } from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import Link from 'next/link';
import { useMemo } from 'react';

export default function CategoryMenu({ isMobileMenuOpen }) {
  const { data: categoryData } = useGetPublicProductCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
  });

  const categories = useMemo(() => categoryData?.data || [], [categoryData]);

  const renderCategoryLink = (category) => {
    const displayName = category.name
      .replace(/embroidery designs/gi, '')
      .trim();
    return (
      <Link
        href={`/category/${category.slug}`}
        prefetch={false}
        className='font-bold capitalize'
      >
        {displayName}
      </Link>
    );
  };

  const renderSubcategoryLinks = (category) =>
    category.subcategories?.map((sub) => (
      <li key={sub._id}>
        <Link
          href={`/${category.slug}/${sub.slug}`}
          prefetch={false}
          className='hover:underline capitalize'
        >
          {sub.name}
        </Link>
      </li>
    ));

  if (!categories.length) return null;

  return (
    <nav aria-label='Category menu'>
      {isMobileMenuOpen ? (
        <div className='container mx-auto flex flex-wrap items-center justify-center'>
          <div className='grid grid-cols-2 sm:grid-cols-6 gap-6 p-6 text-sm'>
            {categories.map((category) => (
              <div
                key={category._id}
                className='space-y-4 border-r border-gray-300 pr-4'
              >
                {renderCategoryLink(category)}
                <ul className='space-y-2'>
                  {renderSubcategoryLinks(category)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='container hidden sm:flex flex-wrap items-center justify-center gap-x-10 py-4'>
          {categories.slice(0, 8).map((category) => {
            const displayName = category.name
              .replace(/embroidery designs/gi, '')
              .trim();
            return (
              <Link
                key={category._id}
                href={`/category/${category.slug}`}
                prefetch={false}
                className='capitalize'
              >
                {displayName}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
