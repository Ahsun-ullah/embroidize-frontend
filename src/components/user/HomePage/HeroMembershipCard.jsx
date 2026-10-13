import OfferCountdown from '@/components/Common/OfferCountdown';
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Crown,
  Download,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

// Membership promo. The hero sells the subscription; the
// custom digitizing pitch moved to the mid-page banner. No plan
// price here — the button routes to /subscriptions so the figures
// always come from the database.
export default function HeroMembershipCard() {
  return (
    <div className='relative w-full lg:w-1/2 flex justify-center lg:justify-end'>
      <div className='relative animate-float w-full max-w-md rounded-3xl bg-white p-8 sm:p-12 shadow-xl shadow-black/5 ring-1 ring-black/5'>
        <span className='inline-flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-sm font-semibold text-white'>
          <Crown className='h-4 w-4' aria-hidden />
          Premium Membership
        </span>

        <h2 className='mt-5 text-3xl sm:text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900'>
          Unlock Every Premium Design
        </h2>
        <p className='mt-3 text-base text-slate-500'>
          One plan, the full premium library in every machine format. Save up to
          75% today.
        </p>

        <div className='mt-5 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm'>
          <Clock className='h-4 w-4 text-green-600' aria-hidden />
          <span className='text-slate-700'>Offer ends in</span>
          <OfferCountdown className='font-bold text-green-600' />
        </div>

        <div className='mt-7 space-y-4'>
          <div className='flex items-center gap-3'>
            <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-slate-900'>
              <Download className='h-5 w-5' aria-hidden />
            </span>
            <p className='font-semibold text-slate-900'>Full premium library</p>
          </div>
          <div className='flex items-center gap-3'>
            <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-slate-900'>
              <BadgeCheck className='h-5 w-5' aria-hidden />
            </span>
            <p className='font-semibold text-slate-900'>
              All machine formats included
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-slate-900'>
              <ShieldCheck className='h-5 w-5' aria-hidden />
            </span>
            <p className='font-semibold text-slate-900'>Cancel anytime</p>
          </div>
        </div>

        <Link
          href='/subscriptions'
          className='group mt-8 inline-flex w-full items-center justify-between gap-4 rounded-full bg-black py-4 px-7 text-base font-bold text-white transition hover:bg-gray-800'
        >
          View Plans &amp; Save 75%
          <span className='flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 transition-transform group-hover:translate-x-0.5'>
            <ArrowRight className='h-5 w-5' aria-hidden />
          </span>
        </Link>
      </div>
    </div>
  );
}
