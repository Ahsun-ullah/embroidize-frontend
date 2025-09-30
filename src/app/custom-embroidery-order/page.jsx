import CustomOrderForm from '@/components/Common/customOrderFoemComponent';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import Image from 'next/image';
import Link from 'next/link';

export async function generateMetadata() {
  return {
    title: 'Custom Embroidery Order | Digitize Your Design Fast',
    description:
      'Order custom embroidery digitizing online. Upload your artwork, choose options, and receive high‑quality embroidery files quickly.',
    robots: 'index,follow',
    openGraph: {
      title: 'Custom Embroidery Order',
      description:
        'Upload embroidery designs and order digitized files online. Fast turnaround, premium quality, professional support.',
    },
  };
}

const gallery = [
  '/images/gallery1.jpg',
  '/images/gallery2.jpg',
  '/images/gallery3.jpg',
  '/images/gallery4.jpg',
  '/images/gallery5.jpg',
  '/images/gallery6.jpg',
];

export default function CustomEmbroideryOrderPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className='relative isolate overflow-hidden bg-slate-50'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
          <div className='grid items-center gap-10 lg:grid-cols-2'>
            <div className='text-white'>
              <p className='mb-4 inline-block rounded-md bg-black px-3 py-1 text-sm tracking-widest text-white/90 font-semibold'>
                Premium Digitizing
              </p>
              <h1 className='text-2xl font-extrabold leading-tight sm:text-5xl'>
                Custom Embroidery Order
              </h1>
              <p className='mt-2 max-w-xl text-sm text-white/80'>
                Upload a design, add requirements, and receive a
                production‑ready embroidery file with fast turnaround and
                meticulous quality checks.
              </p>

              <Link
                href='#order-form'
                className='mt-2 inline-flex items-center justify-center rounded-md bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/90 hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
              >
                Start Order
              </Link>
            </div>

            <div className='relative aspect-[16/10] w-full overflow-hidden rounded-xl ring-1 ring-white/10'>
              <Image
                src='/custom.png'
                alt='Embroidery fabric close-up'
                fill
                className='object-cover'
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <main className='bg-white text-black'>
        {/* Trust + Features */}
        <section className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            <Feature
              icon='⭐'
              title='Top Quality'
              desc='Precision stitch paths and QA review for impeccable sew‑outs.'
            />
            <Feature
              icon='⚡'
              title='Fast Delivery'
              desc='Typical turnaround 4–8 hours for standard complexity.'
            />
            <Feature
              icon='🎯'
              title='Machine Ready'
              desc='Formats like DST, PES, EMB, PDF, and more upon request.'
            />
            <Feature
              icon='💬'
              title='Free Edits'
              desc='Complimentary tweaks to ensure perfect results.'
            />
          </div>
        </section>

        {/* Gallery (SSR) */}
        <section className='mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8'>
          <h2 className='mb-6 text-center text-2xl font-bold'>Our Gallery</h2>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
            {gallery.map((img, i) => (
              <div
                key={i}
                className='group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50'
              >
                <Image
                  src={img}
                  alt={`Embroidery example ${i + 1}`}
                  fill
                  className='object-cover transition-transform duration-300 group-hover:scale-105'
                  priority={i < 2}
                />
              </div>
            ))}
          </div>
          <CustomOrderForm />
        </section>

        {/* Order Form (Client component) */}
        <section
          id='order-form'
          className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'
        >
          <div>
            <h2 className='text-2xl font-bold'>How It Works</h2>

            <ol className='mt-4 list-decimal space-y-4 pl-6 text-sm text-zinc-700'>
              <li>
                Upload your design (JPG, PNG, PDF, etc.) or a hand‑drawn sketch.
              </li>
              <li>Fill out the order form with your requirements.</li>
              <li>Our expert digitizer reviews the design and digitizes it.</li>
              <li>Final file is checked by our QA team before delivery.</li>
              <li>File is delivered via email within 4–8 hours.</li>
            </ol>

            <h3 className='mt-8 text-lg font-semibold'>What You’ll Get:</h3>
            <ul className='mt-3 list-disc space-y-2 pl-6 text-sm text-zinc-700'>
              <li>Digitized embroidery file.</li>
              <li>Unlimited free edits.</li>
              <li>100% satisfaction guarantee.</li>
              <li>Fast email delivery.</li>
            </ul>

            <p className='mt-6 text-sm text-zinc-600'>
              <span className='font-semibold'>Note:</span> If a digitizing
              service for any other machine is required and not mentioned in the
              list, please include the embroidery machine name during order.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className='bg-zinc-50'>
          <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
            <h2 className='text-center text-2xl font-bold'>How It Works</h2>
            <div className='mx-auto mt-8 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4'>
              <Step
                num='1'
                title='Request'
                desc='Submit order with details and artwork.'
              />
              <Step
                num='2'
                title='Review'
                desc='Digitizer examines design & fabric.'
              />
              <Step
                num='3'
                title='Digitize'
                desc='We craft optimized stitch paths.'
              />
              <Step
                num='4'
                title='Receive'
                desc='Get your file via email quickly.'
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
          <h2 className='text-center text-2xl font-bold'>Testimonials</h2>
          <div className='mt-8 grid gap-6 md:grid-cols-2'>
            <Testimonial
              quote='Amazing speed and service—my go‑to for embroidery files.'
              author='Customer A'
              role='Shop Owner'
            />
            <Testimonial
              quote='Easy process and great communication. Highly recommended.'
              author='Customer B'
              role='Fashion Designer'
            />
          </div>
        </section>

        {/* FAQs */}
        <section className='bg-zinc-50'>
          <div className='mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8'>
            <h2 className='text-center text-2xl font-bold'>FAQs</h2>
            <div className='mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white'>
              <FAQ
                q='When will I get my embroidery file?'
                a='Most designs are delivered in 4–8 hours after order submission, depending on complexity.'
              />
              <FAQ
                q='Which file formats do you support?'
                a='DST, PES, EMB, PDF, PNG, JPG. Specify format in the order details.'
              />
              <FAQ
                q='Do you offer revisions?'
                a='Yes, minor edits are included to ensure excellent sew‑outs.'
              />
            </div>
          </div>
        </section>

        {/* SEO Footer Strip */}
        <section className='mx-auto max-w-7xl px-4 py-10 text-sm text-zinc-600 sm:px-6 lg:px-8'>
          <p>
            Professional embroidery digitizing services for logos, monograms,
            caps, 3D puff, and apparel. Files are machine‑ready for popular
            brands and delivered fast with quality assurance.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}

