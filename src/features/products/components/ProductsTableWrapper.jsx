'use client';
import UserTable from '@/components/Common/Table';
import { PlusIcon, VerticalDotsIcon } from '@/components/icons';
import { productStatusColor } from '@/utils/colorStatus/page';
import { capitalize } from '@/utils/functions/page';
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from '@heroui/react';
import Link from 'next/link';
import { useCallback, useState } from 'react';

export default function ProductsTableWrapper({
  initialData,
  columns,
  pageSize,
  searchableFieldsName,
}) {
  const [filteredData, setFilteredData] = useState(initialData);

  const filterData = useCallback(
    (value) => {
      try {
        if (!value) {
          setFilteredData(initialData);
          return;
        }

        const filtered = initialData.filter((product) => {
          const availableFields = searchableFieldsName.filter(
            (field) =>
              product.hasOwnProperty(field) &&
              product[field] !== undefined &&
              product[field] !== null,
          );
          return availableFields.some((field) =>
            product[field]
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase()),
          );
        });
        setFilteredData(filtered);
      } catch (error) {
        console.error('Error filtering data:', error);
        setFilteredData(initialData);
      }
    },
    [initialData, searchableFieldsName],
  );

  const renderCell = useCallback((product, columnKey) => {
    try {
      const cellValue = product[columnKey];

      switch (columnKey) {
        case 'name':
          return (
            <User
              avatarProps={{ radius: 'lg', src: product.images[0].url }}
              name={cellValue}
            >
              {product.name}
            </User>
          );
        case 'status':
          return (
            <Chip
              className='capitalize'
              color={productStatusColor[product.status]}
              size='sm'
              variant='flat'
            >
              {capitalize(product.status)}
            </Chip>
          );
        case 'category':
          return <span>{capitalize(product.category?.value)}</span>;
        case 'tags':
          return (
            <span>
              {product.tags?.map((tag) => capitalize(tag)).join(', ')}
            </span>
          );

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
                  <DropdownItem key='edit' onPress={() => {}}>
                    Edit
                  </DropdownItem>
                  <DropdownItem key='delete' onPress={() => {}}>
                    Delete
                  </DropdownItem>
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
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h1>All Products</h1>
        <Link href='/admin/add-products'>
          <Button
            className='bg-foreground text-background'
            endContent={<PlusIcon />}
            size='sm'
          >
            Add New
          </Button>
        </Link>
      </div>
      <UserTable
        data={filteredData}
        columns={columns}
        pageSize={pageSize}
        renderCell={renderCell}
        searchableFieldsName={searchableFieldsName}
        onSearchChange={filterData}
      />
    </div>
  );
}
