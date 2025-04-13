'use client';
import { useGetPublicProductCategoriesQuery } from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
} from '@heroui/react';
import { useState } from 'react';

const CategorySelect = () => {
  const [openCategory, setOpenCategory] = useState(null);
  const { data: categoryData } = useGetPublicProductCategoriesQuery();

  return (
    <div className='dropdown-container flex gap-10'>
      {categoryData?.data.map((category) => (
        <div
          key={category._id}
          className='dropdown-wrapper'
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
            <DropdownMenu aria-label={`${category.name} Subcategories`}>
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
            </DropdownMenu>
          </Dropdown>
        </div>
      ))}
    </div>
  );
};

export default CategorySelect;
