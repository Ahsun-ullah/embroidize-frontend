import CustomOrderForm from '@/components/Common/CustomOrderForm';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import Image from 'next/image';
import Link from 'next/link';

export async function generateMetadata() {
  return {
    title: 'Custom Embroidery Digitizing Service',
    description:
      'Upload a image or artwork, add requirements, and receive a production‑ready embroidery file with fast turnaround and meticulous quality checks.',
    robots: 'index,follow',
    openGraph: {
      title: 'Custom Embroidery Digitizing Service',
      description:
        'Upload a image or artwork, add requirements, and receive a production‑ready embroidery file with fast turnaround and meticulous quality checks.',
      url: 'https://www.embroidize.com/custom-embroidery-order',
      siteName: 'Embroidize',
      images: [
        {
          url: 'https://www.embroidize.com/og-image-custom-embroidery-order.jpg',
          width: 1200,
          height: 630,
          alt: 'Custom Embroidery Order',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
  };
}

const gallery = [
  '/images/gallery1.png',
  '/images/gallery2.png',
  '/images/gallery3.png',
  '/images/gallery4.png',
  '/images/gallery5.png',
  '/images/gallery6.png',
];

export default function CustomEmbroideryOrderPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className='relative isolate overflow-hidden bg-slate-50'>
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
          <div className='grid items-center gap-10 lg:grid-cols-2'>
            {/* Image Container: order-first on mobile, order-last on desktop */}
            <div className='relative order-first lg:order-last flex justify-center'>
              <div className='relative aspect-square w-full max-w-[350px] sm:max-w-[450px] lg:w-full'>
                <Image
                  src='https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/custom-order-page-banner-image.png'
                  alt='custom embroidery banner'
                  fill
                  className='object-contain'
                  priority
                />
              </div>
            </div>

            {/* Text Content: order-last on mobile, order-first on desktop */}
            <div className='text-center lg:text-left order-last lg:order-first'>
              <p className='mb-4 inline-block rounded-md bg-black px-3 py-1 text-xs sm:text-sm tracking-widest text-white font-semibold uppercase'>
                Premium Digitizing
              </p>
              <h1 className='text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl'>
                Custom Embroidery{' '}
                <span className='block lg:inline text-black'>Order</span>
              </h1>
              <p className='mx-auto lg:mx-0 mt-4 max-w-xl text-base text-slate-600 leading-relaxed'>
                Upload a design, add requirements, and receive a
                production‑ready embroidery file with fast turnaround and
                meticulous quality checks.
              </p>

              <div className='mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4'>
                <Link
                  href='#order-form'
                  role='button'
                  className='inline-flex items-center justify-center rounded-md bg-black px-8 py-4 text-base font-bold text-white transition hover:bg-slate-800 shadow-lg active:scale-95'
                >
                  Start Order Now
                </Link>
              </div>
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
        <section className='mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8'>
          <h2 className='mb-8 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl'>
            Our Gallery
          </h2>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {gallery.map((img, i) => (
              <div
                key={i}
                className='group relative aspect-[16/9] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm'
              >
                <Image
                  src={img}
                  alt={`Embroidery example ${i + 1}`}
                  fill
                  className='object-contain p-2 transition-transform duration-300 group-hover:scale-105'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  priority={i < 2}
                />
              </div>
            ))}
          </div>

          {/* Form Section with Responsive Margin */}
          <div className='mt-16 sm:mt-24'>
            <CustomOrderForm orderForm='order-form' />
          </div>
        </section>

        {/* Order Form (Client component) */}
        <section className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
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
        <section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <h2 className='text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl'>
              What Our Clients Say
            </h2>
            <p className='mt-4 text-lg text-slate-600 max-w-2xl mx-auto'>
              Trusted by embroidery shop owners and independent designers
              worldwide for premium digitizing.
            </p>
          </div>

          <div className='mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            <Testimonial
              quote='The digitizing quality is exceptional. Even the most intricate small details in our floral designs came out perfectly on the first run.'
              author='Sarah Jenkins'
              role='Boutique Shop Owner'
            />
            <Testimonial
              quote='Incredible turnaround time. I uploaded a custom logo at night and had a production-ready file in my inbox by morning. Highly recommend!'
              author='Michael Chen'
              role='Custom Apparel Designer'
            />
            <Testimonial
              quote="I've used many digitizing services, but Embroidize's attention to stitch density and pathing is unmatched. No thread breaks at all."
              author='Elena Rodriguez'
              role='Industrial Embroidery Lab'
            />
            <Testimonial
              quote="The 'Before and After' comparisons on their site are exactly what you get. They really know how to translate complex gradients into stitches."
              author='David Thompson'
              role='Freelance Graphic Artist'
            />
            <Testimonial
              quote='Their customer support is fantastic. They helped me adjust a file for a specific fabric type without any extra hassle.'
              author='Amanda Foster'
              role='Home Decor Specialist'
            />
            <Testimonial
              quote='Finally a service that understands commercial embroidery standards. The files are clean, efficient, and ready for high-volume production.'
              author='Robert Miller'
              role='Textile Manufacturer'
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
