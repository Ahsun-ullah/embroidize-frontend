import { Suspense } from 'react';
import PaymentConfirmationPage from './PaymentConfirmationPage';

export default function PaymentConfirmationPageWrapper() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <PaymentConfirmationPage />
    </Suspense>
  );
}
