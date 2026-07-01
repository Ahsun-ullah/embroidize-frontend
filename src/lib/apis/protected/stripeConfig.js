import { cookies } from 'next/headers';

// Server-side fetch of the (masked) Stripe settings. Requires both admin auth
// and the Financial elevation token — mirrors the other finance-gated pages.
export async function getStripeSettings() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const finance = cookieStore.get('finance_elev')?.value;

    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (finance) headers.set('x-finance-elevation', finance);

    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const res = await fetch(`${apiUrl}/admin/settings/stripe`, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error('Error fetching Stripe settings:', error);
    return null;
  }
}
