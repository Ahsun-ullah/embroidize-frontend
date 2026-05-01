import { cookies } from 'next/headers';

async function serverHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

export async function getAdminActionLog({ action = '', search = '', page = 1, limit = 20 } = {}) {
  'use server';
  try {
    const headers = await serverHeaders();
    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const response = await fetch(`${apiUrl}/admin/scripts/audit-log?${params.toString()}`, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const data = await response.json();
    return (
      data?.data || { items: [], page: 1, limit, total: 0, totalPages: 1 }
    );
  } catch (error) {
    console.error('Error fetching admin action log:', error);
    return { items: [], page: 1, limit, total: 0, totalPages: 1 };
  }
}
