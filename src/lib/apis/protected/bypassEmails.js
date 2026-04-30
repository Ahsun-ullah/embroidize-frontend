import { cookies } from 'next/headers';

async function serverHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

export async function getBypassEmails() {
  'use server';
  try {
    const headers = await serverHeaders();
    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const response = await fetch(`${apiUrl}/admin/bypass-emails`, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error('Error fetching bypass emails:', error);
    return [];
  }
}
