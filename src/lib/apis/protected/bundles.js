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

export async function getAllBundlesForDashboard(search, page, limit) {
  try {
    const url = buildURL('/public/bundles', {
      page,
      limit,
      ...(search && { search }),
    });

    const data = await getJSON(url);

    return {
      bundles: data?.data?.bundles || [],
      pagination: {
        total: data?.data?.pagination?.total || 0,
        page: data?.data?.pagination?.page || page,
        limit: data?.data?.pagination?.limit || limit,
        totalPages: data?.data?.pagination?.totalPages || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return {
      bundles: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

export async function getSingleBundle(bundleSlug) {
  try {
    const url = buildURL(`/public/bundles/${bundleSlug}`);
    const data = await getJSON(url);

    return data?.data?.bundle || null;
  } catch (error) {
    console.error(`Error fetching bundle ${bundleSlug}:`, error);
    return null;
  }
}
