import { cookies } from 'next/headers';

// Server-side fetch of the app settings (free download limit/window).
// Admin-only endpoint; requires the admin JWT but no finance elevation.
export async function getAppSettings() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const res = await fetch(`${apiUrl}/admin/settings/app`, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error('Error fetching app settings:', error);
    return null;
  }
}
