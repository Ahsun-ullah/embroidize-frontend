import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';

export const metadata = {
  title: 'Privacy Policy - Embroidize',
  description:
    'Read Embroidize’s Privacy Policy to understand how we collect, use, and protect your personal information when you download embroidery designs from our platform.',
  alternates: {
    canonical: 'https://embroidize.com/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy - Embroidize',
    description:
      'Read Embroidize’s Privacy Policy to understand how we collect, use, and protect your personal information when you download embroidery designs from our platform.',
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
    title: 'Privacy Policy - Embroidize',
    description:
      'Read Embroidize’s Privacy Policy to understand how we collect, use, and protect your personal information when you download embroidery designs from our platform.',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
  metadataBase: new URL('https://embroidize.com'),
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />

      <h1 className='text-4xl font-bold my-8 text-center'>
        Privacy Policy – Embroidize
      </h1>
      
      <main className='container px-6 mb-6 text-gray-800'>
        <div>
          <div className='space-y-8 text-base leading-relaxed'>
            <p>
              At Embroidize, we are committed to safeguarding your personal
              information. This Privacy Policy outlines the ways in which we
              collect, utilize, and secure your data when you browse our
              website, engage with our services, or make a purchase. By
              accessing or using our platform, you acknowledge and consent to
              the practices described in this policy.
            </p>

            <Section title='What Information Do We Collect?'>
              <p>
                <strong>Personal information you disclose to us</strong>
              </p>
              <p>
                Summary: We collect the personal details you choose to share
                with us.
              </p>
              <p>
                When you sign up for our services, show interest in our
                offerings, take part in site activities, or reach out to us
                directly, you may provide us with personal information. The type
                of data we gather depends on how you interact with our website
                and the features you use.
              </p>
              <p>
                <strong>Personal Data You Share:</strong>
              </p>
              <ul className='list-disc pl-6 space-y-1'>
                <li>Full name</li>
                <li>Email address</li>
                <li>Username</li>
                <li>Password</li>
                <li>Billing address</li>
                <li>Purchase history</li>
              </ul>
              <p>
                <strong>Sensitive Data:</strong> We do not collect or process
                any sensitive personal information.
              </p>
              <p>
                <strong>Non-Personal Information Collection:</strong>
              </p>
              <p>
                We also collect certain types of information that do not
                directly identify you as an individual. This non-personally
                identifiable data is gathered automatically based on your
                interactions with our website and may be analyzed both
                individually and in aggregate.
              </p>
              <p>
                For instance, we may track details such as the webpage you
                visited before arriving at our site, the page you visit next,
                your web browser type, and your Internet Protocol (IP) address.
              </p>
              <p>
                A URL (Uniform Resource Locator) refers to the web address of a
                page or resource online. An IP address is a unique number
                assigned to your device whenever you access the internet. These
                identifiers help websites communicate with your device and are
                necessary for web browsing and online shopping.
              </p>
              <p>
                This type of information helps us understand user behavior,
                improve website performance, and enhance your overall experience
                on our platform
              </p>
            </Section>

            <Section title='Where Do We Collect Information From You and How Do We Use It?'>
              <p>
                Our main purpose in gathering personal information is to deliver
                a personalized and high-quality experience for visitors to
                Embroidize. We use the details you provide to process orders,
                communicate updates about purchases, share promotional offers,
                improve site functionality, and manage our internal systems more
                efficiently.
              </p>
            </Section>

            <Section title='Shopping and User Activity Tracking'>
              <p>
                We collect certain types of technical and usage data during your
                interactions with our website. This includes IP addresses for
                system administration, demographic analysis, ad delivery, and
                reporting of non-personal information to our partners. Details
                we may gather include the referring URL, domain type (e.g., .com
                or .org), IP address, access date and time, number of visits or
                orders, browser and operating system details, server type,
                geographic data (such as country, state, or area code), site
                pages viewed, browser language, Java or cookie support,
                plug-ins, and any search terms entered on our platform.
              </p>
            </Section>

            <Section title='Ordering'>
              <p>
                When you place an order, we collect personally identifiable
                information such as your name, email address, billing and
                shipping addresses, phone number, selected products, payment
                details, order number, IP address, referring URL, and a
                password. This information is necessary to fulfill your order,
                provide order updates, and send promotional content. You will
                have the opportunity to review and update your information
                before finalizing your purchase, and these updates will be
                securely saved for future transactions.
              </p>
            </Section>

            <Section title='Digital Downloads'>
              <p>
                For digital products and downloads, we collect personal details
                including your name, email, billing/shipping information,
                company name (if applicable), contact numbers, product
                selections, payment details, order reference, IP address, and
                login credentials. This data allows us to fulfill your order,
                manage royalty or license obligations, maintain site operations,
                and provide marketing communication. Downloadable content may
                include usage limitations and restrictions tied to specific
                devices or systems.
              </p>
            </Section>

            <Section title='Surveys and Polls'>
              <p>
                To help us improve our services, we may invite customers to
                complete voluntary surveys. These may be conducted internally or
                by a third party. While individual responses remain
                confidential, aggregate non-personal data may be shared with
                relevant partners. Participation is optional.
              </p>
            </Section>

            <Section title='Contests and Promotions'>
              <p>
                When you participate in giveaways, contests, or other
                promotions, we may request personal information such as your
                name, address, and email. This information is used to manage the
                promotion, notify winners, and—where legally required—publicly
                disclose winners. Participation implies consent to receive
                promotional content related to the contest. You may also be
                required to submit eligibility documentation to claim prizes.
              </p>
            </Section>

            <Section title='Newsletters & Promotional Emails'>
              <p>
                We provide free newsletters and promotional emails to keep our
                customers informed about deals, offers, and news. If you no
                longer wish to receive such messages, you can unsubscribe by
                contacting us at{' '}
                <a
                  href='mailto:support@embroidize.com'
                  className='text-blue-600 underline'
                >
                  support@embroidize.com
                </a>{' '}
                Note that if you opt into receiving emails from third-party
                partners, those communications will be governed by their own
                privacy policies and opt-out mechanisms.
              </p>
            </Section>

            <Section title='Customer Service and Communication Records'>
              <p>
                When you contact our customer service team—via phone, email, or
                contact forms—we may retain a record of the communication. This
                helps us track support issues and improve service quality. If
                third parties contact us regarding your use of our site, we may
                also retain that correspondence for reference.
              </p>
            </Section>

            <Section title='Advertising'>
              <p>
                We may display advertisements on our website tailored to user
                interests. This allows us to deliver relevant promotions based
                on your browsing behavior. Advertisers do not have access to
                your personal information. We may use aggregated,
                non-identifiable data to help advertisers target appropriate
                audiences. For example, we may include an advertisement in a
                marketing email to customers who have shown interest in a
                relevant product category.
              </p>
            </Section>

            <Section title='Site Usage Tracking'>
              <p>
                We monitor how users navigate and interact with our site,
                including the pages viewed, ads clicked, products added to the
                cart, and completed purchases. This information is used to
                troubleshoot technical issues, optimize performance, and better
                understand customer preferences. Aggregated usage statistics may
                be shared with business partners or third parties.
              </p>
            </Section>

            <Section title='Cookies'>
              <p>
                We use cookies to improve your browsing experience and enable
                site functionality. Cookies help store preferences, track user
                sessions, and deliver relevant content. Third parties may also
                use cookies in association with our site for analytics or
                advertising purposes.
              </p>
            </Section>

            <Section title='Sharing Your Information'>
              <p>
                We do not sell, trade, or rent your personal data to third
                parties. However, we may share your information with trusted
                partners in the following situations:
              </p>
              <ul className='list-disc pl-6 space-y-1'>
                <li>
                  <strong>Service Providers:</strong>We work with third-party
                  vendors who assist us with essential services such as payment
                  processing, order delivery, and email communications.
                </li>
                <li>
                  <strong>Legal Compliance:</strong> We may disclose information
                  if required by law or if necessary to protect our legal rights
                  or the safety of our users and business.
                </li>
              </ul>
            </Section>

            <Section title='How We Safeguard Your Information'>
              <ul className='list-disc pl-6 space-y-1'>
                <li>SSL encryption for secure transactions</li>
                <li>Routine security audits and platform updates</li>
                <li>Restricted data access to authorized personnel only</li>
              </ul>
            </Section>

            <Section title='Your Data Rights'>
              <ul className='list-disc pl-6 space-y-1'>
                <li>
                  <strong>Access:</strong> Request a copy of your data
                </li>
                <li>
                  <strong>Correction:</strong> Fix inaccurate information
                </li>
                <li>
                  <strong>Deletion:</strong> Ask us to delete your data
                </li>
                <li>
                  <strong>Opt-Out:</strong> Unsubscribe from promotional content
                </li>
              </ul>
              <p>
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
                Our website may feature links to external websites operated by
                third parties. We are not responsible for the content, policies,
                or privacy practices of these sites. We encourage you to review
                their privacy statements before providing any personal data.
              </p>
            </Section>

            <Section title='Policy Updates'>
              <p>
                We may revise this Privacy Policy periodically to reflect
                changes in our practices or for legal and operational reasons.
                Any updates will be posted on this page with a new "last
                updated" date. We recommend checking this page occasionally to
                stay informed on how we protect your data.
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
              {/* <p>Phone: +0123456789</p> */}
            </Section>
          </div>
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
      <div className='space-y-3'>{children}</div>
    </div>
  );
}
