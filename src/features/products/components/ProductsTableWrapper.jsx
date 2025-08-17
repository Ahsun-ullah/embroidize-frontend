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
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';

export default function ProductsTableWrapper({
  columns,
  searchableFieldsName,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [deleteProduct] = useDeleteProductMutation();
  const { data: allProducts, refetch: allProductRefetch } =
    useAllProductsQuery();

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const onSearchChange = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      setPage(1);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const onPageChange = useCallback(
    (newPage) => {
      setPage(newPage);
    },
    [],
  );

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return allProducts?.data?.data?.slice(start, end) || [];
  }, [allProducts?.data?.data, page, rowsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil((allProducts?.data?.data?.length || 0) / rowsPerPage);
  }, [allProducts?.data?.data?.length, rowsPerPage]);

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
        data={paginatedData}
        columns={columns}
        pageSize={rowsPerPage}
        renderCell={renderCell}
        searchableFieldsName={searchableFieldsName}
        onSearchChange={onSearchChange}
        pagination={{ totalPages: totalPages, currentPage: page }}
        onPageChange={onPageChange}
      />
    </>
  );
}