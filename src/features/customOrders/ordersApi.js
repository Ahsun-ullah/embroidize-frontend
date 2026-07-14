'use client';

import Cookies from 'js-cookie';

// Client-side API helpers for the customer order hub.
// Auth resolution (matches backend verifyOrderAccess):
//   1. `token` cookie (registered login)  -> Authorization: Bearer
//   2. `order_session` cookie (guest magic-link session) -> x-order-session
const API = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const ORDER_SESSION_COOKIE = 'order_session';

export function orderAuthHeaders() {
  const headers = {};
  const token = Cookies.get('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  const session = Cookies.get(ORDER_SESSION_COOKIE);
  if (session) headers['x-order-session'] = session;
  return headers;
}

export function hasOrderAccess() {
  return Boolean(Cookies.get('token') || Cookies.get(ORDER_SESSION_COOKIE));
}

async function parse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body?.success === false) {
    const err = new Error(body?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

export async function fetchMyOrders() {
  const res = await fetch(`${API}/public/orders/my`, {
    headers: orderAuthHeaders(),
    cache: 'no-store',
  });
  return (await parse(res)).data;
}

export async function fetchOrder(orderId) {
  const res = await fetch(`${API}/public/orders/custom/${orderId}`, {
    headers: orderAuthHeaders(),
    cache: 'no-store',
  });
  const data = (await parse(res)).data;
  // Attach the customer's own review (if any) onto the order object.
  return { ...data.order, myReview: data.myReview || null };
}

export async function submitReview(orderId, rating, comment, imageFile) {
  // Multipart (not JSON) so an optional photo can ride along; the backend
  // parses the fields with multer either way.
  const form = new FormData();
  form.append('rating', rating);
  form.append('comment', comment);
  if (imageFile) form.append('image', imageFile);
  const res = await fetch(`${API}/public/orders/custom/${orderId}/review`, {
    method: 'POST',
    headers: orderAuthHeaders(),
    body: form,
  });
  return (await parse(res)).data.review;
}

export async function createCheckoutSession(orderId) {
  const res = await fetch(
    `${API}/public/orders/custom/${orderId}/checkout-session`,
    { method: 'POST', headers: orderAuthHeaders() },
  );
  return (await parse(res)).data;
}

export async function requestAccessLink(email) {
  const res = await fetch(`${API}/public/orders/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return parse(res);
}

export async function verifyAccessToken(token) {
  const res = await fetch(`${API}/public/orders/access/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  return (await parse(res)).data;
}

export async function requestRevision(orderId, notes) {
  const res = await fetch(`${API}/public/orders/custom/${orderId}/revision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...orderAuthHeaders() },
    body: JSON.stringify({ notes }),
  });
  return parse(res);
}

export async function fetchOrderMessages(orderId) {
  const res = await fetch(`${API}/public/orders/custom/${orderId}/messages`, {
    headers: orderAuthHeaders(),
    cache: 'no-store',
  });
  return (await parse(res)).data.messages || [];
}

export async function sendOrderMessage(orderId, body, imageFile) {
  // Multipart (not JSON) so an optional photo can ride along; the backend
  // parses the fields with multer either way.
  const form = new FormData();
  form.append('body', body);
  if (imageFile) form.append('image', imageFile);
  const res = await fetch(`${API}/public/orders/custom/${orderId}/messages`, {
    method: 'POST',
    headers: orderAuthHeaders(),
    body: form,
  });
  return (await parse(res)).data.message;
}

// Streams the delivery ZIP as a blob and returns { blob, filename }.
export async function downloadOrderZip(orderId, fallbackName) {
  const res = await fetch(`${API}/public/orders/custom/${orderId}/download`, {
    headers: orderAuthHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || 'Download failed');
  }
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || fallbackName || 'embroidize-order.zip';
  return { blob: await res.blob(), filename };
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Human labels + grayscale chip styling per status (brand: black & white only).
export const STATUS_META = {
  pending_review: { label: 'Under review', className: 'bg-zinc-100 text-zinc-700 border-zinc-300' },
  awaiting_payment: { label: 'Awaiting payment', className: 'bg-black text-white border-black' },
  paid: { label: 'Paid — in queue', className: 'bg-zinc-800 text-white border-zinc-800' },
  in_progress: { label: 'In progress', className: 'bg-zinc-700 text-white border-zinc-700' },
  delivered: { label: 'Delivered', className: 'bg-white text-black border-black' },
  in_revision: { label: 'Revision in progress', className: 'bg-zinc-200 text-zinc-800 border-zinc-400' },
  completed: { label: 'Completed', className: 'bg-zinc-100 text-zinc-600 border-zinc-300' },
  cancelled: { label: 'Cancelled', className: 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through' },
  expired: { label: 'Payment window expired', className: 'bg-zinc-100 text-zinc-500 border-zinc-300' },
};

export function statusMeta(status) {
  return (
    STATUS_META[status] || {
      label: status || 'Unknown',
      className: 'bg-zinc-100 text-zinc-600 border-zinc-300',
    }
  );
}
