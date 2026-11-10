'use client';

import Cookies from 'js-cookie';
import { useEffect, useState, useSyncExternalStore } from 'react';

// The signed-in member's vote for today, shared by every vote button on the
// page (homepage cards, the vote page, a product page) through one tiny store,
// so ten cards make one request and all flip to "voted" together.

const BASE = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

let state = { loaded: false, votedFor: null, day: null };
let inflight = null;
const listeners = new Set();

const emit = () => listeners.forEach((l) => l());
const set = (next) => {
  state = { ...state, ...next };
  emit();
};

const authHeaders = () => {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function loadMyVote() {
  if (inflight) return inflight;
  if (!Cookies.get('token')) {
    set({ loaded: true, votedFor: null });
    return Promise.resolve();
  }
  inflight = fetch(`${BASE}/daily-vote/me`, {
    headers: authHeaders(),
    credentials: 'include',
    cache: 'no-store',
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => {
      set({
        loaded: true,
        votedFor: json?.data?.votedFor || null,
        day: json?.data?.day || null,
      });
    })
    .catch(() => set({ loaded: true }))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/**
 * Casts the vote. Resolves to { ok, status, message, data }. Never throws.
 * `credentials: 'include'` sends the browser id cookie the API uses for its
 * one-vote-per-browser check.
 */
export async function castDailyVote(productId) {
  try {
    const res = await fetch(`${BASE}/daily-vote/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
      body: JSON.stringify({ productId }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      set({
        loaded: true,
        votedFor: json?.data?.votedFor || { _id: productId },
      });
    } else if (json?.error?.code === 'already_voted' && json?.error?.votedFor) {
      set({ loaded: true, votedFor: json.error.votedFor });
    }
    return {
      ok: res.ok,
      status: res.status,
      message: json?.message,
      data: json?.data,
      error: json?.error,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      message: 'Network error. Please try again.',
    };
  }
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;
const getServerSnapshot = () => state;

/** { mounted, isLoggedIn, loaded, votedFor } — votedFor is a product or null. */
export function useMyDailyVote() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Cookies exist only in the browser; gate on mount so SSR and the first
  // client render agree (same reason as FavoriteButton).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (!state.loaded) loadMyVote();
  }, []);
  const isLoggedIn = mounted && !!Cookies.get('token');
  return { mounted, isLoggedIn, loaded: snap.loaded, votedFor: snap.votedFor };
}
