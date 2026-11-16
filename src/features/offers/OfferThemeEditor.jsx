'use client';

import { offerSurfaceStyle } from '@/lib/offers/theme';
import { Button, Slider } from '@heroui/react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

// The "Look" of one offer: the colours (and optional background image) every
// banner, card and pop-up of this offer paints with. Each campaign can carry
// its own character — Black Friday black + gold, Christmas red + green.

export const DEFAULT_THEME_FORM = {
  bg: '#000000',
  bg2: '',
  text: '#FFFFFF',
  accent: '#E8C26A',
  buttonText: '#000000',
  image: { url: '', public_id: '' },
  overlay: 45,
};

const PRESETS = [
  { name: 'Black & gold', bg: '#000000', bg2: '', text: '#FFFFFF', accent: '#E8C26A', buttonText: '#000000' },
  { name: 'Black & pink (Black Friday page)', bg: '#0B0B10', bg2: '#9B1450', text: '#FFFFFF', accent: '#E8276F', buttonText: '#FFFFFF' },
  { name: 'Christmas', bg: '#7F1D1D', bg2: '#14532D', text: '#FFFFFF', accent: '#FACC15', buttonText: '#14532D' },
  { name: 'Midnight blue', bg: '#0F172A', bg2: '#1E3A8A', text: '#FFFFFF', accent: '#38BDF8', buttonText: '#0F172A' },
  { name: 'Light', bg: '#FFFFFF', bg2: '', text: '#0B0F1E', accent: '#000000', buttonText: '#FFFFFF' },
];

/** The form's theme → the shape placements read (for the live preview). */
const previewOffer = (t) => ({
  theme: { ...t, imageUrl: t.image?.url || '' },
});

function ColorField({ label, value, onChange, optional }) {
  const on = !!value;
  return (
    <label className='flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2'>
      <span className='text-sm'>
        {label}
        {optional && <span className='block text-xs text-gray-500'>Optional — makes a gradient</span>}
      </span>
      <span className='flex items-center gap-2'>
        {optional && on && (
          <button
            type='button'
            className='text-xs text-gray-500 underline'
            onClick={(e) => {
              e.preventDefault();
              onChange('');
            }}
          >
            Remove
          </button>
        )}
        {optional && !on ? (
          <button
            type='button'
            className='rounded-md border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-600'
            onClick={(e) => {
              e.preventDefault();
              onChange('#333333');
            }}
          >
            Add
          </button>
        ) : (
          <>
            <code className='text-xs text-gray-500'>{value}</code>
            <input
              type='color'
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className='h-8 w-10 cursor-pointer rounded border border-gray-200 bg-transparent p-0.5'
              aria-label={label}
            />
          </>
        )}
      </span>
    </label>
  );
}

export default function OfferThemeEditor({ value, onChange, upload, offerName }) {
  const t = { ...DEFAULT_THEME_FORM, ...(value || {}) };
  const set = (k, v) => onChange({ ...t, [k]: v });
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pickImage = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const img = await upload(file);
      onChange({ ...t, image: { url: img.url, public_id: img.public_id } });
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const preview = previewOffer(t);
  const name = offerName || 'Black Friday Plan';

  return (
    <section>
      <h3 className='text-sm font-semibold'>Look</h3>
      <p className='mb-3 text-xs text-gray-500'>
        The colours of this offer&apos;s landing page and of every banner, card and pop-up it shows. Text is always drawn in the text colour you
        pick, so it stays readable on any page.
      </p>

      <div className='mb-3 flex flex-wrap gap-2'>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type='button'
            onClick={() => {
              const { name: _name, ...colors } = p;
              onChange({ ...t, ...colors });
            }}
            className='flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:border-gray-400'
          >
            <span
              className='h-4 w-4 rounded-full ring-1 ring-black/10'
              style={{ background: p.bg2 ? `linear-gradient(115deg, ${p.bg}, ${p.bg2})` : p.bg }}
            />
            <span className='h-2.5 w-2.5 rounded-full' style={{ background: p.accent }} />
            {p.name}
          </button>
        ))}
      </div>

      <div className='grid gap-2 sm:grid-cols-2'>
        <ColorField label='Background' value={t.bg} onChange={(v) => set('bg', v)} />
        <ColorField label='Second background' value={t.bg2} onChange={(v) => set('bg2', v)} optional />
        <ColorField label='Text' value={t.text} onChange={(v) => set('text', v)} />
        <ColorField label='Accent (labels + button)' value={t.accent} onChange={(v) => set('accent', v)} />
        <ColorField label='Button text' value={t.buttonText} onChange={(v) => set('buttonText', v)} />
      </div>

      {/* Background image */}
      <div className='mt-3 rounded-lg border border-gray-200 bg-white p-3'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <p className='text-sm'>Background image</p>
            <p className='text-xs text-gray-500'>Optional. Wide images work best (e.g. 1600 × 500).</p>
          </div>
          <div className='flex gap-2'>
            <input
              ref={fileRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={(e) => pickImage(e.target.files?.[0])}
            />
            <Button
              size='sm'
              variant='flat'
              isLoading={uploading}
              startContent={!uploading && <ImagePlus size={14} />}
              onPress={() => fileRef.current?.click()}
            >
              {t.image?.url ? 'Replace' : 'Upload'}
            </Button>
            {t.image?.url && (
              <Button
                size='sm'
                variant='light'
                color='danger'
                startContent={<Trash2 size={14} />}
                onPress={() => onChange({ ...t, image: { url: '', public_id: '' } })}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
        {error && <p className='mt-2 text-xs text-red-600'>{error}</p>}
        {t.image?.url && (
          <Slider
            className='mt-3'
            size='sm'
            label='Darken the image (keeps text readable)'
            minValue={0}
            maxValue={90}
            step={5}
            value={Number(t.overlay) || 0}
            onChange={(v) => set('overlay', Array.isArray(v) ? v[0] : v)}
            getValue={(v) => `${v}%`}
          />
        )}
      </div>

      {/* Live preview */}
      <p className='mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500'>Preview</p>
      <div className='space-y-2'>
        <div className='rounded-lg px-4 py-2 text-center text-sm' style={offerSurfaceStyle(preview)}>
          <span className='o-fg'>
            <span className='o-accent font-bold'>{name}:</span> 1 year of Pro for $39.50 + 150 bonus credits
            <span className='o-muted'> · Ends Dec 1</span>
          </span>
        </div>
        <div className='o-ring-soft rounded-2xl p-5' style={offerSurfaceStyle(preview)}>
          <p className='o-accent text-xs font-bold uppercase tracking-[0.2em]'>{name} · Ends Dec 1</p>
          <p className='mt-1 flex items-baseline gap-2'>
            <span className='o-fg text-3xl font-extrabold'>$39.50</span>
            <span className='o-fg font-semibold'>for 1 year</span>
            <span className='o-faint line-through'>$49.99</span>
          </p>
          <p className='o-muted mt-1 text-sm'>1 year of Pro for $39.50 + 150 bonus credits</p>
          <span className='o-btn mt-3 flex h-10 items-center justify-center rounded-xl text-sm font-bold'>
            Get the {name}
          </span>
        </div>
      </div>
    </section>
  );
}
