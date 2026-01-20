import { cookies } from 'next/headers';

export async function getAllCustomOrdersForDashboard(
  search = '',
  page = 1,
  limit = 20,
  status = 'all',
  sortBy = 'createdAt',
  order = 'desc',
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const url = new URL(`${apiUrl}/admin/orders/custom`);

    console.log(url);

    // Append query parameters matching your backend API
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('order', order);

    if (search) {
      url.searchParams.set('search', search);
    }

    if (status && status !== 'all') {
      url.searchParams.set('status', status);
    }

    const response = await fetch(url.toString(), {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseData = await response.json();

    if (!responseData.success) {
      throw new Error(
        responseData.message || 'API returned unsuccessful response',
      );
    }

    const pagination = responseData?.data?.pagination || {};

    return {
      orders: responseData?.data?.orders || [],
      pagination: {
        total: pagination.total || 0,
        page: pagination.page || page,
        limit: pagination.limit || limit,
        totalPages: pagination.pages || 0, // Backend returns 'pages'
      },
    };
  } catch (error) {
    console.error('Error fetching custom orders:', error);
    return {
      orders: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }
}

export async function getCustomOrderStats() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const url = `${apiUrl}/admin/orders/custom/stats`;

    const response = await fetch(url, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseData = await response.json();

    if (!responseData.success) {
      throw new Error(
        responseData.message || 'API returned unsuccessful response',
      );
    }

    return {
      stats: responseData?.data || {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
      },
    };
  } catch (error) {
    console.error('Error fetching custom order stats:', error);
    return {
      stats: {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
      },
    };
  }
}
