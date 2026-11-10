'use client';

import { Check, Link2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// Share buttons for the daily vote. Facebook and WhatsApp first: that is where
// the page and the group are. Pinterest pins the preview image itself.
export default function VoteShareBar({
  url,
  text,
  image,
  compact = false,
  className = '',
}) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  const open = (href) =>
    window.open(href, '_blank', 'noopener,noreferrer,width=640,height=560');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  const btn =
    'inline-flex items-center justify-center gap-1.5 rounded-full text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';
  const size = compact
    ? 'h-9 w-9 text-base'
    : 'h-10 px-4 text-sm font-semibold';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {!compact && (
        <span className='mr-1 text-sm font-semibold text-gray-700'>Share:</span>
      )}
      <button
        type='button'
        className={`${btn} ${size} bg-[#1877F2]`}
        onClick={() =>
          open(`https://www.facebook.com/sharer/sharer.php?u=${u}`)
        }
        aria-label='Share on Facebook'
      >
        <i className='ri-facebook-fill' aria-hidden />
        {!compact && 'Facebook'}
      </button>
      <button
        type='button'
        className={`${btn} ${size} bg-[#25D366]`}
        onClick={() =>
          open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`)
        }
        aria-label='Share on WhatsApp'
      >
        <i className='ri-whatsapp-line' aria-hidden />
        {!compact && 'WhatsApp'}
      </button>
      <button
        type='button'
        className={`${btn} ${size} bg-[#E60023]`}
        onClick={() =>
          open(
            `https://www.pinterest.com/pin/create/button/?url=${u}&description=${t}${
              image ? `&media=${encodeURIComponent(image)}` : ''
            }`,
          )
        }
        aria-label='Pin on Pinterest'
      >
        <i className='ri-pinterest-line' aria-hidden />
        {!compact && 'Pinterest'}
      </button>
      <button
        type='button'
        className={`${btn} ${size} bg-black`}
        onClick={() =>
          open(`https://twitter.com/intent/tweet?text=${t}&url=${u}`)
        }
        aria-label='Share on X'
      >
        <i className='ri-twitter-x-line' aria-hidden />
        {!compact && 'X'}
      </button>
      <button
        type='button'
        className={`${btn} ${size} bg-gray-700`}
        onClick={copy}
        aria-label='Copy link'
      >
        {copied ? (
          <Check className='h-4 w-4' aria-hidden />
        ) : (
          <Link2 className='h-4 w-4' aria-hidden />
        )}
        {!compact && (copied ? 'Copied' : 'Copy link')}
      </button>
      {canNativeShare && (
        <button
          type='button'
          className={`${btn} ${size} bg-amber-500 text-black sm:hidden`}
          onClick={() =>
            navigator
              .share({ title: 'Embroidize daily free design', text, url })
              .catch(() => {})
          }
          aria-label='More sharing options'
        >
          <Share2 className='h-4 w-4' aria-hidden />
          {!compact && 'More'}
        </button>
      )}
    </div>
  );
}
