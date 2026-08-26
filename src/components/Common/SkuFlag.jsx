'use client';
import { useState } from 'react';

/**
 * Click-to-copy SKU code.
 *
 * `variant='flag'` (default) is the ribbon used on the product detail page,
 * where there is room for it.
 *
 * `variant='inline'` is for the product grid. The flag cannot be used there:
 * its size is absolute (fixed padding + font size) while a card's size is
 * relative (a fraction of the grid), and the two scale in opposite directions —
 * at ≥640px the flag gets BIGGER while the grid adds columns and cards get
 * NARROWER. On a wide screen showing 4 columns the ribbon covered over half the
 * card and sat across the middle of the design itself. Inline puts it under the
 * title where it costs the artwork nothing.
 */
export default function SkuFlag({ sku, variant = 'flag' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    // Cards wrap their content in links — copying a code must not navigate.
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(sku);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (variant === 'inline') {
    return (
      <button
        type='button'
        onClick={handleCopy}
        title='Click to copy SKU'
        aria-label={`Copy SKU ${sku}`}
        className='mt-1 inline-flex w-fit items-center font-mono text-[11px] leading-none tracking-tight text-neutral-400 transition-colors hover:text-neutral-800'
      >
        {copied ? '✓ copied' : `SKU ${sku}`}
      </button>
    );
  }

  return (
    <button
      type='button'
      onClick={handleCopy}
      title='Click to copy SKU'
      aria-label={`Copy SKU ${sku}`}
      className='absolute top-0 right-0 z-10 group'
    >
      <div className='relative'>
        {/* Flag Body */}
        <div
          className={`
            bg-gray-800 group-hover:bg-black
            px-3 py-1.5 sm:px-4 sm:py-2
            text-xs sm:text-sm
            font-mono font-semibold
            rounded-l-md rounded-br-md
            shadow-md
            transition-all duration-300
            flex items-center justify-center
          `}
        >
          <span
            className={`transition-opacity duration-300 ${
              copied ? 'opacity-100 text-green-400' : 'opacity-100 text-white'
            }`}
          >
            {copied ? 'SKU copied' : `SKU: ${sku}`}
          </span>
        </div>

        {/* Flag Notch */}
        <div
          className={`
            absolute top-0 right-0
            w-0 h-0
            border-t-[16px] sm:border-t-[20px]
            border-t-transparent
            border-l-[10px]
            border-l-gray-800
            group-hover:border-l-black
            transition-colors
          `}
        />
      </div>
    </button>
  );
}
