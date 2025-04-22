'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { useForgotPasswordMutation } from '@/lib/redux/common/user/userInfoSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const [submitted, setSubmitted] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (data) => {
    try {
      const response = await forgotPassword(data).unwrap();
      SuccessToast('Success', response?.message || 'Reset link sent!', 4000);
      setSubmitted(true);
      reset();
    } catch (error) {
      ErrorToast(
        'Error',
        error.data?.message || 'Failed to send reset link',
        3000,
      );
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white w-full max-w-md p-6 rounded-lg relative shadow-lg'>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className='absolute top-3 right-3 text-gray-500 hover:text-black text-xl'
        >
          <i className='ri-close-fill text-2xl' />
        </button>

        <h2 className='text-2xl font-bold mb-6 text-center'>Forgot Password</h2>

        {submitted ? (
          <p className='text-green-600 text-sm mb-4 text-center'>
            If your email is registered, a reset link will be sent shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Input */}
            <div className='mb-6'>
              <label className='block font-medium mb-1' htmlFor='email'>
                Email Address
              </label>
              <input
                type='email'
                id='email'
                {...register('email')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter your email'
              />
              {errors.email && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.email.message}
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
              {isLoading ? <LoadingSpinner /> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
