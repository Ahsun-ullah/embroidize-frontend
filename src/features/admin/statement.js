// Printable financial statement (admin-only), shared by the Custom Orders and
// Subscribers pages. Follows the receipt.js pattern: opens a clean print-ready
// document in a new window — the browser's "Save as PDF" is the download.
// Grayscale only, per brand.

const LOGO_URL =
  'https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/logo-black.png';
const SUPPORT_EMAIL = 'support@embroidize.com';

function money(n) {
  const v = Number(n) || 0;
  const abs = Math.abs(v).toFixed(2);
  return v < 0 ? `−$${abs}` : `$${abs}`;
}

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// config = {
//   title:       'Custom Orders Statement'
//   periodLabel: 'Jul 1, 2026 – Jul 15, 2026' | 'All time'
//   columns:     [{ key, label, align?: 'right' }]   (amount cells: key 'amount')
//   rows:        [{ ...columnKey: value }]           (amount as Number)
//   totals:      [{ label, value, strong?: true }]   (pre-formatted strings)
//   sections:    optional [{ heading, columns, rows }] extra tables (e.g. by channel)
// }
function statementHtml(config) {
  const { title, periodLabel, columns, rows, totals, sections = [] } = config;
  const generated = new Date().toLocaleString('en-US');

  const th = (cols) =>
    cols
      .map(
        (c) =>
          `<th class="${c.align === 'right' ? 'amt' : ''}">${esc(c.label)}</th>`,
      )
      .join('');

  const td = (cols, row) =>
    cols
      .map((c) => {
        const raw = row[c.key];
        const isAmount = c.key === 'amount' || c.format === 'money';
        const val = isAmount ? money(raw) : c.key === 'date' ? fmtDate(raw) : raw;
        const neg = isAmount && Number(raw) < 0 ? ' neg' : '';
        return `<td class="${c.align === 'right' ? 'amt' : ''}${neg}">${esc(val)}</td>`;
      })
      .join('');

  const table = (cols, tableRows) => `
    <table>
      <thead><tr>${th(cols)}</tr></thead>
      <tbody>
        ${
          tableRows.length
            ? tableRows.map((r) => `<tr>${td(cols, r)}</tr>`).join('')
            : `<tr><td colspan="${cols.length}" class="empty">No transactions in this period.</td></tr>`
        }
      </tbody>
    </table>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} — ${esc(periodLabel)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; background: #f4f4f5; }
  .sheet { max-width: 860px; margin: 24px auto; background: #fff; padding: 40px; border: 1px solid #e5e5e5; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 16px; }
  .logo { height: 44px; }
  .doc { text-align: right; }
  .doc h1 { margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase; }
  .muted { color: #666; font-size: 12px; }
  .summary { display: flex; gap: 24px; margin: 20px 0; flex-wrap: wrap; }
  .summary .cell h3 { margin: 0 0 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; }
  .summary .cell .v { font-size: 18px; font-weight: bold; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 28px 0 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12.5px; }
  th { text-align: left; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; color: #999; border-bottom: 1px solid #e5e5e5; padding: 6px 4px; }
  td { padding: 7px 4px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  td.amt, th.amt { text-align: right; white-space: nowrap; }
  td.neg { font-weight: bold; }
  td.empty { color: #999; text-align: center; padding: 18px 0; }
  .totals { display: flex; justify-content: flex-end; margin-top: 14px; }
  .totals .box { min-width: 260px; }
  .totals .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
  .totals .grand { border-top: 2px solid #111; margin-top: 6px; padding-top: 9px; font-size: 16px; font-weight: bold; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #666; text-align: center; }
  .actions { text-align: center; margin: 20px 0; }
  .btn { background: #111; color: #fff; border: 0; padding: 10px 22px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
  @media print {
    body { background: #fff; }
    .sheet { border: 0; margin: 0; max-width: none; padding: 0; }
    .actions { display: none; }
  }
</style>
</head>
<body>
  <div class="actions">
    <button class="btn" onclick="window.print()">Download / Print (Save as PDF)</button>
  </div>
  <div class="sheet">
    <div class="top">
      <img class="logo" src="${LOGO_URL}" alt="Embroidize" />
      <div class="doc">
        <h1>${esc(title)}</h1>
        <div class="muted">Period: ${esc(periodLabel)}</div>
        <div class="muted">Generated: ${esc(generated)}</div>
      </div>
    </div>

    <div class="summary">
      ${totals
        .map(
          (t) => `
        <div class="cell">
          <h3>${esc(t.label)}</h3>
          <div class="v">${esc(t.value)}</div>
        </div>`,
        )
        .join('')}
    </div>

    <h2>Transactions</h2>
    ${table(columns, rows)}

    <div class="totals">
      <div class="box">
        ${totals
          .map(
            (t) => `
          <div class="row ${t.strong ? 'grand' : ''}">
            <span>${esc(t.label)}</span><span>${esc(t.value)}</span>
          </div>`,
          )
          .join('')}
      </div>
    </div>

    ${sections
      .map(
        (s) => `
      <h2>${esc(s.heading)}</h2>
      ${table(s.columns, s.rows)}`,
      )
      .join('')}

    <div class="footer">
      Internal financial statement — refunds appear as negative amounts.<br />
      Embroidize · <a href="https://embroidize.com">embroidize.com</a> · ${SUPPORT_EMAIL}
    </div>
  </div>
  <script>
    window.onload = function () { setTimeout(function () { window.print(); }, 400); };
  </script>
</body>
</html>`;
}

// Browsers only allow window.open inside the click gesture — after an awaited
// fetch the gesture is gone and the popup is blocked. So callers open the
// shell FIRST (synchronously, in the click handler), fetch their data, then
// render into the already-open window.
export function openStatementShell() {
  const w = window.open('', '_blank', 'width=980,height=920');
  if (!w) return null; // genuinely blocked (browser setting)
  w.document.open();
  w.document.write(
    '<!doctype html><html><head><title>Statement</title></head>' +
      '<body style="font-family:Arial,Helvetica,sans-serif;color:#666;padding:48px;text-align:center">Building statement…</body></html>',
  );
  w.document.close();
  return w;
}

export function renderStatement(w, config) {
  if (!w || w.closed || !config) return false;
  w.document.open();
  w.document.write(statementHtml(config));
  w.document.close();
  return true;
}

// Shows the failure inside the already-open shell so it never just hangs on
// "Building statement…".
export function renderStatementError(w, message) {
  if (!w || w.closed) return;
  w.document.open();
  w.document.write(
    '<!doctype html><html><head><title>Statement</title></head>' +
      `<body style="font-family:Arial,Helvetica,sans-serif;color:#666;padding:48px;text-align:center">Could not build the statement.<br/><br/>${esc(message || 'Unknown error')}</body></html>`,
  );
  w.document.close();
}

// Synchronous open+render — only safe when the config is already in hand
// inside the click handler (no awaits before calling this).
export function openStatement(config) {
  const w = openStatementShell();
  if (!w) return false;
  return renderStatement(w, config);
}
