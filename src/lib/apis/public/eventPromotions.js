// Seasonal event posters (Admin → Content → Event Promotions). The backend
// returns only what is live right now — active and inside its schedule — and
// already resolves each poster's link, so callers just filter by placement.
//
// Never throws: a promo is decoration, and a slow or failed request must not
// take the home page or a listing page down with it.
export async function getActiveEventPromotions() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/event-promotions`,
      {
        cache: 'no-store',
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

// Fire-and-forget click count. keepalive lets it finish while the browser is
// already navigating to the poster's link.
export function trackEventPromotionClick(id) {
  if (!id) return;
  try {
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/event-promotions/${id}/click`,
      { method: 'POST', keepalive: true },
    ).catch(() => {});
  } catch {
    // Counting a click is never worth an error.
  }
}
