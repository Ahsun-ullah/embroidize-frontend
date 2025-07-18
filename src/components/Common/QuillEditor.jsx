'use client';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef } from 'react';

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike', { color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
];

// Add className and id as props
export default function QuillEditor({
  value = '',
  onChange,
  placeholder = 'Write here...',
  readOnly = false,
  style = { height: '600px' },
}) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    const editorDiv = document.createElement('div');
    containerRef.current.appendChild(editorDiv);

    quillRef.current = new Quill(editorDiv, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
      placeholder,
      readOnly,
    });

    if (value) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value);
    }

    const handler = () => {
      if (onChange) onChange(quillRef.current.root.innerHTML);
    };
    quillRef.current.on('text-change', handler);

    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change', handler);
        quillRef.current = null;
      }
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value || '');
    }
  }, [value]);

  return <div ref={containerRef} style={style} />;
}
