'use client';

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
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

function FormatDropdown({ label, isLoading, options, onSelect }) {
  return (
    <Dropdown className='w-full'>
      <DropdownTrigger>
        <Button
          variant='flat'
          className='w-full bg-black text-white font-semibold text-lg h-12'
          isLoading={isLoading}
          aria-label={label}
        >
          {label}
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label={`${label} Formats`}>
        {options.map((type) => (
          <DropdownItem
            textValue={type.toUpperCase()}
            key={type}
            onPress={() => onSelect(type)}
          >
            <span className='uppercase font-semibold text-base'>{type}</span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

export default function ProductDownloadCard({ data }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [downloadExtension, setDownloadExtension] = useState('');
  const productId = useSearchParams().get('id');
  const token = Cookies.get('token');
  const apiBase = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
  const { data: userInfoData } = useUserInfoQuery();

  const handleSingleZipFileDownload = useCallback(
    async ({ id, extension }) => {
      const token = Cookies.get('token');
      if (!token) {
        window.location.href = `/auth/login?pathName=${window.location.pathname}?id=${id}`;
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(
          `${apiBase}/download/product/${id}/extension/${extension}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          const errorJson = await res.json().catch(() => ({}));
          ErrorToast(
            errorJson?.message || 'Download Failed',
            errorJson?.error?.message || 'Could not download the ZIP file',
            3000,
          );
          return;
        }

        const blob = await res.blob();
        const filename = `From_Embroid_${extension}.zip`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      } catch (err) {
        ErrorToast(
          'Download Failed',
          err?.message || 'Could not download the ZIP file',
          3000,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase],
  );

  const handleBuyNow = useCallback(
    async (extension) => {
      if (!token) {
        window.location.href = `/auth/login?pathName=${window.location.pathname}?id=${productId}`;
        return;
      }

      setBuyLoading(true);
      try {
        const amount = Math.round(data.price * 100);

        if (amount < 1) {
          ErrorToast('Invalid Amount', 'Amount must be at least $0.01', 3000);
          return;
        }

        const res = await fetch(`${apiBase}/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: userInfoData?._id,
            productId: data?._id,
            amount,
            currency: 'usd',
            metadata: { productId: data?._id },
          }),
        });

        const json = await res.json();
        if (json.error) {
          ErrorToast('Payment Error', json.error.message, 3000);
          return;
        }

        setClientSecret(json.clientSecret);
        setDownloadExtension(extension);
        setShowModal(true);
      } catch (err) {
        ErrorToast('Payment Error', err.message, 3000);
      } finally {
        setBuyLoading(false);
      }
    },
    [apiBase, data?._id, token, userInfoData?._id, productId],
  );

  return (
    <>
      <Card
        isFooterBlurred
        className='flex flex-col gap-4 p-6 w-full max-w-xl mx-auto'
      >
        <h1 className='text-black font-bold text-2xl'>
          Download Embroidery Machine Design
        </h1>
        <p className='text-gray-600 my-2'>
          Download high-quality embroidery machine designs for free. Get
          creative with our exclusive free collection of embroidery designs.
        </p>

        {data?.price > 0 ? (
          <FormatDropdown
            label={`Buy Now – $${(data.price).toFixed(2)}`}
            isLoading={buyLoading}
            options={data?.available_file_types || []}
            onSelect={(type) => handleBuyNow(type)}
          />
        ) : (
          <FormatDropdown
            label='Free Download'
            isLoading={isLoading}
            options={data?.available_file_types || []}
            onSelect={(type) =>
              handleSingleZipFileDownload({ id: productId, extension: type })
            }
          />
        )}
      </Card>

      {showModal && clientSecret && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <Card className='w-full max-w-[840px] max-h-[90vh] overflow-y-auto p-4 sm:p-6'>
            <h2 className='text-lg sm:text-xl md:text-2xl font-bold mb-4'>
              Complete Your Purchase
            </h2>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                clientSecret={clientSecret}
                onSuccess={() => {
                  setShowModal(false);
                  handleSingleZipFileDownload({
                    id: productId,
                    extension: downloadExtension,
                  });
                }}
                onCancel={() => setShowModal(false)}
                priceCents={Math.round(data.price * 100)}
                productName={data?.name}
                downloadExtension={downloadExtension}
                productId={productId}
              />
            </Elements>
          </Card>
        </div>
      )}
    </>
  );
}
