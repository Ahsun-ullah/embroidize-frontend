'use client';

import { useEffect, useState } from 'react';
import { FilesDropZone } from './FileDragAndDropInput';

// Product-page media: 2 extra images + 1 short video, shown as the thumbnail
// row under the main image. Uploaded separately from the product itself
// (PUT /product/:id/media) because the server re-encodes them — images to
// WebP ≤1600px, video to 720p H.264 — so the raw file size here never ends up
// in the bucket.

export const emptyProductMedia = (product) => ({
  gallery: [0, 1].map((i) => ({
    existing: product?.gallery?.[i] || null,
    file: null,
  })),
  video: { existing: product?.video || null, file: null },
});

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp,image/avif';
const VIDEO_ACCEPT =
  'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.m4v';
const MAX_VIDEO_MB = 200;

const formatMb = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

function MediaTile({ id, title, kind, slot, onPick, onClear, hint }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slot.file instanceof File) {
      const url = URL.createObjectURL(slot.file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(
      kind === 'video'
        ? slot.existing?.poster_url || null
        : slot.existing?.url || null,
    );
    return undefined;
  }, [slot, kind]);

  const handle = (file) => {
    if (!file) return;
    const ok =
      kind === 'video'
        ? file.type.startsWith('video/') ||
          /\.(mp4|mov|webm|m4v)$/i.test(file.name)
        : file.type.startsWith('image/');
    if (!ok) {
      setError(
        kind === 'video'
          ? `"${file.name}" is not a video (MP4, MOV or WebM).`
          : `"${file.name}" is not an image.`,
      );
      return;
    }
    if (kind === 'video' && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(
        `Video is ${formatMb(file.size)} — the limit is ${MAX_VIDEO_MB} MB.`,
      );
      return;
    }
    setError(null);
    onPick(file);
  };

  const hasSomething = slot.file instanceof File || slot.existing;
  const isNewVideo = kind === 'video' && slot.file instanceof File;

  return (
    <div className='flex h-full flex-col items-center rounded-md border border-gray-300 bg-white px-3 py-3 text-center'>
      <div className='relative flex h-20 w-20 items-center justify-center overflow-hidden rounded bg-gray-100'>
        {isNewVideo && preview ? (
          <video
            src={preview}
            muted
            playsInline
            preload='metadata'
            className='h-full w-full object-cover'
          />
        ) : preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt='' className='h-full w-full object-cover' />
        ) : (
          <span className='text-[10px] font-semibold uppercase tracking-wide text-gray-500'>
            {kind === 'video' ? 'VIDEO' : 'IMG'}
          </span>
        )}
        {kind === 'video' && hasSomething && (
          <span className='absolute inset-0 flex items-center justify-center'>
            <span className='flex h-7 w-7 items-center justify-center rounded-full bg-black/60'>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='#fff'>
                <path d='M8 5v14l11-7z' />
              </svg>
            </span>
          </span>
        )}
      </div>

      <p className='mt-2 text-sm font-medium text-gray-800'>{title}</p>
      <p className='mt-0.5 w-full truncate text-xs text-gray-500'>
        {slot.file instanceof File
          ? `${slot.file.name} · ${formatMb(slot.file.size)}`
          : slot.existing
            ? kind === 'video'
              ? `Current video${slot.existing.duration ? ` · ${slot.existing.duration}s` : ''}${slot.existing.size ? ` · ${formatMb(slot.existing.size)}` : ''}`
              : 'Current image'
            : 'Optional'}
      </p>

      <div className='mt-2 flex items-center gap-2'>
        <label
          htmlFor={id}
          className='cursor-pointer rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-black'
        >
          {hasSomething ? 'Replace' : 'Browse'}
        </label>
        {hasSomething && (
          <button
            type='button'
            onClick={() => {
              setError(null);
              onClear();
            }}
            className='rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50'
          >
            Remove
          </button>
        )}
      </div>
      <input
        id={id}
        type='file'
        accept={kind === 'video' ? VIDEO_ACCEPT : IMAGE_ACCEPT}
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.target.value = '';
        }}
        className='hidden'
      />

      {error ? (
        <p className='mt-2 text-[11px] font-light leading-snug text-red-500'>
          {error}
        </p>
      ) : (
        hint && (
          <p className='mt-2 text-[11px] leading-snug text-gray-400'>{hint}</p>
        )
      )}
    </div>
  );
}

