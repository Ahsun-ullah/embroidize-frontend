'use client';

import { useSiteConfig } from '@/lib/providers/SiteConfigProvider';
import { usePathname } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// Site-wide WhatsApp click-to-chat button.
//
// Opens wa.me with the number and a pre-filled message the customer can edit or
// delete before sending. No API, no webhook: the conversation happens in
// WhatsApp, on the phone, like any other message.
//
// The number comes from admin config (Settings → WhatsApp), never from code or
// an env var — a support number changes, and it must be fixable without a
// deploy. An empty number renders NOTHING: a chat link pointing at a number
// nobody reads is worse than no link at all.
//
// Placement is bottom-LEFT on purpose. The right-hand corner is already taken
// by the Crisp chat bubble and the scroll-to-top control; a third button there
// would sit on top of one of them.
// ─────────────────────────────────────────────────────────────────────────────

export default function WhatsAppButton() {
  const pathname = usePathname();
  // Shared with the product cards' badge window — one config request per page
  // load rather than one per component. A config that cannot be read leaves the
  // number empty, and the button simply does not appear.
  const { whatsappNumber: number, whatsappMessage: message } = useSiteConfig();

  // The admin dashboard is not a customer surface — the owner does not need to
  // WhatsApp themselves from the Subscribers table.
  if (!number || pathname?.startsWith('/admin')) return null;

  const href = `https://wa.me/${number}${
    message ? `?text=${encodeURIComponent(message)}` : ''
  }`;

  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      aria-label='Message us on WhatsApp'
      title='Message us on WhatsApp'
      // WhatsApp green, not the site's grayscale. This is a third-party brand
      // mark, not decoration: people recognise it at a glance and tap it
      // without reading, which is the entire point of the button.
      className='group fixed bottom-4 left-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:bg-[#1DA851] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2'
    >
      {/* Remixicon is already loaded site-wide (see the root layout), so the
          official glyph costs nothing extra. */}
      <i className='ri-whatsapp-fill text-[32px] leading-none' aria-hidden='true' />
      {/* Label expands on hover on pointer devices; the icon alone carries it on
          a phone, where there is no hover and no room. */}
      <span className='pointer-events-none absolute left-16 hidden whitespace-nowrap rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 md:block'>
        Message us on WhatsApp
      </span>
    </a>
  );
}
