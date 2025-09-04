// export async function getProducts(searchQuery, currentPage, perPageData) {
//   try {
//     const headers = new Headers();
//     headers.set('Authorization', 'Bearer some-static-token');

//     const queryParams = new URLSearchParams();
//     if (searchQuery) queryParams.append('search', searchQuery);
//     if (currentPage) queryParams.append('page', currentPage.toString());
//     if (perPageData) queryParams.append('limit', perPageData.toString());

//     const apiUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/product?${queryParams.toString()}`;

//     console.log(apiUrl);

//     const response = await fetch(apiUrl, {
//       headers,
//       cache: 'no-store',
//       next: { revalidate: 0 },
//     });

//     if (!response.ok) {
//       throw new Error(`API request failed with status ${response.status}`);
//     }

//     const result = await response.json();

//     return {
//       products: result.data.data,
//       totalCount: result.data.meta.total,
//       page: result.data.meta.page,
//       totalPages: result.data.meta.totalPages,
//     };
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     throw error;
//   }
// }

// export async function getPopularProducts(
//   searchQuery,
//   currentPage,
//   perPageData,
// ) {
//   try {
//     const headers = new Headers();
//     headers.set('Authorization', 'Bearer some-static-token');

//     const queryParams = new URLSearchParams();
//     if (searchQuery) queryParams.append('search', searchQuery);
//     queryParams.append('page', currentPage.toString());
//     queryParams.append('limit', perPageData.toString());

//     const apiUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/popular/products?${queryParams.toString()}`;

//     console.log(apiUrl);

//     const response = await fetch(apiUrl, {
//       headers,
//       cache: 'no-store',
//       next: { revalidate: 0 },
//     });

//     if (!response.ok) {
//       throw new Error(`API request failed with status ${response.status}`);
//     }

//     const result = await response.json();

//     return {
//       products: result.data.data,
//       totalCount: result.data.meta.total,
//       page: result.data.meta.page,
//       totalPages: result.data.meta.totalPages,
//     };
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     throw error;
//   }
// }

// export async function getSingleProduct(productId) {
//   try {
//     const headers = new Headers();
//     headers.set('Authorization', 'Bearer some-static-token');

//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/product/${productId}`,
//       {
//         headers,
//         cache: 'no-store',
//         next: { revalidate: 0 },
//       },
//     );

//     if (!response.ok) {
//       throw new Error(`API request failed with status ${response.status}`);
//     }

//     return response.json();
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     throw error;
//   }
// }

import 'server-only';

const BASE = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
const AUTH = 'Bearer some-static-token';

function buildURL(path, params) {
  const url = new URL(`${BASE}${path}`);
  if (params)
    Object.entries(params).forEach(
      ([k, v]) => v != null && url.searchParams.append(k, String(v)),
    );
  return url.toString();
}

async function getJSON(url) {
  const res = await fetch(url, {
    headers: { Authorization: AUTH },
    cache: 'no-store',
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`API ${url} failed: ${res.status}`);
  return res.json();
}

export async function getProducts(searchQuery, currentPage, perPageData) {
  const url = buildURL('/public/product', {
    search: searchQuery || undefined,
    page: currentPage || 1,
    limit: perPageData || 8,
  });

  const result = await getJSON(url);

  const data = result?.data?.data ?? [];
  const meta = result?.data?.meta ?? {};
  return {
    products: data,
    totalCount: meta.total ?? 0,
    page: meta.page ?? 1,
    totalPages: meta.totalPages ?? 1,
  };
}

export async function getPopularProducts(
  searchQuery,
  currentPage,
  perPageData,
) {
  const url = buildURL('/public/popular/products', {
    search: searchQuery || undefined,
    page: currentPage || 1,
    limit: perPageData || 12,
  });

  const result = await getJSON(url);

  const data = result?.data?.data ?? [];
  const meta = result?.data?.meta ?? {};
  return {
    products: data,
    totalCount: meta.total ?? 0,
    page: meta.page ?? 1,
    totalPages: meta.totalPages ?? 1,
  };
}

export async function getSingleProduct(productId) {
  const url = buildURL(`/public/product/${productId}`);
  return getJSON(url);
}

// get all products in sitemap
export async function getAllProductsPaginated() {
  let page = 1;
  const limit = 500;
  let allProducts = [];
  let totalPages = 1;

  do {
    const { products, totalPages: total } = await getProducts(
      null,
      page,
      limit,
    );
    allProducts.push(...products);
    totalPages = total;
    page++;
  } while (page <= totalPages);

  return allProducts;
}
