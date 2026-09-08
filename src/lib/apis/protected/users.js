import { cookies } from 'next/headers';

export async function getUsers(
  page = 1,
  perPage = 10,
  search = '',
  minDownloads = '',
  startDate = '',
  endDate = '',
  blocked = false,
) {
  'use server';
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const headers = new Headers();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const url = new URL(`${apiUrl}/all-users`);

    // Append all params
    url.searchParams.set('page', String(page));
    url.searchParams.set('perPage', String(perPage));
    if (search) url.searchParams.set('search', search);
    if (minDownloads) url.searchParams.set('minDownloads', minDownloads);
    if (startDate) url.searchParams.set('startDate', startDate);
    if (endDate) url.searchParams.set('endDate', endDate);
    if (blocked) url.searchParams.set('blocked', '1');

    const response = await fetch(url.toString(), {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseData = await response.json();

    // Structure matches the new backend response
    return {
      data: responseData?.data?.users,
      pagination: responseData?.data?.pagination,
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: [], pagination: { total: 0, totalPages: 0 } };
  }
}

export async function getDashboardStatsAPI() {
  'use server';
  try {
    const cookieStore = await cookies(); // Next.js 15 fix
    const token = cookieStore.get('token')?.value;
    const headers = new Headers();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    // Call the NEW endpoint
    const response = await fetch(`${apiUrl}/dashboard-stats`, {
      headers,
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    const data = await response.json();
    return data.data; // Returns { totalUsers, formattedUserData, etc. }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

export async function getDownloadStats(
  page = 1,
  perPage = 10,
  search = '',
  startDate = '',
  endDate = '',
  userTier = '',
  productTier = '',
) {
  'use server';

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
      process.env.NEXT_PUBLIC_BASE_API_URL;

    const url = new URL(`${apiUrl}/stats/downloads/products`);

    url.searchParams.set('page', String(page));
    url.searchParams.set('perPage', String(perPage));
    if (search) url.searchParams.set('search', search);
    if (startDate) url.searchParams.set('startDate', startDate);
    if (endDate) url.searchParams.set('endDate', endDate);
    if (userTier) url.searchParams.set('userTier', userTier);
    if (productTier) url.searchParams.set('productTier', productTier);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return {
        data: [],
        pagination: { total: 0, page, perPage, totalPages: 0 },
      };
    }

    const responseData = await response.json();

    return {
      data: responseData?.data?.data || [],
      pagination: responseData?.data?.pagination || { total: 0, totalPages: 0 },
      filter: responseData?.data?.filter,
    };
  } catch (error) {
    console.error('Error fetching paginated stats:', error);
    return { data: [], pagination: { total: 0, totalPages: 0 } };
  }
}

// Download breakdown: subscriber vs free downloader, premium vs free design.
// Takes the same date range as getDownloadStats so both halves of the Downloads
// page always describe the same window.
export async function getDownloadBreakdown(startDate = '', endDate = '') {
  'use server';

  const empty = {
    totals: { downloads: 0, uniqueUsers: 0, uniqueProducts: 0 },
    byUserTier: [],
    byProductTier: [],
    matrix: [],
  };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
      process.env.NEXT_PUBLIC_BASE_API_URL;

    const url = new URL(`${apiUrl}/stats/downloads/breakdown`);
    if (startDate) url.searchParams.set('startDate', startDate);
    if (endDate) url.searchParams.set('endDate', endDate);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return empty;
    }

    const responseData = await response.json();
    return responseData?.data || empty;
  } catch (error) {
    console.error('Error fetching download breakdown:', error);
    return empty;
  }
}
