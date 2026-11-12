// Pulls the structured bits the product page shows as a table/chips out of the
// free-text (markdown) description, so nothing new has to be entered per
// design. Pure and synchronous — runs once on the server render.
//
// Sizes look like (dash/quote/× variants tolerated):
//   3.51" x 2.93" (89.2 x 74.4 mm) – 28,668 stitches
// Formats look like:
//   ## Included File Formats\nDST, EXP, HUS, JEF, PES, VP3, XXX, SEW
//   Formats: DST, PES, JEF

const toNum = (s) => (s == null ? null : Number(String(s).replace(/[, ]/g, '')));

// Stitch counts: "28,668", "28.668" and "28 668" are all twenty-eight thousand.
const stitchNum = (s) => {
  const t = String(s).trim();
  if (/^\d{1,3}(?:[., ]\d{3})+$/.test(t)) return Number(t.replace(/[., ]/g, ''));
  return toNum(t);
};

// Decimal comma ("89,2") → dot; thousands commas ("28,668") are left alone.
const decimalNum = (s) => Number(String(s).replace(/,(\d{1,2})$/, '.$1').replace(/,/g, ''));

const decodeEntities = (text) =>
  String(text || '')
    .replace(/&quot;|&#34;|&#x22;/gi, '"')
    .replace(/&rdquo;|&ldquo;|&#8221;|&#8220;/gi, '"')
    .replace(/&#8243;|&Prime;/gi, '″')
    .replace(/&times;|&#215;/gi, '×')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;|&#160;/g, ' ');

// Lines with a flag for "this line is a heading" so a section can be cut out.
// Handles markdown (#, **bold**), HTML (<h3>, <strong>, <li>, <br>) and tables.
const structuredLines = (text) =>
  decodeEntities(
    String(text || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<h[1-6][^>]*>/gi, '\n### ')
      .replace(/<\/(p|li|div|h\d|tr)>/gi, '\n')
      .replace(/<\/t[dh]>/gi, ' | ')
      .replace(/<[^>]+>/g, ' '),
  )
    .split(/\r?\n/)
    .map((raw) => {
      const trimmed = raw.trim();
      const isMdHeading = /^#{1,6}\s/.test(trimmed);
      const text = trimmed
        .replace(/^\s*(?:[-*+•]|\d+[.)])\s+/, '') // list bullets
        .replace(/^#+\s*/, '') // heading marks
        .replace(/[*_`]/g, '') // emphasis
        .replace(/\s+/g, ' ')
        .trim();
      // "**Sizes**" or "Sizes:" alone on a line also counts as a heading.
      const isBoldOnly = /^\*\*[^*]+\*\*:?$/.test(trimmed) || /^__[^_]+__:?$/.test(trimmed);
      const isLabel = /^[A-Za-z][A-Za-z '&/()-]{1,40}:$/.test(text);
      return { text, heading: isMdHeading || isBoldOnly || isLabel };
    })
    .filter((l) => l.text);

const plainLines = (text) => structuredLines(text).map((l) => l.text);

// "Sizes", "Size", "Available Sizes", "Design Sizes", "Sizes Included",
// "Size & Stitches", "Sizes:" … — optionally followed by inline content.
const SIZES_HEADING = /^(?:available |design |embroidery |hoop |included |finished )?sizes?\b(?:\s*(?:included|available|&\s*stitch(?:es)?(?: count)?|and stitch(?:es)?(?: count)?|\(.*?\)))?\s*:?\s*(.*)$/i;

/**
 * The lines under the "Sizes" heading, up to the next heading. Inline content
 * on the heading line itself ("Sizes: 3.5" x 2.9", 4.5" x 3.8"") is included.
 * Returns null when the description has no Sizes heading.
 */
function sizesSection(description) {
  const lines = structuredLines(description);
  const out = [];
  let inside = false;
  let found = false;
  for (const line of lines) {
    const m = line.text.match(SIZES_HEADING);
    const looksLikeHeading = line.heading || (m && m[1].trim() === '');
    if (m && (looksLikeHeading || /\d/.test(m[1]))) {
      inside = true;
      found = true;
      if (m[1].trim()) out.push(m[1].trim());
      continue;
    }
    if (inside && line.heading) break;
    // A short line with no numbers after the sizes ("File Formats") is the
    // next section's title written as plain text.
    if (inside && out.some((l) => /\d/.test(l)) && !/\d/.test(line.text) && line.text.length <= 40 && !/[.!?,]$/.test(line.text)) break;
    if (inside) out.push(line.text);
  }
  return found ? out : null;
}

// ── One line → one or more sizes ─────────────────────────────────────────────

const N = '(\\d+(?:[.,]\\d+)?)';
const UNIT = '(mm|cm|millimet(?:er|re)s?|centimet(?:er|re)s?|in(?:ch(?:es)?)?\\b|"|”|″|\'\'|\')?';
// 3.51" x 2.93" | 3.51 x 2.93 in | 89.2mm x 74.4mm | 4x4 | W 3.51 x H 2.93
const PAIR_RE = new RegExp(
  `(?:w(?:idth)?\\s*:?\\s*)?${N}\\s*${UNIT}\\s*(?:[x×X*]|by)\\s*(?:h(?:eight)?\\s*:?\\s*)?${N}\\s*${UNIT}(\\s*(?:hoop|frame)\\b)?`,
  'gi',
);
const STITCH_RE = /(?:(\d[\d,. ]*\d|\d)\s*(?:stitches|stitch|sts|st)\b)|(?:stitch(?:es)?(?:\s*count)?\s*[:=\-–—]?\s*(\d[\d,. ]*\d|\d))/gi;

const unitOf = (u1, u2) => {
  const u = String(u2 || u1 || '').toLowerCase();
  if (!u) return null;
  if (u.startsWith('mm') || u.startsWith('millim')) return 'mm';
  if (u.startsWith('cm') || u.startsWith('centim')) return 'cm';
  return 'in';
};

const round1 = (n) => Math.round(n * 10) / 10;
const round2 = (n) => Math.round(n * 100) / 100;

function parseSizeLine(line) {
  const pairs = [];
  for (const m of line.matchAll(PAIR_RE)) {
    if (m[5]) continue; // "4x4 hoop" names the hoop, not the design size
    const a = decimalNum(m[1]);
    const b = decimalNum(m[3]);
    if (!(a > 0 && b > 0)) continue;
    pairs.push({ a, b, unit: unitOf(m[2], m[4]) });
  }
  if (!pairs.length) return [];

  const hasMm = pairs.some((p) => p.unit === 'mm' || p.unit === 'cm');
  for (const p of pairs) {
    if (p.unit) continue;
    // Unitless: beside an explicit mm pair it is the inch pair; on its own,
    // embroidery sizes over 30 can only be millimetres.
    p.unit = hasMm ? 'in' : p.a > 30 || p.b > 30 ? 'mm' : 'in';
  }
  for (const p of pairs) {
    if (p.unit === 'cm') {
      p.unit = 'mm';
      p.a *= 10;
      p.b *= 10;
    }
  }

  const inches = pairs.filter((p) => p.unit === 'in');
  const mms = pairs.filter((p) => p.unit === 'mm');

  const stitches = [];
  for (const m of line.matchAll(STITCH_RE)) {
    const n = stitchNum(m[1] || m[2]);
    if (Number.isFinite(n) && n >= 50) stitches.push(n);
  }
  // Table rows ("| 3.51" x 2.93" | 89.2 x 74.4 mm | 28,668 |"): a big bare
  // number in its own cell is the stitch count.
  if (!stitches.length && line.includes('|')) {
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
    const last = cells[cells.length - 1];
    if (/^\d[\d,. ]*$/.test(last || '') && stitchNum(last) >= 500) stitches.push(stitchNum(last));
  }

  // Normal case: one size per line (inch pair and/or mm pair). When a line
  // lists several sizes ("3.5" x 2.9", 4.5" x 3.8""), they are zipped in order.
  const count = Math.max(inches.length, mms.length);
  const sizes = [];
  for (let i = 0; i < count; i += 1) {
    const inch = inches[i];
    const mm = mms[i];
    const widthIn = inch ? inch.a : round2(mm.a / 25.4);
    const heightIn = inch ? inch.b : round2(mm.b / 25.4);
    const widthMm = mm ? round1(mm.a) : round1(inch.a * 25.4);
    const heightMm = mm ? round1(mm.b) : round1(inch.b * 25.4);
    if (widthIn > 60 || heightIn > 60) continue;
    sizes.push({
      widthIn,
      heightIn,
      widthMm,
      heightMm,
      stitches:
        stitches.length === count
          ? stitches[i]
          : count === 1 && stitches.length
            ? stitches[0]
            : null,
    });
  }
  return sizes;
}

/**
 * Sizes for the table. Reads the section under the "Sizes" heading
 * (### Sizes, **Sizes**, Sizes:, <h3>Sizes</h3> …) and every size line in it,
 * whatever the format: inches and/or mm/cm, quotes or "in"/"inches", ×/x/by,
 * stitches before or after, tables, several sizes on one line. Descriptions
 * with no Sizes heading fall back to scanning lines that clearly are sizes.
 */
export function parseSizes(description) {
  const section = sizesSection(description);
  const lines =
    section ??
    plainLines(description).filter((l) => /mm|stitch|"|”|″|inch/i.test(l));

  const seen = new Set();
  const sizes = [];
  for (const line of lines) {
    for (const size of parseSizeLine(line)) {
      const key = `${size.widthIn}x${size.heightIn}`;
      if (seen.has(key)) continue;
      seen.add(key);
      sizes.push(size);
    }
  }
  return sizes;
}

const FORMAT_TOKEN = /^[A-Z0-9]{2,4}$/;

export function parseFormats(description) {
  const lines = plainLines(description);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const m = line.match(/\bformats?\b\s*(?:included)?\s*[:\-–—]?\s*(.*)$/i);
    if (!m) continue;
    // Either "Formats: DST, PES" on one line, or a heading followed by the list.
    const candidates = [m[1], lines[i + 1], lines[i + 2]].filter(Boolean);
    for (const candidate of candidates) {
      const tokens = candidate
        .split(/[,/|;·]|\s+and\s+|\s{2,}|\s(?=[A-Z0-9]{2,4}\b)/)
        .map((t) => t.replace(/^\./, '').trim().toUpperCase())
        .filter(Boolean);
      const formats = tokens.filter((t) => FORMAT_TOKEN.test(t));
      // Most of the line must be format codes, or it is prose ("all formats
      // work with most machines").
      if (formats.length >= 2 && formats.length >= tokens.length * 0.6) {
        return [...new Set(formats)];
      }
    }
  }
  return [];
}

/**
 * Formats shown on the page: the description's list when it has one,
 * otherwise the real files on the product. The download picker keeps using
 * the real files either way.
 */
export function displayFormats(description, availableFileTypes = []) {
  const fromText = parseFormats(description);
  if (fromText.length) return fromText;
  return [...new Set((availableFileTypes || []).map((t) => String(t).toUpperCase()))];
}

export const formatInches = (n) => `${Number(n).toFixed(2)}"`;
export const formatMm = (n) => Number(n).toFixed(1);
