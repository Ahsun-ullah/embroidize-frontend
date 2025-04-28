'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { useResetPasswordMutation } from '@/lib/redux/common/user/userInfoSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

export default function ResetPasswordForm() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawQuery = window.location.search;
      const rawToken = rawQuery?.startsWith('?token=')
        ? rawQuery.replace('?token=', '')
        : rawQuery.substring(1);
      setToken(rawToken);
    }
  }, []);

  const onSubmit = async (data) => {
    if (!token) {
      ErrorToast('Error', 'Missing token in URL', 3000);
      return;
    }

    try {
      const response = await resetPassword({
        token,
        password: data.password,
        confirm_password: data.confirm_password,
      }).unwrap();

      SuccessToast('Success', response.message || 'Password reset!', 3000);
      router.push('/auth/login');
    } catch (error) {
      ErrorToast(
        'Error',
        error?.data?.message || 'Password reset failed',
        3000,
      );
    }
  };

  return (
    <>
      <Header />
      <div className='flex my-10 items-center justify-center bg-gray-50 px-4'>
        <div className='w-full max-w-md p-6 bg-white rounded-lg shadow-lg'>
          <h2 className='text-2xl font-bold text-center mb-6'>
            Reset Password
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* New Password */}
            <div className='mb-4 relative'>
              <label htmlFor='password' className='block font-medium mb-1'>
                New Password
              </label>
              <input
                id='password'
                type={showNewPassword ? 'text' : 'password'}
                {...register('password')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter new password'
              />
              <button
                type='button'
                onClick={() => setShowNewPassword((prev) => !prev)}
                className='absolute right-3 top-9 text-gray-500'
              >
                {showNewPassword ? (
                  <i className='ri-eye-off-fill text-xl' />
                ) : (
                  <i className='ri-eye-close-fill text-xl' />
                )}
              </button>
              {errors.password && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className='mb-6 relative'>
              <label
                htmlFor='confirm_password'
                className='block font-medium mb-1'
              >
                Confirm Password
              </label>
              <input
                id='confirm_password'
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirm_password')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Confirm password'
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className='absolute right-3 top-9 text-gray-500'
              >
                {showConfirmPassword ? (
                  <i className='ri-eye-off-fill text-xl' />
                ) : (
                  <i className='ri-eye-close-fill text-xl' />
                )}
              </button>
              {errors.confirm_password && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading || !isDirty}
              className={`w-full h-10 font-semibold rounded-md transition ${
                isLoading || !isDirty
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-blue-500'
              }`}
            >
              {isLoading ? <LoadingSpinner /> : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
