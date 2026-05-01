import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

const Footer = () => {
  return (
    <footer className='relative bg-gradient-to-b from-white to-gray-50 text-gray-600 border-t border-gray-200'>
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
              telephone: '+1-251-332-0605',
              email: 'support@embroidize.com',
              contactType: 'customer support',
              areaServed: 'US',
              availableLanguage: ['English'],
            },
            address: {
              '@type': 'PostalAddress',
              streetAddress: '1209 Mountain Road Pl NE, Ste R',
              addressLocality: 'Albuquerque',
              addressRegion: 'NM',
              postalCode: '87110',
              addressCountry: 'US',
            },
          }),
        }}
      />

      {/* Decorative top accent — thin gradient line */}
      <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-900/40 to-transparent' />

      {/* Soft tint glow for depth */}
      <div
        aria-hidden
        className='pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gray-900/[0.03] blur-3xl rounded-full'
      />

      {/* TOP — brand + link columns */}
      <div className='relative container max-w-7xl mx-auto px-6 pt-10 pb-6'>
        <div className='grid gap-8 md:gap-10 sm:grid-cols-2 md:grid-cols-12'>
          {/* BRAND */}
          <div className='md:col-span-4 space-y-3'>
            <Link href='/' className='block w-[130px] h-[42px] relative'>
              <Image
                src='/logo-black.png'
                alt='Embroidize Logo'
                fill
                className='object-contain object-left'
              />
            </Link>
            <p className='text-[15px] leading-relaxed text-gray-700 max-w-sm'>
              Premium embroidery designs for creators &amp; small businesses.
              Instant download. Commercial-friendly.
            </p>

            {/* SOCIAL */}
            <div className='flex items-center gap-2 pt-2'>
              {[
                ['linkedin', 'https://www.linkedin.com/company/embroidize-official/', 'LinkedIn'],
                ['pinterest', 'https://www.pinterest.com/embroidize/', 'Pinterest'],
                ['facebook', 'https://www.facebook.com/embroidize', 'Facebook'],
                ['twitter-x', 'https://x.com/embroidize', 'X (Twitter)'],
                ['instagram', 'https://www.instagram.com/embroidize/', 'Instagram'],
                ['youtube', 'https://www.youtube.com/channel/UCVCNRSIGLqdBG6O9D1xHGpQ', 'YouTube'],
              ].map(([icon, url, label]) => (
                <Link
                  key={icon}
                  href={url}
                  target='_blank'
                  aria-label={label}
                  className='group w-8 h-8 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-900 hover:border-gray-900 hover:text-white hover:scale-110 transition-all duration-200 shadow-sm'
                >
                  <i className={`ri-${icon}-fill text-[13px]`} />
                </Link>
              ))}
            </div>
          </div>

          {/* LINK COLUMNS */}
          <div className='md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8'>
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
                <h3 className='text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-900 mb-3 relative inline-block'>
                  {section.title}
                  <span className='absolute -bottom-1 left-0 w-5 h-px bg-gray-900' />
                </h3>
                <ul className='space-y-2 text-[13px]'>
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        target={link.external ? '_blank' : '_self'}
                        className='group text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1.5'
                      >
                        <span className='w-0 h-px bg-gray-900 group-hover:w-2 transition-all duration-200' />
                        <span>{link.name}</span>
                        {link.external && (
                          <i className='ri-external-link-line text-[10px] text-gray-400 group-hover:text-gray-900 transition-colors' />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT — centered single-row strip */}
        <div className='mt-8 pt-5 border-t border-gray-200'>
          <ul className='flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[13px]'>
            <li>
              <a
                href='mailto:support@embroidize.com'
                className='group inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
              >
                <span className='w-7 h-7 inline-flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 group-hover:bg-gray-900 group-hover:border-gray-900 transition-colors'>
                  <i className='ri-mail-line text-gray-700 group-hover:text-white text-[13px] transition-colors' />
                </span>
                support@embroidize.com
              </a>
            </li>
            <li>
              <a
                href='tel:+12513320605'
                className='group inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
              >
                <span className='w-7 h-7 inline-flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 group-hover:bg-gray-900 group-hover:border-gray-900 transition-colors'>
                  <i className='ri-phone-line text-gray-700 group-hover:text-white text-[13px] transition-colors' />
                </span>
                +1 (251) 332-0605
              </a>
            </li>
            <li>
              <address className='inline-flex items-center gap-2 not-italic text-gray-600'>
                <span className='w-7 h-7 inline-flex items-center justify-center rounded-full bg-gray-100 border border-gray-200'>
                  <i className='ri-map-pin-line text-gray-700 text-[13px]' />
                </span>
                1209 Mountain Road Pl NE, Ste R, Albuquerque, NM 87110, USA
              </address>
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM STRIP */}
      <div className='relative border-t border-gray-200 bg-white/80'>
        <div className='container max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3'>
          <p className='text-[11px] text-gray-500 tracking-wide'>
            © {new Date().getFullYear()}{' '}
            <span className='font-medium text-gray-700'>Embroidize LLC</span>
            <span className='hidden sm:inline'> · All rights reserved.</span>
          </p>

          <p className='text-[11px] text-gray-500 flex items-center gap-1.5'>
            <i className='ri-shield-check-line text-gray-700' />
            Secured by{' '}
            <span className='font-semibold text-gray-700'>Stripe</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
