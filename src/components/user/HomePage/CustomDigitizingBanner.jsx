import {
  ArrowRight,
  Clock,
  FileCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

// Custom digitizing banner — moved here from the hero, which now sells
// the membership. Same card shell the limited-offer banner used.
export default function CustomDigitizingBanner() {
  return (
    <section
      aria-labelledby='custom-digitizing-heading'
      className='container mx-auto max-w-7xl py-6 sm:py-8'
    >
      <div className='overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5'>
        <div className='flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between'>
          <div className='min-w-0'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white'>
              <Sparkles className='h-3.5 w-3.5' aria-hidden />
              Custom Digitizing
            </span>

            <h2
              id='custom-digitizing-heading'
              className='mt-3 font-serif text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl'
            >
              Need Custom Embroidery Digitizing?
            </h2>
            <p className='mt-2 max-w-xl text-sm text-slate-500 sm:text-base'>
              Send us your logo or artwork and get it back as a machine-ready
              embroidery file, digitized by hand — from $5.
            </p>

            <ul className='mt-4 flex flex-wrap gap-x-5 gap-y-2'>
              <li className='flex items-center gap-2'>
                <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-slate-900'>
                  <Clock className='h-3.5 w-3.5' aria-hidden />
                </span>
                <p className='text-sm font-semibold text-slate-900'>
                  1–24 hour delivery
                </p>
              </li>
              <li className='flex items-center gap-2'>
                <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-slate-900'>
                  <FileCheck className='h-3.5 w-3.5' aria-hidden />
                </span>
                <p className='text-sm font-semibold text-slate-900'>
                  DST, PES, JEF &amp; more
                </p>
              </li>
              <li className='flex items-center gap-2'>
                <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-slate-900'>
                  <RefreshCw className='h-3.5 w-3.5' aria-hidden />
                </span>
                <p className='text-sm font-semibold text-slate-900'>
                  Free unlimited revisions
                </p>
              </li>
            </ul>
          </div>

          <div className='flex w-full shrink-0 flex-col items-stretch lg:w-auto lg:items-end'>
            <Link
              href='/custom-embroidery-digitizing-service'
              className='group inline-flex items-center justify-between gap-4 rounded-full bg-black py-2.5 pl-6 pr-2.5 text-sm font-bold sm:text-base text-white transition hover:bg-gray-800'
            >
              Start a custom order
              <span className='flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 transition-transform group-hover:translate-x-0.5'>
                <ArrowRight className='h-5 w-5' aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
