export const LINK_IN_BIO_PAGE_SIZE = 30;

// One page of the designs picked in Admin → Content → Links Page, newest pick
// first. The backend already drops unpublished and deleted products.
// Returns { items, hasMore }.
//
// Never throws: an empty grid is better than an error page for someone who
// just tapped the link in our Instagram bio.
export async function getLinkInBioPage(
  page = 1,
  limit = LINK_IN_BIO_PAGE_SIZE,
  { server = true } = {},
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/link-in-bio?page=${page}&limit=${limit}`,
      server
        ? {
            // Short ISR window: the first page stays a cached static response
            // for Instagram traffic bursts, and admin changes show within a
            // minute.
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(4000),
          }
        : { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return { items: [], hasMore: false };
    const data = (await res.json())?.data;
    // An older backend ignores ?page and returns the whole list.
    if (Array.isArray(data)) return { items: data, hasMore: false };
    return {
      items: Array.isArray(data?.items) ? data.items : [],
      hasMore: !!data?.hasMore,
    };
  } catch {
    return { items: [], hasMore: false };
  }
}
