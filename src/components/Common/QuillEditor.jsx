'use client';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef } from 'react';

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
          // Custom handler: insert image with ALT prompt
          handlers: {
            image: function imageHandler() {
              if (readOnly) return;
              const url = window.prompt('Image URL');
              if (!url) return;

              const alt = window.prompt('Alt text (optional)') || '';
              const range = quill.getSelection(true) || {
                index: quill.getLength(),
                length: 0,
              };
              quill.insertEmbed(range.index, 'image', url, 'user');
              if (alt) quill.formatText(range.index, 1, { alt });
              quill.setSelection(range.index + 1, 0);
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
      // place after the image button
      const container = toolbar.container;
      const imageBtn = container.querySelector('button.ql-image');
      if (imageBtn?.parentElement) {
        imageBtn.parentElement.insertBefore(altBtn, imageBtn.nextSibling);
      } else {
        container.appendChild(altBtn);
      }
      // Handler for our custom button
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
      quill.off('text-change', onTextChange);
      quillRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [placeholder, readOnly]);

  // External value -> editor sync
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    const current = quill.root.innerHTML || '';
    if ((value || '') !== current) {
      quill.clipboard.dangerouslyPasteHTML(value || '');
    }
  }, [value]);

  return <div ref={containerRef} style={style} className={className} id={id} />;
}
