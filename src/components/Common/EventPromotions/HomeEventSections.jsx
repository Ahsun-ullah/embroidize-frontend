import PromoPoster from './PromoPoster';

// Home page event posters for ONE position, in the admin's sort order. The
// page renders this three times, once per spot the admin can pick per event:
//
//   after_hero     full-width sections right under the hero
//   middle         one shared row after the first product section —
//                  2–3 square posters side by side (one alone goes full width)
//   before_footer  full-width sections after the last product section
//
// Full-width sections reuse the other home sections' white header band so a
// poster reads as part of the page, not an ad slot.

const forPosition = (promotions, position) =>
  promotions.filter(
    (p) =>
      p.showOnHome &&
      (p.desktopImage || p.mobileImage) &&
      (p.homePosition || 'after_hero') === position,
  );

function FullWidthSection({ promo, eager }) {
  const hasHeader = promo.sectionTitle || promo.sectionSubtitle;
  return (
    <section
      aria-labelledby={promo.sectionTitle ? `event-${promo._id}-heading` : undefined}
      aria-label={promo.sectionTitle ? undefined : promo.name}
      className='text-black my-8 py-6'
    >
      {hasHeader ? (
        <div className='bg-[#ffffff] flex flex-col items-center justify-center gap-2 py-6 mb-6 px-4 text-center'>
          {promo.sectionTitle ? (
            <h2
              id={`event-${promo._id}-heading`}
              className='text-2xl sm:text-2xl md:text-3xl font-bold leading-snug'
            >
              {promo.sectionTitle}
            </h2>
          ) : null}
          {promo.sectionSubtitle ? (
            <p className='text-base sm:text-base md:text-lg font-medium text-gray-600'>
              {promo.sectionSubtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className='container mx-auto max-w-7xl px-4'>
        <PromoPoster promo={promo} eager={eager} />
      </div>
    </section>
  );
}

// Desktop columns follow the number of events, capped at 6 per row (a 7th
// starts a new row). Literal class names: Tailwind only ships classes it can
// find written out in the source.
const DESKTOP_COLS = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};
const MAX_PER_ROW = 6;

function EventRow({ items }) {
  // A lone event in the row has the whole width — show it like a full section.
  if (items.length === 1) return <FullWidthSection promo={items[0]} />;

  const perRow = Math.min(items.length, MAX_PER_ROW);
  // Phones: 2 across. Tablets: up to 3. Desktop: one column per event, max 6.
  const cols = `grid-cols-2 ${perRow >= 3 ? 'sm:grid-cols-3' : ''} ${DESKTOP_COLS[perRow]}`;
  // Six across leaves ~200px a card — captions shrink to fit.
  const compact = perRow > 3;

  return (
    <section aria-labelledby='home-events-row-heading' className='text-black my-8 py-6'>
      <div className='bg-[#ffffff] flex flex-col items-center justify-center gap-2 py-6 mb-6 px-4 text-center'>
        <h2
          id='home-events-row-heading'
          className='text-2xl sm:text-2xl md:text-3xl font-bold leading-snug'
        >
          Shop by Event
        </h2>
        <p className='text-base sm:text-base md:text-lg font-medium text-gray-600'>
          Seasonal collections, ready for your next project.
        </p>
      </div>

      <div
        className={`container mx-auto max-w-7xl px-4 grid ${compact ? 'gap-4' : 'gap-6'} ${cols}`}
      >
        {items.map((promo) => (
          <div key={promo._id} className='flex flex-col'>
            <PromoPoster promo={promo} prefer='square' />
            {promo.sectionTitle || promo.sectionSubtitle ? (
              <div className='mt-2 px-1 text-center'>
                {promo.sectionTitle ? (
                  <h3
                    className={`font-bold leading-snug ${compact ? 'text-sm' : 'text-lg'}`}
                  >
                    {promo.sectionTitle}
                  </h3>
                ) : null}
                {promo.sectionSubtitle ? (
                  <p
                    className={`mt-0.5 font-medium text-gray-600 ${compact ? 'text-xs line-clamp-2' : 'text-sm'}`}
                  >
                    {promo.sectionSubtitle}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomeEventSections({ promotions = [], position = 'after_hero' }) {
  const items = forPosition(promotions, position);
  if (!items.length) return null;

  if (position === 'middle') return <EventRow items={items} />;

  // Only the spot just under the hero is near the top of the page.
  return items.map((promo, i) => (
    <FullWidthSection
      key={promo._id}
      promo={promo}
      eager={position === 'after_hero' && i === 0}
    />
  ));
}
