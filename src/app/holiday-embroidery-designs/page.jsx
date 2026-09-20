import LandingPlanCards from '@/components/Common/LandingPlanCards';
import LandingReviews from '@/components/Common/LandingReviews';
import { getFeaturedReviews } from '@/lib/apis/public/featuredReviews';
import {
  getSubscriptionPlans,
  yearlySavingPercent,
} from '@/lib/apis/public/subscriptionPlans';
import { Caveat, Inter, Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import HolidayGallerySlider from './HolidayGallerySlider';
import LandingStickyCta from './LandingStickyCta';
import { GALLERY_CATEGORIES, galleryHref } from './galleryCategories';
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
 * Q4 subscription landing page.
 *
 * This file used to be a complete standalone HTML document (<!DOCTYPE html>,
 * <head>, <style>, inline <script>) saved with a .jsx extension, so the route
 * could not compile at all. The markup is the same design, converted to JSX:
 *   • <head> → the metadata export below
 *   • <style> → ./landing.css, scoped to the .slp wrapper
 *   • inline <script> → ./LandingStickyCta
 * The document's own <html>/<body>/<main> are gone because the root layout
 * already provides them.
 */

export const metadata = {
  // The root layout's template appends " | Embroidize".
  title: 'Your Q4 Embroidery Season Starts Here',
  description:
    'Get instant access to machine embroidery designs for Halloween, Christmas, holiday gifts, fall, Thanksgiving and New Year projects — all with one Embroidize subscription.',
};

// Prices, plan names and feature lists come from the same endpoint the
// /subscriptions page reads. They were hard-coded from the mockup before,
// which had this page advertising $99.99 a year against a live $49.99 plan.
// The fetch is uncached (it is money), so it lives in its own Suspense
// boundary: the hero and everything above the plans stream immediately
// instead of the whole page waiting on the API round-trip.
async function PlanColumn() {
  const plans = await getSubscriptionPlans();
  const savingPercent = yearlySavingPercent(plans);

  return (
    <>
      <LandingPlanCards
        plans={plans}
        ctaLabels={{
          month: 'Start Monthly',
          year: 'Get Yearly Access',
          fallback: 'Choose This Plan',
        }}
        fallbackCta='View Subscription Plans'
      />
      {savingPercent != null && (
        <p className='plan-note'>
          Save ~{savingPercent}% compared with paying monthly for 12 months.
        </p>
      )}
    </>
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
    <section
      className='band band--wash'
      id='reviews'
      style={{ paddingTop: '0', background: '#fff' }}
    >
      <div className='wrap'>
        <div className='head'>
          <h2>Loved by Embroidery Enthusiasts</h2>
        </div>
        <LandingReviews reviews={reviews} totalCount={totalCount} />
      </div>
    </section>
  );
}

export default function HolidayEmbroideryDesignsPage() {
  return (
    <div
      className={`slp ${poppins.variable} ${inter.variable} ${caveat.variable}`}
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
            id='i-gem'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinejoin='round'
          >
            <path d='M6 3h12l3 5-9 13L3 8z' />
            <path d='M3 8h18M9 3L6.5 8 12 21 17.5 8 15 3' />
          </symbol>
          <symbol id='i-heart-f' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 20.4S4 15.5 4 10.2A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 8 2.7c0 5.3-8 10.2-8 10.2z' />
          </symbol>
          <symbol
            id='i-file'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z' />
            <path d='M14 3v5h5M9 13h6M9 17h4' />
          </symbol>
          <symbol
            id='i-bolt'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M13.2 2.5L5 13.6h5.4L10 21.5l8.4-11.4H13z' />
          </symbol>
          <symbol
            id='i-heart'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M12 20s-7.2-4.4-7.2-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7.2 2.6C19.2 15.6 12 20 12 20z' />
          </symbol>
          <symbol
            id='i-shield'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M12 3l7 3v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z' />
            <path d='M9.2 12.2l2 2 3.6-4' />
          </symbol>
          <symbol
            id='i-sparkle'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M12 3l1.9 4.9L19 9.8l-4.4 2.6L13.4 18 12 13.9 8.9 18l.7-5.6L5 9.8l5.1-.9z' />
          </symbol>
          <symbol
            id='i-machine'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='3.5' y='6' width='17' height='12' rx='2' />
            <path d='M8 10h8M8 14h5' />
          </symbol>
          <symbol
            id='i-home'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M4 10.5L12 4l8 6.5' />
            <path d='M6 10v10h12V10M10 20v-5h4v5' />
          </symbol>
          <symbol
            id='i-store'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M4 9l1.2-4h13.6L20 9' />
            <path d='M4 9a2.6 2.6 0 0 0 5.2 0 2.6 2.6 0 0 0 5.6 0A2.6 2.6 0 0 0 20 9' />
            <path d='M5.5 11v9h13v-9M10 20v-5h4v5' />
          </symbol>
          <symbol
            id='i-gift'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='4' y='9.5' width='16' height='10.5' rx='1.6' />
            <path d='M3 9.5h18M12 9.5V20' />
            <path d='M12 9.5S10.6 5 8.6 5a2.1 2.1 0 0 0 0 4.5zM12 9.5S13.4 5 15.4 5a2.1 2.1 0 0 1 0 4.5z' />
          </symbol>
          <symbol
            id='i-cart'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M3 4h2.2l2.3 11h9.8l2.2-8H6' />
            <circle cx='9' cy='19.2' r='1.4' />
            <circle cx='17' cy='19.2' r='1.4' />
          </symbol>
          <symbol
            id='i-search'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <circle cx='11' cy='11' r='6.2' />
            <path d='M15.6 15.6L21 21' />
          </symbol>
          <symbol
            id='i-dl'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M12 3v12' />
            <path d='M7.5 10.5L12 15l4.5-4.5' />
            <path d='M4 19h16' />
          </symbol>
          <symbol
            id='i-shirt'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M8.5 3L4 5.5 5.5 10H8v11h8V10h2.5L20 5.5 15.5 3a3.5 3.5 0 0 1-7 0z' />
          </symbol>
          <symbol
            id='i-chart'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='3.5' y='4' width='17' height='16' rx='2.2' />
            <path d='M7.5 15.5l3-3.4 2.6 2.2 3.4-4.3' />
          </symbol>
          <symbol
            id='i-balloon'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M9.2 3.2a4 4 0 0 1 3.6 6.5L9.2 14 5.6 9.7a4 4 0 0 1 3.6-6.5zM14.8 6.2a4 4 0 0 1 3.6 6.5L14.8 17l-1.6-1.9' />
            <path d='M9.2 14v6.5M14.8 17v3.5' />
          </symbol>
          <symbol
            id='i-bag'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M5 7.5h14l-1.2 12.3H6.2z' />
            <path d='M8.6 10V6.6a3.4 3.4 0 0 1 6.8 0V10' />
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
            id='i-x'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.8'
            strokeLinecap='round'
          >
            <path d='M6 6l12 12M18 6L6 18' />
          </symbol>
          <symbol
            id='i-lock'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.7'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='4.5' y='10.5' width='15' height='10' rx='2.2' />
            <path d='M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7' />
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
          <symbol id='i-holly' viewBox='0 0 60 44'>
            <path d='M4 20c6-11 18-17 26-15-3 8-12 16-20 17z' fill='#2F7A3E' />
            <path d='M12 33c3-11 13-19 22-19-1 9-9 18-17 20z' fill='#3D8F4A' />
            <path d='M30 6c8 1 16 8 19 17-9 1-18-5-21-13z' fill='#2F7A3E' />
            <circle cx='34' cy='24' r='4.2' fill='#C8352C' />
            <circle cx='42' cy='27' r='3.6' fill='#D9453A' />
            <circle cx='37' cy='32' r='3.2' fill='#B72E27' />
          </symbol>
          <symbol id='i-maple' viewBox='0 0 60 44'>
            <path
              d='M30 4l5 9 7-3-3 8 9 2-7 6 6 7-10-1-1 9-6-7-6 7-1-9-10 1 6-7-7-6 9-2-3-8 7 3z'
              fill='#D2721F'
            />
            <path d='M14 30c-4 3-8 5-12 6 5-5 9-9 12-11z' fill='#B85A18' />
          </symbol>
        </defs>
      </svg>

      {/* ══ HEADER — logo + pink CTA ════════════════════════════════════════════
           The reference's row of anchor links was removed on request; the CTA is
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
          <Link className='btn btn--primary btn--sm' href='/subscriptions'>
            Get Subscription
          </Link>
        </div>
      </header>

      <div id='main'>
        {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
        <section className='hero' id='hero'>
          <div className='hero__grid'>
            <div className='hero__copy'>
              <span className='eyebrow'>
                Seasonal designs. Endless possibilities.
              </span>
              <h1>
                Your <span className='pink'>Q4 Embroidery</span>
                <br />
                Season Starts Here
              </h1>
              <p className='lede'>
                Get instant access to machine embroidery designs for Halloween,
                Christmas, holiday gifts, fall, Thanksgiving, and New Year
                projects — all with one Embroidize subscription.
              </p>

              <div className='hero__actions'>
                <Link className='btn btn--primary' href='/subscriptions'>
                  View Q4 Subscription Plans{' '}
                  <svg
                    className='arw'
                    width='17'
                    height='17'
                    aria-hidden='true'
                  >
                    <use href='#i-arw' />
                  </svg>
                </Link>
                <a className='btn btn--ghost' href='#gallery'>
                  See What&apos;s Included
                </a>
              </div>

              <ul className='hero__trust'>
                <li>
                  <span className='ic'>
                    <svg width='19' height='19' aria-hidden='true'>
                      <use href='#i-gem' />
                    </svg>
                  </span>
                  <span>
                    <b>18,000+</b>
                    <span>Designs</span>
                  </span>
                </li>
                <li>
                  <span className='ic'>
                    <svg width='19' height='19' aria-hidden='true'>
                      <use href='#i-machine' />
                    </svg>
                  </span>
                  <span>
                    <b>Multiple</b>
                    <span>Machine Formats</span>
                  </span>
                </li>
                <li>
                  <span className='ic'>
                    <svg width='19' height='19' aria-hidden='true'>
                      <use href='#i-sparkle' />
                    </svg>
                  </span>
                  <span>
                    <b>New Designs</b>
                    <span>Added Regularly</span>
                  </span>
                </li>
                <li>
                  <span className='ic'>
                    <svg width='19' height='19' aria-hidden='true'>
                      <use href='#i-heart' />
                    </svg>
                  </span>
                  <span>
                    <b>Commercial</b>
                    <span>Use Included</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className='hero__media'>
              <Image
                src='/landing/q4/hero-banner.webp'
                alt="Embroidered canvas bags with a jack-o'-lantern, Christmas tree, give thanks and Merry Christmas design"
                fill
                priority
                sizes='(max-width: 900px) 100vw, 50vw'
              />
              <p className='script hero__script bg-[#ffdfec] rounded-full p-6 text-center text-2xl font-bold text-red-800'>
                One
                <br />
                Subscription.
                <br />
                So Many
                <br />
                Possibilities!
                <br />
                <svg
                  width='15'
                  height='15'
                  className='mx-auto'
                  aria-hidden='true'
                >
                  <use href='#i-heart-f' />
                </svg>
              </p>
            </div>
          </div>
        </section>

        {/* ══ EVERYTHING YOU NEED ═════════════════════════════════════════════════ */}
        <section className='band' id='what'>
          <div className='wrap'>
            <div className='head'>
              <h2>Everything You Need for Q4 Embroidery Projects</h2>
            </div>
            <div className='feats'>
              <article className='feat'>
                <span className='feat__ic'>
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-gem' />
                  </svg>
                </span>
                <h3>Thousands of Designs</h3>
                <p>
                  Explore a growing library of seasonal embroidery designs for
                  holidays, gifts, apparel, home décor, and more.
                </p>
              </article>
              <article className='feat'>
                <span className='feat__ic'>
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-file' />
                  </svg>
                </span>
                <h3>Multiple File Formats</h3>
                <p>
                  Download machine-ready formats such as PES, DST, EXP, JEF,
                  VP3, XXX and more.
                </p>
              </article>
              <article className='feat'>
                <span className='feat__ic'>
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-bolt' />
                  </svg>
                </span>
                <h3>Instant Downloads</h3>
                <p>
                  Find a design you love and start downloading immediately after
                  access is activated.
                </p>
              </article>
              <article className='feat'>
                {/* ⚠ Word to your actual licence. Do not imply resale of the files. */}
                <span className='feat__ic'>
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-heart' />
                  </svg>
                </span>
                <h3>Commercial Use</h3>
                <p>
                  Use eligible designs for personal projects or finished
                  products for your business.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ══ DESIGNS FOR EVERY Q4 MOMENT ═════════════════════════════════════════ */}
        <section className='band band--wash' id='moments'>
          <div className='wrap'>
            <div className='head'>
              <h2>Designs for Every Q4 Moment</h2>
              <p>
                From spooky season to New Year celebrations, explore embroidery
                ideas for the busiest creative season of the year.
              </p>
            </div>
            <div className='grid g5'>
              <article className='cat'>
                <Image
                  className='ph ph--43'
                  role='img'
                  src='https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/1757575532567.jpg'
                  alt='Cute Mummy, Pumpkin & Ghost'
                  width={340}
                  height={340}
                  style={{ objectFit: 'cover' }}
                />
                <div className='cat__body'>
                  <h3>
                    Halloween
                    <br />
                    Embroidery
                  </h3>
                  <p>
                    Pumpkins, ghosts, witches, spooky sayings, trick-or-treat
                    designs and more.
                  </p>
                  <a
                    className='btn btn--ghost btn--sm'
                    href={galleryHref('halloween')}
                  >
                    See These Designs
                  </a>
                </div>
              </article>
              <article className='cat'>
                <Image
                  className='ph ph--43'
                  role='img'
                  src='https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/1761195496051.png'
                  alt='Thankful Pumpkin'
                  width={340}
                  height={340}
                  style={{ objectFit: 'cover' }}
                />
                <div className='cat__body'>
                  <h3>
                    Fall &amp; Thanksgiving
                    <br />
                    Designs
                  </h3>
                  <p>
                    Autumn leaves, gratitude sayings, turkeys, harvest themes
                    and more.
                  </p>
                  <a
                    className='btn btn--ghost btn--sm'
                    href={galleryHref('fall-thanksgiving')}
                  >
                    See These Designs
                  </a>
                </div>
              </article>
              <article className='cat'>
                <Image
                  className='ph ph--43'
                  role='img'
                  src='https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/1760610511612.png'
                  alt='Merry Christmas Monster Truck'
                  width={340}
                  height={340}
                  style={{ objectFit: 'cover' }}
                />
                <div className='cat__body'>
                  <h3>
                    Christmas
                    <br />
                    Embroidery
                  </h3>
                  <p>
                    Christmas trees, Santa, reindeer, ornaments, festive sayings
                    and more.
                  </p>
                  <a
                    className='btn btn--ghost btn--sm'
                    href={galleryHref('christmas')}
                  >
                    See These Designs
                  </a>
                </div>
              </article>
              <article className='cat'>
                <Image
                  className='ph ph--43'
                  role='img'
                  src='https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/1764052271903.png'
                  alt='Christmas Gnome Gift'
                  width={340}
                  height={340}
                  style={{ objectFit: 'cover' }}
                />

                <div className='cat__body'>
                  <h3>
                    Holiday Gift
                    <br />
                    Projects
                  </h3>
                  <p>
                    Monograms, names, gift bags, towels, apparel, home décor and
                    more.
                  </p>
                  <a
                    className='btn btn--ghost btn--sm'
                    href={galleryHref('holiday-gifts')}
                  >
                    See These Designs
                  </a>
                </div>
              </article>
              <article className='cat'>
                <Image
                  className='ph ph--43'
                  role='img'
                  src='https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/1763550009637.png'
                  alt='Happy New Year Gnome'
                  width={340}
                  height={340}
                  style={{ objectFit: 'cover' }}
                />
                <div className='cat__body'>
                  <h3>
                    New Year
                    <br />
                    Designs
                  </h3>
                  <p>
                    Celebration graphics, festive typography, fireworks and
                    more.
                  </p>
                  <a
                    className='btn btn--ghost btn--sm'
                    href={galleryHref('new-year')}
                  >
                    See These Designs
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ══ SEE WHAT YOU CAN CREATE ═════════════════════════════════════════════ */}
        <section
          className='band band--wash'
          id='gallery'
          style={{ paddingTop: '8px' }}
        >
          <svg
            className='deco deco--tl'
            width='54'
            height='40'
            aria-hidden='true'
          >
            <use href='#i-holly' />
          </svg>
          <svg
            className='deco deco--tr'
            width='54'
            height='40'
            aria-hidden='true'
          >
            <use href='#i-holly' />
          </svg>
          <svg
            className='deco deco--bl'
            width='52'
            height='38'
            aria-hidden='true'
          >
            <use href='#i-maple' />
          </svg>
          <svg
            className='deco deco--br'
            width='52'
            height='38'
            aria-hidden='true'
          >
            <use href='#i-maple' />
          </svg>
          <div className='wrap'>
            {/* Targets for the cards' "See These Designs" links. Zero-height and
                outside the slider, so the jump still works without JS; the
                slider reads the id and opens that category. */}
            {GALLERY_CATEGORIES.map((c) => (
              <span
                key={c.id}
                id={`gallery-${c.id}`}
                className='gslider__anchor'
              />
            ))}
            <div className='head' style={{ marginBottom: '20px' }}>
              <h2>See What You Can Create This Season</h2>
              <p>A small taste of the projects you can make with Embroidize.</p>
            </div>
            <HolidayGallerySlider />
            <p
              className='center'
              style={{
                margin: '16px auto 0',
                maxWidth: '72ch',
                fontSize: '.8125rem',
                color: 'var(--ink-600)',
              }}
            >
              From home décor to gifts and small-business orders, one
              subscription gives you more creative options throughout Q4.
            </p>
            <div className='cta-row' style={{ marginTop: '22px' }}>
              <Link className='btn btn--primary' href='/subscriptions'>
                Get Q4 Design Access{' '}
                <svg className='arw' width='17' height='17' aria-hidden='true'>
                  <use href='#i-arw' />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ══ MADE FOR EMBROIDERERS LIKE YOU ══════════════════════════════════════ */}
        <section className='band' id='who'>
          <div className='wrap'>
            <div className='head'>
              <h2>Made for Embroiderers Like You</h2>
            </div>
            <div className='grid g3'>
              <article className='aud'>
                <span className='aud__ic'>
                  <svg width='30' height='30' aria-hidden='true'>
                    <use href='#i-home' />
                  </svg>
                </span>
                <div>
                  <h3>Hobby Embroiderers</h3>
                  <p>
                    Create seasonal projects for your home, family, and friends
                    without buying every design separately.
                  </p>
                </div>
              </article>
              <article className='aud'>
                <span className='aud__ic'>
                  <svg width='30' height='30' aria-hidden='true'>
                    <use href='#i-store' />
                  </svg>
                </span>
                <div>
                  <h3>Small Embroidery Businesses</h3>
                  <p>
                    Prepare for holiday orders with more design options for
                    apparel, gifts, towels, bags, décor and more.
                  </p>
                </div>
              </article>
              <article className='aud'>
                <span className='aud__ic'>
                  <svg width='30' height='30' aria-hidden='true'>
                    <use href='#i-gift' />
                  </svg>
                </span>
                <div>
                  <h3>Creators &amp; Gift Makers</h3>
                  <p>
                    Make meaningful handmade gifts for Halloween parties,
                    Thanksgiving gatherings, Christmas and New Year.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ══ TWO-COLUMN ROW 1 — comparison + 3 steps ═════════════════════════════
           Side by side exactly as in the approved design.
           Add className="stacked" to <body> to split them into two full-width rows.
           ════════════════════════════════════════════════════════════════════════ */}
        <section className='band' id='how'>
          <div className='wrap'>
            <div className='row2'>
              <div>
                <h2 style={{ fontSize: 'clamp(1.35rem,2.4vw,1.75rem)' }}>
                  One Subscription for the Whole Season
                </h2>
                <p style={{ fontSize: '.8125rem', marginBottom: '16px' }}>
                  Q4 brings multiple holidays, gift projects, customer orders,
                  and last-minute ideas. Instead of purchasing designs one by
                  one, use one subscription to explore more designs throughout
                  the season.
                </p>

                <div className='cmp'>
                  <div className='cmp__h'>
                    <div className='a'>Buying Designs Individually</div>
                    <div className='b'>Embroidize Subscription</div>
                  </div>
                  <div className='cmp__r'>
                    <div className='a'>
                      <svg
                        className='no'
                        width='13'
                        height='13'
                        aria-hidden='true'
                      >
                        <use href='#i-x' />
                      </svg>
                      Pay separately for each design
                    </div>
                    <div className='b'>
                      <svg
                        className='yes'
                        width='13'
                        height='13'
                        aria-hidden='true'
                      >
                        <use href='#i-check' />
                      </svg>
                      One subscription
                    </div>
                  </div>
                  <div className='cmp__r'>
                    <div className='a'>
                      <svg
                        className='no'
                        width='13'
                        height='13'
                        aria-hidden='true'
                      >
                        <use href='#i-x' />
                      </svg>
                      Smaller selection
                    </div>
                    <div className='b'>
                      <svg
                        className='yes'
                        width='13'
                        height='13'
                        aria-hidden='true'
                      >
                        <use href='#i-check' />
                      </svg>
                      Access to a broad design library
                    </div>
                  </div>
                  <div className='cmp__r'>
                    <div className='a'>
                      <svg
                        className='no'
                        width='13'
                        height='13'
                        aria-hidden='true'
                      >
                        <use href='#i-x' />
                      </svg>
                      More checkout steps
                    </div>
                    <div className='b'>
                      <svg
                        className='yes'
                        width='13'
                        height='13'
                        aria-hidden='true'
                      >
                        <use href='#i-check' />
                      </svg>
                      Easier ongoing access
                    </div>
                  </div>
                  <div className='cmp__r'>
                    <div className='a'>
                      <svg
                        className='no'
                        width='13'
                        height='13'
                        aria-hidden='true'
                      >
                        <use href='#i-x' />
                      </svg>
                      Harder to try new ideas
                    </div>
                    <div className='b'>
                      <svg
                        className='yes'
                        width='13'
                        height='13'
                        aria-hidden='true'
                      >
                        <use href='#i-check' />
                      </svg>
                      Explore more styles
                    </div>
                  </div>
                  <div className='cmp__r'>
                    <div className='a'>
                      <svg
                        className='no'
                        width='13'
                        height='13'
                        aria-hidden='true'
                      >
                        <use href='#i-x' />
                      </svg>
                      Extra cost for multiple projects
                    </div>
                    <div className='b'>
                      <svg
                        className='yes'
                        width='13'
                        height='13'
                        aria-hidden='true'
                      >
                        <use href='#i-check' />
                      </svg>
                      Better suited for frequent projects
                    </div>
                  </div>
                  <div className='cmp__r'>
                    <div className='a'>
                      <svg
                        className='no'
                        width='13'
                        height='13'
                        aria-hidden='true'
                      >
                        <use href='#i-x' />
                      </svg>
                      May need multiple marketplaces
                    </div>
                    <div className='b'>
                      <svg
                        className='yes'
                        width='13'
                        height='13'
                        aria-hidden='true'
                      >
                        <use href='#i-check' />
                      </svg>
                      One central library
                    </div>
                  </div>
                </div>

                <div className='cta-row' style={{ marginTop: '22px' }}>
                  <Link className='btn btn--primary' href='/subscriptions'>
                    View Subscription Options{' '}
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

              <div>
                <h2
                  className='center'
                  style={{
                    fontSize: 'clamp(1.35rem,2.4vw,1.75rem)',
                    marginBottom: '26px',
                  }}
                >
                  Start Stitching in 3 Simple Steps
                </h2>
                <div className='steps'>
                  <div className='step'>
                    <span className='step__ic'>
                      <svg width='28' height='28' aria-hidden='true'>
                        <use href='#i-cart' />
                      </svg>
                    </span>
                    <h3>1. Choose your plan</h3>
                    <p>Pick monthly or yearly access.</p>
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
                      <svg width='28' height='28' aria-hidden='true'>
                        <use href='#i-search' />
                      </svg>
                    </span>
                    <h3>2. Find your Q4 designs</h3>
                    <p>
                      Browse Halloween, fall, Thanksgiving, Christmas, gifts and
                      New Year designs.
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
                      <svg width='28' height='28' aria-hidden='true'>
                        <use href='#i-dl' />
                      </svg>
                    </span>
                    <h3>3. Download and stitch</h3>
                    <p>
                      Choose the correct machine format and start your project.
                    </p>
                  </div>
                </div>
                <div className='cta-row' style={{ marginTop: '0' }}>
                  <Link className='btn btn--primary' href='/subscriptions'>
                    Start Your Subscription{' '}
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

        {/* ══ MORE WAYS TO USE YOUR SUBSCRIPTION ══════════════════════════════════ */}
        <section className='band' id='uses' style={{ paddingTop: '0' }}>
          <div className='wrap'>
            <div className='head'>
              <h2>More Ways to Use Your Subscription This Q4</h2>
            </div>
            <div className='grid g6'>
              <article className='uc'>
                <span
                  className='uc__ic'
                  style={{ background: '#EDF1FE', color: 'var(--ic-blue)' }}
                >
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-shirt' />
                  </svg>
                </span>
                <h3>Holiday Apparel</h3>
                <p>
                  Sweatshirts, T-shirts, jackets, hats and kid&apos;s clothing.
                </p>
              </article>
              <article className='uc'>
                <span
                  className='uc__ic'
                  style={{ background: '#FEF3E7', color: 'var(--ic-orange)' }}
                >
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-home' />
                  </svg>
                </span>
                <h3>Home Décor</h3>
                <p>Pillows, towels, table linens, wall hangings and more.</p>
              </article>
              <article className='uc'>
                <span
                  className='uc__ic'
                  style={{ background: '#EAF0FD', color: 'var(--ic-indigo)' }}
                >
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-gift' />
                  </svg>
                </span>
                <h3>Personalized Gifts</h3>
                <p>Monograms, names, keepsakes, tote bags and custom gifts.</p>
              </article>
              <article className='uc'>
                <span
                  className='uc__ic'
                  style={{ background: '#E8F7EE', color: 'var(--ic-green)' }}
                >
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-chart' />
                  </svg>
                </span>
                <h3>Small-Business Orders</h3>
                <p>
                  Create more options for customer requests during the holiday
                  season.
                </p>
              </article>
              <article className='uc'>
                <span
                  className='uc__ic'
                  style={{ background: '#F3EBFC', color: 'var(--ic-violet)' }}
                >
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-balloon' />
                  </svg>
                </span>
                <h3>Party &amp; Event Projects</h3>
                <p>
                  Halloween parties, Thanksgiving gatherings, Christmas and New
                  Year events.
                </p>
              </article>
              <article className='uc'>
                <span
                  className='uc__ic'
                  style={{ background: '#FDECEB', color: 'var(--ic-red)' }}
                >
                  <svg width='22' height='22' aria-hidden='true'>
                    <use href='#i-bag' />
                  </svg>
                </span>
                <h3>Seasonal Accessories</h3>
                <p>Bags, stockings, ornaments, patches, aprons and more.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ══ TWO-COLUMN ROW 2 — pricing + why yearly ═════════════════════════════
           ⚠ Replace the plan cards with the live /subscriptions plan component so
             this page can never drift out of sync with real pricing.
           ⚠ Savings line must be recomputed if the price changes:
             saving % = (monthly × 12 − yearly) ÷ (monthly × 12) × 100
             $9.99 × 12 = $119.88 → $99.99 = 16.6% ("~17%")
             The subscription page mockup shows $79.99 → that would be ~33%.
             Never print 75% here; that is the anchor-price discount.
           ════════════════════════════════════════════════════════════════════════ */}
        <section className='band' id='plans' style={{ paddingTop: '0' }}>
          <div className='wrap'>
            <div className='row2'>
              <div>
                <div className='head' style={{ marginBottom: '22px' }}>
                  <h2
                    style={{
                      fontSize: 'clamp(1.35rem,2.4vw,1.75rem)',
                      marginBottom: '6px',
                    }}
                  >
                    Choose the Plan That Works for You
                  </h2>
                  <p style={{ fontSize: '.8125rem' }}>
                    One plan. More Q4 projects.
                  </p>
                </div>
                {/* Reserves the cards' height so nothing below jumps when
                    the live plans stream in. */}
                <Suspense fallback={<div style={{ minHeight: '420px' }} />}>
                  <PlanColumn />
                </Suspense>
              </div>

              <div className='why'>
                <h2 style={{ fontSize: 'clamp(1.35rem,2.4vw,1.75rem)' }}>
                  Q4 Is Just the Beginning
                </h2>
                <p className='intro'>
                  The yearly plan keeps your design access going beyond the
                  holidays, so you can continue creating for Valentine&apos;s
                  Day, spring, Easter, summer, birthdays, and more.
                </p>
                <ul className='why__list'>
                  <li>
                    <span className='tick'>
                      <svg width='11' height='11' aria-hidden='true'>
                        <use href='#i-check' />
                      </svg>
                    </span>
                    Full-year access
                  </li>
                  <li>
                    <span className='tick'>
                      <svg width='11' height='11' aria-hidden='true'>
                        <use href='#i-check' />
                      </svg>
                    </span>
                    Fewer billing interruptions
                  </li>
                  <li>
                    <span className='tick'>
                      <svg width='11' height='11' aria-hidden='true'>
                        <use href='#i-check' />
                      </svg>
                    </span>
                    Better for frequent embroiderers
                  </li>
                  <li>
                    <span className='tick'>
                      <svg width='11' height='11' aria-hidden='true'>
                        <use href='#i-check' />
                      </svg>
                    </span>
                    Useful for year-round small-business projects
                  </li>
                </ul>
                <Link className='btn btn--primary' href='/subscriptions'>
                  Choose Yearly{' '}
                  <svg
                    className='arw'
                    width='17'
                    height='17'
                    aria-hidden='true'
                  >
                    <use href='#i-arw' />
                  </svg>
                </Link>
                <p className='script why__script'>
                  More
                  <br />
                  Creativity
                  <br />
                  All Year
                  <br />
                  Long!
                </p>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={null}>
          <ReviewsSection />
        </Suspense>

        {/* ══ FINAL CTA ═══════════════════════════════════════════════════════════ */}
        <section className='final' id='final'>
          {/* Side photographs bleed off both edges. Replace each .ph with an <img>. */}
          <div className='final__side final__side--l' aria-hidden='true'>
            <Image
              src='/landing/q4/footer-left-banner.webp'
              alt=''
              fill
              sizes='(max-width: 640px) 0px, 20vw'
            />
          </div>
          <div className='final__side final__side--r' aria-hidden='true'>
            <Image
              src='/landing/q4/footer-right-banner.webp'
              alt=''
              fill
              sizes='(max-width: 640px) 0px, 20vw'
            />
          </div>
          <div className='wrap'>
            <h2>Ready for Your Best Q4 Embroidery Season?</h2>
            <p className='sub'>
              Get access to designs for Halloween, fall, Thanksgiving,
              Christmas, gifts, New Year and more with one Embroidize
              subscription.
            </p>
            <div className='final__actions'>
              <Link className='btn btn--ghost' href='/subscriptions'>
                Start Monthly
              </Link>
              <Link className=' btn btn--primary' href='/subscriptions'>
                Get Yearly Access
              </Link>
            </div>
            <ul className='final__trust'>
              <li>
                <svg width='15' height='15' aria-hidden='true'>
                  <use href='#i-lock' />
                </svg>
                Secure Checkout
              </li>
              <li>
                <svg width='15' height='15' aria-hidden='true'>
                  <use href='#i-bolt' />
                </svg>
                Instant Access
              </li>
              <li>
                <svg width='15' height='15' aria-hidden='true'>
                  <use href='#i-file' />
                </svg>
                Multiple Machine Formats
              </li>
            </ul>
          </div>
        </section>
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

      <LandingStickyCta />
    </div>
  );
}
