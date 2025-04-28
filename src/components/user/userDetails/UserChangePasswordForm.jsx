'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { useUpdatePasswordMutation } from '@/lib/redux/common/user/userInfoSlice'; // Adjust path
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const passwordSchema = z.object({
  current_password: z.string().min(6, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
});

export default function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
    },
  });

  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const toggleCurrentPassword = () => setShowCurrentPassword((prev) => !prev);
  const toggleNewPassword = () => setShowNewPassword((prev) => !prev);

  const onSubmit = async (data) => {
    try {
      const response = await updatePassword(data).unwrap();
      SuccessToast('Success', 'Password updated successfully!', 3000);
      reset();
    } catch (error) {
      ErrorToast(
        'Error',
        error.data?.message || 'Failed to update password',
        3000,
      );
    }
  };

  return (
    <div className='w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md'>
      <h1 className='text-2xl font-bold mb-6'>Change Password</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Current Password */}
        <div className='mb-4 relative'>
          <label className='block font-medium mb-1' htmlFor='current_password'>
            Current Password
          </label>
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            id='current_password'
            {...register('current_password')}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10'
            placeholder='Enter current password'
          />
          <button
            type='button'
            className='absolute right-3 top-[32px] text-xl text-gray-500'
            onClick={toggleCurrentPassword}
          >
            {showCurrentPassword ? (
              <i className='ri-eye-off-fill text-2xl' />
            ) : (
              <i className='ri-eye-close-fill text-2xl' />
            )}
          </button>
          {errors.current_password && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.current_password.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className='mb-6 relative'>
          <label className='block font-medium mb-1' htmlFor='new_password'>
            New Password
          </label>
          <input
            type={showNewPassword ? 'text' : 'password'}
            id='new_password'
            {...register('new_password')}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10'
            placeholder='Enter new password'
          />
          <button
            type='button'
            className='absolute right-3 top-[32px] text-xl text-gray-500'
            onClick={toggleNewPassword}
          >
            {showNewPassword ? (
              <i className='ri-eye-off-fill text-2xl' />
            ) : (
              <i className='ri-eye-close-fill text-2xl' />
            )}
          </button>
          {errors.new_password && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.new_password.message}
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
          {isLoading ? <LoadingSpinner /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
