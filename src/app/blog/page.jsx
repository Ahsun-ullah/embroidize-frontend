import BlogSection from '@/components/user/HomePage/BlogSection';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';

export const metadata = {
  title: 'Blog | Embroidize',
  description:
    'Explore the latest embroidery design tutorials, tips, and updates from the Embro ID team.',
  openGraph: {
    title: 'Blog | Embro ID',
    description:
      'Explore the latest embroidery design tutorials, tips, and updates from the Embro ID team.',
    url: 'https://embroidize.com/blog',
    type: 'website',
    images: [
      {
        url: 'https://embroidize.com/og-banner.jpg',
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
    images: ['https://embroidize.com/og-banner.jpg'],
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
