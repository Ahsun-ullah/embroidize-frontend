'use client';

import { useGetPublicProductCategoriesQuery } from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import Link from 'next/link';

export default function CategoryMenu({ isMobileMenuOpen }) {
  const { data: categoryData } = useGetPublicProductCategoriesQuery();

  return (
    <>
      {isMobileMenuOpen ? (
        <div
          className={`${isMobileMenuOpen ? 'block' : 'hidden'} container mx-auto flex flex-wrap items-center justify-center gap-x-6  `}
        >
          <div className='grid grid-cols-2 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 gap-6 p-6 text-sm'>
            {categoryData?.data?.map((category) => (
              <div
                key={category?._id}
                className='space-y-4 border-gray-400 border-r-1 pr-4'
              >
                <Link
                  href={`/category/${category?._id}?searchQuery=${category?.name.split(' ').join('+')}`}
                  className='font-bold capitalize  '
                >
                  {category?.name}
                </Link>
                <ul className='space-y-2'>
                  {category?.subcategories?.map((sub) => (
                    <li key={sub?._id}>
                      <Link
                        href={`/subcategory/${sub?._id}?searchQuery=${sub?.name.split(' ').join('+')}`}
                        className='hover:underline capitalize'
                      >
                        {sub?.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='flex flex-wrap items-center justify-center gap-x-10 py-4'>
          {categoryData?.data?.map((category) => (
            <Link
              key={category?._id}
              color='foreground'
              href={`/category/${category?._id}?searchQuery=${category?.name.split(' ').join('+')}`}
              className='capitalize'
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
