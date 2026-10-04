import PromoLink from './PromoLink';

// A finished poster designed outside the site — its words are in the pixels, so
// nothing is laid over it and it is never cropped: it renders at its own aspect
// ratio.
//
// prefer='wide' (full-width spots): the desktop poster, with the square one
// swapped in below 640px when the admin uploaded it.
// prefer='square' (cards in a row): the square poster on every screen — a wide
// poster shrunk to a third of the page makes its text unreadable.
// Either falls back to whichever image exists.
export default function PromoPoster({ promo, prefer = 'wide', eager = false, className = '' }) {
  const wide = promo?.desktopImage;
  const square = promo?.mobileImage;
  if (!wide && !square) return null;

  const main = prefer === 'square' ? square || wide : wide || square;
  const phoneSource = prefer === 'wide' && wide && square ? square : null;

  return (
    <PromoLink
      promoId={promo._id}
      href={promo.href}
      aria-label={promo.name}
      className={`group block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md ${className}`}
    >
      <picture>
        {phoneSource ? <source media='(max-width: 639px)' srcSet={phoneSource} /> : null}
        <img
          src={main}
          alt={promo.name}
          loading={eager ? 'eager' : 'lazy'}
          decoding='async'
          className='block h-auto w-full transition-transform duration-300 group-hover:scale-[1.01]'
        />
      </picture>
    </PromoLink>
  );
}
