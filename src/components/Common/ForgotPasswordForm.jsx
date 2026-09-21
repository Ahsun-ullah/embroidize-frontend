'use client';

import { handleApiError } from '@/lib/utils/handleError';
import { useForgotPasswordMutation } from '@/lib/redux/common/user/userInfoSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import LoadingSpinner from './LoadingSpinner';
import { SuccessToast } from './SuccessToast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const ForgotPasswordModal = React.memo(function ForgotPasswordModal({ isOpen, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
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
      handleApiError(error, 'Failed to send reset link');
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      role='dialog'
      aria-modal='true'
      aria-labelledby='forgot-password-title'
    >
      <div className='bg-white w-full max-w-md p-6 rounded-lg relative shadow-lg'>
        <button
          onClick={handleClose}
          className='absolute top-3 right-3 text-gray-500 hover:text-black text-xl'
          aria-label='Close dialog'
        >
          <i className='ri-close-fill text-2xl' />
        </button>

        <h2 id='forgot-password-title' className='text-2xl font-bold mb-6 text-center'>
          Forgot Password
        </h2>

        {submitted ? (
          <div className='text-sm text-neutral-700 text-center space-y-2'>
            <p>
              If your email is registered, a reset link is on its way. It can
              take a couple of minutes — check your spam folder too.
            </p>
            <p className='font-semibold text-neutral-900'>
              The link is valid for one hour, so open it as soon as it arrives.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='mb-6'>
              <label className='block font-medium mb-1' htmlFor='email'>
                Email Address
              </label>
              <input
                type='email'
                id='email'
                {...register('email')}
                className='w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20'
                placeholder='Enter your email'
                aria-required='true'
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className='text-red-500 text-sm mt-1' role='alert'>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Not gated on react-hook-form's isDirty: a browser or password
                manager filling the field does not reliably mark the form dirty,
                which left the button greyed out and unclickable with a perfectly
                good address typed into it. Validation already refuses an empty
                or malformed email. */}
            <button
              type='submit'
              disabled={isLoading}
              className={`w-full h-10 font-semibold rounded-md transition ${
                isLoading
                  ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              {isLoading ? <LoadingSpinner /> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
});

export default ForgotPasswordModal;
