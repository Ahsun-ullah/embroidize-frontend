'use client';

import LoadingSpinner from '@/components/Common/LoadingSpinner';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

// ── Lightbox with pan + zoom ──────────────────────────────────────────────────

function ImageLightbox({ src, alt, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);
  const didPan = useRef(false);
  const containerRef = useRef(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;

  const clampScale = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  // Reset pan when fully zoomed out
  const resetIfNeeded = useCallback((newScale) => {
    if (newScale <= MIN_SCALE) setPosition({ x: 0, y: 0 });
  }, []);

  // Zoom buttons
  const zoomIn = () => {
    setScale((s) => clampScale(parseFloat((s + 0.5).toFixed(1))));
  };
  const zoomOut = () => {
    const next = clampScale(parseFloat((scale - 0.5).toFixed(1)));
    setScale(next);
    resetIfNeeded(next);
  };
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Scroll wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale((prev) => {
      const next = clampScale(parseFloat((prev + delta).toFixed(1)));
      resetIfNeeded(next);
      return next;
    });
  }, [resetIfNeeded]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Keyboard: Escape to close, +/- to zoom
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, scale]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Drag to pan
  const onMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    didPan.current = false;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };
  const onMouseMove = (e) => {
    if (!isDragging || !dragStart.current) return;
    didPan.current = true;
    setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const onMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  // Touch drag to pan
  const onTouchStart = (e) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    const t = e.touches[0];
    didPan.current = false;
    dragStart.current = { x: t.clientX - position.x, y: t.clientY - position.y };
  };
  const onTouchMove = (e) => {
    if (!dragStart.current || e.touches.length !== 1) return;
    didPan.current = true;
    const t = e.touches[0];
    setPosition({ x: t.clientX - dragStart.current.x, y: t.clientY - dragStart.current.y });
  };
  const onTouchEnd = () => { dragStart.current = null; };

  // Close when click lands on the backdrop (not on the image itself) and wasn't a pan
  const onBackdropClick = (e) => {
    if (didPan.current) {
      didPan.current = false;
      return;
    }
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/90'
    >
      {/* Image area — clicking on the backdrop (not the image) closes the lightbox */}
      <div
        ref={containerRef}
        className='relative w-full h-full flex items-center justify-center overflow-hidden'
        onClick={onBackdropClick}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-out' }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease',
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            userSelect: 'none',
            borderRadius: '12px',
          }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className='absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition'
        aria-label='Close'
      >
        <svg width={20} height={20} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2.5}>
          <path d='M18 6 6 18M6 6l12 12' />
        </svg>
      </button>

      {/* Zoom controls */}
      <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2'>
        <button
          onClick={(e) => { e.stopPropagation(); zoomOut(); }}
          disabled={scale <= MIN_SCALE}
          className='w-8 h-8 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition disabled:opacity-30'
          aria-label='Zoom out'
        >
          <svg width={18} height={18} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2.5}>
            <circle cx='11' cy='11' r='8' /><path d='m21 21-4.35-4.35M8 11h6' />
          </svg>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); resetZoom(); }}
          className='px-3 py-1 text-xs text-white font-medium hover:bg-white/20 rounded-full transition min-w-[3rem] text-center'
          aria-label='Reset zoom'
        >
          {Math.round(scale * 100)}%
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); zoomIn(); }}
          disabled={scale >= MAX_SCALE}
          className='w-8 h-8 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition disabled:opacity-30'
          aria-label='Zoom in'
        >
          <svg width={18} height={18} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2.5}>
            <circle cx='11' cy='11' r='8' /><path d='m21 21-4.35-4.35M11 8v6M8 11h6' />
          </svg>
        </button>
      </div>

      {/* Hint */}
      <p className='absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-xs pointer-events-none'>
        Scroll or use buttons to zoom · Drag to pan · Click outside to close
      </p>
    </div>
  );
}

// ── Main media card + thumbnail row ──────────────────────────────────────────

const ProBadge = () => (
  <span className='pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-1.5 text-base font-extrabold text-neutral-900 shadow-sm sm:text-lg'>
    <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor' aria-hidden>
      <path d='M2.5 7.5 7 11l5-7 5 7 4.5-3.5L19.5 19h-15L2.5 7.5Z' />
    </svg>
    PRO
  </span>
);

const PlayIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='currentColor' aria-hidden>
    <path d='M8 5v14l11-7z' />
  </svg>
);

