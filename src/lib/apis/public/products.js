export async function getProducts(
  searchQuery,
  currentPage = 0,
  perPageData = 8,
) {
  try {
    const headers = new Headers();
    headers.set('Authorization', 'Bearer some-static-token');

    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('search', searchQuery);
    queryParams.append('page', (currentPage + 1).toString());
    queryParams.append('limit', perPageData.toString());

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/product?${queryParams.toString()}`;

    const response = await fetch(apiUrl, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    return {
      products: result.data.data,
      totalCount: result.data.meta.total,
      page: result.data.meta.page,
      totalPages: result.data.meta.totalPages,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}
export async function getPopularProducts(
  searchQuery,
  currentPage = 0,
  perPageData = 10,
) {
  try {
    const headers = new Headers();
    headers.set('Authorization', 'Bearer some-static-token');

    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('search', searchQuery);
    queryParams.append('page', (currentPage + 1).toString());
    queryParams.append('limit', perPageData.toString());

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/popular/products?${queryParams.toString()}`;

    const response = await fetch(apiUrl, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    return {
      products: result.data.data,
      totalCount: result.data.meta.total,
      page: result.data.meta.page,
      totalPages: result.data.meta.totalPages,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getSingleProduct(productId) {
  try {
    const headers = new Headers();
    headers.set('Authorization', 'Bearer some-static-token');

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
