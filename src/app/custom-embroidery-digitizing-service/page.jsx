import CustomOrderForm from '@/components/Common/CustomOrderForm';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import Image from 'next/image';
import Link from 'next/link';

export async function generateMetadata() {
  return {
    title:
      'Custom Embroidery Digitizing Service | Starting at $5 | Fast Turnaround',
    description:
      'Professional custom embroidery digitizing service starting at $5. Get machine-ready DST, PES, JEF files with 1-24 hour delivery. 100% manual digitizing, unlimited revisions, trusted by 1,000+ businesses.',
    robots: 'index,follow',
    alternates: {
      canonical:
        'https://www.embroidize.com/custom-embroidery-digitizing-service',
    },
    openGraph: {
      title: 'Custom Embroidery Digitizing Service | Starting at $5',
      description:
        'Upload your logo or artwork and receive machine‑ready embroidery files with fast turnaround and unlimited revisions.',
      url: 'https://www.embroidize.com/custom-embroidery-digitizing-service',
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

      {/* HERO SECTION */}
      <section className='bg-gradient-to-b from-slate-50 to-white'>
        <div className='container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-10'>
          <div className='grid items-center gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:gap-4'>
            {/* LEFT: Hero Text */}
            <div>
              <p className='text-sm font-bold uppercase tracking-wider text-slate-600 sm:text-base'>
                Professional
              </p>

              <h1 className='mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-4xl'>
                Custom Embroidery Digitizing Service
              </h1>

              <p className='mt-5 text-base font-semibold italic text-slate-800 sm:text-lg lg:text-xl'>
                Fast, professional embroidery digitizing starting at $5 with
                1–24 hour delivery for all embroidery machines
              </p>

              <p className='mt-4 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg'>
                Upload your logo, artwork, or sketch and receive professional
                embroidery digitizing converted into machine‑ready embroidery
                files. Delivered with fast turnaround, free revisions, and
                meticulous quality checks — perfect for businesses, designers,
                and embroidery professionals.
              </p>

              <div className='mt-8 space-y-3'>
                <Link
                  href='#order-form'
                  className='inline-flex w-full items-center justify-center rounded-full bg-black px-10 py-4 text-base font-bold text-white shadow-xl transition hover:bg-slate-800 active:scale-95 sm:w-auto sm:text-lg'
                >
                  Start Custom Embroidery Order
                </Link>
                <p className='text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm'>
                  Trusted by 1,000+ businesses • 100% Satisfaction Guarantee
                </p>
              </div>
            </div>

            {/* RIGHT: Hero Image */}
            <div className='relative flex justify-center lg:justify-end'>
              <div className='relative h-[300px] w-[400px] sm:h-[350px] sm:w-[480px] lg:h-[400px] lg:w-[520px]'>
                <Image
                  src='https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/custom-order-page-banner-image.png'
                  alt='Custom embroidery digitizing before and after comparison'
                  fill
                  className='object-contain drop-shadow-2xl'
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - Feature Cards */}
      <section className='bg-white py-12 lg:py-16'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <h2 className='text-3xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-3xl'>
              Why Choose Our Embroidery Digitizing Service?
            </h2>
            <p className='mx-auto mt-4 max-w-3xl text-base text-slate-600 sm:text-lg lg:text-xl'>
              We specialize in professional embroidery digitizing, ensuring
              every stitch is optimized for smooth machine performance and
              premium results.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='flex h-full flex-col rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg ring-1 ring-slate-200 transition hover:shadow-xl'>
              <div className='mb-3 flex items-start gap-4'>
                <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100'>
                  <span className='text-2xl'>🏆</span>
                </div>
                <h3 className='text-lg font-bold text-slate-900 sm:text-xl'>
                  Top‑Quality Digitizing
                </h3>
              </div>
              <p className='text-sm leading-relaxed text-slate-700 sm:text-base'>
                Clean stitch paths, perfect density, and smooth finishes — no
                thread breaks or machine issues.
              </p>
            </div>

            <div className='flex h-full flex-col rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg ring-1 ring-slate-200 transition hover:shadow-xl'>
              <div className='mb-3 flex items-start gap-4'>
                <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-pink-100'>
                  <span className='text-2xl'>⚡</span>
                </div>
                <h3 className='text-lg font-bold text-slate-900 sm:text-xl'>
                  Fast Turnaround
                </h3>
              </div>
              <p className='text-sm leading-relaxed text-slate-700 sm:text-base'>
                Most designs are delivered within 1–24 hours, even complex
                designs.
              </p>
            </div>

            <div className='flex h-full flex-col rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg ring-1 ring-slate-200 transition hover:shadow-xl'>
              <div className='mb-3 flex items-start gap-4'>
                <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100'>
                  <span className='text-2xl'>📁</span>
                </div>
                <h3 className='text-lg font-bold text-slate-900 sm:text-xl'>
                  Machine‑Ready Files
                </h3>
              </div>
              <p className='text-sm leading-relaxed text-slate-700 sm:text-base'>
                Delivered in formats compatible with DST, PES, JEF, EXP, VP3 and
                all major embroidery machines.
              </p>
            </div>

            <div className='flex h-full flex-col rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg ring-1 ring-slate-200 transition hover:shadow-xl'>
              <div className='mb-3 flex items-start gap-4'>
                <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100'>
                  <span className='text-2xl'>♾️</span>
                </div>
                <h3 className='text-lg font-bold text-slate-900 sm:text-xl'>
                  Unlimited Revisions
                </h3>
              </div>
              <p className='text-sm leading-relaxed text-slate-700 sm:text-base'>
                We revise until you're 100% satisfied — no extra cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className='bg-white'>
        {/* Our Digitizing Gallery */}
        <section className='bg-slate-50 py-12 lg:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <h2 className='text-center text-3xl font-extrabold text-slate-900 sm:text-3xl lg:text-3xl'>
              Our Digitizing Gallery
            </h2>
            <p className='mx-auto mt-4 max-w-3xl text-center text-base text-slate-600 sm:text-lg'>
              See real before‑and‑after examples of artwork converted into
              clean, machine‑ready embroidery designs.
            </p>

            <div className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {gallery.map((img, i) => (
                <div
                  key={i}
                  className='group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-md transition hover:shadow-xl'
                >
                  <Image
                    src={img}
                    alt={`Embroidery digitizing before and after example ${i + 1}`}
                    width={800}
                    height={500}
                    className='h-auto w-full object-cover transition group-hover:scale-105'
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FILE FORMATS */}
        <section className='bg-white py-12 lg:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <h2 className='text-center text-3xl font-extrabold text-slate-900 sm:text-3xl lg:text-3xl'>
              Embroidery Digitizing File Formats We Support
            </h2>
            <p className='mx-auto mt-4 max-w-3xl text-center text-base text-slate-600 sm:text-lg'>
              Our embroidery digitizing service supports all major embroidery
              machine formats, ensuring full compatibility with your equipment.
            </p>

            <ul className='mx-auto mt-8 max-w-2xl space-y-3 text-base text-slate-800 sm:text-lg lg:text-xl'>
              <li className='gap-3'>
                <span className='text-2xl'>✓</span>
                <span className='font-semibold'>DST (Tajima)</span>
              </li>
              <li className='gap-3'>
                <span className='text-2xl'>✓</span>
                <span className='font-semibold'>PES (Brother / Babylock)</span>
              </li>
              <li className='gap-3'>
                <span className='text-2xl'>✓</span>
                <span className='font-semibold'>JEF (Janome)</span>
              </li>
              <li className='gap-3'>
                <span className='text-2xl'>✓</span>
                <span className='font-semibold'>EXP (Melco / Bernina)</span>
              </li>
              <li className='gap-3'>
                <span className='text-2xl'>✓</span>
                <span className='font-semibold'>VP3 (Husqvarna Viking)</span>
              </li>
              <li className='gap-3'>
                <span className='text-2xl'>✓</span>
                <span className='font-semibold'>XXX (Singer)</span>
              </li>
              <li className='gap-3'>
                <span className='text-2xl'>✓</span>
                <span className='font-semibold'>
                  HUS, CND, PDF (stitch preview)
                </span>
              </li>
            </ul>

            <p className='mx-auto mt-6 max-w-3xl text-center text-sm text-slate-600 sm:text-base'>
              Need a specific format? Just mention it in your order. If you're
              unsure which format you need, our team will select the correct
              file type for your machine.
            </p>
          </div>
        </section>

        {/* CUSTOM ORDER FORM */}
        <section
          id='order-form'
          className='bg-gradient-to-b from-slate-50 to-white py-12 lg:py-16'
        >
          <div className='mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-extrabold text-slate-900 sm:text-3xl lg:text-3xl'>
              Custom Order Form
            </h2>
            <p className='mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg'>
              Upload your logo or artwork to get started with our custom
              embroidery digitizing service.
            </p>
          </div>

          <div className='mx-auto mt-10 max-w-5xl px-4 sm:px-6 lg:px-8'>
            <CustomOrderForm orderForm='order-form' />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className='bg-white py-12 lg:py-16'>
          <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-3xl'>
              How Our Embroidery Digitizing Service Works
            </h2>
            <p className='mt-4 max-w-4xl text-base text-slate-600 sm:text-lg lg:text-xl'>
              Getting your custom embroidery digitizing done is quick and
              simple. Follow these easy steps to receive machine‑ready
              embroidery files with guaranteed quality.
            </p>

            <ol className='mt-10 space-y-8 text-base text-slate-800 sm:text-lg'>
              <li className='flex gap-4'>
                <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-black text-lg font-bold text-white'>
                  1
                </span>
                <div>
                  <h3 className='text-xl font-bold text-slate-900 sm:text-2xl'>
                    Upload Your Design
                  </h3>
                  <p className='mt-2'>
                    Upload your logo, artwork, or design in JPG, PNG, PDF, AI,
                    EPS, or even a hand‑drawn sketch. We accept all common file
                    types for embroidery digitizing.
                  </p>
                </div>
              </li>

              <li className='flex gap-4'>
                <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-black text-lg font-bold text-white'>
                  2
                </span>
                <div>
                  <h3 className='text-xl font-bold text-slate-900 sm:text-2xl'>
                    Submit Your Requirements
                  </h3>
                  <p className='mt-2'>
                    Fill out the order form with your embroidery details,
                    including design size, fabric type, placement (cap, shirt,
                    jacket, etc.), and required file format.
                  </p>
                </div>
              </li>

              <li className='flex gap-4'>
                <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-black text-lg font-bold text-white'>
                  3
                </span>
                <div>
                  <h3 className='text-xl font-bold text-slate-900 sm:text-2xl'>
                    Expert Embroidery Digitizing
                  </h3>
                  <p className='mt-2'>
                    Our professional digitizer manually converts your design
                    into a high‑quality embroidery digitizing file, optimized
                    for smooth stitching and machine performance.
                  </p>
                </div>
              </li>

              <li className='flex gap-4'>
                <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-black text-lg font-bold text-white'>
                  4
                </span>
                <div>
                  <h3 className='text-xl font-bold text-slate-900 sm:text-2xl'>
                    Quality Assurance Check
                  </h3>
                  <p className='mt-2'>
                    Every embroidery file goes through a strict QA review to
                    ensure clean stitch paths, correct density, and flawless
                    results on embroidery machines.
                  </p>
                </div>
              </li>

              <li className='flex gap-4'>
                <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-black text-lg font-bold text-white'>
                  5
                </span>
                <div>
                  <h3 className='text-xl font-bold text-slate-900 sm:text-2xl'>
                    Fast Delivery
                  </h3>
                  <p className='mt-2'>
                    Your machine‑ready embroidery file is delivered via email
                    within 4–8 hours, ready to stitch with confidence.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* WHO THIS IS FOR */}
        <section className='bg-slate-50 py-12 lg:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-extrabold text-slate-900 sm:text-3xl lg:text-3xl'>
              Who This Embroidery Digitizing Service Is For
            </h2>

            <p className='mt-4 max-w-3xl text-base text-slate-600 sm:text-lg lg:text-xl'>
              Our professional embroidery digitizing service is ideal for:
            </p>

            <ul className='mt-6 flex flex-col gap-2'>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-black'></span>
                Embroidery businesses & shops
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-black'></span>
                Clothing brands & manufacturers
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-black'></span>
                Promotional product companies
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-black'></span>
                Etsy & online sellers
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-black'></span>
                Fashion designers
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-black'></span>
                DIY embroidery enthusiasts
              </li>
            </ul>

            <p className='mt-4 max-w-3xl text-base text-slate-600 sm:text-lg lg:text-xl'>
              Whether you need one design or bulk digitizing, we’ve got you
              covered.
            </p>

            <h3 className='mt-12 text-2xl font-extrabold text-slate-900 sm:text-3xl'>
              What You'll Receive
            </h3>

            <ul className='mt-6 flex flex-col gap-4'>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                Machine‑ready embroidery files
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                Commercial‑use rights
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                Clean underlay & smooth stitching
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                Unlimited revisions
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                100% satisfaction guarantee
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                Fast email delivery
              </li>
            </ul>

            <p className='mt-6 text-sm text-slate-600 sm:text-base'>
              <span className='font-bold'>Note:</span> If a digitizing service
              for any other machine is required and not mentioned in the list,
              please include the embroidery machine name during your order.
            </p>
          </div>
        </section>

        {/* WHY TRUST EMBROIDIZE */}
        <section className='bg-white py-12 lg:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-extrabold text-slate-900 sm:text-3xl lg:text-3xl'>
              Why Customers Trust Embroidize
            </h2>

            <ul className='mt-6 flex flex-col gap-4'>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                100% manual embroidery digitizing
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                Experienced professional digitizers
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                Commercial embroidery use allowed
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                Secure file & design handling
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                Fast turnaround options
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                Unlimited revisions policy
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='text-2xl'>✓</span>
                Trusted by global embroidery businesses
              </li>
            </ul>

            <h3 className='mt-12 text-2xl font-extrabold text-slate-900 sm:text-3xl'>
              Simple 5‑Step Process
            </h3>

            <div className='mt-6 overflow-x-auto'>
              <table className='min-w-full border-2 border-slate-300 text-left text-sm text-slate-800 sm:text-base'>
                <thead className='bg-slate-100'>
                  <tr>
                    <th className='border-2 border-slate-300 px-4 py-3 font-bold'>
                      Step 01
                    </th>
                    <th className='border-2 border-slate-300 px-4 py-3 font-bold'>
                      Step 02
                    </th>
                    <th className='border-2 border-slate-300 px-4 py-3 font-bold'>
                      Step 03
                    </th>
                    <th className='border-2 border-slate-300 px-4 py-3 font-bold'>
                      Step 04
                    </th>
                    <th className='border-2 border-slate-300 px-4 py-3 font-bold'>
                      Step 05
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border-2 border-slate-300 px-4 py-3 font-medium'>
                      Upload Design
                    </td>
                    <td className='border-2 border-slate-300 px-4 py-3 font-medium'>
                      Provide Order Details
                    </td>
                    <td className='border-2 border-slate-300 px-4 py-3 font-medium'>
                      Manual Digitizing
                    </td>
                    <td className='border-2 border-slate-300 px-4 py-3 font-medium'>
                      Quality Check
                    </td>
                    <td className='border-2 border-slate-300 px-4 py-3 font-medium'>
                      File Delivery
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className='bg-slate-50 py-12 lg:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <h2 className='text-3xl font-extrabold text-slate-900 sm:text-3xl lg:text-3xl'>
                What Our Clients Say
              </h2>
              <p className='mx-auto mt-4 max-w-3xl text-base text-slate-600 sm:text-lg'>
                Trusted by embroidery shop owners and independent designers
                worldwide for premium digitizing.
              </p>
            </div>

            <div className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              <Testimonial
                quote='The digitizing quality is exceptional. Even the most intricate small details in our floral designs come out perfectly on the first run.'
                author='Sarah Jenkins'
                role='Boutique Shop Owner'
              />
              <Testimonial
                quote='Incredible turnaround time. I uploaded a custom logo at night and had a production‑ready file in my inbox by morning. Highly recommend.'
                author='Michael Chen'
                role='Custom Apparel Designer'
              />
              <Testimonial
                quote="I've used many digitizing services, but Embroidize's attention to stitch density and pathing is unmatched. No thread breaks at all."
                author='Elena Rodriguez'
                role='Industrial Embroidery Lab'
              />
              <Testimonial
                quote="The 'before and after' comparisons on their site are exactly what you get. They know how to translate complex gradients into stitches."
                author='David Thompson'
                role='Freelance Graphic Artist'
              />
              <Testimonial
                quote='Their customer support is fantastic. They helped me adjust a file for a specific fabric type without any extra hassle.'
                author='Amanda Foster'
                role='Home Decor Specialist'
              />
              <Testimonial
                quote='Finally a service that understands commercial embroidery standards. Files are clean, efficient, and ready for high‑volume production.'
                author='Robert Miller'
                role='Textile Manufacturer'
              />
            </div>
          </div>
        </section>

        {/* TYPES OF DIGITIZING */}
        <section className='bg-white py-12 lg:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-extrabold text-slate-900 sm:text-3xl lg:text-3xl'>
              Types of Embroidery Digitizing We Offer
            </h2>
            <p className='mt-4 max-w-4xl text-base text-slate-600 sm:text-lg lg:text-xl'>
              We provide a full range of custom embroidery digitizing services
              tailored to different applications and garment types.
            </p>

            <ul className='mt-8 flex flex-col gap-4'>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-black'></span>
                Logo Embroidery Digitizing
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-black'></span>
                Cap & Hat Embroidery Digitizing
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-black'></span>
                3D Puff Embroidery Digitizing
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-black'></span>
                Left Chest Embroidery Digitizing
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-black'></span>
                Jacket Back Embroidery Digitizing
              </li>
              <li className='flex items-center gap-3 text-base font-semibold text-slate-800 sm:text-lg'>
                <span className='flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-black'></span>
                Applique Embroidery Digitizing
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className='bg-slate-50 py-12 lg:py-16'>
          <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-extrabold text-slate-900 sm:text-3xl lg:text-3xl'>
              Frequently Asked Questions
            </h2>

            <div className='mt-10 space-y-8'>
              <div>
                <h3 className='text-xl font-bold text-slate-900 sm:text-2xl'>
                  How much does embroidery digitizing cost?
                </h3>
                <p className='mt-2 text-base text-slate-700 sm:text-lg'>
                  Embroidery digitizing prices start at $5, depending on size
                  and complexity.
                </p>
              </div>

              <div>
                <h3 className='text-xl font-bold text-slate-900 sm:text-2xl'>
                  How fast is your embroidery digitizing service?
                </h3>
                <p className='mt-2 text-base text-slate-700 sm:text-lg'>
                  We offer 1‑hour express delivery, with standard turnaround
                  within 12–24 hours.
                </p>
              </div>

              <div>
                <h3 className='text-xl font-bold text-slate-900 sm:text-2xl'>
                  Do you manually digitize designs?
                </h3>
                <p className='mt-2 text-base text-slate-700 sm:text-lg'>
                  Yes. Every design is 100% manually digitized for the best
                  embroidery quality.
                </p>
              </div>

              <div>
                <h3 className='text-xl font-bold text-slate-900 sm:text-2xl'>
                  What embroidery machines do you support?
                </h3>
                <p className='mt-2 text-base text-slate-700 sm:text-lg'>
                  Our files work with Brother, Tajima, Barudan, Ricoma, Janome,
                  Melco, SWF, Happy, Bernina, and more.
                </p>
              </div>

              <div>
                <h3 className='text-xl font-bold text-slate-900 sm:text-2xl'>
                  Can I use the digitized files commercially?
                </h3>
                <p className='mt-2 text-base text-slate-700 sm:text-lg'>
                  Absolutely. All files include full commercial usage rights.
                </p>
              </div>

              <div>
                <h3 className='text-xl font-bold text-slate-900 sm:text-2xl'>
                  Do you offer revisions?
                </h3>
                <p className='mt-2 text-base text-slate-700 sm:text-lg'>
                  Yes — unlimited revisions until you are fully satisfied.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className='mt-12 rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-lg'>
              <h3 className='text-2xl font-extrabold text-slate-900 sm:text-3xl'>
                Start Your Custom Embroidery Digitizing Order Today
              </h3>
              <p className='mt-3 max-w-2xl text-base text-slate-700 sm:text-lg'>
                Get professional‑quality embroidery digitizing starting at just
                $5, with fast turnaround and unlimited revisions.
              </p>
              <p className='mt-3 text-base text-slate-700 sm:text-lg'>
                👉 Upload your design now and get started with Embroidize.
              </p>

              <div className='mt-6'>
                <Link
                  href='#order-form'
                  className='inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-base font-bold text-white shadow-xl transition hover:bg-slate-800 active:scale-95 sm:text-lg'
                >
                  Start Your Custom Order
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

/* Testimonial Component */
function Testimonial({ quote, author, role }) {
  return (
    <figure className='rounded-xl border-2 border-slate-200 bg-white p-6 shadow-md transition hover:shadow-lg'>
      <blockquote className='text-base text-slate-800 sm:text-lg'>
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className='mt-4 text-sm font-semibold text-slate-600 sm:text-base'>
        — {author}, <span className='font-normal'>{role}</span>
      </figcaption>
    </figure>
  );
}
