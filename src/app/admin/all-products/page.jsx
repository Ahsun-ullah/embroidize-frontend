import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ProductsTableWrapper from '@/features/products/components/ProductsTableWrapper';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

export async function getProducts() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    const headers = new Headers();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/product`,
      {
        headers,
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

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
