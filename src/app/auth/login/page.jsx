'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import ForgotPasswordModal from '@/components/Common/ForgotPasswordForm';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { useLogInMutation } from '@/lib/redux/public/auth/authSlice';
import { Card, CardBody, CardHeader, Input } from '@heroui/react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import mainLogo from '../../../../public/logo-black.png';

const Login = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const [logIn, { isLoading }] = useLogInMutation();

  const pathName = searchParams.get('pathName');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email').toLowerCase(),
      password: formData.get('password'),
    };

    try {
      const response = await logIn(data);
      if (response.error) {
        ErrorToast(
          'Error',
          response.error.data.message || 'Login failed',
          3000,
        );
      } else {
        SuccessToast(
          'Success',
          response.data.message || 'Login successful!',
          3000,
        );

        Cookies.set('token', response.data.data.token);

        if (response.data.data.role === 'admin') {
          router.push('/admin');
        } else {
          router.push(pathName ? pathName : '/');
        }
      }
    } catch (err) {
      ErrorToast('Error', err.message || 'Something went wrong', 3000);
    }
  };

  const openForgotPassword = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className='flex flex-col h-screen items-center justify-center gap-10 px-4 sm:px-6 lg:px-8'>
        <Card className='w-full max-w-md p-6 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3'>
          <CardHeader className='flex flex-col items-center'>
            <div>
              <Link
                href='/'
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
              Sign in to continue to Embroidize.
            </p>
          </CardHeader>

          <CardBody className='overflow-visible py-2'>
            <form onSubmit={handleSubmit}>
              {/* Email */}
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

              {/* Password & Forgot */}
              <div className='mb-6'>
                <div className='flex items-center justify-between'>
                  <label htmlFor='password-input' className='form-label'>
                    Password
                  </label>
                  <button
                    onClick={openForgotPassword}
                    type='button'
                    className='text-sm text-black hover:underline'
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  type='password'
                  name='password'
                  className='form-control password-input mt-2'
                  placeholder='Enter password'
                  required
                />
              </div>

              {/* Submit */}
              <div className='w-full flex items-center justify-center'>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <input
                    type='submit'
                    value='Login'
                    style={{
                      borderRadius: '20px',
                    }}
                    className='button hover:bg-blue-500 text-white hover:text-white w-full h-10'
                  />
                )}
              </div>
            </form>

            {/* Register link */}
            <div className='mt-5 text-center'>
              <p className='mb-0'>
                Don't have an account?
                <Link
                  href='/auth/register'
                  className='font-semibold ml-1 text-blue-500 underline'
                >
                  Register
                </Link>
              </p>
            </div>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </CardBody>
        </Card>

        {/* Footer */}
        <div className='text-center'>
          <p className='mb-0'>
            &copy; {new Date().getFullYear()} Embroidize. Crafted by Ahsun
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
