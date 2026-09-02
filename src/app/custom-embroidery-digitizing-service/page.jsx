import CustomOrderForm from '@/components/Common/CustomOrderForm';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getCustomOrderReviews } from '@/lib/apis/public/customOrderReviews';
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
        'https://embroidize.com/custom-embroidery-digitizing-service',
    },
    openGraph: {
      title: 'Custom Embroidery Digitizing Service | Starting at $5',
      description:
        'Upload your logo or artwork and receive machine-ready embroidery files with fast turnaround and unlimited revisions.',
      url: 'https://embroidize.com/custom-embroidery-digitizing-service',
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

/* ── Content data ─────────────────────────────────────────────── */

const whoFor = [
  { icon: '🏪', title: 'Embroidery Business Owners & Print Shops', text: 'You take on client orders and need clean, reliable stitch files delivered fast — production-ready from the first run, no guesswork, no re-stitching.' },
  { icon: '👔', title: 'Apparel & Uniform Companies', text: 'Corporate uniforms, sports kits, and workwear requiring consistent, repeatable embroidery with perfect consistency across every garment.' },
  { icon: '🎁', title: 'Promotional Products Suppliers', text: 'Branded caps, bags, towels, and accessories requiring embroidery that accurately represents client brands with color matching and product-type optimization.' },
  { icon: '✨', title: 'Fashion & Clothing Brands', text: 'Embroidered branding and design details on woven fabrics, denim, knitwear, and specialty materials with stitch density guidance.' },
  { icon: '🏢', title: 'Small Business Owners', text: 'Putting your logo on workwear, merchandise, or branded gifts? Upload your logo, tell us your machine and garment, and we handle everything.' },
  { icon: '🧵', title: 'Home Embroiderers & Hobbyists', text: 'Convert designs into exact file formats for Brother, Janome, Babylock, or Husqvarna machines — PES, JEF, VP3, HUS — optimized for perfect stitching at your desired size.' },
  { icon: '⚽', title: 'Sports Teams & Clubs', text: 'Jerseys, caps, and kit bags with clean digitized crests and team logos — handling multi-color crests, gradient-to-solid conversions, and small-scale text.' },
  { icon: '🚀', title: 'Startups & Event Organizers', text: 'Need branded merchandise for a launch, conference, or team event? We turn your logo into a production-ready embroidery file quickly so you can order without delays.' },
];

const receive = [
  { icon: '📁', title: 'Your Embroidery Stitch File', text: 'Machine-ready file in your chosen format (DST, PES, JEF, VP3, HUS, EMB, EXP, XXX, or others), optimized for your specific machine type and fabric.' },
  { icon: '🖼️', title: 'Digital Preview Image', text: 'A rendered preview showing how the stitching will look — stitch direction, color placement, and density — before you load it onto your machine.' },
  { icon: '🎨', title: 'Thread Color Breakdown', text: 'A full list of thread colors by stop number. If you provided a specific thread brand — Madeira, Isacord, Robison-Anton — we include the exact color codes.' },
  { icon: '📊', title: 'Stitch Count & Technical Summary', text: 'Total stitch count, color stops, and approximate stitching time for estimating production time and thread consumption.' },
  { icon: '🔄', title: 'Free Unlimited Revisions', text: 'Size, colors, stitch density, design elements — revisions are completely free and unlimited. We don’t mark a job complete until the file runs exactly as you expect.' },
  { icon: '📧', title: 'Fast Email Delivery', text: 'Everything delivered directly to your inbox within 1–24 hours depending on design complexity. No account login required to receive your files.' },
];

const galleryTabs = ['All', 'Cap / Hat', 'Polo & Shirt', 'Crests & Patches', 'Text & Monograms', '3D Puff', 'Appliqué'];
const gallery = [
  '/images/gallery1.png',
  '/images/gallery2.png',
  '/images/gallery3.png',
  '/images/gallery4.png',
  '/images/gallery5.png',
  '/images/gallery6.png',
];

const formats = [
  { ext: '.DST', machines: 'Tajima, most commercial machines' },
  { ext: '.PES', machines: 'Brother, Babylock' },
  { ext: '.JEF', machines: 'Janome' },
  { ext: '.VP3', machines: 'Husqvarna Viking, Pfaff' },
  { ext: '.HUS', machines: 'Husqvarna' },
  { ext: '.EMB', machines: 'Wilcom (native format)' },
  { ext: '.EXP', machines: 'Melco, Bernina' },
  { ext: '.XXX', machines: 'Singer' },
  { ext: '.SEW', machines: 'Janome (older models)' },
  { ext: '.OFM', machines: 'Barudan' },
];

const digitizingTypes = [
  { title: 'Logo Embroidery Digitizing', text: 'We convert logos of any complexity into clean, stitch-perfect files — including small text, fine lines, and gradient-to-solid color conversions.' },
  { title: 'Hat & Cap Embroidery Digitizing', text: 'Cap digitizing requires special handling due to the curved surface and small stitching area. We optimize stitch direction and density specifically for caps to prevent fabric distortion.' },
  { title: 'Patch Embroidery Digitizing', text: 'We digitize patches with clean border stitching (merrow e-stitch or satin border), fill optimization, and proper underlay for stand-alone patch production.' },
  { title: '3D Puff Embroidery Digitizing', text: '3D puff requires foam underlayment and modified satin stitching. We account for puff thickness, angle, and fabric type to deliver raised embroidery that stays crisp.' },
  { title: 'Appliqué Digitizing', text: 'We create multi-step appliqué files with tack-down placement stitches, a fabric trim stop, and cover stitching — structured for single or multi-head machines.' },
  { title: 'Text & Monogram Digitizing', text: 'Custom lettering, monograms, and fonts — even at very small sizes (down to 4mm letter height) — are manually digitized with the correct stitch path and density for legibility.' },
];

const howToOrder = [
  { title: 'Upload Your Design', text: 'Send us your artwork in any format: JPG, PNG, PDF, AI, EPS, CDR, or even a photo. The higher the resolution, the better — but we work with what you have.' },
  { title: 'Tell Us Your Requirements', text: 'Let us know: finished embroidery size, fabric type (hat, polo, jacket, towel, bag), machine format, and any color preferences. Not sure? We’ll advise.' },
  { title: 'We Digitize Manually', text: 'Our experienced digitizers convert your design by hand — setting stitch types, density, underlay, sequence, and tie-offs for clean, efficient machine running.' },
  { title: 'You Receive Your File', text: 'Delivery in 1–24 hours to your email. Includes a digital preview image, thread color breakdown, and stitch count summary.' },
  { title: 'Revisions Until It’s Perfect', text: 'Need a size change, color swap, or stitch adjustment? Revisions are free and unlimited. We don’t stop until your file runs exactly as you want.' },
];

const pricing = [
  { type: 'Simple logo / text', price: '$5' },
  { type: 'Medium complexity', price: '$10–$15' },
  { type: 'Complex crest / patch', price: '$20–$30' },
  { type: '3D puff', price: '$15+' },
  { type: 'Appliqué', price: '$15+' },
  { type: 'Rush delivery (<2 hrs)', price: '+$5' },
];

const whyChoose = [
  { icon: '🖐️', title: '100% Human Digitizing', text: 'Every file is created by a real expert, not software. Auto-digitizing produces files that cause thread breaks, puckering, and poor stitch quality. Manual digitizing delivers dramatically better results.' },
  { icon: '⚡', title: '1–24 Hour Turnaround', text: 'Most standard designs are delivered within a few hours. Rush orders are welcome for urgent projects.' },
  { icon: '🏭', title: 'Trusted by 1,000+ Businesses', text: 'From small embroidery shops to promotional product companies, uniform suppliers, and fashion brands worldwide.' },
  { icon: '🔄', title: 'Unlimited Free Revisions', text: 'We don’t mark a job complete until the file performs perfectly on your machine. Revisions are always free.' },
  { icon: '🎯', title: 'Optimized for Your Machine & Fabric', text: 'Tell us your machine and your fabric. We optimize stitch angle, density, and underlay specifically for that combination.' },
  { icon: '🔒', title: 'Your Designs Stay Private', text: 'Your artwork is never shared, resold, or used for any other purpose. Complete confidentiality, always.' },
];

const faqs = [
  { q: 'What file formats do you deliver?', a: 'We deliver in any format your machine requires — DST, PES, JEF, VP3, HUS, EMB, EXP, XXX, and more. Just tell us your machine brand and we’ll provide the right format. Need multiple formats for the same design? We offer additional formats at a small extra charge.' },
  { q: 'How long does embroidery digitizing take?', a: 'Most standard designs are delivered within 1–24 hours. Simple logos and text often come back within 1–4 hours. Complex crests, detailed patches, or designs with many color changes may take up to 24 hours. Rush delivery is available if you need it faster.' },
  { q: 'How much does embroidery digitizing cost?', a: 'Pricing starts at $5 for simple designs. Simple logos and text are $5–$10. Medium complexity is $10–$20. Complex crests, patches, 3D puff, and appliqué start at $20. Revisions are always free.' },
  { q: 'What image formats can I send you?', a: 'We accept JPG, PNG, PDF, AI (Adobe Illustrator), EPS, CDR (CorelDRAW), SVG, and PSD. We can also work from a clear photo of a physical design.' },
  { q: 'Do you use auto-digitizing software?', a: 'No. Every design is digitized manually by a trained human digitizer. Auto-digitizing tools produce files that cause thread breaks, puckering, and poor small-text legibility. Manual digitizing delivers far better results on the machine.' },
  { q: 'What if I need revisions?', a: 'Revisions are free and unlimited. If the file needs resizing, color adjustments, density changes, or any other tweak — just ask. We revise until the file is exactly right.' },
  { q: 'Can you digitize designs for caps and hats?', a: 'Yes. Hat and cap embroidery requires specialized digitizing because of the curved surface and compressed stitch area. We optimize specifically for cap frames to prevent distortion on the finished garment.' },
  { q: 'Do you offer 3D puff embroidery digitizing?', a: 'Yes. 3D puff requires specific satin stitch angles and foam compensation. Our digitizers are experienced with puff work for caps, bags, and apparel.' },
  { q: 'Can you match specific Pantone or thread colors?', a: 'Yes. Provide your thread brand and color codes — Madeira, Isacord, Robison-Anton, etc. — and we’ll assign the correct color numbers in your file.' },
  { q: 'Is my design kept confidential?', a: 'Yes. Your artwork and files are kept strictly private and are never shared, resold, or used for any other purpose.' },
  { q: 'Can you re-digitize an existing embroidery file?', a: 'Yes. If you have an old file that runs poorly — causing thread breaks, puckering, or loss of detail — we can re-digitize from your original artwork and produce a clean replacement file.' },
  { q: 'What is the minimum text size you can digitize?', a: 'We can digitize text down to approximately 4mm letter height depending on the font style. Below that threshold, most machine stitching loses legibility regardless of digitizing quality.' },
];

/* ── JSON-LD structured data ──────────────────────────────────── */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Custom Embroidery Digitizing Service',
      serviceType: 'Embroidery digitizing',
      description:
        'Professional, 100% manual custom embroidery digitizing. Machine-ready DST, PES, JEF, VP3 and more, delivered within 1–24 hours with unlimited free revisions.',
      provider: { '@type': 'Organization', name: 'Embroidize', url: 'https://embroidize.com' },
      areaServed: 'Worldwide',
      offers: { '@type': 'Offer', price: '5', priceCurrency: 'USD', url: 'https://embroidize.com/custom-embroidery-digitizing-service' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

/* ── Reusable bits ────────────────────────────────────────────── */
const SectionTitle = ({ children, sub }) => (
  <div className='text-center'>
    <h2 className='text-3xl font-extrabold tracking-tight text-slate-900'>{children}</h2>
    {sub && <p className='mx-auto mt-4 max-w-3xl text-base text-slate-600 sm:text-lg'>{sub}</p>}
  </div>
);

function Testimonial({ quote, author, role }) {
  return (
    <figure className='rounded-xl border-2 border-slate-200 bg-white p-6 shadow-md transition hover:shadow-lg'>
      <blockquote className='text-base text-slate-800 sm:text-lg'>&ldquo;{quote}&rdquo;</blockquote>
      <figcaption className='mt-4 text-sm font-semibold text-slate-600 sm:text-base'>
        — {author}, <span className='font-normal'>{role}</span>
      </figcaption>
    </figure>
  );
}

export default async function CustomEmbroideryOrderPage() {
  const orderReviews = await getCustomOrderReviews(15);
  return (
    <>
      <Header />

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      <section className='bg-gradient-to-b from-slate-50 to-white'>
        <div className='container mx-auto px-4 py-10 sm:px-6 lg:px-8'>
          <div className='grid items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
            <div className='text-center lg:text-left'>
              <p className='text-sm font-bold uppercase tracking-wider text-slate-600'>Professional</p>
              <h1 className='mt-3 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-4xl'>
                Custom Embroidery Digitizing Service
              </h1>
              <p className='mt-5 text-base font-semibold italic text-slate-800 sm:text-lg lg:text-xl'>
                Turn any logo, artwork, or design into a machine-ready embroidery file — starting at $5
                with 1–24 hour delivery for all embroidery machines.
              </p>
              <p className='mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg lg:mx-0'>
                Upload designs for professional digitization by expert digitizers — never auto-software.
                We deliver DST, PES, JEF, VP3, and all major formats with fast turnaround, unlimited free
                revisions, and quality checks. Serving embroidery businesses, print shops, uniform
                companies, and home embroiderers.
              </p>
              <div className='mt-8 space-y-3'>
                <Link href='#order-form' className='inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-4 text-sm font-bold text-white shadow-xl transition hover:bg-slate-800 active:scale-95 sm:w-auto sm:px-10 sm:text-lg'>
                  Start Custom Embroidery Order
                </Link>
                <p className='text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm'>
                  Trusted by 1,000+ businesses • 100% Satisfaction Guarantee • Unlimited Free Revisions
                </p>
              </div>
            </div>
            <div className='relative flex justify-center lg:justify-end'>
              <div className='relative aspect-[4/3] w-full max-w-[400px] sm:max-w-[480px] lg:max-w-[520px]'>
                <Image
                  src='https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/custom-order-page-banner-image.png'
                  alt='Custom embroidery digitizing before and after comparison'
                  fill
                  sizes='(min-width: 1024px) 520px, (min-width: 640px) 480px, 100vw'
                  className='object-contain drop-shadow-2xl'
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className='bg-white'>
        {/* ── WHAT IS DIGITIZING ── */}
        <section className='bg-white py-12 lg:py-16'>
          <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center'>
            <SectionTitle>What Is Embroidery Digitizing?</SectionTitle>
            <p className='mt-6 text-base leading-relaxed text-slate-700 sm:text-lg'>
              Embroidery digitizing converts images, logos, or artwork into stitch files that machines can
              execute. Unlike printing, machines follow precise instructions for stitch placement, type
              (satin, fill, running), thread colors, and operation sequence. Poor digitizing causes thread
              breaks, puckering, and misalignment. Professional digitizing ensures clean stitching whether
              you produce one piece or 10,000 units.
            </p>
            <p className='mt-4 text-base font-semibold text-slate-900 sm:text-lg'>
              All files are manually digitized — never auto-traced.
            </p>
          </div>
        </section>

        {/* ── WHO THIS IS FOR ── */}
        <section className='bg-slate-50 py-12 lg:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <SectionTitle>Who This Service Is For</SectionTitle>
            <div className='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
              {whoFor.map((c) => (
                <div key={c.title} className='flex h-full flex-col rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200 transition hover:shadow-xl'>
                  <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl'>{c.icon}</div>
                  <h3 className='text-base font-bold text-slate-900'>{c.title}</h3>
                  <p className='mt-2 text-sm leading-relaxed text-slate-600'>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT YOU'LL RECEIVE ── */}
        <section className='bg-white py-12 lg:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <SectionTitle>What You&rsquo;ll Receive With Every Order</SectionTitle>
            <div className='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {receive.map((c) => (
                <div key={c.title} className='flex h-full flex-col rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-md ring-1 ring-slate-200'>
                  <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl'>{c.icon}</div>
                  <h3 className='text-lg font-bold text-slate-900'>{c.title}</h3>
                  <p className='mt-2 text-sm leading-relaxed text-slate-600 sm:text-base'>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GALLERY ── */}
        <section className='bg-slate-50 py-12 lg:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <SectionTitle sub='Every design started as a flat image (JPG logo, PNG crest, PDF artwork) and was converted into a machine-ready stitch file by our digitizers. What you see is the actual digital preview from the stitch data — not a simulation.'>
              Digitizing Gallery
            </SectionTitle>

            <div className='mt-8 flex flex-wrap justify-center gap-2'>
              {galleryTabs.map((t, i) => (
                <span key={t} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${i === 0 ? 'bg-black text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>
                  {t}
                </span>
              ))}
            </div>

            <div className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {gallery.map((img, i) => (
                <div key={i} className='group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-md transition hover:shadow-xl'>
                  <Image src={img} alt={`Embroidery digitizing before and after example ${i + 1}`} width={800} height={500} className='h-auto w-full object-cover transition group-hover:scale-105' />
                </div>
              ))}
            </div>

            <p className='mx-auto mt-8 max-w-2xl text-center text-sm text-slate-600'>
              Want to see your specific design type?{' '}
              <Link href='/contact-us' className='font-semibold text-black underline'>Contact us</Link>{' '}
              and we&rsquo;ll share relevant samples before you order.
            </p>
          </div>
        </section>

        {/* ── FILE FORMATS ── */}
        <section className='bg-white py-12 lg:py-16'>
          <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
            <SectionTitle sub='We deliver in any machine-required format. Tell us your machine brand and model and we automatically provide the correct format.'>
              File Formats We Support
            </SectionTitle>
            <div className='mt-10 overflow-x-auto'>
              <table className='min-w-full overflow-hidden rounded-xl border border-slate-200 text-left text-sm text-slate-800 sm:text-base'>
                <thead className='bg-slate-100'>
                  <tr>
                    <th className='px-5 py-3 font-bold'>Format</th>
                    <th className='px-5 py-3 font-bold'>Compatible Machines</th>
                  </tr>
                </thead>
                <tbody>
                  {formats.map((f, i) => (
                    <tr key={f.ext} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                      <td className='px-5 py-3 font-bold'>{f.ext}</td>
                      <td className='px-5 py-3 text-slate-600'>{f.machines}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── DIGITIZING TYPES ── */}
        <section className='bg-slate-50 py-12 lg:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <SectionTitle>Types of Embroidery Digitizing We Specialize In</SectionTitle>
            <div className='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {digitizingTypes.map((t) => (
                <div key={t.title} className='rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200'>
                  <h3 className='text-lg font-bold text-slate-900'>{t.title}</h3>
                  <p className='mt-2 text-sm leading-relaxed text-slate-600 sm:text-base'>{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW TO ORDER ── */}
        <section className='bg-white py-12 lg:py-16'>
          <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
            <SectionTitle>How to Order — Simple 5-Step Process</SectionTitle>
            <ol className='mt-10 space-y-8'>
              {howToOrder.map((s, i) => (
                <li key={s.title} className='flex gap-4'>
                  <span className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-black text-base font-bold text-white'>{i + 1}</span>
                  <div>
                    <h3 className='text-xl font-bold text-slate-900'>{s.title}</h3>
                    <p className='mt-1 text-base text-slate-700'>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── ORDER FORM ── */}
        <section id='order-form' className='scroll-mt-24 bg-gradient-to-b from-slate-50 to-white py-12 lg:py-16'>
          <div className='mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8'>
            <SectionTitle sub='Fill in the form below and we&rsquo;ll deliver your machine-ready embroidery file within 1–24 hours.'>
              Submit Your Order
            </SectionTitle>
          </div>
          <div className='mt-10 px-4 sm:px-6 lg:px-8'>
            <CustomOrderForm />
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className='bg-white py-12 lg:py-16'>
          <div className='mx-auto max-w-3xl px-4 sm:px-6 lg:px-8'>
            <SectionTitle sub='Transparent, per-design pricing with no subscriptions and no hidden fees.'>
              Pricing
            </SectionTitle>
            <div className='mt-10 overflow-hidden rounded-2xl border border-slate-200 shadow-sm'>
              <table className='min-w-full text-left text-base text-slate-800'>
                <thead className='bg-black text-white'>
                  <tr>
                    <th className='px-6 py-4 font-bold'>Design Type</th>
                    <th className='px-6 py-4 text-right font-bold'>Starting Price</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((p, i) => (
                    <tr key={p.type} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                      <td className='px-6 py-4 font-medium'>{p.type}</td>
                      <td className='px-6 py-4 text-right font-bold'>{p.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className='mt-6 text-center text-sm text-slate-600'>
              All prices include: one file format · digital preview · thread color list · unlimited free
              revisions. Additional formats for the same design are available at a small extra charge. No
              subscriptions. No hidden fees. Pay per design.
            </p>
          </div>
        </section>

        {/* ── WHY CHOOSE ── */}
        <section className='bg-slate-50 py-12 lg:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <SectionTitle>Why Choose Embroidize?</SectionTitle>
            <div className='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {whyChoose.map((c) => (
                <div key={c.title} className='flex h-full flex-col rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200'>
                  <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl'>{c.icon}</div>
                  <h3 className='text-lg font-bold text-slate-900'>{c.title}</h3>
                  <p className='mt-2 text-sm leading-relaxed text-slate-600 sm:text-base'>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className='bg-white py-12 lg:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <SectionTitle sub='Trusted by embroidery shop owners and independent designers worldwide for premium digitizing.'>
              What Our Clients Say
            </SectionTitle>
            <div className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              <Testimonial quote='The digitizing quality is exceptional. Even the most intricate small details in our floral designs come out perfectly on the first run.' author='Sarah Jenkins' role='Boutique Shop Owner' />
              <Testimonial quote='Incredible turnaround time. I uploaded a custom logo at night and had a production-ready file in my inbox by morning. Highly recommend.' author='Michael Chen' role='Custom Apparel Designer' />
              <Testimonial quote="I've used many digitizing services, but Embroidize's attention to stitch density and pathing is unmatched. No thread breaks at all." author='Elena Rodriguez' role='Industrial Embroidery Lab' />
              <Testimonial quote="The 'before and after' comparisons on their site are exactly what you get. They know how to translate complex gradients into stitches." author='David Thompson' role='Freelance Graphic Artist' />
              <Testimonial quote='Their customer support is fantastic. They helped me adjust a file for a specific fabric type without any extra hassle.' author='Amanda Foster' role='Home Decor Specialist' />
              <Testimonial quote='Finally a service that understands commercial embroidery standards. Files are clean, efficient, and ready for high-volume production.' author='Robert Miller' role='Textile Manufacturer' />
            </div>
          </div>
        </section>

        {/* ── REAL CUSTOMER REVIEWS (latest 15) ── */}
        {orderReviews.length > 0 && (
          <section className='bg-slate-50 py-12 lg:py-16'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
              <SectionTitle sub='Verified reviews from customers who ordered custom digitizing.'>
                Recent Customer Reviews
              </SectionTitle>
              <div className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {orderReviews.map((r, i) => (
                  <figure
                    key={i}
                    className='rounded-xl border-2 border-slate-200 bg-white p-6 shadow-md'
                  >
                    <div className='flex items-center gap-0.5'>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <svg
                          key={n}
                          width={18}
                          height={18}
                          viewBox='0 0 24 24'
                          fill={n <= r.rating ? '#F59E0B' : '#E5E7EB'}
                        >
                          <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                        </svg>
                      ))}
                    </div>
                    {r.comment && (
                      <blockquote className='mt-3 text-base text-slate-800'>
                        &ldquo;{r.comment}&rdquo;
                      </blockquote>
                    )}
                    {r.image?.url && (
                      <img
                        src={r.image.url}
                        alt={`Photo shared by ${r.name || 'a customer'}`}
                        loading='lazy'
                        className='mt-3 max-h-48 w-auto rounded-lg border border-slate-200 object-cover'
                      />
                    )}
                    <figcaption className='mt-4 text-sm font-semibold text-slate-600'>
                      — {r.name || 'Verified customer'}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── READY CTA ── */}
        <section className='bg-slate-50 py-12 lg:py-16'>
          <div className='mx-auto max-w-3xl px-4 sm:px-6 lg:px-8'>
            <div className='rounded-2xl border-2 border-slate-200 bg-white p-8 text-center shadow-lg'>
              <h2 className='text-2xl font-extrabold text-slate-900 sm:text-3xl'>Ready to Get Started?</h2>
              <p className='mx-auto mt-3 max-w-2xl text-base text-slate-700 sm:text-lg'>
                Upload your design now and get a machine-ready embroidery file delivered to your inbox —
                starting at $5, with 1–24 hour turnaround and unlimited free revisions.
              </p>
              <div className='mt-6'>
                <Link href='#order-form' className='inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-base font-bold text-white shadow-xl transition hover:bg-slate-800 active:scale-95 sm:text-lg'>
                  Upload Your Design Now →
                </Link>
              </div>
              <p className='mt-4 text-sm text-slate-600'>
                Questions first?{' '}
                <Link href='/contact-us' className='font-semibold text-black underline'>Contact us</Link>{' '}
                — we respond within 1 hour.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className='bg-white py-12 lg:py-16'>
          <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
            <SectionTitle>Frequently Asked Questions</SectionTitle>
            <div className='mt-10 divide-y divide-slate-200'>
              {faqs.map((f) => (
                <details key={f.q} className='group py-5'>
                  <summary className='flex cursor-pointer list-none items-center justify-between text-lg font-bold text-slate-900'>
                    {f.q}
                    <span className='ml-4 text-slate-400 transition group-open:rotate-45'>＋</span>
                  </summary>
                  <p className='mt-3 text-base leading-relaxed text-slate-700'>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
