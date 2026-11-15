import OfferCheckoutButton from '@/components/Common/Offer/OfferCheckoutButton';
import OfferCountdownTiles from '@/components/Common/Offer/OfferCountdown';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import {
  endsLong,
  offerLine,
  perMonth,
  renewsLine,
  usd,
} from '@/lib/offers/format';
import { ArrowRight, CalendarCheck, Check, Coins, CreditCard } from 'lucide-react';
import Link from 'next/link';

// Answers that are true for every offer, built from its own numbers. The
// admin's FAQs come first; these fill in what a buyer always asks.
function defaultFaqs(offer) {
  const unit = offer.plan.billingInterval;
  const list = [
    {
      q: 'When does the offer end?',
      a: `${endsLong(offer)}. After that the ${offer.name} and its bonus are gone.`,
    },
    {
      q: 'What happens after the first ' + unit + '?',
      a: `${renewsLine(offer)} We email you before every renewal, and you can cancel any time from My Plan.`,
    },
  ];
  if (offer.bonusCredits > 0) {
    list.push({
      q: 'How do the bonus credits work?',
      a: `The ${offer.bonusCredits} credits land in your account the moment you pay. While your plan is active you use your daily downloads, so the credits are never touched. When your plan ends, each credit downloads one premium design${
        offer.bonusCreditsValidityDays
          ? `, for ${offer.bonusCreditsValidityDays} days after purchase`
          : ', and they never expire'
      }. If you cancel, they are still yours.`,
    });
  }
  list.push({
    q: "I'm on the Monthly plan. Can I switch?",
    a: `Yes. Buy the ${offer.name} and your monthly plan is cancelled automatically, so you only ever pay for one plan.`,
  });
  return list;
}

