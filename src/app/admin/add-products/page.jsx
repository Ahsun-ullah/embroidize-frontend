import { ProductsForm } from '@/features/products/components/ProductsForm';

async function singleProductFetch(productId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/product/${productId}`,
    {
      method: 'GET',
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