const isVideoFile = (file) =>
  file?.type?.startsWith('video/') ||
  /\.(mp4|mov|webm|m4v)$/i.test(file?.name || '');
const isImageFile = (file) => file?.type?.startsWith('image/');

export default function ProductMediaSection({ media, onChange }) {
  const [dropError, setDropError] = useState(null);

  const setGallery = (index, next) =>
    onChange({
      ...media,
      gallery: media.gallery.map((s, i) => (i === index ? next : s)),
    });

  // Drop anywhere in the section: the video goes to the video slot, images
  // fill the empty image slots first (then replace from slot 1), exactly like
  // the Files section routes the cover/ZIP/EMB/PDF.
  const handleDroppedFiles = (files) => {
    const rejected = [];
    const images = [];
    let video = null;

    files.forEach((file) => {
      if (!file || file.size === 0) {
        rejected.push(file?.name || 'file');
      } else if (isVideoFile(file)) {
        if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
          rejected.push(`${file.name} (over ${MAX_VIDEO_MB} MB)`);
        } else if (!video) {
          video = file;
        } else {
          rejected.push(`${file.name} (only 1 video)`);
        }
      } else if (isImageFile(file)) {
        images.push(file);
      } else {
        rejected.push(file.name);
      }
    });

    const gallery = [...media.gallery];
    const order = [
      ...gallery
        .map((s, i) => i)
        .filter((i) => !gallery[i].file && !gallery[i].existing),
      ...gallery
        .map((s, i) => i)
        .filter((i) => gallery[i].file || gallery[i].existing),
    ];
    images.forEach((file, n) => {
      if (n < order.length) gallery[order[n]] = { existing: null, file };
      else rejected.push(`${file.name} (only ${gallery.length} extra images)`);
    });

    if (images.length || video) {
      onChange({
        ...media,
        gallery,
        video: video ? { existing: null, file: video } : media.video,
      });
    }
    setDropError(
      rejected.length
        ? `Not added: ${rejected.join(', ')} — drop up to ${gallery.length} images and 1 video (MP4, MOV, WebM).`
        : null,
    );
  };

  return (
    <section className='mt-4 rounded-lg border border-gray-200 bg-white p-4'>
      <div className='mb-3 flex flex-wrap items-baseline justify-between gap-2'>
        <h3 className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
          Product page gallery
        </h3>
        <p className='text-xs text-gray-400'>
          Drag images and a video anywhere in this box — each one lands in its
          own slot. Optimised automatically on upload.
        </p>
      </div>

      <FilesDropZone onFiles={handleDroppedFiles}>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          {media.gallery.map((slot, i) => (
            <MediaTile
              key={i}
              id={`gallery-upload-${i}`}
              title={`Extra image ${i + 1}`}
              kind='image'
              slot={slot}
              hint='Saved as WebP, max 1600px.'
              onPick={(file) => setGallery(i, { existing: null, file })}
              onClear={() => setGallery(i, { existing: null, file: null })}
            />
          ))}
          <MediaTile
            id='video-upload'
            title='Product video'
            kind='video'
            slot={media.video}
            hint='MP4/MOV/WebM. Saved as 720p, max 20s, no sound (~2 MB).'
            onPick={(file) =>
              onChange({ ...media, video: { existing: null, file } })
            }
            onClear={() =>
              onChange({ ...media, video: { existing: null, file: null } })
            }
          />
        </div>
      </FilesDropZone>

      {dropError && (
        <p className='mt-2 text-xs font-light text-red-500'>{dropError}</p>
      )}
    </section>
  );
}
