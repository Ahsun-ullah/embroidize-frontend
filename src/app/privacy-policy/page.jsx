import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We may collect personal and non-personal information including:\n\n- Name and email address\n- Account credentials\n- Billing information (processed via third parties)\n- IP address and geolocation data\n- Device, browser, and usage data\n- Download activity and interaction logs`,
    },
    {
      title: '2. How We Use Your Information',
      content: `We use your information to:\n\n- Process transactions and subscriptions\n- Deliver digital products\n- Provide customer support\n- Improve platform performance and user experience\n- Detect fraud, abuse, or unauthorized activity\n- Communicate updates, offers, and service notices`,
    },
    {
      title: '3. Legal Basis for Processing (GDPR)',
      content: `We process your data based on:\n\n- Contractual necessity (to provide services)\n- Legal obligations\n- Legitimate interests (security, analytics, improvement)\n- Your consent (for marketing communications)`,
    },
    {
      title: '4. Payment Processing',
      content: `All payments are securely handled by third-party providers such as Stripe or PayPal.\n\nWe do not store your full payment card details on our servers.`,
    },
    {
      title: '5. Cookies & Tracking Technologies',
      content: `We use cookies and similar technologies to:\n\n- Maintain user sessions\n- Remember preferences\n- Analyze traffic and behavior\n- Improve functionality\n\nYou can control cookies through your browser settings.`,
    },
    {
      title: '6. Analytics & Usage Tracking',
      content: `We may collect analytics data such as page views, clicks, downloads, and session behavior to improve our platform.\n\nThis data may be aggregated and anonymized.`,
    },
    {
      title: '7. Anti-Fraud & Abuse Detection',
      content: `We use IP tracking, activity monitoring, and behavioral analysis to prevent:\n\n- Multiple account abuse\n- Download limit bypassing\n- Unauthorized access\n- Fraudulent transactions\n\nAccounts involved in suspicious activity may be restricted or terminated.`,
    },
    {
      title: '8. Data Retention',
      content: `We retain your data only as long as necessary to:\n\n- Provide services\n- Maintain legal and financial records\n- Resolve disputes\n- Enforce agreements`,
    },
    {
      title: '9. Data Sharing',
      content: `We do not sell your personal data.\n\nWe may share information with trusted third parties including:\n\n- Payment processors (Stripe, PayPal)\n- Analytics providers\n- Hosting and infrastructure services\n\nThese parties are required to protect your data.`,
    },
    {
      title: '10. International Data Transfers',
      content: `Your data may be processed in countries outside your location. We ensure appropriate safeguards are applied to protect your information.`,
    },
    {
      title: '11. Your Rights',
      content: `You have the right to:\n\n- Access your personal data\n- Correct inaccurate data\n- Request deletion\n- Withdraw consent\n- Object to certain processing\n\nTo exercise your rights, contact support@embroidize.com`,
    },
    {
      title: '12. Marketing Communications',
      content: `We may send promotional emails. You can unsubscribe at any time by contacting us or using the unsubscribe link.`,
    },
    {
      title: '13. Children’s Privacy',
      content: `Our services are not intended for individuals under 13 years of age. We do not knowingly collect data from children.`,
    },
    {
      title: '14. Security Measures',
      content: `We implement appropriate security measures including encryption, access controls, and monitoring systems to protect your data.`,
    },
    {
      title: '15. Third-Party Links',
      content: `Our website may contain links to third-party websites. We are not responsible for their privacy practices.`,
    },
    {
      title: '16. Changes to Policy',
      content: `We may update this Privacy Policy at any time. Continued use of the platform constitutes acceptance of the updated policy.`,
    },

    {
      title: '17. Contact Information',
      content: (
        <>
          <p>For privacy-related inquiries:</p>
          <a
            href='mailto:support@embroidize.com'
            className='text-blue-600 underline font-medium'
          >
            support@embroidize.com
          </a>
        </>
      ),
    },
  ];

  return (
    <>
      <Header />

      <h1 className='text-4xl font-bold text-center my-6'>
        Privacy Policy – Embroidize LLC
      </h1>

      <main className='container px-6 mb-10 text-gray-800'>
        <p className='text-sm text-gray-500 mb-6 text-center'>
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <p className='mb-8 text-center'>
          At Embroidize LLC, we are committed to protecting your personal data
          and ensuring transparency in how we collect and use information.
        </p>

        {sections.map((section, index) => (
          <div key={index} className='mb-8 border-t pt-6'>
            <h2 className='text-xl font-semibold mb-2'>{section.title}</h2>
            <p className='whitespace-pre-line'>{section.content}</p>
          </div>
        ))}
      </main>

      <Footer />
    </>
  );
}
