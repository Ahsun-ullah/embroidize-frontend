'use client';
import UserTable from '@/components/Common/Table';
import { VerticalDotsIcon } from '@/components/icons';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from '@heroui/react';
import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MostDownloadedProductsTableWrapper({
  initialData,
  columns,
  pageSize,
  searchableFieldsName,
  pagination,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSearchChange = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const onPageChange = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', page.toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const renderCell = useCallback((item, columnKey) => {
    try {
      const cellValue = item.product[columnKey];

      switch (columnKey) {
        case 'name':
          return (
            <User
              avatarProps={{ radius: 'lg', src: item.product.image?.url }}
              name={cellValue}
            >
              {item.product.name}
            </User>
          );
        case 'category':
          return <>{item.product.category?.name || '-'}</>;
        case 'sub_category':
          return <>{item.product.sub_category?.name || '-'}</>;
        case 'totalDownloads':
          return <>{item.totalDownloads}</>;
        case 'fileTypes':
          return <>{item.fileTypes?.join(', ') || '-'}</>;
        case 'actions':
          return (
            <div className='relative flex justify-center items-center gap-2'>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size='sm' variant='light'>
                    <VerticalDotsIcon className='text-default-300' />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key='view'>View</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    } catch (error) {
      console.error(`Error rendering cell ${columnKey}:`, error);
      return <span>Error</span>;
    }
  }, []);

  return (
    <>
      <div className='flex justify-between items-center'>
        <h1>Most Downloaded Products</h1>
      </div>
      <UserTable
        data={initialData}
        columns={columns}
        pageSize={pageSize}
        renderCell={renderCell}
        searchableFieldsName={searchableFieldsName}
        onSearchChange={onSearchChange}
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </>
  );
}