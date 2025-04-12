'use client';

import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';

export const BreadCrumb = () => {
  return (
    <div>
      <Breadcrumbs size='lg' className='flex'>
        <BreadcrumbItem href='/docs/components/button'>Button</BreadcrumbItem>
        <BreadcrumbItem href='/docs/components/breadcrumbs'>
          Breadcrumbs
        </BreadcrumbItem>
        <BreadcrumbItem href='/docs/components/card'>Card</BreadcrumbItem>
        <BreadcrumbItem href='/docs/components/checkbox'>
          Checkbox
        </BreadcrumbItem>
        <BreadcrumbItem href='/docs/components/code'>Code</BreadcrumbItem>
      </Breadcrumbs>
    </div>
  );
};
