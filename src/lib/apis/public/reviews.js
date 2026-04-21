const BASE = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export async function getProductReviews(productId, page = 1, limit = 10, sort = 'recent') {
  const url = new URL(`${BASE}/public/products/${productId}/reviews`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('sort', sort);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch reviews: ${res.status}`);
  return res.json();
}

export async function getReviewSummary(productId) {
  const url = `${BASE}/public/products/${productId}/reviews/summary`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch review summary: ${res.status}`);
  return res.json();
}
