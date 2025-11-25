import { cookies } from 'next/headers';

export async function getUsers(
  page = 1,
  perPage = 10,
  search = '',
  minDownloads = '',
  startDate = '',
  endDate = '',
) {
  'use server';
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const headers = new Headers();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const url = new URL(`${apiUrl}/all-users`);

    console.log(url);

    // Append all params
    url.searchParams.set('page', String(page));
    url.searchParams.set('perPage', String(perPage));
    if (search) url.searchParams.set('search', search);
    if (minDownloads) url.searchParams.set('minDownloads', minDownloads);
    if (startDate) url.searchParams.set('startDate', startDate);
    if (endDate) url.searchParams.set('endDate', endDate);

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

export async function getDownloadStats(page = 1, perPage = 10) {
  'use server';

  try {
    const cookieStore = cookies();
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

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const responseData = await response.json();
    return {
      data: responseData?.data?.data,
      pagination: responseData?.data?.pagination,
    };
  } catch (error) {
    console.error('Error fetching paginated product download stats:', error);
    throw error;
  }
}
