// FAQ content for /subscriptions.
//
// Shared between the server page (which emits FAQPage JSON-LD for rich results,
// mirroring /free-machine-embroidery-designs) and the client page (which renders
// the accordion). The first answer quotes the live admin-managed free quota, so
// the list is built per request rather than frozen at module load.
export const buildSubscriptionFaqs = (freeLimit, freeWindow) => [
  {
    q: 'What do I get with a subscription that the free plan does not give me?',
    a: `The free plan lets you download ${freeLimit} designs per ${freeWindow} for personal use. A subscription raises that daily allowance, and every design you download comes with a commercial use licence, so you can sell what you stitch.`,
  },
  {
    q: 'Which embroidery file formats are included?',
    a: 'Every download is a single ZIP containing PES, DST, JEF, VP3, HUS, EXP, PCS, CND and XXX — covering all major home and commercial machine brands. The formats are the same on every plan, including the free one.',
  },
  {
    q: 'Can I use the designs on items I sell?',
    a: 'Yes, on any paid plan. Designs downloaded on a paid plan include a commercial use licence, so you can stitch and sell finished items on Etsy, at markets, in your own shop or for client orders with no extra licensing fee. The free plan is for personal use only.',
  },
  {
    q: 'Can I cancel at any time?',
    a: 'Yes. Cancelling stops the next renewal — it does not cut your access short. You keep full access until the end of the period you have already paid for, and after that your account simply returns to the free plan.',
  },
  {
    q: 'What happens to my designs if my plan ends?',
    a: 'Every file you have already downloaded is yours to keep and stays on your computer. Your account drops back to the free allowance, and you can subscribe again at any time to restore the higher limit.',
  },
  {
    q: 'Do I need a credit card to use the free plan?',
    a: `No. Creating an account takes under a minute and needs nothing but an email address. You can download ${freeLimit} designs per ${freeWindow} without entering any payment details at all.`,
  },
  {
    q: 'My card was declined. Is there another way to pay?',
    a: 'Yes. Cards get declined for all sorts of reasons that have nothing to do with you or your bank balance. Use the "Other payment methods" link on this page and we will take the payment another way and set your account up by hand, usually within a few hours.',
  },
];

// FAQPage structured data for rich results.
export const buildFaqJsonLd = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});
