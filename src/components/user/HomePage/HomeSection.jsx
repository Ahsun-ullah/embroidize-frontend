import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Shared shell for every home page section: a compact header row (serif
// title + one-line subtitle on the left, a quiet "View all" link on the
// right) above the section's content. Keeping it in one place is what makes
// the sections read as one page instead of six differently styled blocks.

// The quiet text link from the Browse Categories header, now used by every
// section. On phones the label shortens to "View all" so it never pushes the
// title onto a second line.
export function ViewAllLink({ href, label = 'View All', className = '' }) {
  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={label}
      className={`group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-neutral-500 transition hover:text-neutral-900 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-neutral-900 ${className}`}
    >
      <span className='sm:hidden'>View all</span>
      <span className='hidden sm:inline'>{label}</span>
      <ArrowRight
        className='h-4 w-4 transition-transform group-hover:translate-x-0.5'
        aria-hidden
      />
    </Link>
  );
}

export function SectionHeader({
  id,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel,
}) {
  return (
    <div className='mb-5 flex items-end justify-between gap-4 sm:mb-6'>
      <div className='min-w-0'>
        {title ? (
          <h2
            id={id}
            style={{ fontFamily: 'Georgia, serif' }}
            className='text-xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-2xl lg:text-3xl'
          >
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className='mt-1 text-sm text-neutral-500'>{subtitle}</p>
        ) : null}
      </div>
      {viewAllHref ? (
        <ViewAllLink
          href={viewAllHref}
          label={viewAllLabel}
          className='mb-0.5'
        />
      ) : null}
    </div>
  );
}

// tone: 'white' for a white band, 'muted' to sit on the page's grey. The home
// page alternates them so each section has a clear edge without extra chrome.
export default function HomeSection({
  id,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel,
  tone = 'muted',
  children,
}) {
  return (
    <section
      aria-labelledby={id}
      className={`text-black ${tone === 'white' ? 'bg-white' : ''}`}
    >
      <div className='container mx-auto max-w-7xl py-8 sm:py-10'>
        <SectionHeader
          id={id}
          title={title}
          subtitle={subtitle}
          viewAllHref={viewAllHref}
          viewAllLabel={viewAllLabel}
        />
        {children}
      </div>
    </section>
  );
}

// One grid for every product/bundle row: two up on phones (the old single
// column made eight designs eight screens tall), four up on desktop so the
// eight fetched items fill exactly two rows.
export const HOME_GRID =
  'grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5';
