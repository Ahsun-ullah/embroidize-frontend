import OfferLandingPage from '@/features/offers/OfferLandingPage';
import { offerMetadata } from '@/features/offers/offerMetadata';
import { getOfferBySlug } from '@/lib/apis/public/offers';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// The Black Friday offer's landing page — the offer whose link name is
// "black-friday" in Admin → Content → Offers & Campaigns. 404 until its early
// access starts, so the URL gives nothing away before then.
export async function generateMetadata() {
  return offerMetadata('black-friday', '/black-friday');
}

export default async function BlackFridayPage() {
  const offer = await getOfferBySlug('black-friday');
  if (!offer) notFound();
  return <OfferLandingPage offer={offer} />;
}
