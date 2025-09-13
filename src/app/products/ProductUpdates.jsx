'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function ProductUpdates({ retryInterval = 10000 }) {
  const router = useRouter();
  const esRef = useRef(null);
  const retryTimeout = useRef(null);
  const [status, setStatus] = useState('connecting');
  const [product, setProduct] = useState(null);

  const streamUrl =
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_BASE_API_URL_PROD + '/public/product/stream'
      : process.env.NEXT_PUBLIC_BASE_API_URL_DEV + '/public/product/stream';

  const connect = () => {
    if (!streamUrl || typeof window === 'undefined') return;

    setStatus('connecting');
    const es = new EventSource(streamUrl);
    esRef.current = es;

    es.onopen = () => {
      setStatus('open');
    };

    es.addEventListener('heartbeat', () => {
      // The server is sending a heartbeat to keep the connection alive.
      // We can use this to show a more specific status.
      setStatus('listening');
    });

    es.onmessage = (e) => {
      const newProduct = JSON.parse(e.data);
      setProduct(newProduct);
      router.refresh();
    };

    es.onerror = (err) => {
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

  const statusColor = {
    connecting: 'bg-yellow-500',
    open: 'bg-green-500',
    listening: 'bg-green-500',
    error: 'bg-red-500',
    reconnecting: 'bg-yellow-500',
  };

  return (
    <div className="fixed bottom-4 right-4">
      <div className="flex items-center space-x-2">
        <div className={`h-3 w-3 rounded-full ${statusColor[status]}`}></div>
        <p className="text-sm text-gray-500">
          {/* {status.charAt(0).toUpperCase() + status.slice(1)} */}
        </p>
      </div>
    </div>
  );
}