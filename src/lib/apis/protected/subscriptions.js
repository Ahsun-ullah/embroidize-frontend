import { cookies } from 'next/headers';

async function serverHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const finance = cookieStore.get('finance_elev')?.value;
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (finance) headers.set('x-finance-elevation', finance);
  return headers;
}

const apiUrl = () => process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export async function getSubscribedUsers() {
  'use server';
  try {
    const headers = await serverHeaders();
    const response = await fetch(`${apiUrl()}/admin/users/subscriptions`, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const data = await response.json();
    const allUsers = data?.data?.users || [];
    return allUsers.filter((u) => u.subscription != null);
  } catch (error) {
    console.error('Error fetching subscribed users:', error);
    return [];
  }
}

export async function getRevenueStats() {
  'use server';
  try {
    const headers = await serverHeaders();
    const response = await fetch(`${apiUrl()}/admin/subscriptions/revenue`, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const data = await response.json();
    return data?.data || null;
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    return null;
  }
}

// Everyone who has ever held download credits. They own no UserSubscription
// row, so getSubscribedUsers() can never return them — this is a separate call
// against a separate list, not a filter over the subscribers.
export async function getCreditCustomers() {
  'use server';
  try {
    const headers = await serverHeaders();
    const response = await fetch(`${apiUrl()}/admin/credit-customers`, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const data = await response.json();
    return {
      customers: data?.data?.customers || [],
      totals: data?.data?.totals || null,
    };
  } catch (error) {
    console.error('Error fetching credit customers:', error);
    return { customers: [], totals: null };
  }
}
