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
      content: `All products available on Embroidize are digital embroidery design files. No physical items will be shipped. Files are intended for machine embroidery only.`,
    },
    {
      title: '3. License & Usage Rights',
      content: `All designs are provided under a limited, non-exclusive, non-transferable, and revocable license.\n\nYou may use the designs for personal and small business commercial use (physical products only).\n\nYou may NOT resell, share, redistribute, or claim the digital files as your own.`,
    },
    {
      title: '4. Subscription Services',
      content: `Embroidize may offer subscription plans that provide access to additional downloads and features.\n\nSubscriptions are billed automatically via Stripe or similar providers. By subscribing, you authorize recurring billing.\n\nYou may cancel at any time. Cancellation will take effect at the end of the billing cycle.`,
    },
    {
      title: '5. Free Download Policy',
      content: `Free accounts may be subject to download limits (daily or weekly).\n\nAny attempt to bypass limits, including creating multiple accounts or automated downloads, is strictly prohibited and may result in account suspension.`,
    },
    {
      title: '6. Payments',
      content: `All payments are processed securely through third-party providers such as Stripe or PayPal. You confirm that you are authorized to use the selected payment method.`,
    },
    {
      title: '7. Digital Delivery',
      content: `Files are delivered instantly after successful payment or download.\n\nYou are responsible for downloading and securely storing your files. We do not guarantee permanent file access.`,
    },
    {
      title: '8. Refund Policy',
      content: `Due to the digital nature of our products, all sales are final.\n\nHowever, if a file does not work properly, we will provide support, replacement, or a refund at our discretion.`,
    },
    {
      title: '9. File Compatibility',
      content: `Customers are responsible for ensuring compatibility with their embroidery machines and software before purchase.\n\nResults may vary depending on machine type, fabric, stabilizer, and settings.`,
    },
    {
      title: '10. Stitch Quality Disclaimer',
      content: `Resizing designs beyond recommended limits may affect stitch quality, density, and performance.\n\nWe are not responsible for issues caused by machine settings or improper usage.`,
    },
    {
      title: '11. Etsy & Website Purchases',
      content: `All purchases made via Embroidize.com, Etsy, or direct delivery are governed by the same Terms.\n\nReceiving files outside the website does not grant additional rights.`,
    },
    {
      title: '12. Intellectual Property',
      content: `All designs remain the intellectual property of Embroidize LLC.\n\nUnauthorized reproduction, redistribution, or resale is strictly prohibited and may result in legal action.`,
    },
    {
      title: '13. DMCA & Copyright Policy',
      content: `If you believe any content infringes your copyright, please contact us with:\n\n- Your contact information\n- Description of the copyrighted work\n- URL of the infringing content\n\nWe will investigate and take appropriate action.`,
    },
    {
      title: '14. Anti-Piracy Enforcement',
      content: `We actively monitor unauthorized distribution of our designs.\n\nViolations may result in account termination, legal action, and DMCA takedown notices.`,
    },
    {
      title: '15. Account Responsibility',
      content: `You are responsible for maintaining the confidentiality of your account and all activities under it.`,
    },
    {
      title: '16. Termination',
      content: `We reserve the right to suspend or terminate accounts that violate these Terms, including abuse, fraud, or misuse of files.`,
    },
    {
      title: '17. Limitation of Liability',
      content: `To the fullest extent permitted by law, Embroidize LLC shall not be liable for any indirect or consequential damages.\n\nOur total liability shall not exceed the amount paid for the product.`,
    },
    {
      title: '18. Indemnification',
      content: `You agree to indemnify and hold Embroidize harmless from any claims arising from misuse of our products or violation of these Terms.`,
    },
    {
      title: '19. Governing Law',
      content: `These Terms shall be governed and interpreted in accordance with applicable laws.`,
    },
    {
      title: '20. Changes to Terms',
      content: `We may update these Terms at any time. Continued use of the platform constitutes acceptance of the updated Terms.`,
    },
    {
      title: '21. Contact Information',
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
          These Terms and Conditions govern your use of Embroidize and all
          digital products and services provided through our platform.
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
