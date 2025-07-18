import ResetPasswordForm from '@/components/Common/ResetPasswordForm';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <div className='flex my-10 items-center justify-center bg-gray-50 px-4'>
        <Suspense fallback={<div>Loading reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
