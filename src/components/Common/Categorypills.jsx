'use client';

import { useGetPublicProductCategoriesQuery } from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import {
  getCachedCategories,
  setCachedCategories,
} from '@/lib/utils/categoryCache';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';


export default function CategoryPills() {
  const [cachedData, setCachedDataState] = useState(null);

  useEffect(() => {
    const cached = getCachedCategories();
    if (cached) {
      setCachedDataState(cached);
    }
  }, []);

  const { data: categoryData } = useGetPublicProductCategoriesQuery(undefined, {
    skip: !!cachedData,
  });

  useEffect(() => {
    if (categoryData?.data) {
      setCachedCategories(categoryData.data);
      setCachedDataState(categoryData.data);
    }
  }, [categoryData]);

  const categories = useMemo(
    () => cachedData || categoryData?.data || [],
    [cachedData, categoryData],
  );

  if (!categories.length) return null;

  return (
    <div className='flex flex-wrap justify-center gap-4'>
      {categories.map((category) => {
        const displayName = (category.name || '')
          .replace(/embroidery designs?/gi, '')
          .trim();

        return (
          <Link
            key={category._id ?? category.slug}
            href={`/category/${category.slug}`}
            prefetch={false}
            className='px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold capitalize transition-colors'
          >
            {displayName}
          </Link>
        );
      })}
    </div>
  );
}
