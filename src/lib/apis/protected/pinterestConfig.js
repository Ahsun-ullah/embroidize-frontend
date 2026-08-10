import { cookies } from 'next/headers';

// Server-side fetch of the (masked) Pinterest settings. Admin auth only — the
// Financial elevation gate covers money surfaces (Stripe/Creem/subscribers) and
// Pinterest is a marketing surface, so it deliberately isn't behind it.
export async function getPinterestSettings() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const res = await fetch(`${apiUrl}/admin/settings/pinterest`, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error('Error fetching Pinterest settings:', error);
    return null;
  }
}
