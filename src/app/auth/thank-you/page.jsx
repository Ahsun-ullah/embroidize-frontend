'use client';

import { Button } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const redirectPath = searchParams.get('redirect') || '/';

  // Separate countdown timer effect
  useEffect(() => {
    if (countdown === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Separate redirect effect
  useEffect(() => {
    if (countdown === 0) {
      router.push(redirectPath);
    }
  }, [countdown, redirectPath, router]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4'>
      <div className='bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center'>
        {/* Success Icon */}
        <div className='mx-auto mb-6 w-24 h-24 rounded-full bg-green-100 flex items-center justify-center'>
          <svg
            className='w-14 h-14 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>

        {/* Thank You Message */}
        <h1 className='text-4xl font-bold mb-4 text-gray-900'>
          Welcome to Embroidize! 🎉
        </h1>
        <p className='text-gray-600 mb-3 text-lg'>Thank you for registering!</p>
        <p className='text-gray-500 mb-8'>
          Your account has been created successfully. You're now ready to
          download unlimited embroidery designs and explore our entire
          collection.
        </p>

        {/* Features List */}
        <div className='bg-gray-50 rounded-lg p-6 mb-6 text-left'>
          <h3 className='font-semibold mb-3 text-gray-800'>What's next?</h3>
          <ul className='space-y-2 text-sm text-gray-600'>
            <li className='flex items-start'>
              <span className='text-green-600 mr-2'>✓</span>
              Browse thousands of embroidery designs
            </li>
            <li className='flex items-start'>
              <span className='text-green-600 mr-2'>✓</span>
              Download designs in multiple formats (PES, DST, JEF, etc.)
            </li>
            <li className='flex items-start'>
              <span className='text-green-600 mr-2'>✓</span>
              Access exclusive design bundles and collections
            </li>
            <li className='flex items-start'>
              <span className='text-green-600 mr-2'>✓</span>
              Get new designs added weekly
            </li>
          </ul>
        </div>

        {/* Countdown */}
        {countdown > 0 && (
          <p className='text-sm text-gray-500 mb-4'>
            Redirecting in{' '}
            <span className='font-semibold text-blue-600'>{countdown}</span>{' '}
            seconds...
          </p>
        )}

        {/* Continue Button */}
        <Button
          className='w-full bg-black text-white font-semibold hover:bg-gray-800'
          size='lg'
          onPress={() => router.push(redirectPath)}
        >
          Start Exploring Now →
        </Button>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading...</p>
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
