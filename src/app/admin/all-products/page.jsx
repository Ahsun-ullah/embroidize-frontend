'use client';
import GlobalLoadingPage from '@/components/Common/GlobalLoadingPage';
import ProductsTableWrapper from '@/features/products/components/ProductsTableWrapper';
import { useAllProductsQuery } from '@/lib/redux/public/products/productSlice';

export default function AllProductsListPage() {
  const { data: allProducts, isLoading: allProductsIsloading } =
    useAllProductsQuery();

  console.log(allProducts);

  const columns = [
    { name: 'NAME', uid: 'name' },
    { name: 'CATEGORY', uid: 'category' },
    { name: 'SUB CATEGORY', uid: 'sub_category' },
    { name: 'PRICE', uid: 'price' },
    { name: 'DESCRIPTION', uid: 'description' },
    { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div className='flex flex-col gap-3'>
      {allProductsIsloading ? (
        <GlobalLoadingPage />
      ) : (
        <ProductsTableWrapper
          initialData={allProducts?.data ?? []}
          columns={columns}
          pageSize={5}
          searchableFieldsName={['name', 'category', 'price', 'tags']}
        />
      )}
    </div>
  );
}
