// Client-side "Save as PDF" receipt for a paid custom order.
//
// Opens a clean, print-ready receipt in a new window, built entirely from the
// order data the customer already has — no PDF library and no backend call. The
// browser's print dialog offers "Save as PDF", which is the download.

const LOGO_URL =
  'https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/logo-black.png';
const SUPPORT_EMAIL = 'support@embroidize.com';

function money(amount, currency = 'usd') {
  const cur = (currency || 'usd').toLowerCase();
  const n = Number(amount || 0).toFixed(2);
  return cur === 'usd' ? `$${n}` : `${n} ${cur.toUpperCase()}`;
}

function fmtDate(value) {
  const d = value ? new Date(value) : new Date();
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function receiptHtml(order) {
  const isPaid = !!order.paidAt;
  const docTitle = isPaid ? 'RECEIPT' : 'INVOICE';
  const amount = money(order.estimatedPrice, order.currency);
  const docDate = fmtDate(order.paidAt || order.updatedAt || order.createdAt);
  // Never surface the processor's brand name to the customer — old orders
  // have a literal "Stripe" channel in their ledger.
  const rawChannel = order.paymentChannel || '';
  const channel =
    !rawChannel || /^stripe$/i.test(rawChannel.trim())
      ? 'Secure online payment'
      : rawChannel;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Receipt ${esc(order.orderNumber)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; background: #f4f4f5; }
  .sheet { max-width: 640px; margin: 24px auto; background: #fff; padding: 40px; border: 1px solid #e5e5e5; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 16px; }
  .logo { height: 44px; }
  .doc { text-align: right; }
  .doc h1 { margin: 0; font-size: 22px; letter-spacing: 1px; }
  .muted { color: #666; font-size: 12px; }
  .meta { display: flex; justify-content: space-between; margin: 24px 0; font-size: 13px; }
  .meta h3 { margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 14px; }
  th { text-align: left; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; color: #999; border-bottom: 1px solid #e5e5e5; padding: 8px 0; }
  td { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
  td.amt, th.amt { text-align: right; }
  .total { display: flex; justify-content: flex-end; margin-top: 16px; }
  .total .box { min-width: 220px; }
  .total .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .total .grand { border-top: 2px solid #111; margin-top: 6px; padding-top: 10px; font-size: 18px; font-weight: bold; }
  .paid-badge { display: inline-block; margin-top: 4px; border: 1px solid #111; border-radius: 4px; padding: 2px 10px; font-size: 11px; font-weight: bold; letter-spacing: 1px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; text-align: center; }
  .actions { text-align: center; margin: 20px 0; }
  .btn { background: #111; color: #fff; border: 0; padding: 10px 22px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
  @media print {
    body { background: #fff; }
    .sheet { border: 0; margin: 0; max-width: none; }
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
        <h1>${docTitle}</h1>
        <div class="muted">${esc(order.orderNumber)}</div>
        ${isPaid ? '<div class="paid-badge">PAID</div>' : ''}
      </div>
    </div>

    <div class="meta">
      <div>
        <h3>Billed to</h3>
        <div>${esc(order.name)}</div>
        <div class="muted">${esc(order.email)}</div>
      </div>
      <div style="text-align:right;">
        <h3>${isPaid ? 'Payment' : 'Invoice date'}</h3>
        <div>${esc(docDate)}</div>
        <div class="muted">${isPaid ? `Method: ${esc(channel)}` : 'Not yet paid'}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr><th>Description</th><th class="amt">Amount</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Custom Embroidery Digitizing — ${esc(order.orderNumber)}</td>
          <td class="amt">${esc(amount)}</td>
        </tr>
      </tbody>
    </table>

    <div class="total">
      <div class="box">
        <div class="row"><span>Subtotal</span><span>${esc(amount)}</span></div>
        <div class="row grand"><span>Total ${isPaid ? 'paid' : 'due'}</span><span>${esc(amount)}</span></div>
      </div>
    </div>

    <div class="footer">
      Thank you for your order.<br />
      Embroidize · <a href="https://embroidize.com">embroidize.com</a> · ${SUPPORT_EMAIL}
    </div>
  </div>
  <script>
    window.onload = function () { setTimeout(function () { window.print(); }, 400); };
  </script>
</body>
</html>`;
}

export function openOrderReceipt(order) {
  if (!order) return;
  const w = window.open('', '_blank', 'width=820,height=920');
  if (!w) return; // popup blocked — the caller can surface a hint
  w.document.open();
  w.document.write(receiptHtml(order));
  w.document.close();
}
