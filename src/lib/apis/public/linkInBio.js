// Designs picked in Admin → Content → Links Page, newest pick first. The
// backend already drops unpublished and deleted products.
//
// Never throws: an empty grid is better than an error page for someone who
// just tapped the link in our Instagram bio.
export async function getLinkInBioItems() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/link-in-bio`,
      {
        // Short ISR window: the page stays a cached static response for the
        // Instagram traffic bursts, and an admin change shows within a minute.
        next: { revalidate: 60 },
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
