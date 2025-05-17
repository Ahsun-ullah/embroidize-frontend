'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function ProductUpdates({
  streamUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}` +
    '/public/product/stream',
  retryInterval = 10000,
}) {
  const router = useRouter();
  const esRef = useRef(null);
  const retryTimeout = useRef(null);
  const [status, setStatus] = useState('connecting');

  const connect = () => {
    setStatus('connecting');
    const es = new EventSource(streamUrl);
    esRef.current = es;

    es.onopen = () => {
      console.log('✅ SSE open');
      setStatus('open');
      //   SuccessToast('Success!', 'Real‑time updates connected', 3000);
    };

    es.onmessage = (e) => {
      console.log('📨 SSE message', e.data);
      router.refresh();
    };

    es.onerror = (err) => {
      console.error('❌ SSE error', err);
      setStatus('error');
      //   ErrorToast('Error!', 'Live updates lost. Reconnecting...', 3000);
      es.close();

      // schedule reconnection
      retryTimeout.current = setTimeout(() => {
        setStatus('reconnecting');
        connect();
      }, retryInterval);
    };
  };

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      clearTimeout(retryTimeout.current);
    };
  }, []);

  return (
    <>
      {status !== 'open' && (
        <div className='fixed top-16 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-3 py-1 rounded shadow'>
          {status === 'connecting' && 'Connecting real‑time updates...'}
          {status === 'error' && 'Connection lost. Reconnecting...'}
          {status === 'reconnecting' && 'Reconnecting...'}
        </div>
      )}
    </>
  );
}
