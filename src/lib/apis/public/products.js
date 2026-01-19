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

  console.log(result);

  const data = result?.data?.data ?? [];
  const meta = result?.data?.meta ?? {};
  return {
    products: data,
    totalCount: meta.total ?? 0,
    page: meta.page ?? 1,
    totalPages: meta.totalPages ?? 1,
  };
}
// admin choice products
export async function getAdminChoiceProducts(
  searchQuery,
  currentPage = 1,
  perPageData = 12,
) {
  try {
    const url = buildURL('/public/admin-choice/products', {
      search: searchQuery || undefined,
      page: currentPage,
      limit: perPageData,
    });

    // 2. Fetch the JSON data
    const result = await getJSON(url);

    console.log(result);

    // 3. Extract data from your standard response wrapper [web:47][web:52]
    // Your backend returns { data: { data: [...], meta: {...} } }
    const products = result?.data?.data ?? [];
    const meta = result?.data?.meta ?? {};

    return {
      products: products,
      totalCount: meta.total ?? 0,
      page: meta.page ?? 1,
      limit: meta.limit ?? perPageData,
      totalPages: meta.totalPages ?? 1,
    };
  } catch (error) {
    console.error('Error fetching admin choice products:', error);
    return {
      products: [],
      totalCount: 0,
      page: 1,
      totalPages: 1,
    };
  }
}

export async function getSingleProduct(productId) {
  const url = buildURL(`/public/product/${productId}`);
  return getJSON(url);
}

// get all products in sitemap
export async function getAllProductsPaginated() {
  let page = 1;
  const limit = 200;
  let allProducts = [];
  let totalPages = 1;

  do {
    try {
      const { products, totalPages: total } = await getProducts(
        null,
        page,
        limit,
      );
      allProducts.push(...products);
      totalPages = total;
      page++;

      // Optional: small delay to prevent rate-limiting/overload
      if (page % 5 === 0)
        await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      console.error(`Failed at page ${page}:`, err);
      // Logic for 1 retry if needed
      break;
    }
  } while (page <= totalPages);

  return allProducts;
}

// Fetch products for sitemap (only slug and updatedAt)
export async function getProductsForSitemap(skip = 0, limit = 2000) {
  const url = buildURL('/public/product/sitemap', {
    skip,
    limit,
  });

  try {
    const result = await getJSON(url);
    const data = result?.data ?? {};

    return {
      products: data.products ?? [],
      total: data.total ?? 0,
    };
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return { products: [], total: 0 };
  }
}
