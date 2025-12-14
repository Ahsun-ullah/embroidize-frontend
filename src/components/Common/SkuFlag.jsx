'use client';
import { useState } from 'react';

export default function SkuFlag({ sku }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sku);
    setCopied(true);

    // Revert back to SKU after 1.5s
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type='button'
      onClick={handleCopy}
      title='Click to copy SKU'
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
