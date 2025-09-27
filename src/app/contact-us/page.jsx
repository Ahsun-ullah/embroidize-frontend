import { ContactUsForm } from '@/components/Common/ContactUsForm';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';

export const metadata = {
  title: 'Contact Us - Embroidize',
  description:
    'Get in touch with Embroidize for any questions, support, or feedback. We are here to help you with all your embroidery design needs',
  alternates: {
    canonical: 'https://embroidize.com/contact-us',
  },
  openGraph: {
    title: 'Contact Us - Embroidize',
    description:
      'Get in touch with Embroidize for any questions, support, or feedback. We are here to help you with all your embroidery design needs',
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
    title: 'Contact Us - Embroidize',
    description:
      'Get in touch with Embroidize for any questions, support, or feedback. We are here to help you with all your embroidery design needs',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
  metadataBase: new URL('https://embroidize.com'),
};

const ContactUsPage = () => {
  return (
    <>
      <Header />

      <div className='bg-white text-gray-800 px-4 md:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto py-12 md:py-20'>
          <header className='text-center mb-12'>
            <h1 className='text-4xl md:text-5xl font-bold tracking-tight text-gray-900'>
              Contact Us
            </h1>

            <p className='mt-4 text-lg md:text-xl text-gray-600'>
              We’d love to hear from you! Whether you have{' '}
              <strong>any requirement</strong>, face <strong>any issues</strong>
              , are interested in <strong>any commercial work</strong>, or
              simply want to share <strong>any advice</strong>, our team is
              always ready to connect. Feel free to reach out and we’ll be happy
              to assist you.
            </p>
          </header>

          <section>
            <ContactUsForm />
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactUsPage;
