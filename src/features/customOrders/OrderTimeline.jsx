'use client';

// Compact progress stepper for a custom order's lifecycle, shown at the top of
// the customer's order page. Deliberately short: a thin connector line, small
// markers and tiny labels — no large card chrome. Timestamps live in the order
// details panel, so they are intentionally left off here to keep it slim.
// Pass `dark` when rendering on a dark surface (checkout page).

const STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'paid', label: 'Paid' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
];

// How far along the six steps each status has reached (index into STEPS).
const STATUS_LEVEL = {
  pending_review: 0, // submitted, awaiting quote
  awaiting_payment: 1, // quoted
  paid: 2,
  in_progress: 3,
  delivered: 4,
  in_revision: 4, // files delivered; a revision is underway
  completed: 5,
  cancelled: -1,
  expired: -1,
};

export default function OrderTimeline({ order, dark = false }) {
  const status = order?.status;
  if (!status) return null;

  // Cancelled / expired orders don't follow the happy path — show a short note
  // instead of a misleading half-finished stepper.
  if (status === 'cancelled' || status === 'expired') {
    return (
      <p
        className={`text-sm font-semibold ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}
      >
        {status === 'cancelled'
          ? 'This order was cancelled.'
          : 'The payment window for this order expired.'}
      </p>
    );
  }

  const level = STATUS_LEVEL[status] ?? 0;
  const pct = STEPS.length > 1 ? (level / (STEPS.length - 1)) * 100 : 0;
  const current = STEPS[Math.min(level, STEPS.length - 1)];

  return (
    <div className='w-full'>
      <div className='relative'>
        {/* Track + fill sit behind the markers */}
        <span
          className={`absolute left-0 right-0 top-3 h-0.5 -translate-y-1/2 ${
            dark ? 'bg-white/15' : 'bg-zinc-200'
          }`}
        />
        <span
          className={`absolute left-0 top-3 h-0.5 -translate-y-1/2 transition-all duration-500 ${
            dark ? 'bg-white' : 'bg-black'
          }`}
          style={{ width: `${pct}%` }}
        />

        <ol className='relative flex justify-between'>
          {STEPS.map((step, i) => {
            const done = i < level;
            const isCurrent = i === level;
            const filled = done || isCurrent;
            return (
              <li
                key={step.key}
                className='flex flex-col items-center gap-1.5'
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                    filled
                      ? dark
                        ? 'border-white bg-white text-black'
                        : 'border-black bg-black text-white'
                      : dark
                        ? 'border-white/25 bg-zinc-900 text-white/40'
                        : 'border-zinc-300 bg-white text-zinc-300'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                {/* Per-step labels only from sm up; mobile gets a single caption */}
                <span
                  className={`hidden text-[11px] leading-none sm:block ${
                    isCurrent
                      ? dark
                        ? 'font-semibold text-white'
                        : 'font-semibold text-black'
                      : filled
                        ? dark
                          ? 'font-medium text-zinc-300'
                          : 'font-medium text-zinc-700'
                        : dark
                          ? 'font-medium text-zinc-600'
                          : 'font-medium text-zinc-400'
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile caption: replaces the crowded per-step labels */}
      <p
        className={`mt-3 text-center text-xs font-medium sm:hidden ${
          dark ? 'text-zinc-400' : 'text-zinc-600'
        }`}
      >
        Step {Math.min(level, STEPS.length - 1) + 1} of {STEPS.length} ·{' '}
        <span className={`font-semibold ${dark ? 'text-white' : 'text-black'}`}>
          {current.label}
        </span>
      </p>

      {status === 'in_revision' && (
        <p
          className={`mt-3 text-xs font-medium ${
            dark ? 'text-zinc-400' : 'text-zinc-600'
          }`}
        >
          Revision in progress — we&rsquo;ll email you when the updated file is
          ready.
        </p>
      )}
    </div>
  );
}
