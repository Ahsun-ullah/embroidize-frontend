'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
});

export function ContactUsForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );

      if (response.ok) {
        setIsSubmitted(true);
        reset();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Something went wrong!');
      }
    } catch (error) {
      setError('Something went wrong!');
    }
  };

  if (isSubmitted) {
    return (
      <div className='text-center p-8'>
        <h2 className='text-2xl font-bold text-green-600'>Thank you!</h2>
        <p className='mt-4 text-lg'>Your message has been sent successfully.</p>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto p-8 rounded-lg shadow-lg bg-white'>
      {error && (
        <div
          className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'
          role='alert'
        >
          <span className='block sm:inline'>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div>
          <label
            htmlFor='name'
            className='block text-lg font-medium text-gray-800'
          >
            Name
          </label>
          <input
            id='name'
            type='text'
            {...register('name')}
            className='mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-3'
          />
          {errors.name && (
            <p className='mt-2 text-sm text-red-600'>{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='email'
            className='block text-lg font-medium text-gray-800'
          >
            Email
          </label>
          <input
            id='email'
            type='email'
            {...register('email')}
            className='mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-3'
          />
          {errors.email && (
            <p className='mt-2 text-sm text-red-600'>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='phone'
            className='block text-lg font-medium text-gray-800'
          >
            Phone (Optional)
          </label>
          <input
            id='phone'
            type='tel'
            {...register('phone')}
            className='mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-3'
          />
        </div>

        <div>
          <label
            htmlFor='description'
            className='block text-lg font-medium text-gray-800'
          >
            How can we help?
          </label>
          <textarea
            id='description'
            rows={5}
            {...register('description')}
            className='mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-3'
          />
          {errors.description && (
            <p className='mt-2 text-sm text-red-600'>
              {errors.description.message}
            </p>
          )}
        </div>

        <div className='text-center'>
          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full md:w-auto px-8 py-3 rounded-md font-semibold text-white bg-slate-800 hover:bg-black hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out'
          >
            {isSubmitting ? 'Submitting...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  );
}
