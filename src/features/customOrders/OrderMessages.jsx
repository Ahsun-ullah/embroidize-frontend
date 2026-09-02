'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { useCallback, useEffect, useState } from 'react';
import MessageThread from './MessageThread';
import { fetchOrderMessages, sendOrderMessage } from './ordersApi';

// Customer-side message thread for a single order. Loads on mount and appends
// optimistically on send. Pass `embedded` to drop the bordered card + heading
// when the parent already provides that chrome.
export default function OrderMessages({
  orderId,
  embedded = false,
  dark = false,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const msgs = await fetchOrderMessages(orderId);
      setMessages(msgs);
    } catch {
      // Non-fatal — the thread just stays empty if it can't load.
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSend = async (body, image) => {
    setSending(true);
    try {
      const msg = await sendOrderMessage(orderId, body, image);
      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      ErrorToast('Could not send', err.message, 4000);
    } finally {
      setSending(false);
    }
  };

  const inner = loading ? (
    <p
      className={`py-6 text-center text-sm ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}
    >
      Loading…
    </p>
  ) : (
    <MessageThread
      messages={messages}
      onSend={handleSend}
      sending={sending}
      dark={dark}
      viewerSide='customer'
      emptyHint='Questions about your order? Message us here and we’ll reply by email + here.'
    />
  );

  if (embedded) return inner;

  return (
    <div className='mt-6 rounded-xl border border-zinc-200 bg-white p-5'>
      <h2 className='mb-4 text-sm font-bold uppercase tracking-wide text-zinc-500'>
        Messages
      </h2>
      {inner}
    </div>
  );
}
