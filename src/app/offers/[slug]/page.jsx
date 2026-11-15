import OfferLandingPage from '@/features/offers/OfferLandingPage';
import { offerMetadata } from '@/features/offers/offerMetadata';
import { getOfferBySlug } from '@/lib/apis/public/offers';
import { notFound, permanentRedirect } from 'next/navigation';

// Always fresh: the phase (early / public / ended) is time-dependent.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return offerMetadata(slug, `/offers/${slug}`);
}

export default async function OfferPage({ params }) {
  const { slug } = await params;
  // One address per offer: Black Friday lives at /black-friday.
  if (slug === 'black-friday') permanentRedirect('/black-friday');
  const offer = await getOfferBySlug(slug);
  if (!offer) notFound();
  return <OfferLandingPage offer={offer} />;
}
