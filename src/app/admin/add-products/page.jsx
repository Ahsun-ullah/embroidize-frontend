import { ProductsForm } from '@/features/products/components/ProductsForm';
import { cookies } from 'next/headers';

// Sends the admin's session token. The product endpoint now answers 404 for an
// unpublished product unless the caller proves it is staff — without this, the
// edit form would 404 on exactly the products that most need editing.
async function singleProductFetch(productId) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/product/${productId}`,
    {
      method: 'GET',
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    },
  );

  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }

  return res.json();
}

export default async function ContactsPage({ searchParams }) {
  const productId = searchParams.productId;

  // const _ = searchParams.ts;

  const singleProductData = productId
    ? await singleProductFetch(productId)
    : null;

  return (
    <div className='w-full flex flex-col gap-4'>
      <h1 className='text-lg font-medium tracking-tight leading-5'>
        Product Form
      </h1>
      <ProductsForm product={singleProductData?.data} />
    </div>
  );
}
