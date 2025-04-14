// app/products/page.tsx (or wherever your server page is)

import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import { cookies } from 'next/headers';

// Fetch products with pagination logic
export async function getProducts(currentPage = 0, perPageData = 8) {
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

    const allProducts = await response.json();

    // Pagination logic: get data for the current page
    const startIndex = currentPage * perPageData;
    const paginatedProducts = allProducts.data.slice(
      startIndex,
      startIndex + perPageData,
    );

    return { products: paginatedProducts, totalCount: allProducts.data.length };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export default async function AllProductsPage({ searchParams }) {
  // Default to the first page if no currentPage is provided
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 0;
  const perPageData = 40;
  const { products, totalCount } = await getProducts(currentPage, perPageData);

  return (
    <div className='min-h-screen flex flex-col justify-between'>
      <section className='text-black my-8 py-6 border-b-2'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10'>
            {products.map((item, index) => (
              <ProductCard key={index} item={item} />
            ))}
          </div>
        </div>
        {/* Pagination Component */}
        <div className='flex items-center justify-center mt-6'>
          <Pagination
            data={products} // Passing the products array to pagination
            currentPage={currentPage}
            // setCurrentPage={() => {}}
            perPageData={perPageData}
            totalCount={totalCount}
          />
        </div>
      </section>
    </div>
  );
}
