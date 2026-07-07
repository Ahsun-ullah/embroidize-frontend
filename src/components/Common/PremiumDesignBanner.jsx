'use client';

import { ArrowRight, CrownIcon, Lock, Sparkle } from 'lucide-react';

export default function PremiumDesignBanner({ onGetAccess }) {
  return (
    <div className='w-full rounded-3xl border border-gray-100 bg-gray-50 p-5 sm:p-6'>
      <div className='flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
        {/* Left */}
        <div className='flex min-w-0 items-center gap-5'>
          <div className='relative shrink-0'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-black shadow-sm'>
              <CrownIcon
                fill='#F59E0B'
                strokeWidth={1.8}
                className='transition-transform group-hover:scale-110 h-6 w-6 '
                color='#F59E0B'
              />
            </div>

            <Sparkle
              size={10}
              className='absolute -right-3 -top-1 '
              color='#F59E0B'
              fill='#F59E0B'
            />
          </div>

          <div className='min-w-0'>
            <h3 className='text-sm font-bold text-gray-900'>Premium Design</h3>
            <p className='text-xs text-gray-500'>
              Available for Premium members only
            </p>
          </div>
        </div>

        {/* Right */}
        <button
          type='button'
          onClick={onGetAccess}
          className='group flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-neutral-800 sm:w-auto'
        >
          <Lock
            size={18}
            className='transition-transform group-hover:scale-110'
          />

          <span>Upgrade</span>

          <ArrowRight
            size={18}
            className='transition-transform group-hover:translate-x-1'
          />
        </button>
      </div>
    </div>
  );
}
