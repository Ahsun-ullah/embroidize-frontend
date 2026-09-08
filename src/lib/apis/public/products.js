import 'server-only';
import { cookies } from 'next/headers';

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

async function getJSON(url, { authenticated = false, allow404 = false } = {}) {
  // AUTH is a placeholder string that proves nothing; it is kept only because
  // the public endpoints ignore it. Anything asking to see unpublished
  // products has to send the caller's real session token instead.
  let authorization = AUTH;
  if (authenticated) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: authorization },
    cache: 'no-store',
    next: { revalidate: 0 },
  });
  // For a single resource, 404 is an answer rather than a failure. Callers that
  // opt in get null and can render a proper not-found page; throwing sends them
  // into the error boundary instead, which is a different page AND a different
  // status code.
  if (allow404 && res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${url} failed: ${res.status}`);
  return res.json();
}

// `filters` carries the sidebar state (category, sub_category, tier, curated,
// favourited, since, sort). It is optional, so existing callers that only
// paginate keep working unchanged.
export async function getProducts(
  searchQuery,
  currentPage,
  perPageData,
  filters = {},
) {
  const url = buildURL('/public/product', {
    search: searchQuery || undefined,
    page: currentPage || 1,
    limit: perPageData || 8,
    ...filters,
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

// Option counts for the filter sidebar, computed against the same filter state
// as the grid so the numbers match what a click actually returns. Never throws:
// the page must still render if this call fails, just without counts.
export async function getProductFilters(searchQuery, filters = {}) {
  try {
    const url = buildURL('/public/product/filters', {
      search: searchQuery || undefined,
      ...filters,
    });
    const result = await getJSON(url);
    return result?.data ?? null;
  } catch (error) {
    console.error('Error fetching product filters:', error);
    return null;
  }
}

export async function getAllProductsForDashboard(
  searchQuery,
  currentPage,
  perPageData,
  categoryId,
  subCategoryId,
  status,
) {
  const url = buildURL('/public/product', {
    search: searchQuery || undefined,
    page: currentPage || 1,
    limit: perPageData || 8,
    category: categoryId || undefined,
    sub_category: subCategoryId || undefined,
    // 'active' | 'inactive'; omitted means both. The backend only reads this
    // alongside includeHidden, so it cannot be used to browse hidden products
    // from a public URL.
    status: status || undefined,
    // Admin dashboard sees ALL products, including unpublished (inactive) ones;
    // public listings only ever show active products. The API grants this only
    // to a live admin session, hence the authenticated call below.
    includeHidden: 1,
  });

  const result = await getJSON(url, { authenticated: true });

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
export async function getMostFavoritedProducts(
  searchQuery,
  currentPage = 1,
  perPageData = 12,
) {
  try {
    const url = buildURL('/public/most-favorited/products', {
      search: searchQuery || undefined,
      page: currentPage,
      limit: perPageData,
    });

    const result = await getJSON(url);

    const products = result?.data?.data ?? [];
    const meta = result?.data?.meta ?? {};

    return {
      products,
      totalCount: meta.total ?? 0,
      page: meta.page ?? 1,
      limit: meta.limit ?? perPageData,
      totalPages: meta.totalPages ?? 1,
    };
  } catch (error) {
    console.error('Error fetching most favourited products:', error);
    return {
      products: [],
      totalCount: 0,
      page: 1,
      totalPages: 1,
    };
  }
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
  // A 404 here means the design does not exist, or is unpublished and
  // therefore invisible to the public. Both must reach notFound() so Next
  // answers with a real 404 status.
  //
  // Before this, the throw was caught by the error boundary, which renders an
  // error page under HTTP 200 — a soft 404. Search engines treat that as a
  // live page and keep it indexed, which is precisely the wrong outcome for a
  // design that was taken down.
  return getJSON(url, { allow404: true });
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
