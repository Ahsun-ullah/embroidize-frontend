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
  Tooltip,
  useDisclosure,
} from '@heroui/react';
import { ExternalLink, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

function getToken() {
  const row = document.cookie.split('; ').find((r) => r.startsWith('token='));
  return row ? row.split('=').slice(1).join('=') : undefined;
}

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

// No Content-Type: the browser sets the multipart boundary itself.
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ISO → value for <input type="datetime-local"> in the admin's own timezone.
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// What a visitor sees right now, mirroring the backend's public filter.
function liveStatus(item) {
  const now = Date.now();
  if (!item.isActive) return { label: 'Off', color: 'default' };
  if (item.startsAt && new Date(item.startsAt).getTime() > now)
    return { label: 'Scheduled', color: 'warning' };
  if (item.endsAt && new Date(item.endsAt).getTime() <= now)
    return { label: 'Ended', color: 'default' };
  if (!item.showOnHome && !item.showOnStrip && !item.showOnListing)
    return { label: 'No placement', color: 'default' };
  return { label: 'Live', color: 'success' };
}

// Must match HOME_POSITIONS in the backend's EventPromotionModel.
const HOME_POSITIONS = [
  { key: 'after_hero', label: 'After the hero section' },
  { key: 'middle', label: 'Row after “Most Downloaded Designs” (up to 6 across)' },
  { key: 'before_footer', label: 'Before the footer' },
];
const HOME_POSITION_HINTS = {
  after_hero: 'Full width, right under the hero. Uses the desktop poster.',
  middle: 'Shares one “Shop by Event” row with other events here — up to 6 side by side. Uses the square poster.',
  before_footer: 'Full width, after the last section. Uses the desktop poster.',
};
const HOME_POSITION_SHORT = {
  after_hero: 'after hero',
  middle: 'middle row',
  before_footer: 'before footer',
};

const emptyForm = {
  name: '',
  sectionTitle: '',
  sectionSubtitle: '',
  stripText: '',
  stripCtaLabel: '',
  customUrl: '',
  showOnHome: true,
  homePosition: 'after_hero',
  showOnStrip: false,
  showOnListing: false,
  startsAt: '',
  endsAt: '',
  isActive: true,
  sortOrder: 0,
  categories: [],
  subCategories: [],
};

// One upload tile. Click or drop an image; shows the current poster otherwise.
function PosterTile({ label, hint, file, currentUrl, onFile, onClear }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : currentUrl || ''),
    [file, currentUrl],
  );
  useEffect(
    () => () => {
      if (file && previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [file, previewUrl],
  );

  const take = (f) => {
    if (!f) return;
    if (!f.type?.startsWith('image/')) {
      ErrorToast('Validation', 'Poster must be an image (JPG, PNG, WebP).', 3000);
      return;
    }
    onFile(f);
  };

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium'>{label}</p>
        {previewUrl && onClear ? (
          <button
            type='button'
            onClick={onClear}
            className='inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600'
          >
            <X size={12} /> Remove
          </button>
        ) : null}
      </div>
      <div
        role='button'
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          take(e.dataTransfer.files?.[0]);
        }}
        className={`flex min-h-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-gray-50 transition ${
          dragOver ? 'border-black bg-gray-100' : 'border-gray-300 hover:border-gray-500'
        }`}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt='' className='block max-h-56 w-full object-contain' />
        ) : (
          <div className='flex flex-col items-center gap-1 p-4 text-center text-gray-500'>
            <ImagePlus size={22} />
            <span className='text-xs'>Click or drop an image</span>
          </div>
        )}
      </div>
      <p className='text-xs text-gray-500'>{hint}</p>
      <input
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp,image/avif,image/gif'
        className='hidden'
        onChange={(e) => {
          take(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default function EventPromotionsWrapper({ items: initialItems, categories = [] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems || []);

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onOpenChange: onFormChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteChange,
  } = useDisclosure();

  const [form, setForm] = useState(emptyForm);
  const [editTarget, setEditTarget] = useState(null); // null = add mode
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [removeMobile, setRemoveMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Subcategories offered = those under the chosen categories (all of them
  // when no category is chosen, so a subcategory-only event is possible).
  const subCategoryOptions = useMemo(() => {
    const chosen = new Set(form.categories);
    return categories
      .filter((c) => !chosen.size || chosen.has(String(c._id)))
      .flatMap((c) =>
        (c.subcategories || []).map((s) => ({
          _id: String(s._id),
          name: s.name,
          categoryName: c.name,
        })),
      );
  }, [categories, form.categories]);

  // Mirror of the backend's link rule, so the admin sees where a click lands.
  const linkPreview = useMemo(() => {
    if (form.customUrl.trim()) return form.customUrl.trim();
    const catSlugs = categories
      .filter((c) => form.categories.includes(String(c._id)))
      .map((c) => c.slug);
    const subSlugs = categories
      .flatMap((c) => c.subcategories || [])
      .filter((s) => form.subCategories.includes(String(s._id)))
      .map((s) => s.slug);
    const params = [];
    if (catSlugs.length) params.push(`category=${catSlugs.join(',')}`);
    if (subSlugs.length) params.push(`sub_category=${subSlugs.join(',')}`);
    return params.length ? `/products?${params.join('&')}` : '/products';
  }, [form.customUrl, form.categories, form.subCategories, categories]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDesktopFile(null);
    setMobileFile(null);
    setRemoveMobile(false);
    onFormOpen();
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setForm({
      name: item.name || '',
      sectionTitle: item.sectionTitle || '',
      sectionSubtitle: item.sectionSubtitle || '',
      stripText: item.stripText || '',
      stripCtaLabel: item.stripCtaLabel || '',
      customUrl: item.customUrl || '',
      showOnHome: !!item.showOnHome,
      homePosition: item.homePosition || 'after_hero',
      showOnStrip: !!item.showOnStrip,
      showOnListing: !!item.showOnListing,
      startsAt: toLocalInput(item.startsAt),
      endsAt: toLocalInput(item.endsAt),
      isActive: item.isActive !== false,
      sortOrder: item.sortOrder ?? 0,
      categories: (item.categories || []).map((c) => String(c?._id || c)),
      subCategories: (item.subCategories || []).map((s) => String(s?._id || s)),
    });
    setDesktopFile(null);
    setMobileFile(null);
    setRemoveMobile(false);
    onFormOpen();
  };

  const submitForm = async () => {
    const name = form.name.trim();
    if (!name) {
      ErrorToast('Validation', 'Event name is required.', 3000);
      return;
    }
    const hasDesktop = !!desktopFile || !!editTarget?.desktopImage?.url;
    const hasSquare = !!mobileFile || (!removeMobile && !!editTarget?.mobileImage?.url);
    if (form.showOnHome && !hasDesktop && !hasSquare) {
      ErrorToast('Validation', 'Upload a poster for the home page section.', 3500);
      return;
    }
    if (form.showOnListing && !hasDesktop && !hasSquare) {
      ErrorToast('Validation', 'Upload a poster (square works best) for the floating ad.', 3500);
      return;
    }
    if (form.showOnStrip && !form.stripText.trim()) {
      ErrorToast('Validation', 'Strip text is required for the top strip.', 3000);
      return;
    }
    if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
      ErrorToast('Validation', 'End date must be after the start date.', 3000);
      return;
    }

    const fd = new FormData();
    fd.append('name', name);
    for (const k of ['sectionTitle', 'sectionSubtitle', 'stripText', 'stripCtaLabel', 'customUrl']) {
      fd.append(k, form[k].trim());
    }
    fd.append('homePosition', form.homePosition);
    for (const k of ['showOnHome', 'showOnStrip', 'showOnListing', 'isActive']) {
      fd.append(k, String(!!form[k]));
    }
    fd.append('sortOrder', String(Number(form.sortOrder) || 0));
    // datetime-local is the admin's local time; send it as an absolute instant.
    fd.append('startsAt', form.startsAt ? new Date(form.startsAt).toISOString() : '');
    fd.append('endsAt', form.endsAt ? new Date(form.endsAt).toISOString() : '');
    fd.append('categories', JSON.stringify(form.categories));
    // Drop subcategories whose parent category was deselected.
    const allowedSubs = new Set(subCategoryOptions.map((s) => s._id));
    fd.append('subCategories', JSON.stringify(form.subCategories.filter((id) => allowedSubs.has(id))));
    if (desktopFile) fd.append('desktopImage', desktopFile);
    if (mobileFile) fd.append('mobileImage', mobileFile);
    else if (removeMobile) fd.append('removeMobileImage', 'true');

    setIsSaving(true);
    try {
      const isEdit = !!editTarget;
      const url = isEdit
        ? `${apiBase()}/admin/event-promotions/${editTarget._id}`
        : `${apiBase()}/admin/event-promotions`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: fd,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save event');

      const saved = result.data;
      setItems((prev) =>
        isEdit ? prev.map((it) => (it._id === saved._id ? saved : it)) : [saved, ...prev],
      );
      SuccessToast('Success', isEdit ? 'Event updated.' : 'Event created.', 3000);
      onFormChange(false);
      router.refresh();
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to save event', 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (item) => {
    setTogglingId(item._id);
    try {
      const fd = new FormData();
      fd.append('isActive', String(!item.isActive));
      const res = await fetch(`${apiBase()}/admin/event-promotions/${item._id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: fd,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update');
      const saved = result.data;
      setItems((prev) => prev.map((it) => (it._id === saved._id ? saved : it)));
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to update', 3000);
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${apiBase()}/admin/event-promotions/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to delete');
      setItems((prev) => prev.filter((it) => it._id !== deleteTarget._id));
      SuccessToast('Success', 'Event deleted.', 3000);
      onDeleteChange(false);
      setDeleteTarget(null);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to delete event', 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { uid: 'poster', name: 'POSTER' },
    { uid: 'event', name: 'EVENT' },
    { uid: 'placements', name: 'SHOWS ON' },
    { uid: 'schedule', name: 'SCHEDULE' },
    { uid: 'clicks', name: 'CLICKS' },
    { uid: 'active', name: 'ACTIVE' },
    { uid: 'actions', name: 'ACTIONS' },
  ];

  const renderCell = (item, key) => {
    switch (key) {
      case 'poster':
        return item.desktopImage?.url || item.mobileImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.desktopImage?.url || item.mobileImage?.url}
            alt=''
            className='h-12 w-28 rounded-md object-cover ring-1 ring-black/5'
          />
        ) : (
          <div className='flex h-12 w-28 items-center justify-center rounded-md bg-gray-100 text-[10px] text-gray-400'>
            Strip only
          </div>
        );
      case 'event':
        return (
          <div className='min-w-[180px] space-y-1'>
            <p className='text-sm font-medium'>{item.name}</p>
            <div className='flex flex-wrap gap-1'>
              {(item.categories || []).map((c) => (
                <Chip key={c._id} size='sm' variant='flat'>
                  {c.name}
                </Chip>
              ))}
              {(item.subCategories || []).map((s) => (
                <Chip key={s._id} size='sm' variant='bordered'>
                  {s.name}
                </Chip>
              ))}
            </div>
            <p className='text-xs text-gray-500 break-all'>→ {item.href}</p>
          </div>
        );
      case 'placements':
        return (
          <div className='flex flex-wrap gap-1'>
            {item.showOnHome ? (
              <Chip size='sm' variant='flat'>
                Home · {HOME_POSITION_SHORT[item.homePosition || 'after_hero']}
              </Chip>
            ) : null}
            {item.showOnStrip ? <Chip size='sm' variant='flat'>Top strip</Chip> : null}
            {item.showOnListing ? <Chip size='sm' variant='flat'>Floating ad</Chip> : null}
            {!item.showOnHome && !item.showOnStrip && !item.showOnListing ? (
              <span className='text-xs text-gray-400'>None</span>
            ) : null}
          </div>
        );
      case 'schedule': {
        const status = liveStatus(item);
        return (
          <div className='min-w-[150px] space-y-1'>
            <Chip size='sm' color={status.color} variant='flat'>
              {status.label}
            </Chip>
            <p className='text-xs text-gray-500'>
              {item.startsAt ? formatDate(item.startsAt) : 'Now'} →{' '}
              {item.endsAt ? formatDate(item.endsAt) : 'No end'}
            </p>
          </div>
        );
      }
      case 'clicks':
        return <span className='text-sm'>{item.clicks ?? 0}</span>;
      case 'active':
        return (
          <Switch
            size='sm'
            isSelected={item.isActive !== false}
            isDisabled={togglingId === item._id}
            onValueChange={() => toggleActive(item)}
            aria-label='Toggle event active'
          />
        );
      case 'actions':
        return (
          <div className='flex items-center gap-1'>
            <Tooltip content='Edit'>
              <Button isIconOnly size='sm' variant='light' onPress={() => openEdit(item)} aria-label='Edit event'>
                <Pencil size={15} />
              </Button>
            </Tooltip>
            <Tooltip content='Open link'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                as='a'
                href={item.href}
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Open event link'
              >
                <ExternalLink size={15} />
              </Button>
            </Tooltip>
            <Tooltip content='Delete' color='danger'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                color='danger'
                onPress={() => {
                  setDeleteTarget(item);
                  onDeleteOpen();
                }}
                aria-label='Delete event'
              >
                <Trash2 size={15} />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  };

  const liveCount = items.filter((it) => liveStatus(it).label === 'Live').length;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between gap-4 flex-wrap'>
        <div>
          <h1 className='text-2xl font-bold'>Event Promotions</h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            {items.length} event{items.length !== 1 ? 's' : ''} · {liveCount} live now
          </p>
        </div>
        <Button color='primary' startContent={<Plus size={16} />} onPress={openAdd}>
          New Event
        </Button>
      </div>

      <div className='bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-1'>
        <p className='text-xs text-gray-600 dark:text-gray-300'>
          <strong>How it works:</strong> upload a finished poster (text already in the image), pick
          the categories it promotes and where it shows. A click opens those categories&apos; designs,
          or your custom link. With a schedule it switches on and off by itself — changes reach the
          site within ~30 seconds.
        </p>
        <p className='text-xs text-gray-600 dark:text-gray-300'>
          <strong>Poster sizes:</strong> desktop around <strong>1920 × 600</strong> (wide, home
          section); square around <strong>1080 × 1080</strong> (phones + the small floating ad on
          product, category &amp; search pages). Posters are never cropped — they show at their own
          shape. Keep files under ~500 KB (WebP or JPG).
        </p>
      </div>

      <Table aria-label='Event promotions' removeWrapper>
        <TableHeader columns={columns}>
          {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
        </TableHeader>
        <TableBody
          items={items}
          emptyContent={
            <div className='py-12 text-center text-gray-400 text-sm'>
              No events yet. Click &quot;New Event&quot; to create your first Q4 promotion.
            </div>
          }
        >
          {(item) => (
            <TableRow key={item._id}>
              {(colKey) => <TableCell>{renderCell(item, colKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={isFormOpen}
        onOpenChange={onFormChange}
        backdrop='blur'
        size='5xl'
        scrollBehavior='inside'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editTarget ? 'Edit Event' : 'New Event'}</ModalHeader>
              <ModalBody>
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]'>
                  {/* Main column: posters + text */}
                  <div className='space-y-5'>
                    <Input
                      label='Event name'
                      placeholder='e.g. Halloween 2026'
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      description='Internal name, also used as the poster’s alt text.'
                      isRequired
                      autoFocus
                    />

                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                      <PosterTile
                        label='Desktop poster'
                        hint='Wide, ~1920 × 600. Full-width home spots (after hero / before footer).'
                        file={desktopFile}
                        currentUrl={editTarget?.desktopImage?.url}
                        onFile={setDesktopFile}
                        onClear={desktopFile ? () => setDesktopFile(null) : undefined}
                      />
                      <PosterTile
                        label='Square poster (recommended)'
                        hint='~1080 × 1080. Phones, the home middle row and the floating ad.'
                        file={mobileFile}
                        currentUrl={removeMobile ? '' : editTarget?.mobileImage?.url}
                        onFile={(f) => {
                          setMobileFile(f);
                          setRemoveMobile(false);
                        }}
                        onClear={() => {
                          setMobileFile(null);
                          if (editTarget?.mobileImage?.url) setRemoveMobile(true);
                        }}
                      />
                    </div>

                    <div className='space-y-3 rounded-lg border border-gray-200 p-4'>
                      <p className='text-sm font-semibold'>Home page section text</p>
                      <Input
                        label='Section heading (optional)'
                        placeholder='e.g. Halloween Designs Are Here'
                        value={form.sectionTitle}
                        onChange={(e) => setField('sectionTitle', e.target.value)}
                      />
                      <Input
                        label='Section subtitle (optional)'
                        placeholder='e.g. Spooky stitches for every machine — ready before Oct 31.'
                        value={form.sectionSubtitle}
                        onChange={(e) => setField('sectionSubtitle', e.target.value)}
                      />
                    </div>

                    <div className='space-y-3 rounded-lg border border-gray-200 p-4'>
                      <p className='text-sm font-semibold'>Top strip text</p>
                      <Input
                        label='Strip message'
                        placeholder='e.g. 🎃 New Halloween designs just dropped'
                        value={form.stripText}
                        onChange={(e) => setField('stripText', e.target.value)}
                        description='Required when “Top strip” is on. Keep it to one short line.'
                        maxLength={120}
                      />
                      <Input
                        label='Button text'
                        placeholder='Shop now'
                        value={form.stripCtaLabel}
                        onChange={(e) => setField('stripCtaLabel', e.target.value)}
                        maxLength={30}
                      />
                    </div>
                  </div>

                  {/* Sidebar: status, placement, schedule, targeting */}
                  <div className='space-y-5'>
                    <div className='flex items-center justify-between rounded-lg border border-gray-200 p-4'>
                      <div>
                        <p className='text-sm font-medium'>Active</p>
                        <p className='text-xs text-gray-500'>Off = hidden everywhere.</p>
                      </div>
                      <Switch
                        isSelected={form.isActive}
                        onValueChange={(v) => setField('isActive', v)}
                        aria-label='Active'
                      />
                    </div>

                    <div className='space-y-2 rounded-lg border border-gray-200 p-4'>
                      <p className='text-sm font-semibold'>Show on</p>
                      <Checkbox isSelected={form.showOnHome} onValueChange={(v) => setField('showOnHome', v)}>
                        <span className='text-sm'>Home page section</span>
                      </Checkbox>
                      {form.showOnHome ? (
                        <Select
                          size='sm'
                          label='Home page position'
                          selectedKeys={[form.homePosition]}
                          disallowEmptySelection
                          onChange={(e) => e.target.value && setField('homePosition', e.target.value)}
                          description={HOME_POSITION_HINTS[form.homePosition]}
                          className='pl-7'
                        >
                          {HOME_POSITIONS.map((p) => (
                            <SelectItem key={p.key}>{p.label}</SelectItem>
                          ))}
                        </Select>
                      ) : null}
                      <Checkbox isSelected={form.showOnStrip} onValueChange={(v) => setField('showOnStrip', v)}>
                        <span className='text-sm'>Top strip on every page</span>
                      </Checkbox>
                      <Checkbox isSelected={form.showOnListing} onValueChange={(v) => setField('showOnListing', v)}>
                        <span className='text-sm'>Floating ad on product, category &amp; search pages</span>
                      </Checkbox>
                    </div>

                    <div className='space-y-3 rounded-lg border border-gray-200 p-4'>
                      <p className='text-sm font-semibold'>Schedule</p>
                      <Input
                        type='datetime-local'
                        label='Starts'
                        labelPlacement='outside'
                        value={form.startsAt}
                        onChange={(e) => setField('startsAt', e.target.value)}
                        description='Empty = live immediately.'
                      />
                      <Input
                        type='datetime-local'
                        label='Ends'
                        labelPlacement='outside'
                        value={form.endsAt}
                        onChange={(e) => setField('endsAt', e.target.value)}
                        description='Empty = runs until you switch it off.'
                      />
                      <Input
                        type='number'
                        label='Order'
                        labelPlacement='outside'
                        value={String(form.sortOrder)}
                        onChange={(e) => setField('sortOrder', e.target.value)}
                        description='Lower shows first when several events are live.'
                      />
                    </div>

                    <div className='space-y-3 rounded-lg border border-gray-200 p-4'>
                      <p className='text-sm font-semibold'>Promotes</p>
                      <Select
                        label='Categories'
                        selectionMode='multiple'
                        placeholder='Choose one or more'
                        selectedKeys={new Set(form.categories)}
                        onSelectionChange={(keys) =>
                          setField(
                            'categories',
                            keys === 'all' ? categories.map((c) => String(c._id)) : [...keys].map(String),
                          )
                        }
                      >
                        {categories.map((c) => (
                          <SelectItem key={String(c._id)}>{c.name}</SelectItem>
                        ))}
                      </Select>
                      <Select
                        label='Subcategories (optional)'
                        selectionMode='multiple'
                        placeholder='Narrow it further'
                        selectedKeys={
                          new Set(form.subCategories.filter((id) => subCategoryOptions.some((s) => s._id === id)))
                        }
                        onSelectionChange={(keys) =>
                          setField(
                            'subCategories',
                            keys === 'all' ? subCategoryOptions.map((s) => s._id) : [...keys].map(String),
                          )
                        }
                        isDisabled={!subCategoryOptions.length}
                      >
                        {subCategoryOptions.map((s) => (
                          <SelectItem key={s._id} textValue={s.name}>
                            <div className='flex flex-col'>
                              <span className='text-sm'>{s.name}</span>
                              <span className='text-xs text-gray-500'>{s.categoryName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                      <Input
                        label='Custom link (optional)'
                        placeholder='/holiday-embroidery-designs'
                        value={form.customUrl}
                        onChange={(e) => setField('customUrl', e.target.value)}
                        description='Overrides the category link. A site path or full https:// URL.'
                      />
                      <p className='text-xs text-gray-600 break-all'>
                        <strong>Clicks go to:</strong> {linkPreview}
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button color='primary' isLoading={isSaving} onPress={submitForm}>
                  {editTarget ? 'Save Changes' : 'Create Event'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteChange} backdrop='blur' size='sm'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Event</ModalHeader>
              <ModalBody>
                <p className='text-sm'>
                  Delete <strong>{deleteTarget?.name}</strong>?
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  Its posters are removed from storage. To pause it instead, switch it off.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button color='danger' isLoading={isDeleting} onPress={confirmDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
