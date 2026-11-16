// The look of an offer's banners and pop-ups, set per offer in Admin → Offers &
// Campaigns → Look. Every placement paints with the same CSS variables, so one
// edit recolours the top bar, hero, cards, pop-ups and phone bar together.
//
// The colours are applied through the .o-* classes in globals.css, which use
// !important on purpose: placements sit inside pages (the design page, the
// download pop-up) whose own text colours would otherwise win and turn copy
// black-on-black.

export const DEFAULT_THEME = {
  bg: '#000000',
  bg2: '',
  text: '#FFFFFF',
  accent: '#E8C26A',
  buttonText: '#000000',
  imageUrl: '',
  overlay: 45,
};

export function themeOf(offer) {
  return { ...DEFAULT_THEME, ...(offer?.theme || {}) };
}

/** Inline style for a placement's outer box: the variables + its background. */
export function offerSurfaceStyle(offer, { image = true } = {}) {
  const t = themeOf(offer);
  const base = t.bg2 ? `linear-gradient(115deg, ${t.bg} 0%, ${t.bg2} 100%)` : t.bg;
  const shade = Math.min(90, Math.max(0, Number(t.overlay) || 0)) / 100;
  const background =
    image && t.imageUrl
      ? `linear-gradient(rgba(0,0,0,${shade}), rgba(0,0,0,${shade})), url("${t.imageUrl}") center / cover no-repeat, ${t.bg}`
      : base;
  return {
    '--o-bg': t.bg,
    '--o-fg': t.text,
    '--o-accent': t.accent,
    '--o-btn-fg': t.buttonText,
    background,
    color: t.text,
  };
}

/** Variables only — for things that sit outside the surface (e.g. a ring). */
export function offerVars(offer) {
  const t = themeOf(offer);
  return {
    '--o-bg': t.bg,
    '--o-fg': t.text,
    '--o-accent': t.accent,
    '--o-btn-fg': t.buttonText,
  };
}
