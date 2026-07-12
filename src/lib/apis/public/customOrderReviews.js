// Public testimonials for the custom-digitizing service page. Latest visible
// custom-order reviews. Server-side fetch, best-effort (returns [] on failure).
export async function getCustomOrderReviews(limit = 15) {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const res = await fetch(
      `${base}/public/custom-order-reviews?limit=${limit}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.reviews || [];
  } catch {
    return [];
  }
}
