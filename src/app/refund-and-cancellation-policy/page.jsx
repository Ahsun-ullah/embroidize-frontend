import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';

export default function RefundPolicyPage() {
  const sections = [
    {
      title: '1. Digital Product Nature',
      content: `Embroidize provides digital machine embroidery design files only.

- No physical products are shipped
- All files are delivered instantly after payment

Due to this nature, all products are classified as non-returnable digital goods.`,
    },
    {
      title: '2. Subscription-Based Access',
      content: `Embroidize operates on a subscription model.

By purchasing a subscription:

- You receive access to download embroidery design files
- Access is limited based on your selected plan (daily or total download limits)
- Subscriptions renew automatically unless canceled`,
    },
    {
      title: '3. Billing & Renewal',
      content: `Subscriptions are billed on a recurring basis (monthly or yearly).

- Payment is automatically charged at the beginning of each billing cycle
- By subscribing, you authorize recurring billing
- Pricing and billing intervals are clearly displayed before checkout`,
    },
    {
      title: '4. Cancellation Policy',
      content: `You may cancel your subscription at any time.

- Cancellation prevents future billing only
- You will retain access until the end of your current billing period
- No partial refunds are provided for unused time`,
    },
    {
      title: '5. No Refund Policy',
      content: `Due to:

- Instant digital delivery
- Immediate access to downloadable files

All payments are final and non-refundable once access has been granted.`,
    },
    {
      title: '6. Exception Cases (Limited Refund Eligibility)',
      content: `We may issue a refund only under the following conditions:

- Files are corrupted or cannot be opened
- Files are missing from the system after purchase
- A verified technical issue occurred on our platform

All refund decisions are made at our discretion after review.`,
    },
    {
      title: '7. Mandatory Support Resolution',
      content: `Before requesting a refund, you must:

- Contact our support team
- Provide a clear description of the issue
- Allow us to troubleshoot or provide a replacement

Most issues are resolved without requiring a refund.`,
    },
    {
      title: '8. Non-Refundable Situations',
      content: `Refunds will NOT be provided for:

- Lack of knowledge on how to use embroidery files
- Machine or software incompatibility
- Change of mind after purchase
- Accidental purchases
- Subscription renewal charges
- Expectation of receiving a physical product`,
    },
    {
      title: '9. Download & Access Responsibility',
      content: `By subscribing or purchasing, you agree:

- Files are delivered instantly after payment
- You are responsible for downloading and storing your files
- Mobile devices may not fully support embroidery file formats

We recommend downloading and backing up files immediately.`,
    },
    {
      title: '10. Technical Disclaimer',
      content: `Embroidize does not guarantee:

- Compatibility with all embroidery machines or software
- Perfect results without proper stabilizer, thread, and machine settings

Users are responsible for testing designs before final use.`,
    },
    {
      title: '11. Chargebacks & Disputes',
      content: `If a chargeback is initiated without contacting us first:

- Your account may be suspended or restricted
- Access to purchased or downloaded files may be revoked
- We may submit evidence (download logs, login activity, IP data) to payment providers

We strongly encourage contacting support before initiating disputes.`,
    },
    {
      title: '12. Agreement & Acknowledgment',
      content: `By subscribing or making a purchase, you confirm that:

- You understand this is a digital product service
- You agree to a no-refund policy after access is granted
- You accept recurring subscription billing terms`,
    },
    {
      title: '13. Contact Information',
      content: (
        <>
          <p>For refund or billing inquiries:</p>
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
        Refund & Cancellation Policy – Embroidize LLC
      </h1>

      <main className='container px-6 mb-10 text-gray-800'>
        <p className='text-sm text-gray-500 mb-6 text-center'>
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <p className='mb-8 text-center'>
          This policy explains how refunds, cancellations, and subscription
          billing are handled on Embroidize.
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