import {
  votePageUrl,
  voteShareImageUrl,
  VOTE_PAGE_PATH,
} from '@/lib/apis/public/dailyVote';
import { ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import VoteCountdown from './VoteCountdown';
import { EmptyVoteSlot, FreeTodayCard, VoteCard } from './VoteCards';
import VoteShareBar from './VoteShareBar';

// "Which design do you want for free?" — today's free design next to today's
// race. Rendered on the server from the public board; the cards themselves are
// client components (vote buttons, share menus).
//
// variant 'home' : free design + top 3, link to the full page.
// variant 'page' : the same header, then every design with votes.
export default function DailyFreeVoteBoard({
  board,
  variant = 'home',
  highlightSlug = null,
}) {
  if (!board?.enabled) return null;
  const leaders = board.leaders || [];
  const isHome = variant === 'home';
  const slots = isHome ? 3 : Math.max(3, leaders.length);
  const shown = leaders.slice(0, slots);
  // The vote page's main heading; a section heading on the homepage.
  const Heading = isHome ? 'h2' : 'h1';
  const empties = Array.from(
    { length: Math.max(0, 3 - shown.length) },
    (_, i) => shown.length + i + 1,
  );

  return (
    <div className='container mx-auto max-w-7xl px-4'>
      <div className='flex flex-col items-center gap-4 text-center lg:relative'>
        <div>
          <Heading className='text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl'>
            Which Design Do You Want for Free?
          </Heading>
          <p className='mt-2 text-base text-gray-500 sm:text-lg'>
            Vote for your favorite. The most-voted design becomes free tomorrow.
          </p>
        </div>
        <VoteCountdown
          endsAt={board.endsAt}
          serverNow={board.serverNow}
          className='lg:absolute lg:right-0 lg:top-0'
        />
      </div>

      <div className='mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4'>
        {board.freeDesign && (
          <div className='w-[82%] shrink-0 snap-center sm:w-auto'>
            <FreeTodayCard freeDesign={board.freeDesign} />
          </div>
        )}
        {shown.map((entry) => (
          <div
            key={entry.product?._id}
            className='w-[82%] shrink-0 snap-center sm:w-auto'
          >
            <VoteCard
              entry={entry}
              highlight={highlightSlug && entry.product?.slug === highlightSlug}
            />
          </div>
        ))}
        {empties.map((rank) => (
          <div
            key={`empty-${rank}`}
            className='w-[82%] shrink-0 snap-center sm:w-auto'
          >
            <EmptyVoteSlot rank={rank} />
          </div>
        ))}
      </div>

      <div className='mt-6 flex flex-col items-center gap-4'>
        <p className='flex items-center gap-1.5 text-sm text-gray-500'>
          <Info className='h-4 w-4' aria-hidden />
          One vote per member daily · Vote for any premium design · Votes reset
          each day
        </p>
        <VoteShareBar
          url={votePageUrl()}
          image={voteShareImageUrl({ day: board.day })}
          text='Vote for the embroidery design you want FREE tomorrow on Embroidize! 🧵'
        />
        {isHome && (
          <Link
            href={VOTE_PAGE_PATH}
            className='inline-flex items-center gap-1.5 text-sm font-bold text-gray-900 underline-offset-4 hover:underline'
          >
            See the full leaderboard{' '}
            <ArrowRight className='h-4 w-4' aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
