import { cookies } from 'next/headers';

// Server-side fetch of the (masked) Creem settings + the active gateway toggle.
// Requires admin auth + Financial elevation, mirroring the Stripe settings page.
// Additive — this whole file is deleted if the Creem integration is removed.

async function financeHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const finance = cookieStore.get('finance_elev')?.value;
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (finance) headers.set('x-finance-elevation', finance);
  return headers;
}

export async function getCreemSettings() {
  try {
    const headers = await financeHeaders();
    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const res = await fetch(`${apiUrl}/admin/settings/creem`, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error('Error fetching Creem settings:', error);
    return null;
  }
}

export async function getActiveGateway() {
  try {
    const headers = await financeHeaders();
    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const res = await fetch(`${apiUrl}/admin/settings/payment-gateway`, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) return 'stripe';
    const data = await res.json();
    return data?.data?.activePaymentGateway || 'stripe';
  } catch (error) {
    console.error('Error fetching active gateway:', error);
    return 'stripe';
  }
}
