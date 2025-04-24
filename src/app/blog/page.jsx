import BlogSection from '@/components/user/HomePage/BlogSection';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import Link from 'next/link';

export const metadata = {
  title: 'Blog | Embroidize',
  description:
    'Explore the latest embroidery design tutorials, tips, and updates from the Embro ID team.',
  openGraph: {
    title: 'Blog | Embro ID',
    description:
      'Explore the latest embroidery design tutorials, tips, and updates from the Embro ID team.',
    url: 'https://embro-id.vercel.app/blog',
    type: 'website',
    images: [
      {
        url: 'https://embro-id.vercel.app/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Embro ID Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Embro ID',
    description:
      'Explore the latest embroidery design tutorials, tips, and updates from the Embro ID team.',
    images: ['https://embro-id.vercel.app/og-banner.jpg'],
  },
};

export default function AllBlogsPageInFrontSite() {
  return (
    <>
      <Header />
      <BlogSection />
     
      <Footer />
    </>
  );
}
