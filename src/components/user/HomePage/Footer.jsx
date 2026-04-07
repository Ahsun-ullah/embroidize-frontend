import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

const Footer = () => {
  return (
    <footer className='bg-[#fafafa] border-t text-gray-600'>
      {/* SEO STRUCTURED DATA */}
      <Script
        id='organization-schema'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Embroidize LLC',
            url: 'https://embroidize.com',
            logo: 'https://embroidize.com/og-banner.jpg',
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'support@embroidize.com',
              contactType: 'customer support',
            },
          }),
        }}
      />

      <div className='container max-w-7xl mx-auto px-6 py-12'>
        {/* GRID */}
        <div className='grid gap-10 md:grid-cols-2 lg:grid-cols-4'>
          {/* BRAND */}
          <div className='space-y-4'>
            <Link href='/' className='block w-[140px] h-[60px] relative'>
              <Image
                src='/logo-black.png'
                alt='Embroidize Logo'
                fill
                className='object-contain'
              />
            </Link>

            <p className='text-base  leading-relaxed text-gray-500'>
              Premium embroidery designs for creators & small businesses.
              Instant download. Commercial-friendly.
            </p>
          </div>

          {/* LINKS */}
          {[
            {
              title: 'Product',
              links: [
                { name: 'All Designs', href: '/products' },
                { name: 'Bundles', href: '/bundles' },
                { name: 'Resources', href: '/resources' },
                { name: 'Blog', href: '/blog' },
              ],
            },
            {
              title: 'Company',
              links: [
                { name: 'About', href: '/about-us' },
                { name: 'Contact', href: '/contact-us' },
                {
                  name: 'Custom Digitizing',
                  href: '/custom-embroidery-digitizing-service',
                },
                {
                  name: 'Etsy Shop',
                  href: 'https://www.etsy.com/shop/embroidize',
                  external: true,
                },
              ],
            },
            {
              title: 'Legal',
              links: [
                { name: 'Terms & Conditions', href: '/terms-and-conditions' },
                { name: 'Privacy Policy', href: '/privacy-policy' },
                {
                  name: 'Refund & Cancellation',
                  href: '/refund-and-cancellation-policy',
                },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className='font-semibold text-gray-900 mb-4'>
                {section.title}
              </h3>
              <ul className='space-y-2 text-sm'>
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : '_self'}
                      className='hover:text-black transition'
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div className='mt-12 pt-6 border-t flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
          {/* CONTACT */}
          <div className='text-sm space-y-1'>
            <p className='font-medium text-gray-900'>Embroidize</p>

            <a
              href='mailto:support@embroidize.com'
              className='block hover:text-blue-500 transition'
            >
              support@embroidize.com
            </a>

            <p className='text-gray-400 text-xs'>
              Albuquerque, NM, United States
            </p>
          </div>

          {/* SOCIAL + TRUST */}
          <div className='flex flex-col items-start md:items-end gap-3'>
            <div className='flex gap-3 text-lg'>
              {[
                [
                  'linkedin',
                  'https://www.linkedin.com/company/embroidize-official/',
                ],
                ['pinterest', 'https://www.pinterest.com/embroidize/'],
                ['facebook', 'https://www.facebook.com/embroidize'],
                ['twitter-x', 'https://x.com/embroidize'],
                ['instagram', 'https://www.instagram.com/embroidize/'],
                [
                  'youtube',
                  'https://www.youtube.com/channel/UCVCNRSIGLqdBG6O9D1xHGpQ',
                ],
              ].map(([icon, url]) => (
                <Link key={icon} href={url} target='_blank'>
                  <i
                    className={`ri-${icon}-fill hover:text-black transition`}
                  />
                </Link>
              ))}
            </div>

            <p className='text-xs text-gray-400'>
              Secure payments powered by <strong>Stripe</strong>
            </p>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className='text-center text-xs text-gray-400 mt-8'>
          © {new Date().getFullYear()} Embroidize LLC. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
