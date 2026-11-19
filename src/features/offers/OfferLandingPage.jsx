import OfferCheckoutButton from '@/components/Common/Offer/OfferCheckoutButton';
import OfferCountdownTiles, { OfferCountdownText } from '@/components/Common/Offer/OfferCountdown';
import ProductCard from '@/components/Common/ProductCard';
import { caveat, inter, poppins } from '@/fonts/landingFonts';
import { getCategories } from '@/lib/apis/public/category';
import { getFeaturedReviews } from '@/lib/apis/public/featuredReviews';
import { getPopularProducts } from '@/lib/apis/public/products';
import { getSiteConfig } from '@/lib/apis/public/siteConfig';
import { endsLong, OFFER_TIMEZONE, perMonth, usd } from '@/lib/offers/format';
import { offerSurfaceStyle, offerVars } from '@/lib/offers/theme';
import { ArrowRight, Lock, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/*
 * The offer landing page (/black-friday, /offers/<slug>), laid out from the
 * approved Black Friday mockup. ONE page for every campaign: its colours come
 * from the offer's Look (Admin → Offers → Look) — the top bar, hero and final
 * call-to-action paint with the offer's background / image / text colour, and
 * the accent drives buttons, badges and highlights. Nothing here names a season.
 *
 * EVERY NUMBER IS DERIVED, never typed: prices and the per-month figure come
 * from the offer and its plan; the credits' dollar value from the live credit
 * packs (Settings → Credit packs) — a row that cannot be priced is shown
 * without a price rather than with an invented one; the design count from the
 * published catalogue; the review count from the review corpus. The mockup's
 * "Loved by 23,000+" has no source in the data, so the heading carries no
 * number until one exists.
 */

const DEFAULT_BADGE = 'Limited-time offer';

// ── Derived figures ─────────────────────────────────────────────────────────

/** Dollar value of N credits, from the live credit packs. Cents, or null. */
function creditValueCents(credits, packs = []) {
  if (!(credits > 0) || !packs.length) return null;
  const exact = packs.find((p) => Number(p.credits) === credits && p.priceCents > 0);
  if (exact) return Number(exact.priceCents);
  // No pack of exactly that size: price at the CHEAPEST per-credit rate, so the
  // value quoted is the lowest a customer could have paid — never inflated.
  const rates = packs
    .filter((p) => p.credits > 0 && p.priceCents > 0)
    .map((p) => p.priceCents / p.credits);
  if (!rates.length) return null;
  return Math.floor((Math.min(...rates) * credits) / 100) * 100;
}

/** "19,000+" — rounded DOWN to the thousand so the claim is always true. */
function roundedDown(n, step) {
  if (!(n >= step)) return null;
  return `${(Math.floor(n / step) * step).toLocaleString('en-US')}+`;
}

/** The last buyable instant (endsAt is the first instant it is over). */
const lastMoment = (offer) => new Date(new Date(offer.endsAt).getTime() - 60 * 1000);

/** "December 1 at midnight" when it runs to 11:59 PM ET, else "December 1 at 6:00 PM ET". */
function endsPhrase(offer) {
  const last = lastMoment(offer);
  const day = last.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: OFFER_TIMEZONE });
  const time = last.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: OFFER_TIMEZONE });
  return time === '11:59 PM' ? `${day} at midnight` : `${day} at ${time} ET`;
}

const termWord = (interval) => (interval === 'month' ? 'Month' : interval === 'week' ? 'Week' : 'Year');

// ── Small pieces ────────────────────────────────────────────────────────────

