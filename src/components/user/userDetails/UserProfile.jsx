'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  useUpdateUserInfoMutation,
  useUserInfoQuery,
} from '@/lib/redux/common/user/userInfoSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  profile_image: z.any().optional(),
});

export default function ProfileForm() {
  const {
    data: userInfoData,
    isLoading,
    error: fetchError,
    refetch: userInfoRefetch,
  } = useUserInfoQuery();

  const [updateUserInfo, { isLoading: updateUserIsLoading }] =
    useUpdateUserInfoMutation();

  const [previewImage, setPreviewImage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (userInfoData) {
      reset({
        name: userInfoData.name ?? '',
        email: userInfoData.email ?? '',
      });
      if (userInfoData.profile_image?.url) {
        setPreviewImage(userInfoData.profile_image.url);
      }
    }
  }, [userInfoData, reset]);

  const onSubmit = async (data) => {
    if (!isDirty && !data.profile_image) {
      SuccessToast('Success', 'No changes to save', 3000);
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('id', userInfoData?._id);

    if (data.profile_image && data.profile_image[0]) {
      formData.append('profile_image', data.profile_image[0]);
    }

    try {
      const response = await updateUserInfo(formData).unwrap();
      userInfoRefetch();
      SuccessToast('Success', 'Profile updated successfully!', 3000);
    } catch (error) {
      ErrorToast(
        'Error',
        error.data?.message || 'Failed to update profile',
        3000,
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        ErrorToast(
          'Error',
          'Please select a valid image file (JPEG, PNG, or GIF)',
          3000,
        );
        e.target.value = '';
        return;
      }

      if (file.size > maxSize) {
        ErrorToast('Error', 'Image size should be less than 5MB', 3000);
        e.target.value = '';
        return;
      }

      setValue('profile_image', e.target.files, { shouldDirty: true });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center'>
        <LoadingSpinner />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className='text-center text-red-500 p-4'>
        Failed to load profile data. Please try again.
      </div>
    );
  }

  return (
    <div className='w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md'>
      <h1 className='text-2xl font-bold mb-6'>Profile Details</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Profile Picture */}
        <div className='flex flex-col sm:flex-row items-center mb-8'>
          <div className='relative mb-4 sm:mb-0'>
            <div className='w-24 h-24 rounded-full overflow-hidden bg-gray-100'>
              <Image
                src={
                  previewImage ||
                  userInfoData?.profile_image?.url ||
                  '/images.jpg'
                }
                alt='Profile'
                width={96}
                height={96}
                className='object-cover w-full h-full'
                onError={(e) => {
                  e.target.src = '/images.jpg';
                }}
              />
            </div>
          </div>

          <div className='ml-0 sm:ml-4'>
            <div className='relative w-40 h-10 bg-gray-100 text-center text-sm font-medium rounded-lg overflow-hidden cursor-pointer hover:bg-gray-200 transition'>
              <span className='absolute inset-0 flex items-center justify-center z-10'>
                Change Photo
              </span>
              <input
                type='file'
                accept='image/jpeg,image/png,image/gif'
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20'
                onChange={handleImageChange}
              />
            </div>
            <p className='text-xs text-gray-500 mt-1'>
              JPEG, PNG or GIF (max. 5MB)
            </p>
          </div>
        </div>

        {/* Name */}
        <div className='mb-4'>
          <label className='block font-medium mb-1' htmlFor='name'>
            Full Name
          </label>
          <input
            {...register('name')}
            id='name'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Enter your full name'
          />
          {errors.name && (
            <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className='mb-6'>
          <label className='block font-medium mb-1' htmlFor='email'>
            Email
          </label>
          <input
            {...register('email')}
            id='email'
            type='email'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Enter your email'
          />
          {errors.email && (
            <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={
            updateUserIsLoading || (!isDirty && !formValues.profile_image)
          }
          className={`w-full h-10 font-semibold rounded-md transition ${
            updateUserIsLoading || (!isDirty && !formValues.profile_image)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black text-white hover:bg-blue-500'
          }`}
        >
          {updateUserIsLoading ? <LoadingSpinner /> : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
