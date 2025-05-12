'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import {
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const FormatDropdown = ({ label, isLoading, options, onSelect }) => (
  <Dropdown className='w-full'>
    <DropdownTrigger>
      <Button
        variant='flat'
        className='w-full bg-black text-white font-semibold text-lg h-12'
        isLoading={isLoading}
      >
        {label}
      </Button>
    </DropdownTrigger>
    <DropdownMenu>
      {options.map((ext) => (
        <DropdownItem key={ext} onPress={() => onSelect(ext)}>
          <span className='uppercase font-semibold text-base'>{ext}</span>
        </DropdownItem>
      ))}
    </DropdownMenu>
  </Dropdown>
);

export default function ProductDownloadCard({ data }) {
  const [isLoading, setIsLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [checkPurchaseLoading, setCheckPurchaseLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const router = useRouter();
  const token = useMemo(() => Cookies.get('token'), []);
  const apiBase = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
  const productId = useSearchParams().get('id');
  const { data: userInfoData, isLoading: fetchUserInfoLoading } =
    useUserInfoQuery();

  const userId = userInfoData?._id;

  const refetchPurchases = useCallback(async () => {
    if (!userId || !productId) return false;
    setCheckPurchaseLoading(true);
    try {
      const res = await fetch(`${apiBase}/product-access/${data?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      return json.hasAccess;
    } catch (err) {
      console.error('Error checking purchase status:', err);
      return false;
    } finally {
      setCheckPurchaseLoading(false);
    }
  }, [apiBase, userId, productId, data?._id, token]);

  useEffect(() => {
    refetchPurchases().then(setHasPurchased);
  }, [refetchPurchases]);

  const downloadFile = async ({ id, extension }) => {
    if (!token) {
      window.location.href = `/auth/login?pathName=${window.location.pathname}?id=${id}`;
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${apiBase}/download/product/${id}/extension/${extension}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok)
        throw new Error((await res.json())?.message || 'Download failed');

      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `From_Embroid_${extension}.zip`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    } catch (err) {
      ErrorToast('Download Failed', err.message, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      window.location.href = `/auth/login?pathName=${window.location.pathname}?id=${productId}`;
      return;
    }

    setBuyLoading(true);
    try {
      const amount = Math.round(data.price * 100);
      if (amount < 1) throw new Error('Amount must be at least $0.01');

      const res = await fetch(`${apiBase}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          productId: data._id,
          amount,
          currency: 'usd',
          metadata: { userId: userId, productId: data._id },
        }),
      });

      const json = await res.json();
      if (json.error) throw new Error(json.error.message);

      setClientSecret(json.clientSecret);
      setShowModal(true);
    } catch (err) {
      ErrorToast('Payment Error', err.message, 3000);
    } finally {
      setBuyLoading(false);
    }
  };

  const dropdownLabel = useMemo(() => {
    if (data?.price === 0) return 'Free Download';
    if (hasPurchased) return 'Download Now';
    return `Buy Now – $${data.price.toFixed(2)}`;
  }, [data?.price, hasPurchased]);

  const onSelectExtension = useCallback(
    (ext) => {
      if (data?.price === 0) {
        downloadFile({ id: productId, extension: ext });
      } else if (hasPurchased) {
        downloadFile({ id: productId, extension: ext });
      }
    },
    [data?.price, hasPurchased, productId],
  );

  return (
    <>
      <Card className='flex flex-col gap-4 p-6 w-full max-w-xl mx-auto'>
        <h1 className='text-black font-bold text-2xl'>
          Download Embroidery Machine Design
        </h1>
        <p className='text-gray-600 my-2'>
          Download high-quality embroidery machine designs for free. Get
          creative with our exclusive free collection of embroidery designs.
        </p>

        {fetchUserInfoLoading || checkPurchaseLoading ? (
          <Button
            isLoading
            variant='flat'
            className='w-full bg-black text-white font-semibold text-lg h-12'
          >
            Loading...
          </Button>
        ) : data?.price === 0 || hasPurchased ? (
          <FormatDropdown
            label={dropdownLabel}
            isLoading={isLoading || buyLoading}
            options={data?.available_file_types || []}
            onSelect={onSelectExtension}
          />
        ) : (
          <Button
            onPress={() => handleBuyNow()}
            isLoading={buyLoading}
            variant='flat'
            className='w-full bg-black text-white font-semibold text-lg h-12'
          >
            {dropdownLabel}
          </Button>
        )}
      </Card>

      {showModal && clientSecret && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <Card className='w-full max-w-[840px] max-h-[90vh] overflow-y-auto p-4 sm:p-6'>
            <h2 className='text-xl font-bold mb-4'>Complete Your Purchase</h2>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                clientSecret={clientSecret}
                onSuccess={async () => {
                  // setShowModal(false);
                  router.push(
                    `/payment-confirmation?name=${data?.name.split('-').join('+')}&productId=${productId}`,
                  );
                }}
                onCancel={() => setShowModal(false)}
                priceCents={Math.round(data.price * 100)}
                productName={data?.name}
                productId={productId}
              />
            </Elements>
          </Card>
        </div>
      )}
    </>
  );
}
