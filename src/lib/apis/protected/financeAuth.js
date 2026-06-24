import { cookies } from 'next/headers';

// Server-side check used by the protected pages to decide whether to render
// the password screen. Asks the backend to validate the elevation token; the
// backend is the source of truth (the cookie alone is never trusted).
export async function checkFinanceUnlocked() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const finance = cookieStore.get('finance_elev')?.value;

    if (!token || !finance) return false;

    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const response = await fetch(`${apiUrl}/admin/finance/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-finance-elevation': finance,
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    return response.ok;
  } catch (error) {
    console.error('Error checking finance unlock status:', error);
    return false;
  }
}
