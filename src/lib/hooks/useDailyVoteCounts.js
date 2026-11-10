'use client';

import { useEffect, useSyncExternalStore } from 'react';

// Today's vote counts for product cards. Every card on a page registers its
// id; ids are collected for a moment and fetched in ONE request, so a grid of
// 24 cards costs one call, not 24. Also holds which design is free today.

const BASE = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

let state = { enabled: null, freeTodayId: null, counts: {}, version: 0 };
const known = new Set();
let pending = new Set();
let timer = null;
const listeners = new Set();

const emit = () => {
  state = { ...state, version: state.version + 1 };
  listeners.forEach((l) => l());
};

function flush() {
  timer = null;
  const ids = [...pending];
  pending = new Set();
  if (!ids.length) return;
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    fetch(`${BASE}/public/daily-vote/counts?ids=${chunk.join(',')}`, {
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const d = json?.data;
        if (!d) return;
        state.enabled = d.enabled !== false;
        state.freeTodayId = d.freeTodayId || null;
        const counts = { ...state.counts };
        chunk.forEach((id) => {
          counts[id] = d.counts?.[id] || 0;
        });
        state.counts = counts;
        emit();
      })
      .catch(() => {});
  }
}

function request(id) {
  if (!id || known.has(id)) return;
  known.add(id);
  pending.add(id);
  if (!timer) timer = setTimeout(flush, 60);
}

/** Called after a successful vote so the card's number moves at once. */
export function bumpDailyVoteCount(id) {
  state.counts = { ...state.counts, [id]: (state.counts[id] || 0) + 1 };
  emit();
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const snap = () => state;

/** { ready, enabled, votes, isFreeToday } for one product card. */
export function useDailyVoteCount(productId) {
  const s = useSyncExternalStore(subscribe, snap, snap);
  useEffect(() => {
    request(productId);
  }, [productId]);
  const ready = productId in s.counts;
  return {
    ready,
    enabled: s.enabled === true,
    votes: s.counts[productId] || 0,
    isFreeToday: !!s.freeTodayId && s.freeTodayId === productId,
  };
}
