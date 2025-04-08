'use client';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
} from '@heroui/react';
import { useState } from 'react';

const CategorySelect = () => {
  const categories = [
    {
      id: 'cat1',
      name: 'Clothing',
      subcategories: [
        { id: 'sub1', name: 'Shirts', href: '/clothing/shirts' },
        { id: 'sub2', name: 'Pants', href: '/clothing/pants' },
        { id: 'sub3', name: 'Jackets', href: '/clothing/jackets' },
      ],
    },
    {
      id: 'cat2',
      name: 'Accessories',
      subcategories: [
        { id: 'sub4', name: 'Hats', href: '/accessories/hats' },
        { id: 'sub5', name: 'Bags', href: '/accessories/bags' },
      ],
    },
    {
      id: 'cat3',
      name: 'Electronics',
      subcategories: [
        { id: 'sub6', name: 'Phones', href: '/electronics/phones' },
        { id: 'sub7', name: 'Laptops', href: '/electronics/laptops' },
      ],
    },
  ];

  const [openCategory, setOpenCategory] = useState(null);

  return (
    <div className='dropdown-container flex gap-4'>
      {categories.map((category) => (
        <div
          key={category.id}
          className='dropdown-wrapper'
          onMouseEnter={() => setOpenCategory(category.id)}
          onMouseLeave={() => setOpenCategory(null)}
        >
          <Dropdown isOpen={openCategory === category.id}>
            <DropdownTrigger>
              <Link color='foreground' href='#' className='capitalize'>
                {category.name}
              </Link>
            </DropdownTrigger>
            <DropdownMenu aria-label={`${category.name} Subcategories`}>
              {category.subcategories.map((subcategory) => (
                <DropdownItem
                  key={subcategory.id}
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
