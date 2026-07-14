'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { Button, Textarea } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_MB = 10;

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
// `onSend(body, imageFile)` — imageFile is null when no photo is attached.
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
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Object URLs must be released or they leak for the tab's lifetime.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    // Allow re-selecting the same file after removing it.
    e.target.value = '';
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      ErrorToast(
        'Unsupported file',
        'Please attach a JPG, PNG, GIF or WebP image.',
        4000,
      );
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      ErrorToast(
        'File too large',
        `Please keep the image under ${MAX_IMAGE_MB} MB.`,
        4000,
      );
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const submit = async () => {
    const body = text.trim();
    if ((!body && !image) || sending) return;
    await onSend(body, image);
    setText('');
    removeImage();
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
                  {m.body && (
                    <p
                      className={`whitespace-pre-wrap break-words ${
                        mine
                          ? dark
                            ? 'text-zinc-900'
                            : 'text-zinc-100'
                          : dark
                            ? 'text-zinc-900'
                            : 'text-zinc-900'
                      }`}
                    >
                      {m.body}
                    </p>
                  )}
                  {m.image?.url && (
                    <a
                      href={m.image.url}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <img
                        src={m.image.url}
                        alt='Photo attachment'
                        loading='lazy'
                        className={`${m.body ? 'mt-2' : ''} max-h-48 w-auto rounded-lg object-cover`}
                      />
                    </a>
                  )}
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
        <input
          ref={fileInputRef}
          type='file'
          accept={IMAGE_TYPES.join(',')}
          className='hidden'
          onChange={handlePickImage}
        />
        {imagePreview && (
          <div className='flex items-start gap-3'>
            <img
              src={imagePreview}
              alt='Selected photo'
              className={`max-h-24 w-auto rounded-lg border object-cover ${
                dark ? 'border-white/10' : 'border-zinc-200'
              }`}
            />
            <button
              type='button'
              onClick={removeImage}
              className={`text-xs underline ${
                dark
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-zinc-500 hover:text-black'
              }`}
            >
              Remove
            </button>
          </div>
        )}
        <div className='flex items-center justify-between'>
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            title='Attach a photo'
            className={`flex items-center gap-1.5 rounded-lg border border-dashed px-2.5 py-1.5 text-xs ${
              dark
                ? 'border-white/20 text-zinc-400 hover:border-white/40 hover:text-white'
                : 'border-zinc-300 text-zinc-500 hover:border-zinc-500 hover:text-black'
            }`}
          >
            <svg
              width={14}
              height={14}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <rect x='3' y='3' width='18' height='18' rx='2' />
              <circle cx='8.5' cy='8.5' r='1.5' />
              <path d='m21 15-5-5L5 21' />
            </svg>
            Photo
          </button>
          <Button
            size='sm'
            className={
              dark ? 'bg-white font-medium text-black' : 'bg-black text-white'
            }
            isLoading={sending}
            onPress={submit}
            isDisabled={!text.trim() && !image}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
