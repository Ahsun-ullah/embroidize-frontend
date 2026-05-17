'use client';
import Cookies from 'js-cookie';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SPACES_HOST_HINT = 'embroidize-assets.';

// ---- Register Image blot that supports `alt` ----
if (typeof window !== 'undefined' && !window.__quill_image_alt_registered) {
  const BaseImage = Quill.import('formats/image');

  class ImageWithAlt extends BaseImage {
    static blotName = 'image';
    static tagName = 'IMG';

    static formats(domNode) {
      const formats = super.formats(domNode) || {};
      if (domNode.hasAttribute('alt'))
        formats.alt = domNode.getAttribute('alt');
      return formats;
    }

    format(name, value) {
      if (name === 'alt') {
        if (value) this.domNode.setAttribute('alt', value);
        else this.domNode.removeAttribute('alt');
      } else {
        super.format(name, value);
      }
    }
  }

  Quill.register(ImageWithAlt, true);
  window.__quill_image_alt_registered = true;
}

// ---- Toolbar config ----
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike', { color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  ['link', 'image'], // we'll append a custom ALT button next to these
  ['clean'],
];

// ---- Upload helpers ----
function authHeader() {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function uploadImageFile(file) {
  if (!file) throw new Error('No file');
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Image exceeds ${MAX_IMAGE_BYTES / (1024 * 1024)}MB limit`);
  }
  const fd = new FormData();
  fd.append('image', file, file.name || 'image');

  const res = await fetch(`${API_BASE}/editor/upload-image`, {
    method: 'POST',
    headers: { ...authHeader() },
    body: fd,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `Upload failed (${res.status})`);
  }
  return json.data?.url;
}

async function importImageUrl(url) {
  const res = await fetch(`${API_BASE}/editor/import-image-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ url }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `Import failed (${res.status})`);
  }
  return json.data?.url;
}

// Walk pasted HTML, replace every <img src> that isn't already on our Spaces.
// Failures keep the original src so the writer can fix it manually (matches
// Ghost/Notion behavior — they don't drop the image silently).
async function rewriteHtmlImages(html, onWarn) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const imgs = Array.from(doc.querySelectorAll('img'));
  if (imgs.length === 0) return { html, total: 0, failed: 0 };

  let failed = 0;

  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute('src') || '';
      if (!src) return;
      if (src.includes(SPACES_HOST_HINT)) return; // already ours

      try {
        if (src.startsWith('data:image/')) {
          const blob = await (await fetch(src)).blob();
          if (blob.size > MAX_IMAGE_BYTES) {
            throw new Error('Embedded image exceeds 10MB');
          }
          const ext = (blob.type.split('/')[1] || 'png').toLowerCase();
          const file = new File([blob], `pasted_${Date.now()}.${ext}`, {
            type: blob.type,
          });
          const newUrl = await uploadImageFile(file);
          if (newUrl) img.setAttribute('src', newUrl);
        } else if (/^https?:\/\//i.test(src)) {
          const newUrl = await importImageUrl(src);
          if (newUrl) img.setAttribute('src', newUrl);
        }
      } catch (err) {
        failed += 1;
        onWarn?.(src, err?.message || 'import failed');
      }
    }),
  );

  return { html: doc.body.innerHTML, total: imgs.length, failed };
}

