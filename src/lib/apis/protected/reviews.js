import Cookies from 'js-cookie';

const BASE = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

function authHeaders() {
  const token = Cookies.get('token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function getMyReview(productId) {
  const res = await fetch(`${BASE}/products/${productId}/reviews/me`, {
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch my review: ${res.status}`);
  return res.json();
}

export async function createReview(productId, { rating, reviewText, images = [] }) {
  const form = new FormData();
  form.append('rating', String(rating));
  if (reviewText) form.append('reviewText', reviewText);
  images.forEach((file) => form.append('images', file));

  const res = await fetch(`${BASE}/products/${productId}/reviews`, {
    method: 'POST',
    headers: authHeaders(), // no Content-Type — browser sets multipart boundary
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to submit review');
  return data;
}

export async function updateReview(reviewId, { rating, reviewText, images = [], removeImages = [] }) {
  const form = new FormData();
  if (rating !== undefined) form.append('rating', String(rating));
  if (reviewText !== undefined) form.append('reviewText', reviewText);
  images.forEach((file) => form.append('images', file));
  removeImages.forEach((publicId) => form.append('removeImages', publicId));

  const res = await fetch(`${BASE}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to update review');
  return data;
}

export async function deleteReview(reviewId) {
  const res = await fetch(`${BASE}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to delete review');
  return data;
}
