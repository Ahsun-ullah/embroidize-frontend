import LandingPlanCards from '@/components/Common/LandingPlanCards';
import LandingReviews from '@/components/Common/LandingReviews';
import { getFeaturedReviews } from '@/lib/apis/public/featuredReviews';
import { getSubscriptionPlans } from '@/lib/apis/public/subscriptionPlans';
import { money, planTerm } from '@/lib/subscriptions/planPricing';
import { Caveat, Inter, Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { cache, Suspense } from 'react';
import EmbroiderySubscriptionStickyCta from './EmbroiderySubscriptionStickyCta';
import './landing.css';

// Self-hosted at build time and preloaded with the page, instead of the Google
// Fonts @import landing.css used to chain (CSS → fonts.googleapis → gstatic)
// before any text could paint. landing.css reads these variables.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-caveat',
});

/*
 * /embroidery-subscription — evergreen subscription landing page.
 *
 * Delivered as a complete standalone HTML document (<!DOCTYPE html>, <head>,
 * <style>, inline <script>); converted to a real route the same way as
 * /holiday-embroidery-designs:
 *   • <head> → the metadata export below
 *   • <style> → ./landing.css, scoped to the .esub wrapper
 *   • inline <script> → ./EmbroiderySubscriptionStickyCta
 * The document's own <html>/<body>/<main> are gone because the root layout
 * already provides them.
 */

export const metadata = {
  // The root layout's template appends " | Embroidize".
  title: 'Premium Machine Embroidery Designs, Ready to Stitch',
  description:
    'Get instant access to high-quality machine embroidery designs for your personal projects, gifts, and embroidery business. Choose a monthly or yearly plan and start downloading today.',
};

// Prices, plan names and feature lists come from the same endpoint the
// /subscriptions page reads. They were hard-coded from the mockup before,
// which had this page advertising $79.99 a year against a live $49.99 plan.
// The fetch is uncached (it is money), so everything that needs it streams in
// its own Suspense boundary: the page above the pricing band renders at once
// instead of waiting on the API round-trip. cache() makes the price circle and
// the plan cards share ONE request per page view.
const getPlans = cache(getSubscriptionPlans);

// The handwritten circle quotes the live monthly price, and hides itself if
// there is no monthly plan to quote.
async function PricingCircle() {
  const plans = await getPlans();
  const monthlyPlan = plans.find((plan) => planTerm(plan) === 'month');
  if (!monthlyPlan) return null;

  return (
    <p className='script pricing__circle'>
      Just
      <br />
      {money(monthlyPlan.price)}/month
      <br />
      for unlimited
      <br />
      designs!
    </p>
  );
}

async function PlanCards() {
  const plans = await getPlans();

  return (
    <LandingPlanCards
      plans={plans}
      ctaLabels={{
        month: 'Start Monthly',
        year: 'Start Yearly',
        fallback: 'Choose This Plan',
      }}
      fallbackCta='View Subscription Plans'
    />
  );
}

/* ══ REVIEWS ════════════════════════════════════════════════════════════
   Real reviews, curated in admin (Content → Reviews) and served by the
   same getFeaturedReviews() the /subscriptions page uses. The mockup's
   three empty shells and their dashed "AWAITING REAL CONTENT" wrapper
   are gone; the whole section hides itself if nothing is curated.
   (.build-note styles stay in landing.css in case a shell is ever
   needed again.) Streamed like the plans so it never holds up the page.
   ════════════════════════════════════════════════════════════════════════ */
async function ReviewsSection() {
  const { reviews, totalCount } = await getFeaturedReviews();
  if (reviews.length === 0) return null;

  return (
    <section className='band' id='reviews'>
      <div className='wrap'>
        <div className='head' style={{ marginBottom: '20px' }}>
          <h2>Loved by Creators Like You</h2>
        </div>
        <LandingReviews reviews={reviews} totalCount={totalCount} />
      </div>
    </section>
  );
}

