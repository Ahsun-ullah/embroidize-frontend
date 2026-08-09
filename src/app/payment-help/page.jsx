import PaymentHelpForm from '@/components/Common/PaymentHelpForm';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';

export const metadata = {
  title: 'Other ways to pay — Embroidize',
  description:
    'Card not working? Pay by PayPal, Payoneer, bank transfer or Wise and we will set your Embroidize account up by hand.',
  // A link you hand out directly; there is no reason for search engines to
  // index it, and it should never compete with /subscriptions.
  robots: { index: false, follow: false },
};

// Standalone, shareable version of the "pay another way" form.
//
// Exists so you can send someone a direct link — from an email reply, a chat, a
// social DM — instead of talking them through finding the option on the pricing
// page. It renders the same PaymentHelpForm the modal does, so the two can never
// drift apart.
export default function PaymentHelpPage() {
  return (
    <>
      <Header />
      <div className='min-h-screen bg-[#f4f4f4] px-4 py-12'>
        <div className='mx-auto max-w-lg'>
          <div className='mb-6 text-center'>
            <h1 className='text-3xl font-extrabold tracking-tight text-black'>
              Other ways to pay
            </h1>
            <p className='mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-600'>
              Card not working, or you&apos;d rather not use one? Tell us what
              you need below and we&apos;ll send payment details — then set your
              account up by hand, usually within a few hours.
            </p>
          </div>

          <div className='rounded-3xl bg-white p-7 shadow-lg'>
            <PaymentHelpForm compact />
          </div>

          <div className='mt-6 rounded-2xl bg-white/60 p-5 text-center'>
            <p className='text-xs leading-relaxed text-gray-600'>
              We accept <strong>PayPal</strong>, <strong>Payoneer</strong>,{' '}
              <strong>US bank transfer</strong> and <strong>Wise</strong>. If
              none of those work for you, say so in the box above and we&apos;ll
              find something that does.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
