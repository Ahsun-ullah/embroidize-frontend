// Curated testimonials for the pricing page. The admin picks and orders these
// in Content → Reviews; the backend caps how many come back (Settings value,
// default 6), so this helper never decides the count itself.
//
// Also returns totalCount — the size of the whole review corpus, used for the
// "and N more" line. It comes from the server so the copy can never quote a
// number nobody counted.
//
// Revalidated rather than no-store: a starred review appearing a few minutes
// late is fine, and the pricing page should not pay a round-trip per render.
const EMPTY = { reviews: [], totalCount: 0 };

export async function getFeaturedReviews() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const res = await fetch(`${apiUrl}/public/featured-reviews`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return EMPTY;
    const result = await res.json();
    const reviews = result?.data?.reviews;
    return {
      reviews: Array.isArray(reviews) ? reviews : [],
      totalCount: Number(result?.data?.totalCount) || 0,
    };
  } catch (error) {
    // A testimonial section is decoration — never let it take the page down.
    console.error('Error fetching featured reviews:', error);
    return EMPTY;
  }
}
