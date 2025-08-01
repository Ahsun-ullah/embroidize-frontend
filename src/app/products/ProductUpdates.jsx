'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function ProductUpdates({ retryInterval = 10000 }) {
  const router = useRouter();
  const esRef = useRef(null);
  const retryTimeout = useRef(null);
  const [status, setStatus] = useState('connecting');

  console.log('status', status);

  const streamUrl =
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD + '/public/product/stream';

  const connect = () => {
    // if (!streamUrl || typeof window === 'undefined') return;

    setStatus('connecting');
    const es = new EventSource(streamUrl);
    esRef.current = es;

    es.onopen = () => {
      console.log('✅ SSE open');
      setStatus('open');
    };

    es.onmessage = (e) => {
      console.log('📨 SSE message', e.data);
      router.refresh();
    };

    es.onerror = (err) => {
      console.error('❌ SSE error', err);
      setStatus('error');
      es.close();

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

  return null;
}
