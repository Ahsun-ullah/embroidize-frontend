import { getProducts } from '@/app/apis/public/products/page';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ProductsTableWrapper from '@/features/products/components/ProductsTableWrapper';
import { Suspense } from 'react';

export default async function AllProductsListPage() {
  const allProducts = await getProducts();

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
      <Suspense fallback={<LoadingSpinner />}>
        <ProductsTableWrapper
          initialData={allProducts?.data}
          columns={columns}
          pageSize={5}
          searchableFieldsName={['name', 'category', 'price', 'tags']}
        />
      </Suspense>
    </div>
  );
}
