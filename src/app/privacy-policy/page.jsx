import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className='container  px-6 py-12 text-gray-800'>
        <div>
          <h1 className='text-4xl font-bold mb-8 text-center'>
            Privacy Policy – Embroidize
          </h1>

          <section className='space-y-10'>
            <p className='text-lg leading-relaxed'>
              At Embroidize, we are committed to safeguarding your personal
              information. This Privacy Policy outlines how we collect, use, and
              protect your data when you visit our website or use our services.
              By using our platform, you consent to the practices described in
              this policy.
            </p>

            {/* Section */}
            <Section title='What Information Do We Collect?'>
              <p>
                <strong>Personal Information:</strong> We collect details like
                your full name, email, username, password, billing address, and
                purchase history when you register, make a purchase, or contact
                us.
              </p>
              <p>
                <strong>Sensitive Data:</strong> We do not collect or store
                sensitive personal data.
              </p>
              <p>
                <strong>Non-Personal Data:</strong> Automatically collected
                information includes your IP address, browser type, referring
                URLs, and site usage stats.
              </p>
            </Section>

            <Section title='How Do We Use Your Information?'>
              <p>
                We use your data to process orders, provide customer support,
                send promotional content, and improve our site’s performance.
                Tracking data helps us understand user behavior and personalize
                your experience.
              </p>
            </Section>

            <Section title='Ordering & Digital Downloads'>
              <p>
                When placing an order or downloading a product, we collect
                identifying and payment-related information to fulfill your
                request and maintain transaction records.
              </p>
            </Section>

            <Section title='Surveys, Contests & Promotions'>
              <p>
                Participation in these is voluntary. We may request basic info
                (name, email, etc.) to manage participation and fulfill legal or
                promotional obligations.
              </p>
            </Section>

            <Section title='Emails & Newsletters'>
              <p>
                You can opt in to receive updates and offers. You may
                unsubscribe at any time via email or contact us directly.
              </p>
            </Section>

            <Section title='Customer Communication'>
              <p>
                We store communication history to provide better support and
                track interactions.
              </p>
            </Section>

            <Section title='Advertising & Site Tracking'>
              <p>
                We use cookies and analytics to improve user experience and
                display relevant ads. Third-party partners do not receive your
                personal info but may receive anonymous usage data.
              </p>
            </Section>

            <Section title='Cookies'>
              <p>
                Cookies help us personalize content and analyze traffic. You can
                control cookie settings in your browser.
              </p>
            </Section>

            <Section title='Sharing Your Information'>
              <p>
                We do not sell your data. We only share it with trusted partners
                for services like payment processing, shipping, or legal
                compliance.
              </p>
            </Section>

            <Section title='How We Safeguard Your Information'>
              <ul className='list-disc pl-6 space-y-1'>
                <li>SSL encryption for secure transactions</li>
                <li>Routine security audits</li>
                <li>Restricted data access</li>
              </ul>
            </Section>

            <Section title='Your Data Rights'>
              <ul className='list-disc pl-6 space-y-1'>
                <li>
                  <strong>Access:</strong> Request your data
                </li>
                <li>
                  <strong>Correction:</strong> Update or fix info
                </li>
                <li>
                  <strong>Deletion:</strong> Ask us to remove data
                </li>
                <li>
                  <strong>Opt-Out:</strong> Unsubscribe from emails
                </li>
              </ul>
              <p className='mt-2'>
                To exercise your rights, email us at{' '}
                <a
                  href='mailto:support@embroidize.com'
                  className='text-blue-600 underline'
                >
                  support@embroidize.com
                </a>
                .
              </p>
            </Section>

            <Section title='Third-Party Links'>
              <p>
                We are not responsible for privacy practices of third-party
                sites. Always review their policies before sharing personal
                data.
              </p>
            </Section>

            <Section title='Policy Updates'>
              <p>
                We may update this policy. Changes will be posted on this page
                with a revised date.
              </p>
            </Section>

            <Section title='Contact Information'>
              <p>
                Email:{' '}
                <a
                  href='mailto:support@embroidize.com'
                  className='text-blue-600 underline'
                >
                  support@embroidize.com
                </a>
              </p>
              <p>Phone: +0123456789</p>
            </Section>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className='border-t pt-6'>
      <h2 className='text-xl font-semibold mb-3'>{title}</h2>
      <div className='space-y-3 text-base leading-relaxed'>{children}</div>
    </div>
  );
}