/** Main image + up to 2 gallery images + 1 video, in thumbnail order. */
export function productMediaItems(data) {
  const items = [];
  if (data?.image?.url) items.push({ type: 'image', url: data.image.url });
  for (const g of data?.gallery || []) {
    if (g?.url) items.push({ type: 'image', url: g.url });
  }
  if (data?.video?.url) {
    items.push({
      type: 'video',
      url: data.video.url,
      poster: data.video.poster_url || data?.image?.url || null,
    });
  }
  if (!items.length) items.push({ type: 'image', url: '/blog.jpg' });
  return items;
}

export const SingleProductImageCard = ({ data, onImageLoad, isPremium }) => {
  const items = productMediaItems(data);
  const [active, setActive] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // The video element is only created after the shopper picks the video tile,
  // so it costs nothing on page load.
  const current = items[active] || items[0];
  const imageAlt = data?.name || 'Product image';

  return (
    <div className='flex flex-col gap-3'>
      <div
        className='relative aspect-[3/2] w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isPremium && <ProBadge />}

        {current.type === 'video' ? (
          <video
            key={current.url}
            src={current.url}
            poster={current.poster || undefined}
            controls
            autoPlay
            muted
            loop
            playsInline
            preload='metadata'
            className='h-full w-full bg-black object-contain'
          />
        ) : (
          <>
            {isLoading && active === 0 && (
              <div className='absolute inset-0 z-10 flex items-center justify-center'>
                <LoadingSpinner />
              </div>
            )}

            {/* Product-page hero shows the REAL, full-resolution original (not a
                resized/recompressed variant). `unoptimized` opts this single
                image out of Next's optimizer — thumbnails/cards elsewhere stay
                optimized. It's the same URL the zoom lightbox uses, so opening
                zoom is instant (already cached) with no quality jump. Gallery
                images are already WebP ≤1600px from the upload step. */}
            <Image
              key={current.url}
              src={current.url}
              alt={active === 0 ? imageAlt : `${imageAlt} – view ${active + 1}`}
              fill
              unoptimized
              sizes='(max-width: 1024px) 100vw, 800px'
              className='object-cover transition-opacity duration-300'
              onLoad={() => {
                if (active === 0) {
                  setIsLoading(false);
                  if (onImageLoad) onImageLoad();
                }
              }}
              priority={active === 0}
            />

            {/* Hover overlay with zoom icon */}
            {!(isLoading && active === 0) && (
              <button
                onClick={() => setLightboxOpen(true)}
                aria-label='Zoom image'
                className='absolute inset-0 flex items-center justify-center transition-all duration-200'
                style={{
                  background: isHovered ? 'rgba(0,0,0,0.25)' : 'transparent',
                  opacity: isHovered ? 1 : 0,
                  cursor: 'zoom-in',
                }}
              >
                <div
                  className='flex items-center justify-center w-14 h-14 rounded-full bg-white/90 shadow-lg transition-transform duration-200'
                  style={{ transform: isHovered ? 'scale(1)' : 'scale(0.7)' }}
                >
                  <svg
                    width={28}
                    height={28}
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#111'
                    strokeWidth={2.2}
                  >
                    <circle cx='11' cy='11' r='8' />
                    <path d='m21 21-4.35-4.35M11 8v6M8 11h6' />
                  </svg>
                </div>
              </button>
            )}
          </>
        )}
      </div>

      {/* Thumbnail row — only when there is more than the main image. */}
      {items.length > 1 && (
        <div
          className='grid grid-cols-4 gap-2 rounded-3xl border border-gray-100 bg-white p-2 shadow-sm sm:gap-3 sm:p-3'
          role='tablist'
          aria-label='Product images'
        >
          {items.map((item, i) => (
            <button
              key={`${item.type}-${item.url}`}
              type='button'
              role='tab'
              aria-selected={active === i}
              aria-label={item.type === 'video' ? 'Play product video' : `Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-xl bg-gray-50 transition ${
                active === i
                  ? 'ring-2 ring-neutral-900 ring-offset-2'
                  : 'opacity-90 hover:opacity-100'
              }`}
            >
              {item.type === 'video' ? (
                <>
                  {item.poster && (
                    <Image
                      src={item.poster}
                      alt=''
                      fill
                      sizes='160px'
                      quality={75}
                      className='object-cover'
                    />
                  )}
                  <span className='absolute inset-0 flex items-center justify-center bg-black/15'>
                    <span className='flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow'>
                      <PlayIcon />
                    </span>
                  </span>
                </>
              ) : (
                <Image
                  src={item.url}
                  alt=''
                  fill
                  sizes='160px'
                  quality={75}
                  className='object-cover'
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && current.type === 'image' && (
        <ImageLightbox
          src={current.url}
          alt={imageAlt}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};
