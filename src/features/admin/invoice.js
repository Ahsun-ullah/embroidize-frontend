// Printable per-payment invoice (admin-only), used by the Subscribers page.
// Follows the statement.js pattern: opens a clean print-ready document in a
// new window — the browser's "Save as PDF" is the download. Built to be
// evidence-grade for Stripe reviews: merchant + customer blocks, line item
// with service period, card details, every Stripe reference ID, and a
// digital-delivery note. Grayscale only, per brand.

const LOGO_URL =
  'https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/logo-black.png';
const SUPPORT_EMAIL = 'support@embroidize.com';

function money(n, currency = 'USD') {
  const v = Number(n) || 0;
  const abs = Math.abs(v).toFixed(2);
  const prefix = currency === 'USD' ? '$' : `${currency} `;
  return v < 0 ? `−${prefix}${abs}` : `${prefix}${abs}`;
}

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// config = {
//   invoice:  one row from GET /admin/users/:userId/subscription/invoices
//   customer: the `customer` block from the same response
// }
function invoiceHtml({ invoice, customer }) {
  const generated = new Date().toLocaleString('en-US');
  const currency = invoice.currency || 'USD';
  const isPaid = invoice.status === 'paid';
  const hasRefund = Number(invoice.amountRefunded) > 0;
  const netTotal = (Number(invoice.amount) || 0) - (Number(invoice.amountRefunded) || 0);

  const servicePeriod =
    invoice.periodStart && invoice.periodEnd
      ? `Service period: ${fmtDate(invoice.periodStart)} – ${fmtDate(invoice.periodEnd)}`
      : 'One-time purchase — lifetime access per plan terms';

  const paymentMethod =
    invoice.cardBrand && invoice.cardLast4
      ? `${invoice.cardBrand.charAt(0).toUpperCase() + invoice.cardBrand.slice(1)} •••• ${invoice.cardLast4}`
      : 'Card (via Stripe)';

  const refRow = (label, value) =>
    value
      ? `<div class="ref"><span>${esc(label)}</span><code>${esc(value)}</code></div>`
      : '';

  const planRow = (label, value) =>
    value != null && value !== ''
      ? `<div class="ref"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`
      : '';

  // Full package details — spells out exactly what the customer paid for.
  const plan = customer.plan || null;
  const planBilling = plan
    ? plan.type === 'one-time'
      ? 'One-time purchase (no recurring charges)'
      : `Recurring — billed ${plan.billingInterval || 'month'}ly`
    : null;
  const planSection = plan
    ? `
    <h2>Subscription Package Details</h2>
    <div class="refs">
      ${planRow('Package', plan.name)}
      ${planRow('Billing', planBilling)}
      ${planRow('Package price', money(plan.price, currency) + (plan.type === 'recurring' ? ` / ${plan.billingInterval || 'month'}` : ''))}
      ${planRow(
        'Download allowance',
        plan.downloadLimit != null
          ? `${plan.downloadLimit} designs per billing period`
          : 'Unlimited designs during the service period'
      )}
      ${planRow(
        'Daily download limit',
        plan.dailyLimit != null ? `${plan.dailyLimit} designs per day` : 'Unlimited'
      )}
      ${
        plan.features && plan.features.length
          ? `<div class="ref"><span>Included features</span><strong style="text-align:right">${plan.features
              .map((f) => esc(f))
              .join('<br/>')}</strong></div>`
          : ''
      }
    </div>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Invoice ${esc(invoice.number)} — Embroidize</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; background: #f4f4f5; }
  .sheet { max-width: 780px; margin: 24px auto; background: #fff; padding: 44px; border: 1px solid #e5e5e5; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 18px; }
  .logo { height: 44px; }
  .doc { text-align: right; }
  .doc h1 { margin: 0 0 4px; font-size: 22px; letter-spacing: 2px; text-transform: uppercase; }
  .muted { color: #666; font-size: 12px; }
  .stamp { display: inline-block; margin-top: 8px; padding: 3px 14px; border: 2px solid #111; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
  .stamp.unpaid { border-color: #999; color: #999; }
  .parties { display: flex; gap: 40px; margin: 26px 0 6px; }
  .party { flex: 1; }
  .party h3 { margin: 0 0 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; }
  .party p { margin: 2px 0; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 22px; font-size: 13px; }
  th { text-align: left; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; color: #999; border-bottom: 1px solid #111; padding: 7px 4px; }
  td { padding: 10px 4px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  td.amt, th.amt { text-align: right; white-space: nowrap; }
  .item-desc { color: #666; font-size: 11.5px; margin-top: 3px; }
  .totals { display: flex; justify-content: flex-end; margin-top: 12px; }
  .totals .box { min-width: 250px; }
  .totals .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
  .totals .grand { border-top: 2px solid #111; margin-top: 6px; padding-top: 9px; font-size: 17px; font-weight: bold; }
  h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 30px 0 8px; }
  .refs { border: 1px solid #e5e5e5; border-radius: 6px; padding: 12px 16px; }
  .ref { display: flex; justify-content: space-between; gap: 16px; padding: 4px 0; font-size: 12px; }
  .ref span { color: #666; white-space: nowrap; }
  .ref code { font-family: Consolas, Menlo, monospace; font-size: 11.5px; word-break: break-all; text-align: right; }
  .delivery { margin-top: 8px; font-size: 12px; color: #333; background: #f7f7f7; border: 1px solid #e5e5e5; border-radius: 6px; padding: 12px 16px; line-height: 1.55; }
  .footer { margin-top: 34px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #666; text-align: center; line-height: 1.6; }
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
        <h1>Invoice</h1>
        <div class="muted">Invoice no: <strong>${esc(invoice.number)}</strong></div>
        <div class="muted">Date: ${esc(fmtDate(invoice.date))}</div>
        <div class="stamp ${isPaid ? '' : 'unpaid'}">${esc(isPaid ? 'Paid' : invoice.status)}</div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3>From</h3>
        <p><strong>Embroidize</strong></p>
        <p>Digital embroidery design marketplace</p>
        <p>embroidize.com</p>
        <p>${SUPPORT_EMAIL}</p>
      </div>
      <div class="party">
        <h3>Billed To</h3>
        <p><strong>${esc(invoice.billingName || customer.name || '—')}</strong></p>
        <p>${esc(invoice.billingEmail || customer.email || '—')}</p>
        ${invoice.billingCountry || customer.country ? `<p>Country: ${esc(invoice.billingCountry || customer.country)}</p>` : ''}
        <p class="muted">Stripe customer: ${esc(customer.stripeCustomerId || '—')}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr><th>Description</th><th class="amt">Qty</th><th class="amt">Amount</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${esc(invoice.description)}</strong>
            <div class="item-desc">${esc(servicePeriod)}</div>
            <div class="item-desc">Digital goods — ${
              plan && plan.downloadLimit != null
                ? `access to download up to ${esc(plan.downloadLimit)} embroidery design files during the service period.`
                : 'unlimited-download access to embroidery design files during the service period.'
            }</div>
          </td>
          <td class="amt">1</td>
          <td class="amt">${esc(money(invoice.amount, currency))}</td>
        </tr>
        ${
          hasRefund
            ? `<tr>
          <td><strong>Refund issued</strong></td>
          <td class="amt"></td>
          <td class="amt">${esc(money(-invoice.amountRefunded, currency))}</td>
        </tr>`
            : ''
        }
      </tbody>
    </table>

    <div class="totals">
      <div class="box">
        <div class="row"><span>Subtotal</span><span>${esc(money(invoice.amount, currency))}</span></div>
        ${hasRefund ? `<div class="row"><span>Refunded</span><span>${esc(money(-invoice.amountRefunded, currency))}</span></div>` : ''}
        <div class="row grand"><span>Total ${hasRefund ? '(net)' : 'paid'}</span><span>${esc(money(netTotal, currency))}</span></div>
      </div>
    </div>

    ${planSection}

    <h2>Payment Details</h2>
    <div class="refs">
      ${refRow('Payment method', paymentMethod)}
      ${refRow('Currency', currency)}
      ${refRow('Stripe customer ID', customer.stripeCustomerId)}
      ${refRow('Stripe subscription ID', customer.stripeSubscriptionId)}
      ${refRow('Stripe invoice ID', invoice.stripeInvoiceId)}
      ${refRow('Payment intent', invoice.paymentIntentId)}
      ${refRow('Charge ID', invoice.chargeId)}
      ${refRow('Receipt number', invoice.receiptNumber)}
    </div>

    <h2>Delivery of Goods</h2>
    <div class="delivery">
      Digital goods — embroidery design files are delivered instantly via
      authenticated download on embroidize.com; no physical shipment is
      involved. ${
        customer.totalDownloads != null
          ? `This customer account has downloaded <strong>${esc(customer.totalDownloads)}</strong> design file${Number(customer.totalDownloads) === 1 ? '' : 's'} to date.`
          : ''
      }
    </div>

    <div class="footer">
      All referenced IDs are verifiable in the Stripe Dashboard.<br />
      Embroidize · <a href="https://embroidize.com">embroidize.com</a> · ${SUPPORT_EMAIL} · Generated ${esc(generated)}
    </div>
  </div>
  <script>
    window.onload = function () { setTimeout(function () { window.print(); }, 400); };
  </script>
</body>
</html>`;
}

// Synchronous open+render — safe because the invoice data is already loaded
// in the Invoices tab when the button is clicked (no awaits in the handler,
// so the popup is not blocked).
export function openInvoice(config) {
  const w = window.open('', '_blank', 'width=900,height=920');
  if (!w) return false;
  w.document.open();
  w.document.write(invoiceHtml(config));
  w.document.close();
  return true;
}
