// Pulls the structured bits the product page shows as a table/chips out of the
// free-text (markdown) description, so nothing new has to be entered per
// design. Pure and synchronous — runs once on the server render.
//
// Sizes look like (dash/quote/× variants tolerated):
//   3.51" x 2.93" (89.2 x 74.4 mm) – 28,668 stitches
// Formats look like:
//   ## Included File Formats\nDST, EXP, HUS, JEF, PES, VP3, XXX, SEW
//   Formats: DST, PES, JEF

const NUM = '(\\d{1,3}(?:\\.\\d+)?)';
const INCH = `(?:\\s*(?:"|”|″|''|in(?:ch(?:es)?)?\\b))?`;
const TIMES = '\\s*[x×X*]\\s*';

const SIZE_RE = new RegExp(
  `${NUM}${INCH}${TIMES}${NUM}${INCH}` + // 3.51" x 2.93"
    `(?:\\s*\\(?\\s*${NUM}${TIMES}${NUM}\\s*mm\\s*\\)?)?` + // (89.2 x 74.4 mm)
    `(?:[^\\d\\n]{0,12}?([\\d][\\d,. ]*\\d|\\d)\\s*stitch(?:es)?)?`, // – 28,668 stitches
  'i',
);

const toNum = (s) => (s == null ? null : Number(String(s).replace(/[, ]/g, '')));

// Strip markdown/HTML so the regexes see plain lines.
const plainLines = (text) =>
  String(text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|div|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .split(/\r?\n/)
    .map((l) =>
      l
        .replace(/^\s*(?:[-*+•]|\d+[.)])\s+/, '') // list bullets
        .replace(/^#+\s*/, '') // headings
        .replace(/[*_`]/g, '') // emphasis
        .trim(),
    );

export function parseSizes(description) {
  const seen = new Set();
  const sizes = [];
  for (const line of plainLines(description)) {
    // A size line mentions mm or stitches or inch marks — this keeps random
    // "2 x 3" phrases in prose from becoming rows.
    if (!/mm|stitch|"|”|″|inch/i.test(line)) continue;
    const m = line.match(SIZE_RE);
    if (!m) continue;
    const wIn = toNum(m[1]);
    const hIn = toNum(m[2]);
    if (!(wIn > 0 && hIn > 0) || wIn > 60 || hIn > 60) continue;
    const wMm = m[3] ? toNum(m[3]) : Math.round(wIn * 25.4 * 10) / 10;
    const hMm = m[4] ? toNum(m[4]) : Math.round(hIn * 25.4 * 10) / 10;
    const stitches = m[5] ? toNum(m[5]) : null;
    const key = `${wIn}x${hIn}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sizes.push({
      widthIn: wIn,
      heightIn: hIn,
      widthMm: wMm,
      heightMm: hMm,
      stitches: Number.isFinite(stitches) ? stitches : null,
    });
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