export default function OfferLandingPage({ offer }) {
  const ended = offer.phase === 'ended' || new Date(offer.endsAt).getTime() <= Date.now();
  const cta = offer.ctaLabel || `Get the ${offer.name}`;
  const faqs = [...(offer.faqs || []), ...defaultFaqs(offer)];

  const included = [
    'Every design in the library, new ones every day',
    offer.plan.dailyLimit ? `${offer.plan.dailyLimit} downloads a day` : null,
    'PES, DST, JEF, VP3, EXP, XXX and more',
    'Commercial use on physical products',
    ...(offer.plan.features || []),
  ].filter(Boolean);
  // Plan features are admin text and may repeat the lines above.
  const includedUnique = [...new Set(included)];

  return (
    <>
      <Header />
      <main className='bg-[#f4f4f4] pb-16'>
        {/* ── Hero ── */}
        <section className='bg-black text-white'>
          <div className='container mx-auto max-w-5xl px-4 py-12 text-center sm:py-16'>
            <p className='text-xs font-bold uppercase tracking-[0.25em] text-[#E8C26A]'>
              {offer.phase === 'early' ? `Early access · ${offer.name}` : offer.name}
            </p>
            <h1 className='mx-auto mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl'>
              {offer.headline || 'Our biggest offer of the year'}
            </h1>
            <p className='mx-auto mt-4 max-w-2xl text-lg text-white/80'>
              {offerLine(offer)}
              {perMonth(offer) && <span className='text-white/60'> — just {perMonth(offer)}</span>}
            </p>
            {offer.description && (
              <p className='mx-auto mt-3 max-w-2xl text-white/60'>{offer.description}</p>
            )}
            <div className='mt-8 flex justify-center'>
              {ended ? (
                <p className='text-lg font-semibold text-white/70'>This offer has ended.</p>
              ) : (
                <OfferCountdownTiles endsAt={offer.endsAt} tone='dark' />
              )}
            </div>
          </div>
        </section>

        <div className='container mx-auto max-w-5xl px-4'>
          {/* ── Plan card ── */}
          <section className='-mt-6 rounded-3xl bg-white p-6 shadow-xl ring-2 ring-[#E8C26A] sm:p-8'>
            <div className='grid gap-8 md:grid-cols-[1fr_auto] md:items-center'>
              <div>
                {offer.badge && (
                  <span className='inline-block rounded-full bg-black px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E8C26A]'>
                    {offer.badge}
                  </span>
                )}
                <h2 className='mt-3 text-2xl font-extrabold text-black'>{offer.name}</h2>
                <ul className='mt-4 space-y-2'>
                  {includedUnique.map((line) => (
                    <li key={line} className='flex items-start gap-2 text-gray-700'>
                      <Check className='mt-0.5 h-5 w-5 shrink-0 text-black' aria-hidden />
                      {line}
                    </li>
                  ))}
                  {offer.bonusCredits > 0 && (
                    <li className='flex items-start gap-2 font-semibold text-black'>
                      <Check className='mt-0.5 h-5 w-5 shrink-0 text-[#B8892E]' aria-hidden />
                      + {offer.bonusCredits} bonus credits
                      {offer.bonusCreditsValidityDays ? '' : ' that never expire'}
                    </li>
                  )}
                </ul>
              </div>
              <div className='md:w-72 md:text-center'>
                <div className='flex items-baseline gap-2 md:justify-center'>
                  <span className='text-5xl font-extrabold tracking-tight text-black'>
                    {usd(offer.offerPriceCents)}
                  </span>
                  {offer.savingsCents > 0 && (
                    <span className='text-lg text-gray-400 line-through'>
                      {usd(offer.regularPriceCents)}
                    </span>
                  )}
                </div>
                <p className='mt-1 text-sm text-gray-500'>
                  for 1 {offer.plan.billingInterval}
                  {perMonth(offer) ? ` · ${perMonth(offer)}` : ''}
                </p>
                <div className='mt-5'>
                  {ended ? (
                    <Link
                      href='/subscriptions'
                      className='flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black font-bold text-white'
                    >
                      See current plans <ArrowRight className='h-4 w-4' aria-hidden />
                    </Link>
                  ) : (
                    <OfferCheckoutButton
                      offer={offer}
                      source='offer_landing'
                      className='flex h-12 w-full items-center justify-center rounded-xl bg-black text-base font-bold text-white transition hover:bg-gray-900'
                    >
                      {cta}
                    </OfferCheckoutButton>
                  )}
                </div>
                <p className='mt-3 text-xs text-gray-500'>
                  No code needed. {renewsLine(offer)}
                </p>
              </div>
            </div>
          </section>

          {/* ── How the credits work ── */}
          {offer.bonusCredits > 0 && (
            <section className='mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8'>
              <h2 className='text-center text-2xl font-extrabold text-black'>How the bonus credits work</h2>
              <ol className='mt-6 grid gap-4 md:grid-cols-3'>
                {[
                  {
                    icon: CreditCard,
                    title: `Pay ${usd(offer.offerPriceCents)} today`,
                    body: `Your Pro plan starts right away and the ${offer.bonusCredits} credits land in your account.`,
                  },
                  {
                    icon: CalendarCheck,
                    title: `Download all ${offer.plan.billingInterval}`,
                    body: offer.plan.dailyLimit
                      ? `${offer.plan.dailyLimit} downloads every day. Your credits are not touched.`
                      : 'Use your daily downloads. Your credits are not touched.',
                  },
                  {
                    icon: Coins,
                    title: 'Credits take over',
                    body: `Whenever you don't have a plan, each credit downloads one premium design${
                      offer.bonusCreditsValidityDays ? '' : ' — they never expire'
                    }.`,
                  },
                ].map(({ icon: Icon, title, body }, i) => (
                  <li key={title} className='rounded-2xl bg-[#f4f4f4] p-5'>
                    <div className='flex items-center gap-3'>
                      <span className='flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-[#E8C26A]'>
                        {i + 1}
                      </span>
                      <Icon className='h-5 w-5 text-black' aria-hidden />
                    </div>
                    <h3 className='mt-3 font-bold text-black'>{title}</h3>
                    <p className='mt-1 text-sm text-gray-600'>{body}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* ── FAQ ── */}
          <section className='mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8'>
            <h2 className='text-2xl font-extrabold text-black'>Questions</h2>
            <div className='mt-4 divide-y divide-gray-100'>
              {faqs.map(({ q, a }) => (
                <details key={q} className='group py-4'>
                  <summary className='flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-black'>
                    {q}
                    <span className='text-gray-400 transition group-open:rotate-45' aria-hidden>+</span>
                  </summary>
                  <p className='mt-2 text-gray-600'>{a}</p>
                </details>
              ))}
            </div>
          </section>

          {!ended && (
            <div className='mt-8 text-center'>
              <OfferCheckoutButton
                offer={offer}
                source='offer_landing_bottom'
                className='inline-flex h-12 items-center justify-center rounded-xl bg-black px-8 text-base font-bold text-white transition hover:bg-gray-900'
              >
                {cta}
              </OfferCheckoutButton>
              <p className='mt-2 text-sm text-gray-500'>Available until {endsLong(offer)}.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
