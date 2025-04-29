'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import EmailOtp from '@/components/Common/EmailOtp';
import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { useGenerateOtpMutation } from '@/lib/redux/public/auth/authSlice';

import { Card, CardBody, CardHeader, Input } from '@heroui/react';

const Register = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userDetailsData, setUserDetailsData] = useState(null);
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
        3000,
      );
      setStep(step + 1);
    } catch (err) {
      ErrorToast('Error', err?.data?.message || 'Failed to send OTP', 3000);
    }
  };

  return (
    <div className='flex flex-col h-screen items-center justify-center gap-10 px-4 sm:px-6 lg:px-8'>
      {step === 1 && (
        <Card className='w-full max-w-md p-6 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3'>
          <CardHeader className='flex flex-col items-start'>
            <div className='flex items-center justify-between font-bold text-xl mb-3'>
              <span>Hello From</span>
              <Link
                href='/'
                className='hover:text-blue-700 font-semibold ml-1 text-blue-500'
              >
                Embroid
              </Link>
            </div>
            <p className='text-sm uppercase font-bold'>
              Please fill all fields for registration.
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
                  className='form-control mt-2'
                  placeholder='Enter your full name'
                  required
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='email' className='form-label'>
                  Email
                </label>
                <Input
                  type='email'
                  name='email'
                  className='form-control mt-2'
                  placeholder='Enter your email'
                  required
                />
              </div>
              <div className='mb-6'>
                <label className='form-label' htmlFor='password'>
                  Password
                </label>
                <Input
                  type='password'
                  name='password'
                  className='form-control mt-2'
                  placeholder='Enter password'
                  required
                />
              </div>

              <p className='text-sm text-gray-500 mb-2'>
                By registering, you agree to our{' '}
                <Link href='/terms' className='text-blue-500 underline'>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href='/privacy' className='text-blue-500 underline'>
                  Privacy Policy
                </Link>
              </p>

              <div className='w-full flex items-center justify-center'>
                {otpGenerateIsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <input
                    type='submit'
                    value='Register'
                    className='button hover:bg-blue-500 text-white hover:text-white w-full h-10 rounded-md'
                  />
                )}
              </div>
            </form>

            <div className='mt-5 text-center'>
              <p className='mb-0'>
                Already have an account?{' '}
                <Link
                  href='/auth/login'
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
        />
      )}

      <div className='text-center'>
        <p className='mb-0'>
          &copy; {new Date().getFullYear()} EmbroiD. Crafted with{' '}
          <i className='mdi mdi-heart text-red-500'></i> by Ahsun
        </p>
      </div>
    </div>
  );
};

export default Register;
