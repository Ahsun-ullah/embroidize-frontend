'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState } from 'react';

import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import EmailOtp from '@/components/Common/EmailOtp';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { useGenerateOtpMutation } from '@/lib/redux/public/auth/authSlice';
import { handleApiError } from '@/lib/utils/handleError';
import { Input } from '@heroui/react';

const mainLogo = '/logo-black.png';

// Wrapper component to handle search params with Suspense
const RegisterContent = () => {
  const [step, setStep] = useState(1);
  const [userDetailsData, setUserDetailsData] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Dynamic import to avoid SSR issues
  const { useSearchParams } = require('next/navigation');
  const searchParams = useSearchParams();
  const pathName = searchParams?.get('pathName') || '/';

  const [generateOtp, { isLoading: otpGenerateIsLoading }] =
    useGenerateOtpMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (otpGenerateIsLoading || isTransitioning) return;

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get('name')?.toString().trim() || '',
      email: formData.get('email')?.toString().trim().toLowerCase() || '',
      password: formData.get('password')?.toString() || '',
    };

    // Validate data before proceeding
    if (!data.name || !data.email || !data.password) {
      handleApiError(
        { message: 'All fields are required' },
        'Validation Error',
      );
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      handleApiError(
        { message: 'Please enter a valid email address' },
        'Validation Error',
      );
      return;
    }

    setUserDetailsData(data);
    setIsTransitioning(true);

    try {
      const response = await generateOtp({ email: data.email }).unwrap();

      SuccessToast(
        'Success',
        response?.message || 'OTP sent successfully!',
        10000,
      );

      // Small delay to ensure state is set before switching steps
      setTimeout(() => {
        setStep(2);
        setIsTransitioning(false);
      }, 100);
    } catch (err) {
      setIsTransitioning(false);
      handleApiError(err, 'Failed to send OTP');
    }
  };

  // Show loading state while transitioning between steps
  if (isTransitioning) {
    return (
      <div className='flex flex-col h-screen items-center justify-center gap-4'>
        <LoadingSpinner />
        <p className='text-gray-600'>Preparing verification...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-screen items-center justify-center gap-2 px-4 sm:px-6 lg:px-8'>
      {step === 1 && (
        <div className='w-full max-w-md sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 border border-slate-400 rounded-3xl'>
          {/* Logo */}
          <div className='flex flex-col items-center mt-2'>
            <Link href='/' prefetch={false} aria-label='Navigate to homepage'>
              <Image
                src={mainLogo}
                alt='Company Logo'
                priority
                width={150}
                height={150}
              />
            </Link>
          </div>

          <div className='overflow-visible px-6 pb-6'>
            {/* Social Logins */}
            <SocialLoginButtons pathName={pathName} />

            <div className='text-center text-sm text-gray-400'>
              or register with email
            </div>

            {/* Email Registration Form */}
            <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
              <div>
                <label htmlFor='name' className='form-label'>
                  User Name
                </label>
                <Input
                  type='text'
                  name='name'
                  id='name'
                  placeholder='Enter your full name'
                  required
                  aria-required='true'
                  className='form-control mt-2'
                  disabled={otpGenerateIsLoading}
                />
              </div>

              <div>
                <label htmlFor='email' className='form-label'>
                  Email
                </label>
                <Input
                  type='email'
                  name='email'
                  id='email'
                  placeholder='Enter your email'
                  required
                  aria-required='true'
                  className='form-control mt-2'
                  disabled={otpGenerateIsLoading}
                />
              </div>

              <div>
                <label htmlFor='password' className='form-label'>
                  Password
                </label>
                <Input
                  type='password'
                  name='password'
                  id='password'
                  placeholder='Enter password'
                  required
                  aria-required='true'
                  className='form-control mt-2'
                  disabled={otpGenerateIsLoading}
                  minLength={6}
                />
              </div>

              <p className='text-sm text-gray-500 my-0'>
                By registering, you agree to our{' '}
                <Link
                  href='/terms-and-conditions'
                  target='_blank'
                  className='text-blue-500 underline'
                  prefetch={false}
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href='/privacy-policy'
                  target='_blank'
                  className='text-blue-500 underline'
                  prefetch={false}
                >
                  Privacy Policy
                </Link>
              </p>

              <div className='w-full flex items-center justify-center'>
                {otpGenerateIsLoading ? (
                  <div role='status' aria-live='polite'>
                    <LoadingSpinner />
                    <span className='sr-only'>Loading...</span>
                  </div>
                ) : (
                  <input
                    type='submit'
                    value='Register'
                    className='button w-full h-10 text-white hover:bg-blue-500 rounded-2xl'
                  />
                )}
              </div>

              <div className='mt-0 text-center'>
                Already have an account?{' '}
                <Link
                  href='/auth/login'
                  className='font-semibold text-blue-500 underline'
                  prefetch={false}
                >
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP Step - with extra safety checks */}
      {step === 2 && userDetailsData && (
        <div className='w-full max-w-md'>
          <EmailOtp
            step={step}
            setStep={setStep}
            userDetailsData={userDetailsData}
            pathName={pathName}
          />
        </div>
      )}

      {/* Safety net - if step is 2 but data is missing, show error/recovery */}
      {step === 2 && !userDetailsData && (
        <div className='text-center p-6'>
          <p className='text-red-500 mb-4'>
            Something went wrong. Please try again.
          </p>
          <button
            onClick={() => {
              setStep(1);
              setUserDetailsData(null);
            }}
            className='button hover:bg-blue-500 text-white px-6 py-2 rounded-2xl'
          >
            Back to Registration
          </button>
        </div>
      )}

      {/* Footer */}
      <div className='text-center mt-4'>
        <p>&copy; {new Date().getFullYear()} Embroidize.</p>
      </div>
    </div>
  );
};

// Main component with Suspense boundary
const Register = () => {
  return (
    <Suspense
      fallback={
        <div className='flex h-screen items-center justify-center'>
          <LoadingSpinner />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
};

export default Register;