export default function QuillEditor({
  value = '',
  onChange,
  placeholder = 'Write here...',
  readOnly = false,
  style = { height: '500px' },
  className,
  id,
}) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null); // { kind: 'uploading' | 'error', text }

  // Insert one image at the current cursor (or end), with optional alt.
  const insertImageAtCursor = useCallback((url, alt = '') => {
    const quill = quillRef.current;
    if (!quill || !url) return;
    const range = quill.getSelection(true) || {
      index: quill.getLength(),
      length: 0,
    };
    quill.insertEmbed(range.index, 'image', url, 'user');
    if (alt) quill.formatText(range.index, 1, { alt });
    quill.setSelection(range.index + 1, 0);
  }, []);

  // Single file → upload → insert
  const handleSingleFile = useCallback(
    async (file) => {
      try {
        setStatus({ kind: 'uploading', text: 'Uploading image…' });
        const url = await uploadImageFile(file);
        insertImageAtCursor(url, file.name?.replace(/\.[^.]+$/, '') || '');
        setStatus(null);
      } catch (err) {
        setStatus({ kind: 'error', text: err?.message || 'Upload failed' });
        setTimeout(() => setStatus(null), 4000);
      }
    },
    [insertImageAtCursor],
  );

  // Multiple files (drop / file picker) → upload sequentially
  const handleFiles = useCallback(
    async (files) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith('image/'),
      );
      if (imageFiles.length === 0) return;
      if (imageFiles.length === 1) {
        await handleSingleFile(imageFiles[0]);
        return;
      }
      try {
        setStatus({
          kind: 'uploading',
          text: `Uploading ${imageFiles.length} images…`,
        });
        for (const f of imageFiles) {
          // sequential keeps cursor order predictable
          // eslint-disable-next-line no-await-in-loop
          const url = await uploadImageFile(f);
          insertImageAtCursor(url, f.name?.replace(/\.[^.]+$/, '') || '');
        }
        setStatus(null);
      } catch (err) {
        setStatus({ kind: 'error', text: err?.message || 'Upload failed' });
        setTimeout(() => setStatus(null), 4000);
      }
    },
    [handleSingleFile, insertImageAtCursor],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Reset container
    containerRef.current.innerHTML = '';
    const editorDiv = document.createElement('div');
    containerRef.current.appendChild(editorDiv);

    // Init Quill
    const quill = new Quill(editorDiv, {
      theme: 'snow',
      readOnly,
      placeholder,
      modules: {
        toolbar: {
          container: TOOLBAR_OPTIONS,
          handlers: {
            // Open file picker instead of prompting for a URL
            image: function imageHandler() {
              if (readOnly) return;
              fileInputRef.current?.click();
            },
          },
        },
      },
    });
    quillRef.current = quill;

    // Add custom ALT toolbar button (for editing selected image alt)
    if (!readOnly) {
      const toolbar = quill.getModule('toolbar');
      const altBtn = document.createElement('button');
      altBtn.type = 'button';
      altBtn.className = 'ql-alt';
      altBtn.textContent = 'ALT';
      const container = toolbar.container;
      const imageBtn = container.querySelector('button.ql-image');
      if (imageBtn?.parentElement) {
        imageBtn.parentElement.insertBefore(altBtn, imageBtn.nextSibling);
      } else {
        container.appendChild(altBtn);
      }
      toolbar.addHandler('alt', () => {
        const range = quill.getSelection(true);
        if (!range) return;

        const [leaf] = quill.getLeaf(range.index);
        if (!leaf || leaf.constructor?.blotName !== 'image') {
          alert('Click an image first, then press ALT.');
          return;
        }
        const current = quill.getFormat(range).alt || '';
        const next = window.prompt('Alt text', current);
        if (next !== null) quill.format('alt', next.trim());
      });
    }

    // Double-click image to edit alt
    const onDblClick = (e) => {
      if (readOnly) return;
      const target = e.target;
      if (target && target.tagName === 'IMG') {
        const currentAlt = target.getAttribute('alt') || '';
        const nextAlt = window.prompt('Edit alt text', currentAlt);
        if (nextAlt !== null) {
          const blot = Quill.find(target);
          const index = quill.getIndex(blot);
          quill.setSelection(index, 1);
          quill.format('alt', nextAlt.trim());
        }
      }
    };
    quill.root.addEventListener('dblclick', onDblClick);

    // ---- Drag & drop files into the editor ----
    const onDragOver = (e) => {
      if (readOnly) return;
      if (e.dataTransfer?.types?.includes('Files')) {
        e.preventDefault();
      }
    };
    const onDrop = (e) => {
      if (readOnly) return;
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;
      const hasImage = Array.from(files).some((f) =>
        f.type.startsWith('image/'),
      );
      if (!hasImage) return;
      e.preventDefault();
      // Move caret to drop point if browser supports it
      let range = null;
      if (document.caretRangeFromPoint) {
        const r = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (r) {
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(r);
          range = quill.getSelection();
        }
      }
      if (!range) {
        quill.setSelection(quill.getLength(), 0);
      }
      handleFiles(files);
    };
    quill.root.addEventListener('dragover', onDragOver);
    quill.root.addEventListener('drop', onDrop);

    // ---- Paste: screenshot, embedded base64, or rich HTML with remote images ----
    const onPaste = async (e) => {
      if (readOnly) return;
      const cd = e.clipboardData;
      if (!cd) return;

      // 1) Pasted image file(s) (screenshot from OS clipboard)
      const fileItems = Array.from(cd.items || []).filter(
        (it) => it.kind === 'file' && it.type.startsWith('image/'),
      );
      if (fileItems.length > 0) {
        e.preventDefault();
        const files = fileItems.map((it) => it.getAsFile()).filter(Boolean);
        await handleFiles(files);
        return;
      }

      // 2) Rich HTML paste — rewrite <img> sources to our storage
      const html = cd.getData('text/html');
      if (html && /<img\b/i.test(html)) {
        e.preventDefault();
        const warnings = [];
        setStatus({ kind: 'uploading', text: 'Importing pasted images…' });
        try {
          const { html: rewritten, total, failed } = await rewriteHtmlImages(
            html,
            (src, msg) => warnings.push({ src, msg }),
          );
          const range = quill.getSelection(true) || {
            index: quill.getLength(),
            length: 0,
          };
          if (range.length > 0) {
            quill.deleteText(range.index, range.length, 'user');
          }
          quill.clipboard.dangerouslyPasteHTML(range.index, rewritten, 'user');
          if (failed > 0) {
            setStatus({
              kind: 'error',
              text: `Imported ${total - failed}/${total} images. ${failed} kept their original URL.`,
            });
            // eslint-disable-next-line no-console
            console.warn('Editor image import warnings:', warnings);
            setTimeout(() => setStatus(null), 5000);
          } else {
            setStatus(null);
          }
        } catch (err) {
          setStatus({
            kind: 'error',
            text: err?.message || 'Paste import failed',
          });
          setTimeout(() => setStatus(null), 4000);
        }
        return;
      }
      // Otherwise let Quill handle (plain text or HTML without images)
    };
    quill.root.addEventListener('paste', onPaste);

    // Initial content
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    // Change handler
    const onTextChange = () => {
      onChange?.(quill.root.innerHTML);
    };
    quill.on('text-change', onTextChange);

    // Cleanup
    return () => {
      quill.root.removeEventListener('dblclick', onDblClick);
      quill.root.removeEventListener('dragover', onDragOver);
      quill.root.removeEventListener('drop', onDrop);
      quill.root.removeEventListener('paste', onPaste);
      quill.off('text-change', onTextChange);
      quillRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [placeholder, readOnly, handleFiles]);

  // External value -> editor sync
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    const current = quill.root.innerHTML || '';
    if ((value || '') !== current) {
      quill.clipboard.dangerouslyPasteHTML(value || '');
    }
  }, [value]);

  return (
    <div className='relative'>
      <div ref={containerRef} style={style} className={className} id={id} />
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        multiple
        className='hidden'
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
          e.target.value = '';
        }}
      />
      {status && (
        <div
          className={`pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs shadow-md ${
            status.kind === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-black/80 text-white'
          }`}
        >
          {status.text}
        </div>
      )}
    </div>
  );
}
