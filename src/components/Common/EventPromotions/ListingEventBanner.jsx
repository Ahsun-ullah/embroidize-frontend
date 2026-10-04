'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import PromoLink from './PromoLink';

// Floating event ad on /products, category, subcategory and search pages.
// Phones/tablets: small, bottom-LEFT just above the WhatsApp button (the
// bottom-right holds the Crisp bubble and the scroll control). Desktop (lg+):
// larger, TOP-RIGHT just under the sticky header. It slides in shortly after load so
// it never competes with the product grid's first paint, and the visitor can
// close it.
//
// When the visitor is already browsing a category one of the events targets,
// that event wins; otherwise the admin's first-ranked one does.
//
// A floating card is small, so the square phone poster is used when there is
// one — a wide desktop poster shrunk to this width makes its text unreadable.

const SHOW_DELAY_MS = 1500;
// Closing hides that event for a day, then it may come back — long enough not
// to nag within a browsing session, short enough to remind a returning visitor.
const DISMISS_FOR_MS = 24 * 60 * 60 * 1000;
const dismissKey = (id) => `event-float-dismissed:${id}`;

function isDismissed(id) {
  try {
    const at = Number(localStorage.getItem(dismissKey(id)));
    return !!at && Date.now() - at < DISMISS_FOR_MS;
  } catch {
    return false;
  }
}

export default function ListingEventBanner({
  promotions = [],
  categorySlug,
  subCategorySlug,
}) {
  const [promo, setPromo] = useState(null);
  const [visible, setVisible] = useState(false);

  // Picked after mount: dismissal lives in localStorage, which SSR can't see.
  useEffect(() => {
    const items = promotions.filter(
      (p) => p.showOnListing && (p.mobileImage || p.desktopImage) && !isDismissed(p._id),
    );
    if (!items.length) {
      setPromo(null);
      return;
    }
    const matches = (p) =>
      (subCategorySlug && p.subCategorySlugs?.includes(subCategorySlug)) ||
      (categorySlug && p.categorySlugs?.includes(categorySlug));
    setPromo(items.find(matches) || items[0]);

    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, [promotions, categorySlug, subCategorySlug]);

  if (!promo) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(dismissKey(promo._id), String(Date.now()));
    } catch {
      // Private mode: it simply comes back on the next page.
    }
    setVisible(false);
    setPromo(null);
  };

  const image = promo.mobileImage || promo.desktopImage;

  return (
    <aside
      aria-label={promo.name}
      className={`fixed bottom-24 left-4 z-40 w-56 sm:w-64 lg:bottom-auto lg:left-auto lg:right-6 lg:top-36 lg:w-[400px] xl:w-[460px] transition-all duration-500 ease-out ${
        visible
          ? 'translate-x-0 translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-6 opacity-0 lg:translate-x-8 lg:translate-y-0'
      }`}
    >
      <div className='relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10'>
        <PromoLink promoId={promo._id} href={promo.href} className='group block'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={promo.name}
            loading='lazy'
            decoding='async'
            className='block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]'
          />
        </PromoLink>
        <button
          type='button'
          onClick={dismiss}
          aria-label='Close event ad'
          className='absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white shadow transition hover:bg-black'
        >
          <X className='h-4 w-4' aria-hidden />
        </button>
      </div>
    </aside>
  );
}
