import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';

export default function AboutUsPage() {
  return (
    <>
      <Header />
      <main className='container mx-auto px-6 py-16 text-gray-800'>
        <div className='max-w-6xl mx-auto space-y-16'>
          {/* Intro */}
          <section className='text-center mt-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>
              About Embroidize
            </h1>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Where creativity meets convenience — your go-to hub for premium
              embroidery designs.
            </p>
          </section>

          {/* Mission Section */}
          <section className='grid md:grid-cols-2 gap-10 items-center p-8'>
            <div className='space-y-4'>
              <h2 className='text-2xl font-semibold text-gray-900'>
                Our Mission
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                At <strong>Embroidize</strong>, we believe embroidery should be
                accessible, fun, and inspiring. Whether you're a hobbyist or a
                professional crafter, our mission is to deliver beautifully
                crafted digital embroidery designs that help you bring your
                creative projects to life.
              </p>
              <p className='text-gray-700 leading-relaxed'>
                Our goal is to empower makers with the tools they need to
                express themselves through thread and color. We believe that
                creativity shouldn’t be limited by budget or access — that’s why
                we offer affordable and free downloads so anyone, anywhere, can
                start stitching their story.
              </p>
              <p className='text-gray-700 leading-relaxed'>
                Embroidery is a timeless craft, but we’re bringing it into the
                digital age. By offering downloadable designs compatible with
                modern embroidery machines, we help preserve the beauty of
                tradition while embracing the convenience of technology.
              </p>
              <p className='text-gray-700 leading-relaxed'>
                Embroidize is more than a design platform — it’s a growing
                community of creators who inspire and support one another. We
                listen to our users and evolve our collections based on your
                feedback and creative needs.
              </p>
            </div>
            <div>
              <img
                src='https://embroidize.com/og-banner.jpg'
                alt='Embroidery Designs'
                className='rounded-2xl shadow-2xl my-4'
              />
            </div>
          </section>

          {/* Free Downloads Section */}
          <section className='bg-gray-50 p-8 space-y-4 my-4'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              Free Downloads with Fair Use
            </h2>
            <p className='text-gray-700 leading-relaxed'>
              We know how important it is to try before you commit — that’s why
              we let users download a limited number of designs for free every
              week. No hidden fees, no gimmicks. Just quality designs made for
              creators like you.
            </p>
            <p className='text-gray-700'>
              Our download limits help keep the platform sustainable while still
              empowering the community with accessible resources.
            </p>
          </section>

          {/* Why Choose Us Section */}
          <section className='space-y-4 p-8'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              Why Choose Embroidize?
            </h2>
            <ul className='list-disc pl-6 space-y-2 text-gray-700'>
              <li>🌟 Curated and original embroidery designs</li>
              <li>🎁 Free daily downloads — no strings attached</li>
              <li>📂 Easy-to-use formats for all major machines</li>
              <li>👩‍🎨 A platform built by creators, for creators</li>
              <li>🔐 Secure access and ethical use policies</li>
            </ul>
          </section>

          {/* Community Section */}
          <section className='bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl shadow-sm space-y-4'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              Join Our Creative Community
            </h2>
            <p className='text-gray-700 leading-relaxed'>
              Whether you're decorating a tote bag, personalizing gifts, or
              designing products for your small business, Embroidize is here to
              support your creative journey. We're constantly updating our
              collection with fresh designs and listening to what our users
              need.
            </p>
            <p className='text-gray-700'>
              Got feedback or design requests? We’d love to hear from you! Reach
              out at{' '}
              <a
                href='mailto:support@embroidize.com'
                className='text-blue-600 underline font-medium'
              >
                support@embroidize.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
