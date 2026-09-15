import { useEffect, useState } from 'react';

// Which slot a dropped file belongs in, decided by the file itself. This is
// what lets the whole Files section be one drop target: drag a .zip, a .emb, a
// .pdf and a cover image onto it together and each lands in the right place.
// Returns null for anything the product form has no home for.
export const matchFileToSlot = (file) => {
  const name = String(file?.name || '').toLowerCase();
  if (name.endsWith('.zip')) return 'file';
  if (name.endsWith('.emb')) return 'emb_file';
  if (name.endsWith('.pdf')) return 'product_pdf';
  if (file?.type?.startsWith('image/')) return 'image';
  return null;
};

// Wraps the tiles so a drop anywhere in the section — including the gaps
// between tiles — is caught and routed. A drop landing on a tile is handled by
// that tile instead; it stops propagation before this ever sees it.
export const FilesDropZone = ({ onFiles, children }) => {
  const [active, setActive] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive(true);
      }}
      onDragLeave={(e) => {
        // dragleave also fires when the cursor crosses onto a child element,
        // which would flicker the highlight off mid-drag.
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setActive(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive(false);
        onFiles(Array.from(e.dataTransfer?.files || []));
      }}
      className={`relative rounded-lg border-2 border-dashed p-2 transition-colors ${
        active ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
      }`}
    >
      {children}

      {active && (
        <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 text-sm font-semibold text-gray-900'>
          Drop files — each one goes to its matching slot
        </div>
      )}
    </div>
  );
};

// One slot in the Files row. Controlled: what it shows comes from the form
// value, so a file routed here by a section drop appears immediately, exactly
// as if it had been dropped on this tile.
//
// `extension` is validated here on purpose. The `accept` attribute only filters
// the browse dialog — and even there the user can switch it to "All Files" —
// while dropped files skip it entirely. Without this check a .rar/.7z/renamed
// pack looked accepted, then the server's upload filter discarded it and the
// product was created with no design files at all.
export const FileDropTile = ({
  id,
  title,
  badge,
  required = false,
  accept,
  extension,
  isImage = false,
  hint,
  error,
  file,
  existingName,
  existingPreview,
  onSelect,
}) => {
  const [localError, setLocalError] = useState(null);
  const [preview, setPreview] = useState(existingPreview || null);

  // A file chosen anywhere (this tile, or the section drop) clears whatever
  // complaint was on screen, and drives the thumbnail.
  useEffect(() => {
    if (file instanceof File) setLocalError(null);

    if (!isImage) return undefined;

    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    setPreview(existingPreview || null);
    return undefined;
  }, [file, existingPreview, isImage]);

  const reject = (message) => {
    setLocalError(message);
    onSelect(null);
  };

  const handleFile = (picked) => {
    if (!picked) return;

    if (isImage && !picked.type?.startsWith('image/')) {
      reject(`"${picked.name}" is not an image.`);
      return;
    }

    if (extension && !picked.name.toLowerCase().endsWith(`.${extension}`)) {
      reject(
        extension === 'zip'
          ? `"${picked.name}" is not a .zip file. Pack the design files into a ZIP archive and upload that.`
          : `"${picked.name}" is not a .${extension} file. This slot accepts .${extension} only.`,
      );
      return;
    }

    if (picked.size === 0) {
      reject(`"${picked.name}" is empty (0 bytes).`);
      return;
    }

    setLocalError(null);
    onSelect(picked);
  };

  const chosen = file instanceof File;
  const shownName = chosen ? file.name : existingName;

  // Deliberately NOT its own drop target: FilesDropZone catches every drop in
  // the section and routes it by what the file is. A tile that also handled
  // drops would reject a .emb dropped on the ZIP tile that the section would
  // happily have filed one slot over.
  return (
    <div
      className={`flex h-full flex-col items-center rounded-md border px-3 py-3 text-center transition-colors ${
        chosen ? 'border-gray-400 bg-white' : 'border-gray-300 bg-white'
      }`}
    >
      {isImage && preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt='Preview'
          className='h-12 w-12 shrink-0 rounded object-cover'
        />
      ) : (
        <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] font-semibold uppercase tracking-wide text-gray-500'>
          {badge}
        </span>
      )}

      <p className='mt-2 text-sm font-medium text-gray-800'>
        {title} {required && <span className='text-red-600'>*</span>}
      </p>

      <p
        className={`mt-0.5 w-full truncate text-xs ${
          chosen ? 'font-medium text-gray-700' : 'text-gray-400'
        }`}
        title={shownName || undefined}
      >
        {shownName || 'Drag here or browse'}
      </p>

      <label
        htmlFor={id}
        className='mt-2 cursor-pointer rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-black'
      >
        Browse
      </label>
      <input
        id={id}
        type='file'
        accept={accept}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className='hidden'
      />

      {hint && !localError && !error && (
        <p className='mt-2 text-[11px] leading-snug text-gray-400'>{hint}</p>
      )}
      {(localError || error) && (
        <p className='mt-2 text-[11px] font-light leading-snug text-red-500'>
          {localError || error}
        </p>
      )}
    </div>
  );
};
