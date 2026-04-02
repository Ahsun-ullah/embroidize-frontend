'use client';

import { useGetPublicProductCategoriesQuery } from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import {
  getCachedCategories,
  setCachedCategories,
} from '@/lib/utils/categoryCache';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function CategoryMenu({ isMobileMenuOpen }) {
  const [cachedData, setCachedDataState] = useState(() => {
    if (typeof window !== 'undefined') {
      return getCachedCategories();
    }
    return null;
  });

  // ✅ Load from localStorage first
  useEffect(() => {
    const cached = getCachedCategories();
    if (cached) {
      setCachedDataState(cached);
    }
  }, []);

  // ✅ Call API ONLY if no cache
  const { data: categoryData } = useGetPublicProductCategoriesQuery(undefined, {
    skip: !!cachedData, // 👈 KEY LINE
  });

  // ✅ Save API response to cache
  useEffect(() => {
    if (categoryData?.data) {
      setCachedCategories(categoryData.data);
      setCachedDataState(categoryData.data);
    }
  }, [categoryData]);

  // ✅ Use cached OR API
  const categories = useMemo(() => {
    return cachedData || categoryData?.data || [];
  }, [cachedData, categoryData]);

  if (!categories.length) return null;

  const renderCategoryLink = (category) => {
    const displayName = category.name
      .replace(/embroidery designs/gi, '')
      .trim();
    return (
      <Link
        href={`/category/${category.slug}`}
        prefetch={false}
        className='font-bold capitalize underline text-base'
      >
        {displayName}
      </Link>
    );
  };

  const renderSubcategoryLinks = (category) => {
    if (!category?.subcategories?.length) return null;

    return category.subcategories.map((sub) => {
      const displayName = (sub.name || '')
        .replace(/embroidery design(s)?/gi, '') // remove “Embroidery Design(s)”
        .trim();

      return (
        <li key={sub._id ?? sub.slug}>
          <Link
            href={`/${category.slug}/${sub.slug}`}
            prefetch={false}
            className='hover:underline capitalize'
          >
            {displayName}
          </Link>
        </li>
      );
    });
  };

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
        <div className='container sm:flex flex-wrap items-center justify-center gap-x-10 py-4'>
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