/* —————— Small Presentational Components (server-safe) —————— */

function Feature({ icon, title, desc }) {
  return (
    <div className='rounded-xl border border-zinc-200 p-5 shadow-sm transition hover:shadow-md'>
      <div className='flex items-center gap-3'>
        <span className='flex h-9 w-9 items-center justify-center rounded-md bg-black text-white'>
          {icon}
        </span>
        <h3 className='text-base font-semibold'>{title}</h3>
      </div>
      <p className='mt-2 text-sm text-zinc-600'>{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }) {
  return (
    <div className='text-center'>
      <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white'>
        {num}
      </div>
      <h3 className='mt-3 font-semibold'>{title}</h3>
      <p className='mt-1 text-sm text-zinc-600'>{desc}</p>
    </div>
  );
}

function Testimonial({ quote, author, role }) {
  return (
    <figure className='rounded-xl border border-zinc-200 bg-white p-6 shadow-sm'>
      <blockquote className='text-zinc-800'>&ldquo;{quote}&rdquo;</blockquote>
      <figcaption className='mt-3 text-sm text-zinc-600'>
        — {author}, {role}
      </figcaption>
    </figure>
  );
}

function FAQ({ q, a }) {
  return (
    <details className='group px-5 py-4'>
      <summary className='flex cursor-pointer list-none items-center justify-between font-medium'>
        {q}
        <span className='ml-4 rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 group-open:hidden'>
          +
        </span>
        <span className='ml-4 hidden rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 group-open:inline'>
          −
        </span>
      </summary>
      <p className='mt-2 text-sm text-zinc-600'>{a}</p>
    </details>
  );
}