// "See What You Can Create". 2400×1600 design images on the CDN host — never
// the Spaces origin, which took 35-94s per image on the holiday page.
const CDN = 'https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com';
const GALLERY_IMAGES = [
  { src: `${CDN}/1781583491165.png`, alt: 'Hummingbird Floral' },
  { src: `${CDN}/1783596988670.png`, alt: 'Happy Duckling Splash' },
  { src: `${CDN}/1780826186614.png`, alt: 'Bumble Bee Floral' },
  { src: `${CDN}/1781507724872.png`, alt: 'Japanese Cherry Blossom' },
  { src: `${CDN}/1780402659954.png`, alt: 'Butterflies in Wildflower Meadow' },
  { src: `${CDN}/1770805209673.png`, alt: 'Bees in Lavender Garden' },
  { src: `${CDN}/1759667724249.png`, alt: 'Row of Embroidered Strawberries' },
  { src: `${CDN}/1759815185512.png`, alt: 'Vintage Peony Floral Bouquet' },
];

export default function EmbroiderySubscriptionPage() {
  return (
    <div
      className={`esub ${poppins.variable} ${inter.variable} ${caveat.variable}`}
    >
      <a className='skip' href='#main'>
        Skip to content
      </a>

      <svg
        width='0'
        height='0'
        style={{ position: 'absolute' }}
        aria-hidden='true'
      >
        <defs>
          <symbol
            id='i-spark'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M12 4l1.5 4 4 1.5-4 1.5L12 15l-1.5-4-4-1.5 4-1.5z' />
            <path d='M18.5 15.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z' />
          </symbol>
          <symbol id='i-bolt' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M13.4 2L5.2 13.3h5.2L9.9 22l8.5-11.6h-5.4z' />
          </symbol>
          <symbol id='i-shield' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 2.4l7.4 3.1v6.1c0 4.6-3.1 8.1-7.4 9.4-4.3-1.3-7.4-4.8-7.4-9.4V5.5z' />
            <path
              d='M8.9 12l2.1 2.2 4.1-4.5'
              fill='none'
              stroke='#fff'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </symbol>
          <symbol
            id='i-file'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z' />
            <path d='M14 3v5h5M9 13h6M9 17h4' />
          </symbol>
          <symbol
            id='i-lock'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='4.6' y='10.4' width='14.8' height='10' rx='2.2' />
            <path d='M8.3 10.4V7.8a3.7 3.7 0 0 1 7.4 0v2.6' />
          </symbol>
          <symbol
            id='i-layers'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M12 3l9 4.6-9 4.6-9-4.6z' />
            <path d='M3 12.2l9 4.6 9-4.6M3 16.4l9 4.6 9-4.6' />
          </symbol>
          <symbol
            id='i-dl'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M12 3v11M7.6 9.8L12 14.2l4.4-4.4M4.5 19.5h15' />
          </symbol>
          <symbol
            id='i-heart'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M12 20s-7.2-4.4-7.2-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7.2 2.6C19.2 15.6 12 20 12 20z' />
          </symbol>
          <symbol id='i-heart-f' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 20.4S4 15.5 4 10.2A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 8 2.7c0 5.3-8 10.2-8 10.2z' />
          </symbol>
          <symbol
            id='i-home'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M3.6 10.6L12 3.8l8.4 6.8' />
            <path d='M5.8 10v10.2h12.4V10M10 20.2v-5.4h4v5.4' />
          </symbol>
          <symbol
            id='i-store'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M3.8 8.8L5 4.4h14L20.2 8.8' />
            <path d='M3.8 8.8a2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.6 0 2.7 2.7 0 0 0 5.4 0' />
            <path d='M5.4 11v9.2h13.2V11' />
            <path d='M9 14.4h6v5.8H9z' />
          </symbol>
          <symbol
            id='i-gift'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='4' y='9.6' width='16' height='10.6' rx='1.6' />
            <path d='M3 9.6h18M12 9.6v10.6' />
            <path d='M12 9.6S10.6 5 8.6 5a2.1 2.1 0 0 0 0 4.6zM12 9.6S13.4 5 15.4 5a2.1 2.1 0 0 1 0 4.6z' />
          </symbol>
          <symbol
            id='i-click'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M8.6 4.4V2.8M4.6 8.4H3M5.6 5.4L4.4 4.2M9 10l9.4 3.6-4 1.6-1.6 4z' />
          </symbol>
          <symbol
            id='i-search'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <circle cx='11' cy='11' r='6.4' />
            <path d='M15.7 15.7L21 21' />
          </symbol>
          <symbol
            id='i-check'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.6'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M5 12.6l4.4 4.4L19 7' />
          </symbol>
          <symbol
            id='i-badge'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M12 2.6l7.2 3v5.8c0 4.4-3 7.8-7.2 9-4.2-1.2-7.2-4.6-7.2-9V5.6z' />
            <path d='M9.1 11.9l2 2 3.8-4.2' />
          </symbol>
          <symbol
            id='i-clock'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <circle cx='12' cy='12' r='9' />
            <path d='M12 6.8V12l3.4 2' />
          </symbol>
          <symbol
            id='i-arw'
            viewBox='0 0 20 20'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M4 10h11M11 6l4 4-4 4' />
          </symbol>
          <symbol
            id='i-hoop'
            viewBox='0 0 48 48'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
          >
            <circle cx='24' cy='25' r='13.5' />
            <circle cx='24' cy='25' r='10' strokeDasharray='3 3' />
            <path d='M20.8 11.8h6.4a1.7 1.7 0 0 1 1.7 1.7v2.1H19.1v-2.1a1.7 1.7 0 0 1 1.7-1.7z' />
          </symbol>
          <symbol
            id='i-curve'
            viewBox='0 0 46 44'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.1'
            strokeLinecap='round'
          >
            <path d='M3 41C10 27 22 12 38 6' />
            <path d='M29 4.5L39.5 5l-1.5 10' />
          </symbol>
        </defs>
      </svg>

      {/* ══ HEADER — logo · Sign In · View Plans ════════════════════════════════
           The reference's row of anchor links was removed on request; Sign In is
           pushed right by a margin rule in landing.css, and the .nav styles are
           kept there so the bar can be restored by putting the <nav> back.
           ════════════════════════════════════════════════════════════════════════ */}
      <header className='site-header'>
        <div className='wrap'>
          <a className='logo' href='#hero' aria-label='Embroidize home'>
            <Image
              src='/logo-black.png'
              alt='Embroidize'
              width={100}
              height={40}
            />
            <svg
              width='26'
              height='26'
              viewBox='0 0 24 24'
              fill='none'
              stroke='var(--brand-500)'
              strokeWidth='1.9'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              <path d='M12 20s-7.2-4.4-7.2-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7.2 2.6C19.2 15.6 12 20 12 20z' />
              <path d='M8.8 12.3l2.1 2.1 4.4-4.8' stroke='var(--brand-300)' />
            </svg>
          </a>
          <Link className='signin' href='/auth/login'>
            Sign In
          </Link>
          <Link className='btn btn--primary btn--sm' href='/subscriptions'>
            View Plans
          </Link>
        </div>
      </header>

      <div id='main'>
        {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
        <section className='hero' id='hero'>
          <span className='hero__blob hero__blob--1' aria-hidden='true'></span>
          <span className='hero__blob hero__blob--2' aria-hidden='true'></span>
          <span className='hero__blob hero__blob--3' aria-hidden='true'></span>
          <div className='wrap'>
            <div className='hero__grid'>
              <div className='hero__copy'>
                <span className='eyebrow'>
                  <svg width='14' height='14' aria-hidden='true'>
                    <use href='#i-spark' />
                  </svg>{' '}
                  Unlimited Embroidery Designs
                </span>
                <h1>
                  Premium Machine
                  <br />
                  Embroidery Designs,
                  <span className='pink'>Ready to Stitch</span>
                </h1>
                <p className='lede'>
                  Get instant access to high-quality embroidery designs for your
                  personal projects, gifts, and embroidery business. Choose a
                  monthly or yearly plan and start downloading today.
                </p>

                <div className='hero__actions'>
                  <Link className='btn btn--primary' href='/subscriptions'>
                    View Subscription Plans{' '}
                    <svg
                      className='arw'
                      width='17'
                      height='17'
                      aria-hidden='true'
                    >
                      <use href='#i-arw' />
                    </svg>
                  </Link>
                  {/* Reference label is "Explore Designs". The written spec retired it
                     because it sends cold traffic to free browsing; kept here to match
                     the design. Change to "See What's Included" + href="#examples"
                     if the client wants the spec behaviour.
                     The reference href was /designs, which does not exist; the
                     catalogue route is /products. */}
                  <Link className='btn btn--ghost' href='/products'>
                    Explore Designs
                  </Link>
                </div>

                <ul className='hero__trust'>
                  <li>
                    <span className='ic'>
                      <svg width='15' height='15' aria-hidden='true'>
                        <use href='#i-bolt' />
                      </svg>
                    </span>
                    <span>
                      <b>Instant</b>
                      <span>Downloads</span>
                    </span>
                  </li>
                  <li>
                    <span className='ic'>
                      <svg width='15' height='15' aria-hidden='true'>
                        <use href='#i-shield' />
                      </svg>
                    </span>
                    <span>
                      <b>Commercial</b>
                      <span>Use</span>
                    </span>
                  </li>
                  <li>
                    <span className='ic'>
                      <svg width='15' height='15' aria-hidden='true'>
                        <use href='#i-file' />
                      </svg>
                    </span>
                    <span>
                      <b>Multiple</b>
                      <span>Machine Formats</span>
                    </span>
                  </li>
                  <li>
                    <span className='ic'>
                      <svg width='15' height='15' aria-hidden='true'>
                        <use href='#i-lock' />
                      </svg>
                    </span>
                    <span>
                      <b>Secure</b>
                      <span>Checkout</span>
                    </span>
                  </li>
                </ul>
              </div>

              {/* Collage. Replace each .ph with the real photograph: put a
                  next/image with `fill` INSIDE the tile, never in place of it —
                  the tile's class positions it and gives it its shape. */}
              <div className='collage'>
                <figure className='c-photo' style={{ margin: '0' }}>
                  <div className='ph ph--photo'>
                    <Image
                      src='/landing/subscription/hero-dog-polaroid.webp'
                      alt='White apron embroidered with a row of five cartoon chickens'
                      fill
                      priority
                      sizes='(max-width: 900px) 40vw, 240px'
                    />
                  </div>
                </figure>
                <div className='c-hoop ph ph--43 ph--img'>
                  <Image
                    src='/landing/subscription/hero-hoop-floral.webp'
                    alt='Embroidered designs on a canvas tote bag, a T-shirt and a pink cap'
                    fill
                    priority
                    sizes='(max-width: 900px) 66vw, 32vw'
                  />
                </div>
                <div className='c-cap ph ph--sq ph--photo'>
                  <Image
                    src='/landing/subscription/hero-cap-m.webp'
                    alt='Canvas tote bag embroidered with a cute highland calf wearing a pink bow'
                    fill
                    sizes='(max-width: 900px) 30vw, 170px'
                  />
                </div>
                <div className='c-patch ph ph--sq ph--photo'>
                  <Image
                    src='/landing/subscription/hero-butterfly.webp'
                    alt='Linen cushion embroidered with wildflowers growing out of an open book'
                    fill
                    sizes='(max-width: 900px) 30vw, 170px'
                  />
                </div>

                <p className='script hero__script'>
                  <span>
                    Turn your photos
                    <br />
                    into embroidery!
                  </span>
                  <svg
                    width='34'
                    height='32'
                    aria-hidden='true'
                    style={{
                      color: 'var(--ink-900)',
                      flex: 'none',
                      marginBottom: '4px',
                    }}
                  >
                    <use href='#i-curve' />
                  </svg>
                </p>
                <p className='script hero__badge'>
                  So many
                  <br />
                  possibilities!
                  <br />
                  <svg
                    width='15'
                    height='15'
                    style={{ marginTop: '3px' }}
                    aria-hidden='true'
                  >
                    <use href='#i-heart-f' />
                  </svg>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ WHY EMBROIDIZE / WHAT YOU GET ═══════════════════════════════════════ */}
        <section className='band' id='what'>
          <div className='wrap'>
            <div className='head'>
              <p className='kicker'>Why Embroidize?</p>
              <h2>Everything You Need for Your Next Embroidery Project</h2>
            </div>
            <div className='grid g4'>
              <article className='fcard'>
                <span className='fcard__ic'>
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-layers' />
                  </svg>
                </span>
                <h3>Thousands of Designs</h3>
                <p>
                  Explore embroidery designs across popular themes, occasions,
                  styles, and projects.
                </p>
              </article>
              <article className='fcard'>
                <span className='fcard__ic'>
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-file' />
                  </svg>
                </span>
                <h3>Multiple File Formats</h3>
                <p>
                  Download machine-ready formats including PES, DST, EXP, JEF,
                  VP3, XXX and more.
                </p>
              </article>
              <article className='fcard'>
                <span className='fcard__ic'>
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-dl' />
                  </svg>
                </span>
                <h3>Instant Downloads</h3>
                <p>
                  Find the design you want and download it immediately. No
                  waiting for files to be delivered manually.
                </p>
              </article>
              <article className='fcard'>
                {/* ⚠ Word to your actual licence. Do not imply resale of the files. */}
                <span className='fcard__ic'>
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-heart' />
                  </svg>
                </span>
                <h3>Commercial Use</h3>
                <p>
                  Create finished embroidered products for yourself, gifts, or
                  your business according to the Embroidize license terms.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ══ SEE WHAT YOU CAN CREATE ═════════════════════════════════════════════ */}
        <section className='band' id='examples' style={{ paddingTop: '0' }}>
          <div className='wrap'>
            <div className='head' style={{ marginBottom: '20px' }}>
              <h2>See What You Can Create</h2>
              <p>
                New inspiration for home projects, gifts, apparel, accessories
                and small-business embroidery.
              </p>
            </div>
            <div className='gallery'>
              {GALLERY_IMAGES.map((img) => (
                <Image
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  width={340}
                  height={227}
                  sizes='(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 290px'
                />
              ))}
            </div>
            <div className='cta-row'>
              <Link className='btn btn--primary' href='/subscriptions'>
                Browse Subscription Plans{' '}
                <svg className='arw' width='17' height='17' aria-hidden='true'>
                  <use href='#i-arw' />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ══ MADE FOR EMBROIDERERS LIKE YOU ══════════════════════════════════════ */}
        <section className='band' id='who' style={{ paddingTop: '0' }}>
          <div className='wrap aud-wrap'>
            <div className='head' style={{ marginBottom: '18px' }}>
              <h2>Made for Embroiderers Like You</h2>
            </div>
            <p className='script aud__script'>
              Turn ideas
              <br />
              into something
              <br />
              special
            </p>
            <div className='grid g3'>
              <article className='aud'>
                <span className='aud__ic'>
                  <svg width='32' height='32' aria-hidden='true'>
                    <use href='#i-home' />
                  </svg>
                </span>
                <div>
                  <h3>Hobby Embroiderers</h3>
                  <p>
                    Find new designs whenever inspiration strikes without
                    purchasing each design individually.
                  </p>
                </div>
              </article>
              <article className='aud'>
                <span className='aud__ic'>
                  <svg width='32' height='32' aria-hidden='true'>
                    <use href='#i-store' />
                  </svg>
                </span>
                <div>
                  <h3>Small Embroidery Businesses</h3>
                  <p>
                    Build a larger design library and create more finished
                    products for your customers.
                  </p>
                </div>
              </article>
              <article className='aud'>
                <span className='aud__ic'>
                  <svg width='32' height='32' aria-hidden='true'>
                    <use href='#i-gift' />
                  </svg>
                </span>
                <div>
                  <h3>Creators &amp; Gift Makers</h3>
                  <p>
                    Find designs for birthdays, holidays, personalized gifts,
                    clothing, bags and home projects.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ══ TWO-COLUMN ROW — comparison + 3 steps ═══════════════════════════════
           Side by side exactly as in the approved design.
           Add className="stacked" to <body> to split them into two full-width rows.
           ════════════════════════════════════════════════════════════════════════ */}
        <section className='band' id='how' style={{ paddingTop: '0' }}>
          <div className='wrap'>
            <div className='row2'>
              <div>
                <h2 style={{ fontSize: 'clamp(1.3rem,2.3vw,1.6rem)' }}>
                  Stop Buying Designs One at a Time
                </h2>
                <p style={{ fontSize: '.875rem', marginBottom: '0' }}>
                  Individual embroidery files can quickly add up when
                  you&apos;re working on multiple projects. With an Embroidize
                  subscription, you can access a growing design library through
                  one simple plan.
                </p>

                <div className='cmp'>
                  <div className='cmp__h'>
                    <div className='a'>Buying individually</div>
                    <div className='b'>Embroidize subscription</div>
                  </div>
                  <div className='cmp__r'>
                    <div className='a'>Pay for designs separately</div>
                    <div className='b'>One subscription</div>
                  </div>
                  <div className='cmp__r'>
                    <div className='a'>Search multiple stores</div>
                    <div className='b'>Browse one library</div>
                  </div>
                  <div className='cmp__r'>
                    <div className='a'>Limited experimentation</div>
                    <div className='b'>Try more styles</div>
                  </div>
                  <div className='cmp__r'>
                    <div className='a'>Separate purchases</div>
                    <div className='b'>Easy digital access</div>
                  </div>
                  <div className='cmp__r'>
                    <div className='a'>Harder to build a collection</div>
                    <div className='b'>Build your design library faster</div>
                  </div>
                </div>
              </div>

              <div>
                <h2
                  className='center'
                  style={{
                    fontSize: 'clamp(1.3rem,2.3vw,1.6rem)',
                    marginBottom: '22px',
                  }}
                >
                  Start Stitching in 3 Simple Steps
                </h2>
                <div className='steps'>
                  <div className='step'>
                    <span className='step__ic'>
                      <svg width='26' height='26' aria-hidden='true'>
                        <use href='#i-click' />
                      </svg>
                    </span>
                    <h3>1. Choose your plan</h3>
                    <p>Select monthly or yearly access.</p>
                  </div>
                  <svg
                    className='steps__arw'
                    width='22'
                    height='22'
                    aria-hidden='true'
                  >
                    <use href='#i-arw' />
                  </svg>
                  <div className='step'>
                    <span className='step__ic'>
                      <svg width='26' height='26' aria-hidden='true'>
                        <use href='#i-search' />
                      </svg>
                    </span>
                    <h3>2. Find your designs</h3>
                    <p>
                      Browse the Embroidize design library and choose your
                      favorites.
                    </p>
                  </div>
                  <svg
                    className='steps__arw'
                    width='22'
                    height='22'
                    aria-hidden='true'
                  >
                    <use href='#i-arw' />
                  </svg>
                  <div className='step'>
                    <span className='step__ic'>
                      <svg width='26' height='26' aria-hidden='true'>
                        <use href='#i-dl' />
                      </svg>
                    </span>
                    <h3>3. Download &amp; stitch</h3>
                    <p>
                      Download the compatible machine file and start your
                      embroidery project.
                    </p>
                  </div>
                </div>
                <div className='cta-row' style={{ marginTop: '0' }}>
                  {/* The reference button reads "Start Started", which is a typo.
                     Shipping "Get Started" instead. Revert this one word if the
                     client genuinely wants the reference text. */}
                  <Link className='btn btn--primary' href='/subscriptions'>
                    Get Started{' '}
                    <svg
                      className='arw'
                      width='17'
                      height='17'
                      aria-hidden='true'
                    >
                      <use href='#i-arw' />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PRICING ═════════════════════════════════════════════════════════════
           The cards are rendered from the live plans, so the mockup's $79.99/yr
           (against a real $49.99) can never come back. The handwritten circle
           (PricingCircle) quotes the live monthly price too.
           ⚠ "unlimited designs" in that circle is still a CLAIM, and the live
             plans are metered (20/day and 25/day). Reword it or drop it before
             this page takes paid traffic.
           ════════════════════════════════════════════════════════════════════════ */}
        <section className='band band--wash pricing' id='pricing'>
          <Suspense fallback={null}>
            <PricingCircle />
          </Suspense>
          <p className='script pricing__script'>
            More designs.
            <br />
            More possibilities.
            <br />
            More savings!
          </p>
          <div className='wrap'>
            <div className='head' style={{ marginBottom: '22px' }}>
              <p className='kicker'>Simple Pricing</p>
              <h2>Choose the Plan That Works for You</h2>
              <p>One plan. Unlimited possibilities.</p>
            </div>

            <Suspense fallback={<div style={{ minHeight: '420px' }} />}>
              <PlanCards />
            </Suspense>
          </div>
        </section>

        <Suspense fallback={null}>
          <ReviewsSection />
        </Suspense>

        {/* ══ THREE-COLUMN ROW — formats · trust · FAQ ════════════════════════════
           Three sections sharing one row, exactly as in the approved design.
           Add className="stacked" to <body> to split them into three full-width rows.
           ════════════════════════════════════════════════════════════════════════ */}
        <section className='band' id='faq' style={{ paddingTop: '0' }}>
          <div className='wrap'>
            <div className='row3'>
              <div>
                <h3 className='col-h'>Supported Formats</h3>
                <ul className='formats'>
                  <li className='fmt'>PES</li>
                  <li className='fmt'>DST</li>
                  <li className='fmt'>EXP</li>
                  <li className='fmt'>JEF</li>
                  <li className='fmt'>VP3</li>
                  <li className='fmt'>XXX</li>
                  <li className='fmt fmt--more'>and more</li>
                </ul>
              </div>

              <div>
                <h3 className='col-h'>Secure &amp; Trusted</h3>
                <ul className='trust3'>
                  <li>
                    <span className='ic'>
                      <svg width='26' height='26' aria-hidden='true'>
                        <use href='#i-lock' />
                      </svg>
                    </span>
                    <span>
                      Secure
                      <br />
                      Checkout
                    </span>
                  </li>
                  <li>
                    <span className='ic'>
                      <svg width='26' height='26' aria-hidden='true'>
                        <use href='#i-badge' />
                      </svg>
                    </span>
                    <span>Safe Payments</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className='col-h'>Frequently Asked Questions</h3>
                <div className='faq'>
                  <details>
                    <summary>What file formats do I get?</summary>
                    <div className='faq__a'>
                      <p>
                        Designs are supplied in popular machine formats
                        including PES, DST, EXP, JEF, VP3 and XXX, plus
                        additional formats where available.
                      </p>
                    </div>
                  </details>
                  <details>
                    <summary>Can I use the designs commercially?</summary>
                    <div className='faq__a'>
                      <p>
                        Eligible designs may be used to make finished
                        embroidered products, including items you sell, in line
                        with the Embroidize licence.{' '}
                        {/* ⚠ word to the real licence */}
                      </p>
                    </div>
                  </details>
                  <details>
                    <summary>Can I cancel anytime?</summary>
                    <div className='faq__a'>
                      <p>
                        Yes. You can manage or cancel your plan from your
                        account at any time.{' '}
                        {/* ⚠ match the real Refund &amp; Cancellation policy */}
                      </p>
                    </div>
                  </details>
                  <details>
                    <summary>Do I need any embroidery experience?</summary>
                    <div className='faq__a'>
                      <p>
                        No. You need an embroidery machine that reads one of the
                        supported formats and a way to transfer the file to it.
                        Embroidery software is not required to stitch a design.
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ══ FOOTER CTA BAR ══════════════════════════════════════════════════════ */}
      <div className='footbar'>
        <svg
          className='footbar__hearts'
          aria-hidden='true'
          width='100%'
          height='100%'
        >
          <defs>
            <pattern
              id='hp'
              width='70'
              height='60'
              patternUnits='userSpaceOnUse'
            >
              <path
                d='M18 34s-8-5-8-10.5A4.3 4.3 0 0 1 18 21a4.3 4.3 0 0 1 8 2.5C26 29 18 34 18 34z'
                fill='#fff'
              />
              <path
                d='M52 62s-8-5-8-10.5A4.3 4.3 0 0 1 52 49a4.3 4.3 0 0 1 8 2.5C60 57 52 62 52 62z'
                fill='#fff'
              />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#hp)' />
        </svg>
        <div className='wrap'>
          <span className='footbar__logo'>
            <svg
              width='26'
              height='26'
              viewBox='0 0 24 24'
              fill='none'
              aria-hidden='true'
            >
              <path
                d='M12 20.2S4.4 15.4 4.4 10.3A3.9 3.9 0 0 1 12 7.8a3.9 3.9 0 0 1 7.6 2.5c0 5.1-7.6 9.9-7.6 9.9z'
                stroke='#fff'
                strokeWidth='1.9'
                strokeLinejoin='round'
              />
              <path
                d='M8.4 11.6l2.4 2.4 4.6-5.2'
                stroke='rgba(255,255,255,.65)'
                strokeWidth='1.7'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            Embroidize
          </span>
          <p>
            Get unlimited embroidery designs today and bring your ideas to life.
          </p>
          <Link className='btn btn--white' href='/subscriptions'>
            Start Your Subscription{' '}
            <svg className='arw' width='17' height='17' aria-hidden='true'>
              <use href='#i-arw' />
            </svg>
          </Link>
        </div>
      </div>

      <footer className='site-footer'>
        <div className='wrap'>
          <span>
            &copy; <span id='yr'>{new Date().getFullYear()}</span> Embroidize.
            Digital embroidery designs.
          </span>
          <span>
            <Link href='/terms-and-conditions'>Commercial Use Terms</Link>{' '}
            &nbsp;·&nbsp;{' '}
            <Link href='/refund-and-cancellation-policy'>
              Refund &amp; Cancellation
            </Link>
          </span>
        </div>
      </footer>

      <EmbroiderySubscriptionStickyCta />
    </div>
  );
}
