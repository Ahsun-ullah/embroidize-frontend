'use client';
import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import UserTable from '@/components/Common/Table';
import { PlusIcon, VerticalDotsIcon } from '@/components/icons';
import { useDeleteProductMutation } from '@/lib/redux/admin/protectedProducts/protectedProductSlice';
import {
  productSlice,
  useAllProductsQuery,
} from '@/lib/redux/public/products/productSlice';
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
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function ProductsTableWrapper({
  columns,
  pageSize,
  searchableFieldsName,
}) {
  const router = useRouter();

  const [deleteProduct] = useDeleteProductMutation();
  const { data: allProducts, refetch: allProductRefetch } =
    useAllProductsQuery();

  const [filteredData, setFilteredData] = useState(allProducts?.data?.data);

  useEffect(() => {
    setFilteredData(allProducts?.data?.data);
  }, [allProducts?.data?.data]);

  const filterData = useCallback(
    (value) => {
      try {
        if (!value) {
          setFilteredData(allProducts?.data?.data);
          return;
        }

        const filtered = allProducts?.data?.data?.filter((product) => {
          const availableFields = searchableFieldsName.filter(
            (field) =>
              product.hasOwnProperty(field) &&
              product[field] !== undefined &&
              product[field] !== null,
          );
          return availableFields.some((field) =>
            product[field]
              ?.toString()
              .toLowerCase()
              .includes(value.toLowerCase()),
          );
        });
        setFilteredData(filtered);
      } catch (error) {
        console.error('Error filtering data:', error);
        setFilteredData(allProducts?.data?.data);
      }
    },
    [allProducts?.data?.data, searchableFieldsName],
  );

  const renderCell = useCallback(
    (product, columnKey) => {
      try {
        const cellValue = product[columnKey];

        switch (columnKey) {
          case 'name':
            return (
              <User
                avatarProps={{ radius: 'lg', src: product?.image?.url }}
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
            return <span>{capitalize(product?.category?.name)}</span>;
          case 'sub_category':
            return <span>{capitalize(product?.sub_category?.name)}</span>;
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
                    <DropdownItem
                      key='edit'
                      onPress={() => {
                        router.push(
                          `/admin/add-products?productId=${product._id}&ts=${Date.now()}`,
                        );
                      }}
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key='delete'
                      onPress={async () => {
                        try {
                          const response = await deleteProduct(
                            product?._id,
                          ).unwrap();
                          if (response.error) {
                            ErrorToast(
                              'Error',
                              response.error.data?.message || 'Delete failed',
                              3000,
                            );
                          } else {
                            // Optimistically update the cache
                            productSlice.util.updateQueryData(
                              'getAllProducts',
                              undefined,
                              (draft) => {
                                draft.data = draft.data.filter(
                                  (item) => item._id !== product?._id,
                                );
                              },
                            );
                            // Update local filteredData
                            setFilteredData((prev) =>
                              prev?.filter((item) => item._id !== product?._id),
                            );
                            SuccessToast(
                              'Deleted',
                              response.data?.message || 'Product deleted',
                              3000,
                            );
                            // Refetch to confirm server state
                            await allProductRefetch();
                          }
                        } catch (error) {
                          ErrorToast(
                            'Error',
                            error?.message || 'Something went wrong',
                            3000,
                          );
                        }
                      }}
                    >
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
    },
    [deleteProduct, router],
  );

  return (
    <>
      <div className='flex justify-between items-center mb-4'>
        <h1>All Products</h1>
        <Link href='/admin/add-products' prefetch={false}>
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
        data={filteredData || []}
        columns={columns}
        pageSize={pageSize}
        renderCell={renderCell}
        searchableFieldsName={searchableFieldsName}
        onSearchChange={filterData}
      />
    </>
  );
}
