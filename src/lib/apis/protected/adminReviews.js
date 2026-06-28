import { cookies } from 'next/headers';

async function serverHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

export async function getAdminReviews(
  search = '',
  page = 1,
  limit = 20,
  rating = '',
) {
  try {
    const headers = await serverHeaders();
    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const url = new URL(`${apiUrl}/admin/reviews`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(limit));
    if (search) url.searchParams.set('search', search);
    if (rating) url.searchParams.set('rating', String(rating));

    const response = await fetch(url.toString(), {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const data = await response.json();
    const payload = data?.data || {};
    return {
      reviews: Array.isArray(payload.reviews) ? payload.reviews : [],
      newCount: payload.newCount || 0,
      pagination: payload.pagination || { page, limit, total: 0, pages: 0 },
    };
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return {
      reviews: [],
      newCount: 0,
      pagination: { page, limit, total: 0, pages: 0 },
    };
  }
}

// Count of unseen ("new") reviews — used for the dashboard badge.
export async function getNewReviewCount() {
  try {
    const headers = await serverHeaders();
    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const response = await fetch(`${apiUrl}/admin/reviews/new-count`, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const data = await response.json();
    return data?.data?.newCount || 0;
  } catch (error) {
    console.error('Error fetching new review count:', error);
    return 0;
  }
}
