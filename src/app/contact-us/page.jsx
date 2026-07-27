import { ContactUsForm } from '@/components/Common/ContactUsForm';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';

export const metadata = {
  title: 'Contact Embroidize – Customer Support',
  description:
    'Contact Embroidize for help with downloads, file formats, account questions, or business inquiries. Fast, reliable support for all your embroidery design needs.',
  alternates: {
    canonical: 'https://embroidize.com/contact-us',
  },
  openGraph: {
    title: 'Contact Embroidize – Customer Support',
    description:
      'Need help with a download, file format, or your account? Contact the Embroidize support team for fast and reliable assistance.',
    url: 'https://embroidize.com/contact-us',
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

const ContactUsPage = () => {
  return (
    <>
      <Header />

      <main className='container mx-auto px-6 py-16 text-gray-800'>
        {/* HERO */}
        <div className='text-center max-w-3xl mx-auto mb-14 space-y-4'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900'>
            Contact Embroidize
          </h1>

          <p className='text-lg text-gray-600'>
            Need help with a design or having trouble with a file? Our team is
            here to assist you.
          </p>
        </div>
        {/* /* QUICK CONTACT INFO */}
        <section className='grid md:grid-cols-2 gap-6 mb-14'>
          <div className='p-6 border rounded-xl text-center shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-300 cursor-pointer'>
            <h3 className='font-semibold text-lg mb-2'>Email Support</h3>
            <p className='text-gray-600 text-sm mb-2'>
              Reach us directly for any issue
            </p>
            <a
              href='mailto:support@embroidize.com?subject=Support Request - Embroidize'
              className='text-blue-600 underline font-medium hover:text-blue-800'
            >
              support@embroidize.com
            </a>
          </div>

          <div className='p-6 border rounded-xl text-center shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-300 cursor-pointer'>
            <h3 className='font-semibold text-lg mb-2'>Response Time</h3>
            <p className='text-gray-600 text-sm'>
              We typically respond within 24 hours
            </p>
          </div>
        </section>
        {/* FORM + INFO */}
        <section className='grid md:grid-cols-2 gap-12 items-start'>
          {/* FORM */}
          <div>
            <h2 className='text-2xl font-semibold mb-4'>Send Us a Message</h2>
            <ContactUsForm />
          </div>

          {/* HELP INFO */}
          <div className='space-y-6'>
            <h2 className='text-2xl font-semibold'>How We Can Help</h2>

            <ul className='space-y-3 text-gray-700'>
              <li>✔ Help with downloads or account issues</li>
              <li>✔ Questions about available file formats (PES, DST, JEF, etc.)</li>
              <li>✔ Trouble opening or downloading a file</li>
              <li>✔ Billing and subscription questions</li>
              <li>✔ Business and licensing inquiries</li>
            </ul>

            <div className='bg-gray-50 p-6 rounded-xl'>
              <p className='text-gray-700 text-sm'>
                💡 Tip: For faster support, include your order details, machine
                type, and a screenshot of the issue.
              </p>
            </div>
          </div>
        </section>
        {/* CTA */}
        <section className='text-center mt-16 space-y-4'>
          <h2 className='text-2xl font-semibold text-gray-900'>
            We’re Here to Help
          </h2>

          <p className='text-gray-600'>
            Your satisfaction is our priority. We aim to provide quick,
            reliable, and helpful support for every customer.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ContactUsPage;
