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
import { useCallback } from 'react';

export default function ProductsTableWrapper({
  columns,
  searchableFieldsName,
  pageNumber,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔎 Read params from URL (no local page state)
  const rowsPerPage = 10;
  const searchValue = searchParams.get('search') || '';
  const pageParam = Number(searchParams.get('page') || '1');

  // 🔁 Fetch from server with search + pagination
  const { data: allProducts, refetch: allProductRefetch } = useAllProductsQuery(
    {
      search: searchValue,
      page: pageParam,
      limit: rowsPerPage,
    },
  );

  const serverData = allProducts?.data?.data ?? [];
  const totalPages = allProducts?.data?.meta?.totalPages ?? 1;

  // 🔤 Search updates URL (and resets page=1)
  const onSearchChange = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set('search', value);
      else params.delete('search');
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  // 🔢 Page change updates URL (UserTable calls this)
  const onPageChange = useCallback(
    (newPage) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', String(newPage));
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const [deleteProduct] = useDeleteProductMutation();

  const renderCell = useCallback(
    (product, columnKey) => {
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
                    onPress={() =>
                      router.push(
                        `/admin/add-products?productId=${product._id}&ts=${Date.now()}&pageNumber=${pageNumber}`,
                      )
                    }
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
                        if (response?.error) {
                          ErrorToast(
                            'Error',
                            response.error.data?.message || 'Delete failed',
                            3000,
                          );
                        } else {
                          // Optional optimistic cache update (must match endpoint key + args)
                          try {
                            productSlice.util.updateQueryData(
                              'allProducts',
                              {
                                search: searchValue,
                                page: pageParam,
                                limit: rowsPerPage,
                              },
                              (draft) => {
                                if (draft?.data?.data) {
                                  draft.data.data = draft.data.data.filter(
                                    (i) => i._id !== product?._id,
                                  );
                                }
                                if (draft?.data?.meta?.total != null) {
                                  draft.data.meta.total = Math.max(
                                    0,
                                    draft.data.meta.total - 1,
                                  );
                                  draft.data.meta.totalPages = Math.max(
                                    1,
                                    Math.ceil(
                                      draft.data.meta.total / rowsPerPage,
                                    ),
                                  );
                                }
                              },
                            );
                          } catch {}
                          SuccessToast(
                            'Deleted',
                            response.data?.message || 'Product deleted',
                            3000,
                          );
                          await allProductRefetch();
                          router.push(`/admin/all-products?page=${pageParam}`); // stay on same page after deletion
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
    },
    [deleteProduct, pageParam, rowsPerPage, router, searchValue],
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

      {/* ✅ Your reusable table stays untouched */}
      <UserTable
        data={serverData}
        columns={columns}
        pageSize={rowsPerPage}
        renderCell={renderCell}
        searchableFieldsName={searchableFieldsName}
        onSearchChange={onSearchChange}
        pagination={{ totalPages, currentPage: pageParam }}
        onPageChange={onPageChange}
      />
    </>
  );
}
