'use client';

import Link from 'next/link';
import { useState } from 'react';

import EmailOtp from '@/components/Common/EmailOtp';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { useGenerateOtpMutation } from '@/lib/redux/public/auth/authSlice';
import { handleApiError } from '@/lib/utils/handleError';
import { Card, CardBody, CardHeader, Input } from '@heroui/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import mainLogo from '../../../../public/logo-black.png';

const Register = () => {
  const [step, setStep] = useState(1);
  const [userDetailsData, setUserDetailsData] = useState(null);

  const searchParams = useSearchParams();
  const pathName = searchParams.get('pathName');

  console.log(pathName);

  const [generateOtp, { isLoading: otpGenerateIsLoading }] =
    useGenerateOtpMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      name: formData.get('name'),
      email: formData.get('email')?.toString().toLowerCase(),
      password: formData.get('password'),
    };

    setUserDetailsData(data);

    try {
      const response = await generateOtp({ email: data?.email }).unwrap();

      SuccessToast(
        'Success',
        response?.message || 'OTP sent successfully!',
        10000,
      );

      setStep(step + 1);
    } catch (err) {
      handleApiError(err, 'Failed to send OTP');
    }
  };

  return (
    <div className='flex flex-col h-screen items-center justify-center gap-10 px-4 sm:px-6 lg:px-8'>
      {step === 1 && (
        <Card className='w-full max-w-md p-6 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3'>
          <CardHeader className='flex flex-col items-center'>
            <div>
              <Link
                href='/'
                prefetch={false}
                className='relative block'
                aria-label='Navigate to homepage'
              >
                <Image
                  src={mainLogo}
                  alt='Company Logo'
                  priority
                  height={150}
                  width={150}
                />
              </Link>
            </div>

            <p className='text-base  font-bold text-center'>
              Please fill the all fields for registration.
            </p>
          </CardHeader>

          <CardBody className='overflow-visible py-2'>
            <form onSubmit={handleSubmit}>
              <div className='mb-4'>
                <label htmlFor='name' className='form-label'>
                  User Name
                </label>
                <Input
                  type='text'
                  name='name'
                  id='name'
                  className='form-control mt-2'
                  placeholder='Enter your full name'
                  required
                  aria-required='true'
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='email' className='form-label'>
                  Email
                </label>
                <Input
                  type='email'
                  name='email'
                  id='email'
                  className='form-control mt-2'
                  placeholder='Enter your email'
                  required
                  aria-required='true'
                />
              </div>
              <div className='mb-6'>
                <label className='form-label' htmlFor='password'>
                  Password
                </label>
                <Input
                  type='password'
                  name='password'
                  id='password'
                  className='form-control mt-2'
                  placeholder='Enter password'
                  required
                  aria-required='true'
                />
              </div>

              <p className='text-sm text-gray-500 mb-2'>
                By registering, you agree to our{' '}
                <Link
                  target='_blank'
                  prefetch={false}
                  href='/terms-and-conditions'
                  className='text-blue-500 underline'
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  target='_blank'
                  prefetch={false}
                  href='/privacy-policy'
                  className='text-blue-500 underline'
                >
                  Privacy Policy
                </Link>
              </p>

              <div className='w-full flex items-center justify-center '>
                {otpGenerateIsLoading ? (
                  <div role='status' aria-live='polite'>
                    <LoadingSpinner />
                    <span className='sr-only'>Loading...</span>
                  </div>
                ) : (
                  <input
                    type='submit'
                    value='Register'
                    style={{
                      borderRadius: '20px',
                    }}
                    className='button hover:bg-blue-500 text-white hover:text-white w-full h-10 '
                  />
                )}
              </div>
            </form>

            <div className='mt-5 text-center'>
              <p className='mb-0'>
                Already have an account?{' '}
                <Link
                  href='/auth/login'
                  prefetch={false}
                  className='font-semibold ms-1 text-blue-500 underline'
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 2 && (
        <EmailOtp
          step={step}
          setStep={setStep}
          userDetailsData={userDetailsData}
          pathName={pathName}
        />
      )}

      <div className='text-center'>
        <p className='mb-0'>&copy; {new Date().getFullYear()} Embroidize.</p>
      </div>
    </div>
  );
};

export default Register;
