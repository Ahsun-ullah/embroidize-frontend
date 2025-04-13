'use client';

import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';

export const BreadCrumb = ({ items = [] }) => {
  return (
    <div>
      <Breadcrumbs size='lg' className='flex'>
        {items.map((item, index) => (
          <BreadcrumbItem href={item.href} key={index}>
            {item.label}
          </BreadcrumbItem>
        ))}
      </Breadcrumbs>
    </div>
  );
};
