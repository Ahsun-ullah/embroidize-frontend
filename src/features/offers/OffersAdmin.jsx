'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Checkbox,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  useDisclosure,
} from '@heroui/react';
import { Copy, ExternalLink, Pencil, Plus, Trash2, Users, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import OfferReviewPicker, { pickFromPublicReview } from './OfferReviewPicker';
import OfferThemeEditor, { DEFAULT_THEME_FORM } from './OfferThemeEditor';

// ─────────────────────────────────────────────────────────────────────────────
// Admin → Content → Offers & Campaigns.
//
// An offer = an existing plan sold at a lower FIRST price (Creem renews at the
// normal price), plus add-ons granted on purchase, plus the site placements
// that advertise it. All times are entered and shown in US EASTERN time,
// because that is what the customer emails promise ("ends at midnight ET"),
// whatever timezone the admin happens to be in.
// ─────────────────────────────────────────────────────────────────────────────

const TZ = 'America/New_York';

const PLACEMENTS = [
  { key: 'topBar', label: 'Top bar', hint: 'Replaces the seasonal strip on every page' },
  { key: 'homeHero', label: 'Homepage hero', hint: 'Banner with countdown above the categories' },
  { key: 'pricingCard', label: 'Pricing page card', hint: 'Highlighted card above the plans' },
  { key: 'productPriceBox', label: 'Design page price box', hint: 'Replaces the Pro price line' },
  { key: 'limitPopup', label: 'Download-limit pop-up', hint: 'Offer line + button when free downloads run out' },
  { key: 'exitPopup', label: 'Exit pop-up', hint: 'Free visitors, desktop, once per visit' },
  { key: 'mobileBar', label: 'Mobile sticky bar', hint: 'Slim bar at the bottom of phone screens' },
  { key: 'dashboardBanner', label: 'Account banner', hint: '"{name}, your offer is waiting" for logged-in free users' },
];

const PHASE_CHIP = {
  inactive: { label: 'Off', color: 'default' },
  scheduled: { label: 'Scheduled', color: 'warning' },
  early: { label: 'Early access', color: 'secondary' },
  public: { label: 'Live', color: 'success' },
  ended: { label: 'Ended', color: 'default' },
};

function getToken() {
  const row = document.cookie.split('; ').find((r) => r.startsWith('token='));
  return row ? row.split('=').slice(1).join('=') : undefined;
}
const apiBase = () =>
  process.env.NEXT_PUBLIC_BASE_API_URL_PROD || process.env.NEXT_PUBLIC_BASE_API_URL;

async function uploadOfferImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${apiBase()}/admin/offers/upload-image`, {
    method: 'POST',
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Upload failed (${res.status})`);
  return data?.data;
}

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data?.data;
}

// ── US Eastern <-> UTC, without a date library ──────────────────────────────
function wallClockMs(ts, tz) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(new Date(ts))
      .map((p) => [p.type, p.value]),
  );
  return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
}

/** "2026-12-01T23:59" read as US Eastern → ISO (UTC). '' → null. */
function easternInputToIso(value) {
  if (!value) return null;
  const [d, t = '00:00'] = value.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [h, mi] = t.split(':').map(Number);
  const target = Date.UTC(y, m - 1, day, h, mi);
  let utc = target;
  for (let i = 0; i < 3; i++) utc += target - wallClockMs(utc, TZ); // converges across DST
  return new Date(utc).toISOString();
}

/** ISO → "YYYY-MM-DDTHH:mm" in US Eastern, for <input type="datetime-local">. */
function isoToEasternInput(iso, shiftMs = 0) {
  if (!iso) return '';
  const wall = new Date(wallClockMs(new Date(iso).getTime() + shiftMs, TZ));
  return wall.toISOString().slice(0, 16);
}

