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
      className='container mx-auto max-w-7xl px-4 py-6'
    >
      <div className='overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5'>
        <div className='flex flex-col gap-10 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between'>
          <div className='min-w-0'>
            <span className='inline-flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-sm font-semibold text-white'>
              <Sparkles className='h-4 w-4' aria-hidden />
              Custom Digitizing
            </span>

            <h2
              id='custom-digitizing-heading'
              className='mt-5 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl'
            >
              Need Custom Embroidery Digitizing?
            </h2>
            <p className='mt-4 max-w-xl text-base text-slate-500'>
              Send us your logo or artwork and get it back as a machine-ready
              embroidery file, digitized by hand — from $5.
            </p>

            <ul className='mt-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-8'>
              <li className='flex items-center gap-3'>
                <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-slate-900'>
                  <Clock className='h-5 w-5' aria-hidden />
                </span>
                <p className='font-semibold text-slate-900'>
                  1–24 hour delivery
                </p>
              </li>
              <li className='flex items-center gap-3'>
                <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-slate-900'>
                  <FileCheck className='h-5 w-5' aria-hidden />
                </span>
                <p className='font-semibold text-slate-900'>
                  DST, PES, JEF &amp; more
                </p>
              </li>
              <li className='flex items-center gap-3'>
                <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-slate-900'>
                  <RefreshCw className='h-5 w-5' aria-hidden />
                </span>
                <p className='font-semibold text-slate-900'>
                  Free unlimited revisions
                </p>
              </li>
            </ul>
          </div>

          <div className='flex w-full shrink-0 flex-col items-stretch gap-5 lg:w-auto lg:items-end'>
            <Link
              href='/custom-embroidery-digitizing-service'
              className='group inline-flex items-center justify-between gap-4 rounded-full bg-black py-4 px-7 text-base font-bold text-white transition hover:bg-gray-800'
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