// tone 'soft' on the white sections, 'solid' (accent fill) on the coloured ones.
function Kicker({ children, tone = 'soft' }) {
  const cls = tone === 'solid' ? 'o-band' : 'ol-tint-strong ol-ink';
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${cls}`}>
      {children}
    </span>
  );
}

// Every CTA on the page: the offer checkout, or the plans page once it ended.
function BrandCta({ offer, ended, source, children, block = false }) {
  const cls = `${block ? 'flex w-full' : 'inline-flex'} items-center justify-center gap-2 rounded-full o-btn ol-btn-shadow px-7 py-3.5 text-[15px] font-bold`;
  if (ended) {
    return (
      <Link href='/subscriptions' className={cls}>
        See current plans <ArrowRight className='h-4 w-4' aria-hidden />
      </Link>
    );
  }
  return (
    <OfferCheckoutButton offer={offer} source={source} className={cls}>
      {children}
    </OfferCheckoutButton>
  );
}

function SectionHead({ kicker, title, children }) {
  return (
    <div>
      <Kicker>{kicker}</Kicker>
      <h2 className='mt-3 font-[family-name:var(--font-poppins)] text-[28px] font-bold leading-tight text-[#0B0F1E] sm:text-[32px]'>
        {title}
      </h2>
      {children && <p className='mt-2 max-w-xl text-[15px] text-[#6B6B75]'>{children}</p>}
    </div>
  );
}

// ── FAQ ─────────────────────────────────────────────────────────────────────

function buildFaqs(offer, { creditValue }) {
  const credits = offer.bonusCredits;
  const unit = offer.plan.billingInterval || 'year';
  const after = unit === 'year' ? '12 months' : `the first ${unit}`;
  const expiry = offer.bonusCreditsValidityDays
    ? `they stay valid for ${offer.bonusCreditsValidityDays} days after you buy`
    : 'they never expire';

  const list = [
    {
      q: 'Is this a coupon?',
      a: `No code needed. The ${usd(offer.offerPriceCents)} price is applied automatically at checkout when you use any button on this page.`,
    },
  ];
  if (credits > 0) {
    list.push({
      q: `How do the ${credits} credits work?`,
      a: `They land in your account the moment you pay${creditValue ? ` (a ${usd(creditValue)} value)` : ''}. While your Pro plan is active you download with your daily allowance, so the credits are never touched. Whenever you don't have an active plan, each credit downloads one premium design — and ${expiry}.`,
    });
  }
  list.push(
    {
      q: `What happens after ${after}?`,
      a: `Your plan renews at the regular ${usd(offer.regularPriceCents)}/${unit} unless you cancel. We email you before it renews.`,
    },
    {
      q: 'Can I cancel?',
      a: `Yes, any time from My Plan. You keep Pro until the end of the ${unit} you paid for${credits > 0 ? ', and your bonus credits stay yours' : ''}.`,
    },
    {
      q: "I'm on Monthly. Can I switch?",
      a: `Yes. Buy the ${offer.name} and your monthly plan is cancelled automatically, so you only ever pay for one plan.`,
    },
    {
      q: "I'm already on Yearly.",
      a: `The ${offer.name} is for new ${offer.plan.name} members, so it can't be added to an active ${offer.plan.name} plan. Your plan already includes every design and your daily downloads.`,
    },
    {
      q: 'I joined recently. Did I miss out?',
      a: `If you're on the Monthly plan, no — you can switch to the ${offer.name} today and your monthly plan stops automatically. If you joined on ${offer.plan.name}, your full ${unit} is already running.`,
    },
    {
      q: 'Which formats do I get?',
      a: 'Every design comes in the major machine formats — PES, DST, EXP, JEF, VP3, XXX and more — in one download.',
    },
    {
      q: 'When does it end?',
      a: `${endsLong(offer)}. After that the price and the bonus are gone.`,
    }
  );
  // The admin's own questions first.
  return [...(offer.faqs || []), ...list];
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function OfferLandingPage({ offer }) {
  const [site, popular, cats, reviews] = await Promise.all([
    getSiteConfig().catch(() => ({})),
    getPopularProducts('', 1, 10).catch(() => ({ products: [] })),
    getCategories('', 0, 20).catch(() => ({ categories: [] })),
    getFeaturedReviews().catch(() => ({ reviews: [], totalCount: 0 })),
  ]);

  const ended = offer.phase === 'ended' || new Date(offer.endsAt).getTime() <= Date.now();
  const cta = offer.ctaLabel || `Get the ${offer.name}`;
  const badge = offer.badge || DEFAULT_BADGE;
  const credits = offer.bonusCredits || 0;
  const creditValue = creditValueCents(credits, site.creditPacks);
  const totalValue = offer.regularPriceCents + (creditValue || 0);
  const designs = roundedDown(site.totalDesigns, 1000);
  const reviewCount = roundedDown(reviews.totalCount, 100);
  const unit = offer.plan.billingInterval || 'year';
  const daily = offer.plan.dailyLimit;
  const pm = perMonth(offer); // "$3.29/mo"
  const pmWords = pm ? pm.replace('/mo', ' a month') : '';
  const campaign = `${offer.name.replace(/\s+plan$/i, '')} ${lastMoment(offer).getFullYear()}`;
  const ends = endsPhrase(offer);
  const creditExpiry = offer.bonusCreditsValidityDays
    ? `valid ${offer.bonusCreditsValidityDays} days`
    : 'never expire';

  const categoryList = (Array.isArray(cats.categories) ? cats.categories : cats.categories?.data || [])
    .filter((c) => c?.slug && c?.name)
    .map((c) => ({ slug: c.slug, name: c.name.replace(/\s+Embroidery Designs$/i, '') }));
  const products = (popular.products || []).slice(0, 10);
  // Reviews picked for this offer in Admin → Offers, in that order; when none
  // are picked, the first 3 site-wide featured reviews.
  const featured = Array.isArray(offer.reviews) && offer.reviews.length
    ? offer.reviews
    : (reviews.reviews || []).slice(0, 3);
  // 1 card centred, 2 or 4 in pairs, anything else in rows of 3.
  const reviewGrid =
    featured.length === 1
      ? "mx-auto max-w-[420px]"
      : featured.length === 2 || featured.length === 4
        ? "md:grid-cols-2"
        : "md:grid-cols-3";

  return (
    <div
      className={`${poppins.variable} ${inter.variable} ${caveat.variable} bg-white font-[family-name:var(--font-inter)] text-[#6B6B75]`}
      style={offerVars(offer)}
    >
      {/* ══ Top bar ══ */}
      <div className='o-band px-4 py-2 text-center text-[12px] font-medium'>
        <span className='font-bold uppercase tracking-[0.18em]'>{offer.name.replace(/\s+plan$/i, '')}</span>
        <span className='mx-2 opacity-60'>·</span>
        <span>{badge}</span>
        <span className='mx-2 hidden opacity-60 sm:inline'>·</span>
        <span className='hidden sm:inline'>{ended ? 'Offer ended' : `ends ${ends}`}</span>
        {!ended && (
          <span className='ol-invert ml-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold'>
            <OfferCountdownText endsAt={offer.endsAt} />
          </span>
        )}
      </div>

      {/* ══ Header ══ */}
      <header className='border-b border-[#EFE7EC] bg-white'>
        <div className='mx-auto flex max-w-[1180px] items-center justify-between px-4 py-3'>
          <Link href='/' aria-label='Embroidize home'>
            <Image src='/logo-black.png' alt='Embroidize' width={110} height={44} priority />
          </Link>
          <Link href='/' className='text-sm font-medium text-[#3F4350] hover:text-black'>
            Back to Embroidize
          </Link>
        </div>
      </header>

      {/* ══ Hero ══ */}
      <section className='o-fg' style={offerSurfaceStyle(offer)}>
        <div className='mx-auto grid max-w-[1180px] items-center gap-10 px-4 py-12 md:grid-cols-[1.15fr_1fr] md:py-16'>
          <div>
            <Kicker tone='solid'>{campaign}</Kicker>
            <h1 className='mt-4 font-[family-name:var(--font-poppins)] text-[36px] font-bold leading-[1.08] tracking-tight sm:text-[48px] o-fg'>
              1 {termWord(unit)} of Embroidize Pro for{' '}
              <span className='o-accent'>{usd(offer.offerPriceCents)}</span>
            </h1>
            <p className='o-muted mt-4 max-w-lg text-[16px] leading-relaxed'>
              {offer.description ||
                [
                  credits > 0 &&
                    `Plus ${credits} bonus design credits${creditValue ? ` worth ${usd(creditValue)}` : ''}, yours to keep after your ${unit} ends.`,
                  designs && `${designs} designs, new ones every day.`,
                ]
                  .filter(Boolean)
                  .join(' ')}
            </p>
            <div className='mt-7'>
              <BrandCta offer={offer} ended={ended} source='offer_landing_hero'>
                {cta} <ArrowRight className='h-4 w-4' aria-hidden />
              </BrandCta>
            </div>
            <p className='o-faint mt-4 flex items-center gap-1.5 text-[12.5px]'>
              <Lock className='h-3.5 w-3.5' aria-hidden /> Secure checkout · No code needed · Cancel anytime
            </p>
          </div>

          {/* Price card */}
          <div className='relative mx-auto w-full max-w-[400px]'>
            <div className='relative rounded-2xl bg-white p-6 pt-8 text-[#0B0F1E] shadow-2xl ring-1 ring-black/5'>
              <span className='o-band absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-[0.12em] shadow'>
                ★ {badge}
              </span>
              <p className='text-center text-sm font-semibold text-[#3F4350]'>{offer.name}</p>
              <div className='mt-1 flex items-baseline justify-center gap-3'>
                {offer.savingsCents > 0 && (
                  <span className='text-xl text-[#9B9BA4] line-through'>{usd(offer.regularPriceCents)}</span>
                )}
                <span className='font-[family-name:var(--font-poppins)] text-[44px] font-bold leading-none'>
                  {usd(offer.offerPriceCents)}
                </span>
              </div>
              <p className='mt-2 text-center text-[13px] text-[#6B6B75]'>
                for 1 {unit}
                {pmWords ? ` (just ${pmWords})` : ''}, then {usd(offer.regularPriceCents)}/{unit}
              </p>

              {credits > 0 && (
                <div className='ol-tint mt-4 flex items-center gap-3 rounded-xl p-3'>
                  <span className='o-band flex h-10 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-bold'>
                    +{credits}
                  </span>
                  <div className='text-left'>
                    <p className='text-[13px] font-bold text-[#0B0F1E]'>
                      {credits} bonus credits{creditValue ? ` (${usd(creditValue)} value)` : ''}
                    </p>
                    <p className='text-[12px] text-[#6B6B75]'>Unlock when your {unit} ends, {creditExpiry}</p>
                  </div>
                </div>
              )}

              {!ended && (
                <div className='mt-5 flex justify-center'>
                  <OfferCountdownTiles endsAt={offer.endsAt} tone='light' />
                </div>
              )}

              <div className='mt-5'>
                <BrandCta offer={offer} ended={ended} source='offer_landing_card' block>
                  {cta}
                </BrandCta>
              </div>
            </div>
            {credits > 0 && (
              <p className='o-muted mt-3 -rotate-2 text-center font-[family-name:var(--font-caveat)] text-[22px]'>
                Your designs keep coming, even after your {unit}!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ══ What you get ══ */}
      <section className='bg-white'>
        <div className='mx-auto grid max-w-[1180px] items-center gap-10 px-4 py-16 md:grid-cols-2'>
          <SectionHead
            kicker='What you get'
            title={
              <>
                {usd(totalValue)} of value for {usd(offer.offerPriceCents)}
              </>
            }
          >
            A full {unit} of Pro
            {offer.savingsCents > 0 ? ` for ${usd(offer.savingsCents)} less than the regular price` : ''}
            {credits > 0 ? `, plus ${credits} extra designs that stay with you after the ${unit} ends.` : '.'}
          </SectionHead>

          <div className='rounded-2xl border border-[#EFE7EC] bg-white p-6 shadow-[0_10px_30px_-15px_rgba(11,15,30,0.25)]'>
            <div className='flex justify-between gap-4 border-b border-[#F5EFF2] pb-4'>
              <div>
                <p className='font-semibold text-[#0B0F1E]'>1 {unit} of Embroidize Pro</p>
                {daily ? <p className='text-[13px]'>{daily} downloads a day</p> : null}
              </div>
              <p className='font-semibold text-[#0B0F1E]'>{usd(offer.regularPriceCents)}</p>
            </div>
            {credits > 0 && (
              <div className='flex justify-between gap-4 border-b border-[#F5EFF2] py-4'>
                <div>
                  <p className='font-semibold text-[#0B0F1E]'>{credits} bonus design credits</p>
                  <p className='text-[13px]'>Unlock when your {unit} ends, {creditExpiry}</p>
                </div>
                <p className='font-semibold text-[#0B0F1E]'>{creditValue ? usd(creditValue) : 'Included'}</p>
              </div>
            )}
            <div className='flex justify-between border-b-2 border-[#0B0F1E] py-3 text-[14px]'>
              <span>Total value</span>
              <span className='line-through'>{usd(totalValue)}</span>
            </div>
            <div className='flex items-center justify-between pt-4'>
              <span className='font-bold text-[#0B0F1E]'>You pay today</span>
              <span className='ol-ink font-[family-name:var(--font-poppins)] text-[30px] font-bold'>
                {usd(offer.offerPriceCents)}
              </span>
            </div>
            <div className='mt-5'>
              <BrandCta offer={offer} ended={ended} source='offer_landing_value' block>
                {cta}
              </BrandCta>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Categories + trending ══ */}
      <section className='bg-[#F6F6F8]'>
        <div className='mx-auto max-w-[1180px] px-4 py-16'>
          <div className='flex flex-col justify-between gap-6 md:flex-row md:items-end'>
            <SectionHead kicker='Updated daily' title={<>Every category. Always what&apos;s trending.</>}>
              We add fresh designs every day, based on what&apos;s trending and what embroiderers ask for. Every new
              design is included in your plan from day one.
            </SectionHead>
            <div className='grid grid-cols-3 gap-3'>
              {[
                ['Daily', 'new designs'],
                designs ? [designs, 'designs'] : null,
                ['All', 'formats'],
              ]
                .filter(Boolean)
                .map(([big, small]) => (
                  <div key={small} className='rounded-xl bg-white px-4 py-3 shadow-sm'>
                    <p className='font-[family-name:var(--font-poppins)] text-lg font-bold text-[#0B0F1E]'>{big}</p>
                    <p className='text-[12px]'>{small}</p>
                  </div>
                ))}
            </div>
          </div>

          {categoryList.length > 0 && (
            <div className='mt-8 flex flex-wrap gap-2'>
              {categoryList.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className='rounded-full border border-[#EFE7EC] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#3F4350] transition ol-chip'
                >
                  <span className='ol-ink'>+</span> {c.name}
                </Link>
              ))}
              <Link
                href='/categories'
                className='rounded-full border border-[#EFE7EC] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#0B0F1E] hover:border-black'
              >
                All categories →
              </Link>
            </div>
          )}

          {products.length > 0 && (
            <>
              <div className='mt-10 flex items-center justify-between'>
                <h3 className='font-[family-name:var(--font-poppins)] text-lg font-bold text-[#0B0F1E]'>Trending now</h3>
                <Link href='/products?sort=newest' className='ol-ink text-sm font-semibold hover:underline'>
                  See all new designs →
                </Link>
              </div>
              <div className='mt-4 grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-5'>
                {products.map((item, index) => (
                  <ProductCard key={item._id} item={item} index={index} />
                ))}
              </div>
            </>
          )}

          <div className='mt-8 text-center'>
            <BrandCta offer={offer} ended={ended} source='offer_landing_designs'>
              Get every design with the {offer.name}
            </BrandCta>
          </div>
        </div>
      </section>

      {/* ══ Bonus credits ══ */}
      {credits > 0 && (
        <section className='bg-white'>
          <div className='mx-auto max-w-[1180px] px-4 py-16'>
            <SectionHead kicker='Your bonus credits' title={<>Your designs don&apos;t stop when your {unit} ends</>} />
            <div className='mt-8 grid gap-4 md:grid-cols-3'>
              {[
                { t: 'Join today', b: `${credits} bonus credits are saved in your account.` },
                {
                  t: 'Stitch all year with Pro',
                  b: daily ? `${daily} downloads a day, every day, for ${unit === 'year' ? '12 months' : `a ${unit}`}.` : `Download every day for a full ${unit}.`,
                },
                {
                  t: 'Your credits unlock',
                  b: `When your ${unit} ends, ${credits} more designs are yours — ${
                    offer.bonusCreditsValidityDays ? `valid ${offer.bonusCreditsValidityDays} days from purchase` : 'they never expire'
                  }.`,
                  hi: true,
                },
              ].map((s, i) => (
                <div
                  key={s.t}
                  className={`rounded-2xl p-6 ${s.hi ? 'o-band' : 'border border-[#EFE7EC] bg-white'}`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      s.hi ? 'ol-invert' : 'ol-tint-strong ol-ink'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <p className={`mt-4 font-bold ${s.hi ? '' : 'text-[#0B0F1E]'}`}>{s.t}</p>
                  <p className={`mt-1 text-[14px] ${s.hi ? 'opacity-85' : ''}`}>{s.b}</p>
                </div>
              ))}
            </div>

            <div className='mt-6 grid gap-4 md:grid-cols-2'>
              <div className='rounded-2xl border border-[#EFE7EC] p-6'>
                <p className='text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B9BA4]'>Buying single designs</p>
                <p className='mt-2 font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#0B0F1E]'>$1 – $5 each</p>
                <p className='mt-1 text-[14px]'>
                  A few projects add up fast, and every new idea means paying again.
                </p>
              </div>
              <div className='ol-tint ol-accent-border rounded-2xl border-2 p-6'>
                <p className='ol-ink text-[11px] font-bold uppercase tracking-[0.14em]'>
                  {offer.name}
                </p>
                <p className='mt-2 font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#0B0F1E]'>
                  {pmWords || `${usd(offer.offerPriceCents)} for the ${unit}`}
                </p>
                <p className='mt-1 text-[14px]'>
                  {daily ? `Up to ${daily} designs a day for a ${unit}` : `Every design for a ${unit}`}, plus {credits} designs to keep.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ Reviews ══ */}
      {featured.length > 0 && (
        <section className='bg-white'>
          <div className='mx-auto max-w-[1180px] border-t border-[#F5EFF2] px-4 py-16'>
            <div className='flex flex-col justify-between gap-4 md:flex-row md:items-end'>
              <SectionHead kicker='Reviews' title='Loved by embroiderers' />
              {reviewCount && (
                <span className='inline-flex items-center gap-2 self-start rounded-full ol-tint px-4 py-2 text-[13px] font-semibold text-[#0B0F1E] md:self-auto'>
                  <span className='flex text-[#E8A82A]' aria-hidden>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className='h-3.5 w-3.5 fill-current' />
                    ))}
                  </span>
                  {reviewCount} reviews
                </span>
              )}
            </div>
            <div className={`mt-8 grid gap-5 ${reviewGrid}`}>
              {featured.map((r) => {
                const name = r.author?.name || 'Customer';
                const shot = r.images?.[0]?.url;
                return (
                  <article key={r._id} className='overflow-hidden rounded-2xl border border-[#EFE7EC] bg-white'>
                    {shot && (
                      <div className='ol-tint relative aspect-[4/3]'>
                        <Image src={shot} alt={`Stitched by ${name}`} fill sizes='(min-width:768px) 33vw, 100vw' className='object-cover' />
                      </div>
                    )}
                    <div className='p-5'>
                      <div className='flex text-[#E8A82A]' aria-label={`${Math.round(r.rating || 0)} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`h-4 w-4 ${n <= Math.round(r.rating || 0) ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                      <p className='mt-3 line-clamp-4 text-[14px] text-[#3F4350]'>{r.reviewText}</p>
                      <div className='mt-4 flex items-center gap-3'>
                        <span className='flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ol-tint-strong ol-ink text-xs font-bold'>
                          {r.author?.profile_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.author.profile_image} alt='' className='h-full w-full object-cover' />
                          ) : (
                            name.slice(0, 1).toUpperCase()
                          )}
                        </span>
                        <div>
                          <p className='text-[13px] font-semibold text-[#0B0F1E]'>{name}</p>
                          {r.isVerifiedDownload && <p className='text-[12px]'>Verified download</p>}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══ FAQ ══ */}
      <section className='bg-white'>
        <div className='mx-auto grid max-w-[1180px] gap-8 border-t border-[#F5EFF2] px-4 py-16 md:grid-cols-[1fr_1.6fr]'>
          <SectionHead kicker='Questions' title='Good to know' />
          <div className='divide-y divide-[#EFE7EC] border-y border-[#EFE7EC]'>
            {buildFaqs(offer, { creditValue }).map(({ q, a }) => (
              <details key={q} className='group py-4'>
                <summary className='flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-[#0B0F1E]'>
                  {q}
                  <span className='ol-ink text-xl leading-none transition group-open:rotate-45' aria-hidden>
                    +
                  </span>
                </summary>
                <p className='mt-2 text-[14.5px]'>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Final CTA ══ */}
      <section className='o-fg text-center' style={offerSurfaceStyle(offer)}>
        <div className='mx-auto max-w-[760px] px-4 py-16'>
          <Kicker tone='solid'>{badge}</Kicker>
          <h2 className='mt-4 font-[family-name:var(--font-poppins)] text-[30px] font-bold sm:text-[38px] o-fg'>
            {ended ? 'This offer has ended' : `Ends ${ends}`}
          </h2>
          <p className='o-muted mt-2'>
            1 {unit} of Pro for {usd(offer.offerPriceCents)}
            {credits > 0 ? ` + ${credits} bonus credits` : ''}
          </p>
          <div className='mt-6'>
            <BrandCta offer={offer} ended={ended} source='offer_landing_bottom'>
              {cta}
            </BrandCta>
          </div>
          {!ended && (
            <p className='mt-4 text-[13px] font-semibold uppercase tracking-[0.15em] o-faint'>
              <OfferCountdownText endsAt={offer.endsAt} />
            </p>
          )}
        </div>
      </section>

      {/* ══ Fine print ══ */}
      <footer className='bg-white'>
        <div className='mx-auto max-w-[1180px] px-4 py-8 text-[12px] leading-relaxed text-[#9B9BA4]'>
          <p>
            {offer.name}: {usd(offer.offerPriceCents)} for the first {unit === 'year' ? '12 months' : unit}, then{' '}
            {usd(offer.regularPriceCents)}/{unit} unless cancelled.
            {credits > 0 &&
              ` The ${credits} bonus credits are added when you pay and can be used whenever you don't have an active plan; ${
                offer.bonusCreditsValidityDays ? `they are valid for ${offer.bonusCreditsValidityDays} days` : 'they never expire'
              }. Unused bonus credits are removed if the purchase is refunded.`}{' '}
            Offer ends {endsLong(offer)}. Not available on an active {offer.plan.name} plan.
          </p>
          <p className='mt-3 flex flex-wrap gap-4'>
            <Link href='/terms-and-conditions' className='hover:underline'>Terms</Link>
            <Link href='/privacy-policy' className='hover:underline'>Privacy</Link>
            <Link href='/refund-and-cancellation-policy' className='hover:underline'>Refunds &amp; cancellation</Link>
            <Link href='/contact-us' className='hover:underline'>Contact</Link>
          </p>
          <p className='mt-2'>© {new Date().getFullYear()} Embroidize</p>
        </div>
      </footer>
    </div>
  );
}
