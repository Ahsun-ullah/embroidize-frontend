import { getOfferBySlug } from '@/lib/apis/public/offers';
import { offerLine } from '@/lib/offers/format';

// Metadata for an offer landing page. During early access the page is
// link-only: not indexed, and nothing on the site points at it. It becomes
// indexable only in its public window.
export async function offerMetadata(slug, path) {
  const offer = await getOfferBySlug(slug);
  if (!offer) return { title: 'Offer not found', robots: { index: false, follow: false } };
  return {
    title: `${offer.name}: ${offerLine(offer)}`,
    description: offer.description || `${offer.name}: ${offerLine(offer)}.`,
    alternates: { canonical: path },
    robots:
      offer.phase === 'public' ? { index: true, follow: true } : { index: false, follow: false },
  };
}
