'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GALLERY_CATEGORIES } from './galleryCategories';

const AUTO_MS = 3000;
// After a visitor picks a category (tab, arrow, dot, swipe or a card's
// "See These Designs"), hold it long enough to actually look at it.
const HOLD_MS = 12000;
const SWIPE_PX = 40;

/**
 * "See What You Can Create This Season" — one slide per Q4 category, each
 * slide the same 12-tile grid the gallery always had.
 *
 * The cards above link to #gallery-<id>. Those ids are zero-height anchors
 * rendered by the page (so the links still scroll without JS); this component
 * picks up the id from the click or the URL hash and opens that slide.
 */
export default function HolidayGallerySlider() {
  const count = GALLERY_CATEGORIES.length;
  const [index, setIndex] = useState(0);
  const [delay, setDelay] = useState(AUTO_MS);
  // Autoplay never pauses on hover or on mouse clicks — both used to, and a
  // click left focus on the button, which stopped the slider for good. It
  // pauses only for keyboard focus, when off screen, or via the pause button.
  const [stopped, setStopped] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  // Nothing loads with the page (the gallery is far below the fold). Once it
  // is within 600px of the viewport every slide loads eagerly, so a slide
  // never arrives as a row of blank tiles.
  const [warm, setWarm] = useState(false);
  const rootRef = useRef(null);
  const touchX = useRef(null);

  const goTo = useCallback(
    (i, byUser = true) => {
      setIndex(((i % count) + count) % count);
      setDelay(byUser ? HOLD_MS : AUTO_MS);
    },
    [count],
  );

  // Card links and direct visits to /holiday-embroidery-designs#gallery-<id>.
  useEffect(() => {
    const openFromHash = (hash) => {
      const id = hash?.replace(/^#gallery-/, '');
      const i = GALLERY_CATEGORIES.findIndex((c) => c.id === id);
      if (i !== -1) goTo(i);
    };

    openFromHash(window.location.hash);

    // hashchange alone misses a second click on the same card (the hash does
    // not change), by which time autoplay may have moved on.
    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#gallery-"]');
      if (a) openFromHash(a.getAttribute('href'));
    };
    const onHash = () => openFromHash(window.location.hash);

    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHash);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHash);
    };
  }, [goTo]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setOnScreen(true);
      setWarm(true);
      return;
    }
    const visible = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWarm(true);
          near.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    visible.observe(el);
    near.observe(el);
    return () => {
      visible.disconnect();
      near.disconnect();
    };
  }, []);

  // Reduced motion keeps autoplay (Windows turns the setting on whenever
  // "Animation effects" is off); landing.css drops the slide transition, so
  // slides change in place instead of moving.
  const paused = stopped || keyboardFocus || !onScreen;

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setTimeout(() => goTo(index + 1, false), delay);
    return () => clearTimeout(t);
  }, [paused, index, delay, count, goTo]);

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) >= SWIPE_PX) goTo(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      ref={rootRef}
      className='gslider'
      role='region'
      aria-roledescription='carousel'
      aria-label='Q4 design categories'
      onFocus={(e) => setKeyboardFocus(e.target.matches(':focus-visible'))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setKeyboardFocus(false);
      }}
    >
      <div className='gslider__tabs'>
        {GALLERY_CATEGORIES.map((c, i) => (
          <button
            key={c.id}
            type='button'
            className='gslider__tab'
            aria-pressed={i === index}
            onClick={() => goTo(i)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div
        className='gslider__viewport'
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Slides are stacked in one grid cell and crossfade; the tiles of
            the incoming slide rise in one after another (landing.css). */}
        <div className='gslider__track'>
          {GALLERY_CATEGORIES.map((c, i) => (
            <div
              key={c.id}
              className={`gslider__slide${i === index ? ' is-active' : ''}`}
              role='group'
              aria-roledescription='slide'
              aria-label={`${c.label} (${i + 1} of ${count})`}
              aria-hidden={i !== index}
              inert={i !== index}
            >
              <div className='gallery'>
                {c.images.slice(0, 12).map((img, n) => (
                  <Image
                    key={img.src}
                    className='ph ph--sq'
                    src={img.src}
                    alt={img.alt}
                    width={340}
                    height={340}
                    loading={warm ? 'eager' : 'lazy'}
                    style={{ objectFit: 'cover', '--i': n }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='gslider__nav'>
        <button
          type='button'
          className='gslider__arrow'
          aria-label='Previous category'
          onClick={() => goTo(index - 1)}
        >
          <svg width='16' height='16' viewBox='0 0 16 16' aria-hidden='true'>
            <path
              d='M10 3 5 8l5 5'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
        <div className='gslider__dots'>
          {GALLERY_CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              type='button'
              className='gslider__dot'
              aria-label={`Show ${c.label}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button
          type='button'
          className='gslider__arrow'
          aria-label={stopped ? 'Play slideshow' : 'Pause slideshow'}
          onClick={() => setStopped((v) => !v)}
        >
          <svg width='16' height='16' viewBox='0 0 16 16' aria-hidden='true'>
            {stopped ? (
              <path d='M5 3v10l8-5z' fill='currentColor' />
            ) : (
              <path d='M5 3h2v10H5zM9 3h2v10H9z' fill='currentColor' />
            )}
          </svg>
        </button>
        <button
          type='button'
          className='gslider__arrow'
          aria-label='Next category'
          onClick={() => goTo(index + 1)}
        >
          <svg width='16' height='16' viewBox='0 0 16 16' aria-hidden='true'>
            <path
              d='m6 3 5 5-5 5'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
