'use client';

import { Button, Textarea } from '@heroui/react';
import { useState } from 'react';

function fmt(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// HeroUI Textarea restyled for dark surfaces.
const DARK_TEXTAREA = {
  inputWrapper:
    'bg-white/5 border border-white/10 data-[hover=true]:bg-white/10 group-data-[focus=true]:bg-white/10',
  input: 'text-white placeholder:text-zinc-500',
};

// Presentational conversation thread. Data + fetching are owned by the caller
// (customer page uses the magic-link API, admin uses the finance-gated API).
// `viewerSide` decides which bubbles align right (the viewer's own).
// Pass `dark` when rendering on a dark surface (checkout page).
export default function MessageThread({
  messages = [],
  onSend,
  sending = false,
  viewerSide = 'customer',
  emptyHint,
  dark = false,
}) {
  const [text, setText] = useState('');

  const submit = async () => {
    const body = text.trim();
    if (!body || sending) return;
    await onSend(body);
    setText('');
  };

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex max-h-80 flex-col gap-3 overflow-y-auto pr-1'>
        {messages.length === 0 ? (
          <p
            className={`py-6 text-center text-sm ${
              dark ? 'text-zinc-500' : 'text-zinc-400'
            }`}
          >
            {emptyHint || 'No messages yet. Start the conversation below.'}
          </p>
        ) : (
          messages.map((m, i) => {
            const mine = m.sender === viewerSide;
            const who =
              m.sender === 'admin' ? 'Embroidize' : m.senderName || 'Customer';
            return (
              <div
                key={i}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? dark
                        ? 'bg-white text-black'
                        : 'bg-black text-white'
                      : dark
                        ? 'bg-white/10 text-zinc-100'
                        : 'bg-zinc-100 text-zinc-900'
                  }`}
                >
                  <p
                    className={`whitespace-pre-wrap break-words ${
                      mine
                        ? dark
                          ? 'text-zinc-500'
                          : 'text-zinc-300'
                        : dark
                          ? 'text-zinc-400'
                          : 'text-zinc-400'
                    }`}
                  >
                    {m.body}
                  </p>
                  <p
                    className={`mt-1 text-[10px] ${
                      mine
                        ? dark
                          ? 'text-zinc-500'
                          : 'text-zinc-300'
                        : dark
                          ? 'text-zinc-400'
                          : 'text-zinc-400'
                    }`}
                  >
                    {who} · {fmt(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className='flex flex-col gap-2'>
        <Textarea
          minRows={2}
          maxRows={5}
          placeholder='Write a message…'
          value={text}
          onValueChange={setText}
          classNames={dark ? DARK_TEXTAREA : undefined}
        />
        <div className='flex justify-end'>
          <Button
            size='sm'
            className={
              dark ? 'bg-white font-medium text-black' : 'bg-black text-white'
            }
            isLoading={sending}
            onPress={submit}
            isDisabled={!text.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
