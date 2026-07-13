import { getSiteConfig } from '@/lib/apis/public/siteConfig';
import SubscriptionsPageClient from './SubscriptionsPageClient';

// Metadata must live in a server component — the pricing UI is fully client
// (Redux, toasts, countdown), so it's split into SubscriptionsPageClient.
export const metadata = {
  title: 'Embroidery Design Subscription Plans',
  description:
    'Choose a subscription plan and get instant access to premium machine embroidery designs in every format. Commercial use included, cancel anytime.',
  keywords:
    'embroidery subscription, machine embroidery designs, embroidery plans, unlimited embroidery downloads, Embroidize premium',
  alternates: {
    canonical: 'https://embroidize.com/subscriptions',
  },
  openGraph: {
    title: 'Embroidery Design Subscription Plans',
    description:
      'Choose a subscription plan and get instant access to premium machine embroidery designs in every format. Commercial use included, cancel anytime.',
    url: 'https://embroidize.com/subscriptions',
    type: 'website',
    images: [
      {
        url: 'https://embroidize.com/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Embroidize Subscription Plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Embroidery Design Subscription Plans | Embroidize',
    description:
      'Choose a subscription plan and get instant access to premium machine embroidery designs in every format. Commercial use included, cancel anytime.',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
};

export default async function SubscriptionsPage() {
  // Admin-managed free-tier quota — keeps the static Free plan card's copy in
  // sync with what the backend actually enforces.
  const siteConfig = await getSiteConfig();

  return <SubscriptionsPageClient siteConfig={siteConfig} />;
}