function easternLabel(iso, shiftMs = 0) {
  if (!iso) return '—';
  return new Date(new Date(iso).getTime() + shiftMs).toLocaleString('en-US', {
    timeZone: TZ,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const usd = (cents) => `$${(Number(cents || 0) / 100).toFixed(2)}`;
// endsAt is stored as the first minute the offer is OVER; the admin types and
// sees the last minute it can be bought ("Dec 1, 11:59 PM").
const ONE_MIN = 60 * 1000;

const emptyForm = {
  name: '',
  slug: '',
  planId: '',
  offerPrice: '',
  earlyAccessAt: '',
  publicStartsAt: '',
  lastMoment: '',
  isActive: false,
  bonusCredits: '',
  creditsValidityDays: '',
  headline: '',
  badge: '',
  ctaLabel: '',
  description: '',
  faqs: [],
  reviews: [],
  placements: Object.fromEntries(PLACEMENTS.map((p) => [p.key, true])),
  theme: DEFAULT_THEME_FORM,
};

function formFromOffer(o) {
  const credit = (o.addOns || []).find((a) => a.type === 'credits');
  return {
    name: o.name || '',
    slug: o.slug || '',
    planId: String(o.planId?._id || o.planId || ''),
    offerPrice: o.offerPriceCents ? (o.offerPriceCents / 100).toFixed(2) : '',
    earlyAccessAt: isoToEasternInput(o.earlyAccessAt),
    publicStartsAt: isoToEasternInput(o.publicStartsAt),
    lastMoment: isoToEasternInput(o.endsAt, -ONE_MIN),
    isActive: !!o.isActive,
    bonusCredits: credit?.credits ? String(credit.credits) : '',
    creditsValidityDays: credit?.validityDays ? String(credit.validityDays) : '',
    headline: o.headline || '',
    badge: o.badge || '',
    ctaLabel: o.ctaLabel || '',
    description: o.description || '',
    faqs: (o.faqs || []).map((f) => ({ q: f.q, a: f.a })),
    reviews: (o.pickedReviews || []).map(pickFromPublicReview),
    placements: Object.fromEntries(PLACEMENTS.map((p) => [p.key, !!o.placements?.[p.key]])),
    theme: {
      ...DEFAULT_THEME_FORM,
      ...(o.theme || {}),
      image: { url: o.theme?.image?.url || '', public_id: o.theme?.image?.public_id || '' },
    },
  };
}

function bodyFromForm(f) {
  const last = easternInputToIso(f.lastMoment);
  return {
    name: f.name,
    slug: f.slug,
    planId: f.planId,
    offerPrice: f.offerPrice,
    earlyAccessAt: easternInputToIso(f.earlyAccessAt),
    publicStartsAt: easternInputToIso(f.publicStartsAt),
    endsAt: last ? new Date(new Date(last).getTime() + ONE_MIN).toISOString() : null,
    isActive: f.isActive,
    addOns:
      Number(f.bonusCredits) > 0
        ? [
            {
              type: 'credits',
              credits: Number(f.bonusCredits),
              validityDays: f.creditsValidityDays ? Number(f.creditsValidityDays) : null,
            },
          ]
        : [],
    headline: f.headline,
    badge: f.badge,
    ctaLabel: f.ctaLabel,
    description: f.description,
    faqs: f.faqs.filter((x) => x.q.trim() && x.a.trim()),
    reviewIds: f.reviews.map((r) => r._id),
    placements: f.placements,
    theme: f.theme,
  };
}

const landingPath = (slug) => (slug === 'black-friday' ? '/black-friday' : `/offers/${slug}`);
const siteUrl = () => (typeof window !== 'undefined' ? window.location.origin : '');

export default function OffersAdmin({ plans = [] }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [buyers, setBuyers] = useState(null);
  const editor = useDisclosure();
  const buyersModal = useDisclosure();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems((await api('/admin/offers')) || []);
    } catch (e) {
      ErrorToast('Error', e.message, 4000);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const selectedPlan = plans.find((p) => String(p._id) === String(form.planId));
  const regularPrice = Number(selectedPlan?.price) || 0;
  const discount = regularPrice && form.offerPrice ? regularPrice - Number(form.offerPrice) : null;

  const openNew = () => {
    const yearly = plans.find((p) => (p.billingInterval || '').startsWith('year'));
    setForm({ ...emptyForm, planId: yearly ? String(yearly._id) : '' });
    setEditingId(null);
    editor.onOpen();
  };
  const openEdit = (o) => {
    setForm(formFromOffer(o));
    setEditingId(o._id);
    editor.onOpen();
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = bodyFromForm(form);
      const result = editingId
        ? await api(`/admin/offers/${editingId}`, { method: 'PUT', body })
        : await api('/admin/offers', { method: 'POST', body });
      if (result?.warning) ErrorToast('Saved, not active', result.warning, 9000);
      else SuccessToast('Saved', editingId ? 'Offer updated' : 'Offer created', 3000);
      editor.onClose();
      load();
    } catch (e) {
      ErrorToast('Could not save', e.message, 6000);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (o) => {
    if (!window.confirm(`Delete "${o.name}"? Its Creem discount code stops working.`)) return;
    try {
      await api(`/admin/offers/${o._id}`, { method: 'DELETE' });
      SuccessToast('Deleted', 'Offer deleted', 3000);
      load();
    } catch (e) {
      ErrorToast('Could not delete', e.message, 6000);
    }
  };

  const showBuyers = async (o) => {
    setBuyers({ offer: o, rows: null });
    buyersModal.onOpen();
    try {
      setBuyers({ offer: o, rows: (await api(`/admin/offers/${o._id}/redemptions`)) || [] });
    } catch (e) {
      ErrorToast('Error', e.message, 4000);
    }
  };

  const copyLink = async (o) => {
    const url = `${siteUrl()}${landingPath(o.slug)}`;
    try {
      await navigator.clipboard.writeText(url);
      SuccessToast('Copied', url, 3000);
    } catch {
      window.prompt('Copy the link:', url);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold'>Offers &amp; Campaigns</h1>
          <p className='max-w-3xl text-sm text-gray-500'>
            Sell a plan at a lower first price with bonus add-ons, and switch its banners on across the
            site. Creem renews at the plan&apos;s normal price after the first period. All times are{' '}
            <strong>US Eastern</strong>. Only one offer can be live at a time.
          </p>
        </div>
        <Button color='primary' className='bg-black' startContent={<Plus size={16} />} onPress={openNew}>
          New offer
        </Button>
      </div>

      <Table aria-label='Offers' removeWrapper className='rounded-xl bg-white p-2'>
        <TableHeader>
          <TableColumn>OFFER</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>PRICE</TableColumn>
          <TableColumn>WHEN (ET)</TableColumn>
          <TableColumn>SALES</TableColumn>
          <TableColumn align='end'>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={loading}
          emptyContent={loading ? ' ' : 'No offers yet. Create the Black Friday offer to start.'}
          items={items}
        >
          {(o) => {
            const chip = PHASE_CHIP[o.phase] || PHASE_CHIP.inactive;
            const credit = (o.addOns || []).find((a) => a.type === 'credits');
            return (
              <TableRow key={o._id}>
                <TableCell>
                  <div className='font-semibold'>{o.name}</div>
                  <div className='text-xs text-gray-500'>
                    {landingPath(o.slug)} · {o.planId?.name || 'plan?'}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size='sm' color={chip.color} variant='flat'>
                    {chip.label}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className='font-semibold'>{usd(o.offerPriceCents)}</div>
                  <div className='text-xs text-gray-500'>
                    then {o.planId?.price != null ? `$${Number(o.planId.price).toFixed(2)}` : '—'}
                    {credit?.credits ? ` · +${credit.credits} credits` : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='text-xs'>
                    {o.earlyAccessAt && <div>Early: {easternLabel(o.earlyAccessAt)}</div>}
                    <div>Public: {easternLabel(o.publicStartsAt)}</div>
                    <div>Last: {easternLabel(o.endsAt, -ONE_MIN)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='font-semibold'>{o.stats?.purchases || 0} bought</div>
                  <div className='text-xs text-gray-500'>
                    {usd(o.stats?.revenueCents)}
                    {o.stats?.refunded ? ` · ${o.stats.refunded} refunded` : ''}
                  </div>
                  {o.stats?.mismatches > 0 && (
                    <div className='text-xs font-semibold text-red-600'>
                      ⚠ {o.stats.mismatches} charged a different price — check the Creem discount
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex justify-end gap-1'>
                    <Tooltip content='Copy the private link'>
                      <Button isIconOnly size='sm' variant='light' onPress={() => copyLink(o)}>
                        <Copy size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content='Open the landing page'>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        as='a'
                        href={landingPath(o.slug)}
                        target='_blank'
                        rel='noreferrer'
                      >
                        <ExternalLink size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content='Buyers'>
                      <Button isIconOnly size='sm' variant='light' onPress={() => showBuyers(o)}>
                        <Users size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content='Edit'>
                      <Button isIconOnly size='sm' variant='light' onPress={() => openEdit(o)}>
                        <Pencil size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content='Delete'>
                      <Button isIconOnly size='sm' variant='light' color='danger' onPress={() => remove(o)}>
                        <Trash2 size={16} />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>

      {/* ── Editor ── */}
      <Modal isOpen={editor.isOpen} onOpenChange={editor.onOpenChange} size='5xl' scrollBehavior='inside'>
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader>{editingId ? 'Edit offer' : 'New offer'}</ModalHeader>
              <ModalBody>
                <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
                  {/* Main column */}
                  <div className='space-y-5'>
                    <section className='grid gap-3 sm:grid-cols-2'>
                      <Input
                        label='Name'
                        placeholder='Black Friday Plan'
                        value={form.name}
                        onValueChange={(v) => set('name', v)}
                        isRequired
                      />
                      <Input
                        label='Link name'
                        placeholder='black-friday'
                        description={form.slug ? `embroidize.com${landingPath(form.slug)}` : 'black-friday → /black-friday'}
                        value={form.slug}
                        onValueChange={(v) => set('slug', v.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        isRequired
                      />
                      <Select
                        label='Plan it sells'
                        selectedKeys={form.planId ? [form.planId] : []}
                        onSelectionChange={(keys) => set('planId', Array.from(keys)[0] || '')}
                        isRequired
                      >
                        {plans.map((p) => (
                          <SelectItem key={String(p._id)}>{`${p.name} — $${Number(p.price).toFixed(2)}/${p.billingInterval}`}</SelectItem>
                        ))}
                      </Select>
                      <Input
                        label='Offer price (first period)'
                        type='number'
                        step='0.01'
                        startContent={<span className='text-sm text-gray-500'>$</span>}
                        value={form.offerPrice}
                        onValueChange={(v) => set('offerPrice', v)}
                        description={
                          discount != null
                            ? discount > 0
                              ? `Creem discount: $${discount.toFixed(2)} off the first payment, then $${regularPrice.toFixed(2)}`
                              : 'Must be lower than the plan price'
                            : ''
                        }
                        isInvalid={discount != null && discount <= 0}
                        isRequired
                      />
                    </section>

                    <section>
                      <h3 className='mb-2 text-sm font-semibold'>Schedule (US Eastern time)</h3>
                      <div className='grid gap-3 sm:grid-cols-3'>
                        <Input
                          type='datetime-local'
                          label='Early access (optional)'
                          description='Private link works, nothing on the site shows it'
                          value={form.earlyAccessAt}
                          onValueChange={(v) => set('earlyAccessAt', v)}
                        />
                        <Input
                          type='datetime-local'
                          label='Public start'
                          description='Every placement below switches on'
                          value={form.publicStartsAt}
                          onValueChange={(v) => set('publicStartsAt', v)}
                          isRequired
                        />
                        <Input
                          type='datetime-local'
                          label='Last moment to buy'
                          description='e.g. Dec 1, 11:59 PM — then everything switches off'
                          value={form.lastMoment}
                          onValueChange={(v) => set('lastMoment', v)}
                          isRequired
                        />
                      </div>
                    </section>

                    <section>
                      <h3 className='mb-2 text-sm font-semibold'>Add-ons granted on purchase</h3>
                      <div className='grid gap-3 sm:grid-cols-2'>
                        <Input
                          type='number'
                          label='Bonus download credits'
                          placeholder='150'
                          value={form.bonusCredits}
                          onValueChange={(v) => set('bonusCredits', v)}
                          description='Used only when the buyer has no active plan'
                        />
                        <Input
                          type='number'
                          label='Credits valid for (days)'
                          placeholder='Empty = never expire'
                          value={form.creditsValidityDays}
                          onValueChange={(v) => set('creditsValidityDays', v)}
                        />
                      </div>
                    </section>

                    <section className='grid gap-3 sm:grid-cols-3'>
                      <Input
                        label='Headline'
                        placeholder='Our biggest offer of the year'
                        value={form.headline}
                        onValueChange={(v) => set('headline', v)}
                      />
                      <Input
                        label='Badge'
                        placeholder='Best deal of the year'
                        value={form.badge}
                        onValueChange={(v) => set('badge', v)}
                      />
                      <Input
                        label='Button text'
                        placeholder='Get the Black Friday Plan'
                        value={form.ctaLabel}
                        onValueChange={(v) => set('ctaLabel', v)}
                      />
                      <Textarea
                        className='sm:col-span-3'
                        label='Landing page intro (optional)'
                        minRows={2}
                        value={form.description}
                        onValueChange={(v) => set('description', v)}
                      />
                    </section>

                    <section>
                      <div className='mb-2 flex items-center justify-between'>
                        <h3 className='text-sm font-semibold'>Extra FAQs</h3>
                        <Button
                          size='sm'
                          variant='flat'
                          startContent={<Plus size={14} />}
                          onPress={() => set('faqs', [...form.faqs, { q: '', a: '' }])}
                        >
                          Add question
                        </Button>
                      </div>
                      <p className='mb-2 text-xs text-gray-500'>
                        The page already answers: when it ends, what renews, how the credits work, and
                        switching from Monthly — built from the numbers above.
                      </p>
                      <div className='space-y-2'>
                        {form.faqs.map((f, i) => (
                          <div key={i} className='flex gap-2'>
                            <div className='grid flex-1 gap-2 sm:grid-cols-2'>
                              <Input
                                size='sm'
                                label='Question'
                                value={f.q}
                                onValueChange={(v) =>
                                  set('faqs', form.faqs.map((x, j) => (j === i ? { ...x, q: v } : x)))
                                }
                              />
                              <Input
                                size='sm'
                                label='Answer'
                                value={f.a}
                                onValueChange={(v) =>
                                  set('faqs', form.faqs.map((x, j) => (j === i ? { ...x, a: v } : x)))
                                }
                              />
                            </div>
                            <Button
                              isIconOnly
                              size='sm'
                              variant='light'
                              aria-label='Remove question'
                              onPress={() => set('faqs', form.faqs.filter((_, j) => j !== i))}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </section>

                    <OfferReviewPicker
                      value={form.reviews}
                      onChange={(v) => set('reviews', v)}
                      api={api}
                    />

                    <OfferThemeEditor
                      value={form.theme}
                      onChange={(v) => set('theme', v)}
                      upload={uploadOfferImage}
                      offerName={form.name}
                    />
                  </div>

                  {/* Sidebar */}
                  <aside className='space-y-4 rounded-xl bg-gray-50 p-4'>
                    <Switch isSelected={form.isActive} onValueChange={(v) => set('isActive', v)}>
                      Active
                    </Switch>
                    <p className='text-xs text-gray-500'>
                      Activating creates the Creem discount code. If Creem refuses, the offer is saved
                      inactive and you are told why. Deactivating deletes the code.
                    </p>
                    <div>
                      <h3 className='mb-2 text-sm font-semibold'>Where it shows (public window)</h3>
                      <div className='space-y-2'>
                        {PLACEMENTS.map((p) => (
                          <Checkbox
                            key={p.key}
                            isSelected={!!form.placements[p.key]}
                            onValueChange={(v) => set('placements', { ...form.placements, [p.key]: v })}
                            classNames={{ label: 'text-sm' }}
                          >
                            <span className='font-medium'>{p.label}</span>
                            <span className='block text-xs text-gray-500'>{p.hint}</span>
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                    <p className='text-xs text-gray-500'>
                      Price, credits and end date in every placement come from this offer — they can
                      never disagree. People already on this plan never see it.
                    </p>
                  </aside>
                </div>
              </ModalBody>
              <ModalFooter className='sticky bottom-0 bg-white'>
                <Button variant='light' onPress={close}>
                  Cancel
                </Button>
                <Button className='bg-black text-white' isLoading={saving} onPress={save}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Buyers ── */}
      <Modal isOpen={buyersModal.isOpen} onOpenChange={buyersModal.onOpenChange} size='3xl' scrollBehavior='inside'>
        <ModalContent>
          <ModalHeader>Buyers — {buyers?.offer?.name}</ModalHeader>
          <ModalBody className='pb-6'>
            {!buyers?.rows ? (
              <p className='text-sm text-gray-500'>Loading…</p>
            ) : buyers.rows.length === 0 ? (
              <p className='text-sm text-gray-500'>No purchases yet.</p>
            ) : (
              <table className='w-full text-sm'>
                <thead className='text-left text-xs text-gray-500'>
                  <tr>
                    <th className='py-2'>Customer</th>
                    <th>Paid</th>
                    <th>Credits</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.rows.map((r) => (
                    <tr key={r._id} className='border-t border-gray-100'>
                      <td className='py-2'>
                        <div className='font-medium'>{r.userId?.name || '—'}</div>
                        <div className='text-xs text-gray-500'>{r.userId?.email}</div>
                      </td>
                      <td>
                        {usd(r.paidCents)}
                        {r.priceMismatch && <span className='ml-1 text-xs font-semibold text-red-600'>⚠</span>}
                      </td>
                      <td>
                        {r.bonusCredits}
                        {!r.addOnsGranted && <span className='ml-1 text-xs text-amber-600'>(pending)</span>}
                        {r.creditsClawedBack ? <span className='ml-1 text-xs text-gray-500'>−{r.creditsClawedBack}</span> : null}
                      </td>
                      <td>{r.status}</td>
                      <td className='text-xs'>{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
