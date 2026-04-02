import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using Embroidize.com, you agree to be legally bound by these Terms and Conditions. If you do not agree, please discontinue use immediately.`,
    },
    {
      title: '2. Digital Products',
      content: `All products available on Embroidize are digital machine embroidery design files.

- No physical items will be shipped
- Files are intended for machine embroidery only
- Files are delivered electronically after purchase`,
    },
    {
      title: '3. License & Usage Rights',
      content: `All designs are provided under a limited, non-exclusive, non-transferable, and revocable license.

You may:
- Use designs for personal use
- Use designs for small business commercial products (physical items only)

You may NOT:
- Resell or redistribute digital files
- Share files publicly or privately
- Claim designs as your own`,
    },
    {
      title: '4. Subscription Services',
      content: `Embroidize operates on a subscription-based model.

- Subscriptions provide access to downloadable embroidery files
- Plans include download limits (daily or total)
- Subscriptions renew automatically unless canceled

By subscribing, you authorize recurring billing.`,
    },
    {
      title: '5. Billing & Cancellation',
      content: `Subscriptions are billed on a recurring basis (monthly or yearly).

- Payments are automatically charged at the start of each cycle
- You may cancel anytime from your account
- Cancellation stops future billing only
- Access continues until the end of the billing period

No partial refunds are provided.`,
    },
    {
      title: '6. Payments',
      content: `All payments are processed securely via third-party providers such as Stripe or PayPal.

We do not store your full payment details.`,
    },
    {
      title: '7. Digital Delivery',
      content: `Files are delivered instantly after successful payment.

- Files are accessible via your account dashboard
- You are responsible for downloading and storing your files
- We do not guarantee permanent file access`,
    },
    {
      title: '8. Refund Policy',
      content: `Due to the digital nature of our products:

- All payments are final and non-refundable once access is granted

Exceptions may apply only if:
- Files are corrupted or unusable
- Files are missing
- A verified system error occurred

You must contact support before requesting any refund.`,
    },
    {
      title: '9. File Compatibility',
      content: `You are responsible for ensuring compatibility with your embroidery machine and software.

Embroidize does not guarantee compatibility with all devices.`,
    },
    {
      title: '10. Stitch Quality Disclaimer',
      content: `Results may vary depending on:

- Machine type
- Fabric
- Stabilizer
- Thread and settings

We are not responsible for issues caused by improper usage or resizing.`,
    },
    {
      title: '11. Prohibited Use',
      content: `You may NOT:

- Attempt to bypass download limits
- Create multiple accounts for abuse
- Use bots or automation tools
- Share or distribute purchased files

Violations may result in account suspension.`,
    },
    {
      title: '12. Intellectual Property',
      content: `All designs remain the intellectual property of Embroidize LLC.

Unauthorized use, reproduction, or resale is strictly prohibited.`,
    },
    {
      title: '13. Anti-Piracy Enforcement',
      content: `We actively monitor and enforce against unauthorized distribution.

Violations may result in:
- Account termination
- Legal action
- DMCA takedowns`,
    },
    {
      title: '14. Account Responsibility',
      content: `You are responsible for maintaining the security of your account and all activity under it.`,
    },
    {
      title: '15. Chargebacks & Disputes',
      content: `If a chargeback is initiated without contacting us:

- Your account may be suspended
- Access to files may be revoked
- We may submit evidence to payment providers

Please contact support before initiating disputes.`,
    },
    {
      title: '16. Limitation of Liability',
      content: `To the fullest extent permitted by law:

Embroidize LLC shall not be liable for indirect or consequential damages.

Total liability shall not exceed the amount paid.`,
    },
    {
      title: '17. Indemnification',
      content: `You agree to indemnify and hold Embroidize harmless from any claims arising from misuse of our services.`,
    },
    {
      title: '18. Governing Law',
      content: `These Terms shall be governed by applicable laws.`,
    },
    {
      title: '19. Changes to Terms',
      content: `We may update these Terms at any time. Continued use of the platform constitutes acceptance of the updated Terms.`,
    },
    {
      title: '20. Contact Information',
      content: (
        <>
          <p>For any questions, please contact:</p>
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
        Terms & Conditions – Embroidize LLC
      </h1>

      <main className='container px-6 mb-10 text-gray-800'>
        <p className='text-sm text-gray-500 mb-6 text-center'>
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <p className='mb-8 text-center'>
          These Terms govern your use of Embroidize and all digital products and
          subscription services provided through our platform.
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