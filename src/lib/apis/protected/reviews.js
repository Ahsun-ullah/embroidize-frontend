import Cookies from 'js-cookie';

const BASE = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

function authHeaders() {
  const token = Cookies.get('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function getMyReview(productId) {
  const res = await fetch(`${BASE}/products/${productId}/reviews/me`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch my review: ${res.status}`);
  return res.json();
}

export async function createReview(productId, { rating, reviewText }) {
  const res = await fetch(`${BASE}/products/${productId}/reviews`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ rating, reviewText }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to submit review');
  return data;
}

export async function updateReview(reviewId, { rating, reviewText }) {
  const res = await fetch(`${BASE}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ rating, reviewText }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to update review');
  return data;
}

export async function deleteReview(reviewId) {
  const res = await fetch(`${BASE}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to delete review');
  return data;
}
