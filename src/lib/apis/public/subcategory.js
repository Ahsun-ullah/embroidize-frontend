export async function getSubCategories(
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

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/product-subCategory?${queryParams.toString()}`;

    const response = await fetch(apiUrl, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    return {
      subCategories: result.data,
      //   totalCount: result.meta.length,
      //   page: result.meta.page,
      //   totalPages: result.data.meta.totalPages,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getSingleSubCategory(slug) {
  try {
    const headers = new Headers();
    headers.set('Authorization', 'Bearer some-static-token');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/product-subcategory/${slug}`,
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

export async function getAllProductsBySubCategory(
  slug,
  currentPage,
  perPageData,
) {
  console.log('slug', slug);
  try {
    const headers = new Headers();
    headers.set('Authorization', 'Bearer some-static-token');

    // Correct way to build query parameters
    const queryParams = new URLSearchParams();
    if (currentPage) queryParams.append('page', currentPage.toString());
    if (perPageData) queryParams.append('limit', perPageData.toString());

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/products-by-sub-category/${slug}?${queryParams.toString()}`;

    console.log(apiUrl);

    const response = await fetch(apiUrl, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    return {
      products: result.data.products,
      totalCount: result.data.pagination.totalItems,
      page: result.data.pagination.currentPage,
      totalPages: result.data.pagination.totalPages,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}
