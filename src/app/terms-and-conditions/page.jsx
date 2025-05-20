import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';

export const metadata = {
  title: 'Terms And Conditions - Embroidize',
  description: 'Download free embroidery machine designs in multiple formats.',
  openGraph: {
    title: 'Terms And Conditions - Embroidize',
    description: 'Explore and download premium free embroidery designs.',
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
  twitter: {
    card: 'summary_large_image',
    title: 'Terms And Conditions - Embroidize',
    description: 'Explore and download premium free embroidery designs.',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
  metadataBase: new URL('https://embroidize.com'),
};

export function Separator({ className = '' }) {
  return <hr className={`border-t border-gray-200 ${className}`} />;
}

export default function TermsAndConditions() {
  const sections = [
    {
      title: '1. Introduction',
      content: `Welcome to Embroidize.com. These Terms and Conditions govern your use of our website and all purchases made through it. By accessing our site and placing an order, you agree to be legally bound by the terms set out below. If you do not accept these terms, please refrain from using the site.`,
    },
    {
      title: '2. Digital Product Nature',
      content: `All products sold through Embroidize.com are digital embroidery files designed for use with embroidery machines.\n\nNote: These files are not physical products and not intended for hand embroidery.`,
    },
    {
      title: '3. Payment Terms',
      content: `All prices are listed in USD (unless otherwise stated). We accept payments via secure third-party payment gateways (such as Stripe, PayPal, or direct card payments). The full payment must be completed before download links are made available. By placing an order, you confirm that the provided payment information is accurate and authorized.`,
    },
    {
      title: '4. License and Usage Rights',
      content: `Each design purchased grants the buyer a non-exclusive, non-transferable license for personal or small-business commercial use.`,
      allowed: [
        'Use the file to embroider physical items for sale (limited quantity production).',
        'Resize the file (within machine/software limitations).',
      ],
      disallowed: [
        'Share, resell, or distribute the digital files in any form.',
        'Claim the design as your own.',
        'Upload or publish the file on any platform for free or paid download.',
      ],
    },
    {
      title: '5. Instant Digital Delivery',
      content: `Upon successful payment, your design files will be available for immediate download. No physical item will be shipped. Download links are typically valid for a limited time or number of downloads; we recommend downloading and backing up your files immediately.`,
    },
    {
      title: '6. Refunds & Returns Policy',
      content: `Due to the digital nature of our products, all sales are final. No refunds, exchanges, or cancellations will be granted once the file has been downloaded. If you encounter a corrupted file or technical issue, please contact us within 7 business days at support@embroidize.com — we are happy to help resolve the issue.`,
    },
    {
      title: '7. Product Accuracy & Availability',
      content: `We strive to ensure all product descriptions and images are accurate. However, minor color or visual variations may occur due to screen differences. We reserve the right to modify or discontinue products without notice.`,
    },
    {
      title: '8. Intellectual Property',
      content: `All designs on Embroidize.com are the intellectual property of Embroidize or its licensors. Unauthorized reproduction or distribution is a violation of copyright and may result in legal action.`,
    },
    {
      title: '9. Limitation of Liability',
      content: `Embroidize.com shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or misuse of our products. Our maximum liability shall not exceed the purchase price paid for the product in question.`,
    },
    {
      title: '10. Governing Law & Jurisdiction',
      content: `These Terms and Conditions shall be governed by and construed in accordance with the laws of [Your Country/State]. Any disputes arising shall be settled in the appropriate courts of [City/Country].`,
    },
    {
      title: '11. Privacy Policy',
      content: `All customer information (including email and payment details) is stored securely and never shared or sold to third parties. For full privacy practices, please see our Privacy Policy.`,
    },
    {
      title: '12. Updates to Terms',
      content: `Embroidize.com reserves the right to update or modify these Terms at any time without prior notice. The version posted at the time of your order will apply to that purchase.`,
    },
  ];

  return (
    <>
      <Header />
      <main className='container'>
        <div className='p-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            Terms and Conditions
          </h1>
          <p className='text-sm text-gray-500 mb-8'>
            Embroidize.com — Last Updated: 05.03.25
          </p>

          {sections.map((section, index) => (
            <div key={index} className='mb-8'>
              <h2 className='text-xl font-semibold text-gray-800 mb-2'>
                {section.title}
              </h2>
              <p className='text-gray-700 whitespace-pre-line mb-4'>
                {section.content}
              </p>

              {section.allowed && (
                <div className='mb-4'>
                  <p className='font-medium text-gray-700 mb-1'>You may:</p>
                  <ul className='list-disc list-inside text-gray-600'>
                    {section.allowed.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.disallowed && (
                <div>
                  <p className='font-medium text-gray-700 mb-1'>You may not:</p>
                  <ul className='list-disc list-inside text-gray-600'>
                    {section.disallowed.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {index < sections.length - 1 && <Separator className='my-6' />}
            </div>
          ))}
          <h2 className='text-xl font-semibold text-gray-900'>
            13. Contact Information
          </h2>
          <p className='text-gray-700'>
            For any questions regarding these Terms, please contact:{' '}
            <a
              href='mailto:support@embroidize.com'
              className='text-blue-600 underline font-medium'
            >
              support@embroidize.com
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
