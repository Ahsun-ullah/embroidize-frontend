import { cookies } from 'next/headers';

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

    console.log(allProducts);
    console.log(paginatedProducts);

    return { products: paginatedProducts, totalCount: allProducts.data.length };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getSingleProduct(productId) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    const headers = new Headers();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/product/${productId}`,
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
    console.error('Error fetching product:', error);
    throw error;
  }
}
