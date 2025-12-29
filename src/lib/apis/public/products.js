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

export async function getAllProductsForDashboard(
  searchQuery,
  currentPage,
  perPageData,
  categoryId,
  subCategoryId,
) {
  const url = buildURL('/public/product', {
    search: searchQuery || undefined,
    page: currentPage || 1,
    limit: perPageData || 8,
    category: categoryId || undefined,
    sub_category: subCategoryId || undefined,
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
