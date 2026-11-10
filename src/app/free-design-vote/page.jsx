import DailyFreeVoteBoard from '@/components/Common/DailyVote/DailyFreeVoteBoard';
import DesignVotePanel from '@/components/Common/DailyVote/DesignVotePanel';
import VoteBrowser from '@/components/Common/DailyVote/VoteBrowser';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import {
  getDailyVoteBoard,
  getDailyVoteStanding,
  SITE_URL,
  VOTE_PAGE_PATH,
  voteShareImageUrl,
} from '@/lib/apis/public/dailyVote';
import { getCategories } from '@/lib/apis/public/category';
import { getSingleProduct } from '@/lib/apis/public/products';
import { Download, Vote, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// The page to share: embroidize.com/free-design-vote. With ?design=<slug> it
// opens with that design in the spotlight, so a post can say "vote for the
// puppy!" and land people one tap from voting for it.
export const dynamic = 'force-dynamic';

const safeSlug = (v) =>
  typeof v === 'string' && /^[a-z0-9-]{1,200}$/i.test(v) ? v : null;

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const design = safeSlug(sp?.design);
  const board = await getDailyVoteBoard(3);
  const day = board?.day;

  let title = 'Vote for Tomorrow’s Free Embroidery Design | Embroidize';
  let description =
    'Vote for your favorite machine embroidery design. The most-voted design is free to download for everyone tomorrow. New vote every day.';
  if (design) {
    const product = (await getSingleProduct(design).catch(() => null))?.data;
    if (product?.name) {
      title = `Vote to make “${product.name}” free tomorrow | Embroidize`;
      description = `Help make ${product.name} a free embroidery design. The most-voted design today is free for everyone tomorrow.`;
    }
  }
  const image = voteShareImageUrl({ design, day });
  const url = `${SITE_URL}${VOTE_PAGE_PATH}${design ? `?design=${design}` : ''}`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${VOTE_PAGE_PATH}` },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Embroidize',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

function Spotlight({ product, standing }) {
  return (
    <div className='container mx-auto max-w-3xl px-4'>
      <div className='grid items-center gap-6 rounded-3xl border border-amber-200 bg-white p-5 shadow-sm sm:grid-cols-[220px_1fr]'>
        <Link
          href={`/product/${product.slug}`}
          className='relative mx-auto block aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl bg-white'
        >
          <Image
            src={product.image?.url}
            alt={product.name}
            fill
            sizes='220px'
            className='object-contain p-2'
            priority
          />
        </Link>
        <div className='space-y-3'>
          <p className='text-xs font-extrabold uppercase tracking-wide text-amber-700'>
            Someone wants this one free
          </p>
          <h2 className='text-2xl font-extrabold text-gray-900'>
            {product.name}
          </h2>
          {standing?.isFreeToday ? (
            <Link
              href={`/product/${product.slug}`}
              className='inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-500 font-bold text-white hover:bg-green-600'
            >
              <Download className='h-5 w-5' aria-hidden /> It&apos;s free today:
              download it
            </Link>
          ) : (
            <DesignVotePanel product={product} standing={standing} />
          )}
        </div>
      </div>
    </div>
  );
}

export default async function FreeDesignVotePage({ searchParams }) {
  const sp = await searchParams;
  const design = safeSlug(sp?.design);

  const [board, spotlightProduct, categories] = await Promise.all([
    getDailyVoteBoard(24),
    design
      ? getSingleProduct(design)
          .then((r) => r?.data)
          .catch(() => null)
      : null,
    getCategories('', 0, 100)
      .then((r) => (Array.isArray(r?.categories) ? r.categories : []))
      .catch(() => []),
  ]);
  const spotlightStanding = spotlightProduct?._id
    ? await getDailyVoteStanding(spotlightProduct._id)
    : null;

  return (
    <div className='bg-[#f4f4f4]'>
      <Header />
      <main className='space-y-10 py-10'>
        {spotlightProduct && (
          <Spotlight product={spotlightProduct} standing={spotlightStanding} />
        )}

        {board?.enabled ? (
          <DailyFreeVoteBoard
            board={board}
            variant='page'
            highlightSlug={design}
          />
        ) : (
          <div className='container mx-auto max-w-3xl px-4 text-center'>
            <h1 className='text-3xl font-extrabold'>
              The daily free design vote is taking a break
            </h1>
            <p className='mt-2 text-gray-500'>
              Check back soon, or browse our free designs in the meantime.
            </p>
            <Link
              href='/products'
              className='mt-4 inline-block rounded-xl bg-black px-5 py-3 font-bold text-white'
            >
              Browse designs
            </Link>
          </div>
        )}

        {board?.enabled && <VoteBrowser categories={categories} />}

        <section className='container mx-auto max-w-5xl px-4'>
          <h2 className='text-center text-2xl font-extrabold text-gray-900'>
            How it works
          </h2>
          <div className='mt-6 grid gap-4 sm:grid-cols-3'>
            {[
              {
                icon: Vote,
                t: 'Vote once a day',
                d: 'Log in, find any premium design below and vote for it. One vote a day.',
              },
              {
                icon: Trophy,
                t: 'Most votes wins',
                d: 'At midnight UTC the design with the most votes wins. Votes then reset.',
              },
              {
                icon: Download,
                t: 'Free for 24 hours',
                d: 'The winner is free for every member all next day, without using your download limit.',
              },
            ].map(({ icon: Icon, t, d }) => (
              <div
                key={t}
                className='rounded-3xl border border-gray-100 bg-white p-5 text-center shadow-sm'
              >
                <Icon className='mx-auto h-8 w-8 text-amber-500' aria-hidden />
                <p className='mt-3 font-bold text-gray-900'>{t}</p>
                <p className='mt-1 text-sm text-gray-500'>{d}</p>
              </div>
            ))}
          </div>
          <div className='mt-6 text-center'>
            <Link
              href='#vote-any-design'
              className='inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-bold text-white hover:bg-gray-800'
            >
              Find a design to vote for
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
