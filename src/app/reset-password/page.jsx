import ResetPasswordForm from '@/components/Common/ResetPasswordForm';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Header />
      <div className='flex my-10 items-center justify-center bg-gray-50 px-4'>
        <ResetPasswordForm />
      </div>
      <Footer />
    </Suspense>
  );
}
