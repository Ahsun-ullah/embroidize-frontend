import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';

export const metadata = {
  title: 'About Embroidize – Premium Embroidery Design Platform',
  description:
    'Discover Embroidize, a leading platform for high-quality embroidery machine designs. Free downloads, premium files, and creator-focused tools for embroidery enthusiasts and small businesses.',
  alternates: {
    canonical: 'https://embroidize.com/about-us',
  },
  openGraph: {
    title: 'About Embroidize – Premium Embroidery Design Platform',
    description:
      'Explore Embroidize — your trusted source for high-quality embroidery designs with free downloads and commercial use options.',
    url: 'https://embroidize.com',
    siteName: 'Embroidize',
    images: [
      {
        url: 'https://embroidize.com/og-banner.jpg',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  metadataBase: new URL('https://embroidize.com'),
};

export default function AboutUsPage() {
  return (
    <>
      <Header />

      <main className='container mx-auto px-6 py-16 text-gray-800'>
        {/* HERO */}
        <div className='text-center max-w-3xl mx-auto mb-16'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            About Embroidize
          </h1>
          <p className='text-lg text-gray-600'>
            A modern platform built for embroidery creators — combining
            creativity, accessibility, and professional-quality digital designs.
          </p>
        </div>

        <div className='max-w-6xl mx-auto space-y-20'>
          {/* MISSION */}
          <section className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='space-y-4'>
              <h2 className='text-2xl font-semibold text-gray-900'>
                Our Mission
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                At <strong>Embroidize</strong>, our mission is to make
                embroidery design accessible, reliable, and inspiring for
                creators worldwide. Whether you're a beginner or a professional,
                we provide high-quality digital embroidery files that bring your
                ideas to life.
              </p>
              <p className='text-gray-700 leading-relaxed'>
                We focus on delivering designs that are not only visually
                appealing but also optimized for real-world stitching across
                different machines and formats.
              </p>
            </div>

            <img
              src='https://embroidize.com/og-banner.jpg'
              alt='Embroidery designs'
              className='rounded-2xl shadow-xl w-full'
            />
          </section>

          {/* WHAT WE OFFER */}
          <section className='bg-gray-50 p-10 rounded-2xl space-y-6'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              What We Offer
            </h2>

            <ul className='grid md:grid-cols-2 gap-4 text-gray-700'>
              <li>✔ High-quality embroidery design files</li>
              <li>✔ Multiple machine formats (PES, DST, JEF, EXP, etc.)</li>
              <li>✔ Instant digital downloads</li>
              <li>✔ Free daily downloads for registered users</li>
              <li>✔ Premium and subscription-based access</li>
              <li>✔ Commercial use for small businesses</li>
            </ul>
          </section>

          {/* FREE SYSTEM */}
          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              Free Downloads with Fair Use
            </h2>
            <p className='text-gray-700 leading-relaxed'>
              We offer a limited number of free downloads to help users explore
              our designs before committing. This system ensures fair access
              while maintaining platform sustainability.
            </p>
          </section>

          {/* WHY TRUST US */}
          <section className='space-y-6'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              Why Choose Embroidize?
            </h2>

            <ul className='grid md:grid-cols-2 gap-4 text-gray-700'>
              <li>✔ Professionally crafted embroidery designs</li>
              <li>✔ Trusted by creators and small businesses</li>
              <li>✔ Optimized files for smooth machine performance</li>
              <li>✔ Secure platform with protected downloads</li>
              <li>✔ Continuous updates and new designs</li>
              <li>✔ Reliable customer support</li>
            </ul>
          </section>

          {/* BUSINESS / BRAND TRUST */}
          <section className='bg-gradient-to-r from-blue-50 to-purple-50 p-10 rounded-2xl space-y-4'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              Built for Creators & Small Businesses
            </h2>
            <p className='text-gray-700 leading-relaxed'>
              Embroidize is designed to support both hobbyists and
              entrepreneurs. Whether you're creating custom gifts or running a
              small embroidery business, our designs are ready for real-world
              use.
            </p>
          </section>

          {/* CTA */}
          <section className='text-center space-y-4'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              Join Our Creative Community
            </h2>
            <p className='text-gray-700'>
              Start exploring designs, download your favorites, and bring your
              ideas to life with Embroidize.
            </p>

            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg'>
              <p className='text-gray-700 mb-2'>
                📧 <span className='font-medium'>Email:</span>{' '}
                <a
                  href='mailto:support@embroidize.com?subject=Support Request - Embroidize'
                  className='text-blue-600 underline font-medium hover:text-blue-800'
                >
                  support@embroidize.com
                </a>
              </p>
              <p className='text-gray-700'>
                📍 <span className='font-medium'>Address:</span><br />
                <span className='text-gray-600'>
                  Mountain Road Professional Center<br />
                  1209 Mountain Road Place NE, Suite R<br />
                  Albuquerque, New Mexico 87110<br />
                  United States
                </span>
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
