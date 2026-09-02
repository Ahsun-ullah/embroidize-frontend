'use client';

const BASE_STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'paid', label: 'Paid' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
];

// Which step each status sits on.
const STATUS_STEP = {
  pending_review: 'submitted',
  awaiting_payment: 'quoted',
  paid: 'paid',
  in_progress: 'in_progress',
  delivered: 'delivered',
  in_revision: 'in_revision',
  completed: 'completed',
};

export default function OrderTimeline({ order, dark = false }) {
  const status = order?.status;
  if (!status) return null;

  // "In revision" comes AFTER "Delivered" (a revision happens on a delivered
  // design, so Delivered stays checked) and only appears at all when the
  // order actually has revisions — most orders keep the clean 6-step story.
  const revisionsUsed =
    order?.revisionsUsed ?? order?.revisions?.length ?? 0;
  const STEPS =
    status === 'in_revision' || revisionsUsed > 0
      ? [
          ...BASE_STEPS.slice(0, 5),
          { key: 'in_revision', label: 'In revision' },
          BASE_STEPS[5],
        ]
      : BASE_STEPS;

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

  const level = Math.max(
    0,
    STEPS.findIndex((s) => s.key === STATUS_STEP[status]),
  );
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
