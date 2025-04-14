'use client';
import { useGetPublicProductCategoriesQuery } from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import { Dropdown, DropdownTrigger, Link } from '@heroui/react';
import { useState } from 'react';

const CategorySelect = () => {
  const [openCategory, setOpenCategory] = useState(null);
  const { data: categoryData } = useGetPublicProductCategoriesQuery();

  return (
    <>
      {categoryData?.data.map((category) => (
        <div
          key={category._id}
          className=''
          onMouseEnter={() => setOpenCategory(category._id)}
          onMouseLeave={() => setOpenCategory(null)}
        >
          <Dropdown isOpen={openCategory === category._id}>
            <DropdownTrigger>
              <Link
                color='foreground'
                href={`/user/category-products/${category?._id}`}
                className='capitalize'
              >
                {category.name}
              </Link>
            </DropdownTrigger>
            {/* <DropdownMenu aria-label={`${category.name} Subcategories`}>
              {category.subcategories &&
                category.subcategories.map((subcategory) => (
                  <DropdownItem
                    key={subcategory._id}
                    href={subcategory.href}
                    className='capitalize'
                  >
                    {subcategory.name}
                  </DropdownItem>
                ))}
            </DropdownMenu> */}
          </Dropdown>
        </div>
      ))}
    </>
  );
};

export default CategorySelect;
