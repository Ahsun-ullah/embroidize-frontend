'use client';

import { Spinner } from '@heroui/react';
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('productId');
  const productName = searchParams.get('name');
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get('token');

  useEffect(() => {
    const checkAccess = async () => {
      if (!productId || !token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/product-access/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const json = await res.json();
        if (json.hasAccess) {
          setHasAccess(true);
          router.push(`/product/${productName}?id=${productId}`);
        } else {
          setTimeout(checkAccess, 3000);
        }
      } catch (err) {
        console.error('Error verifying purchase', err);
        setTimeout(checkAccess, 3000);
      }
    };

    checkAccess();
  }, [productId, token, router]);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <Spinner size='lg' color='primary' />
      <p className='mt-4 text-lg font-medium text-gray-700'>
        Verifying your purchase... Please wait.
      </p>
    </div>
  );
}
