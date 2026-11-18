'use client';

import { useSiteConfig } from '@/lib/providers/SiteConfigProvider';
import { ArrowRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// "Join our Facebook group" placements, driven by Settings → Community.
//
// Both render NOTHING until a group link is saved — same rule as the WhatsApp
// button: a join button pointing nowhere is worse than no button. The member
// count is the admin's own display text ("10,000+"); when it is blank the copy
// drops the number instead of claiming one.
// ─────────────────────────────────────────────────────────────────────────────

// Footer, every page: Facebook icon + "Join our community (10k+ members)".
export function FacebookCommunityFooterLink() {
  const { facebookGroupUrl, facebookGroupMembers } = useSiteConfig();
  if (!facebookGroupUrl) return null;

  return (
    <a
      href={facebookGroupUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='group mt-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-4 text-[13px] font-semibold text-gray-900 shadow-sm transition hover:border-gray-900 hover:bg-gray-900 hover:text-white'
    >
      <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white transition group-hover:bg-white group-hover:text-gray-900'>
        <i className='ri-facebook-fill text-[14px]' aria-hidden />
      </span>
      <span>
        Join our community
        {facebookGroupMembers ? (
          <span className='font-normal text-gray-500 group-hover:text-gray-300'>
            {' '}
            ({facebookGroupMembers} members)
          </span>
        ) : null}
      </span>
    </a>
  );
}

// Homepage, after the designs and before the footer.
export function FacebookCommunitySection() {
  const { facebookGroupUrl, facebookGroupMembers } = useSiteConfig();
  if (!facebookGroupUrl) return null;

  return (
    <section aria-labelledby='community-heading' className='text-black'>
      <div className='container mx-auto max-w-7xl px-4 py-8 sm:py-10'>
        <div className='flex flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-10 md:flex-row md:text-left'>
          <span className='inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white'>
            <i className='ri-facebook-fill text-3xl' aria-hidden />
          </span>
          <div className='min-w-0 flex-1'>
            <h2
              id='community-heading'
              style={{ fontFamily: 'Georgia, serif' }}
              className='text-xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-2xl'
            >
              {facebookGroupMembers
                ? `Join ${facebookGroupMembers} embroiderers in our Facebook group`
                : 'Join our Facebook group'}
            </h2>
            <p className='mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base'>
              Share your stitch-outs, get project ideas, ask questions and be
              first to hear about new designs and offers.
            </p>
          </div>
          <a
            href={facebookGroupUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='group inline-flex shrink-0 items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black'
          >
            Join the group
            <ArrowRight
              className='h-4 w-4 transition-transform group-hover:translate-x-0.5'
              aria-hidden
            />
          </a>
        </div>
      </div>
    </section>
  );
}
