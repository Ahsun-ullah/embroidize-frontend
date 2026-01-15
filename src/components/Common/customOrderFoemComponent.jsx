'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const MAX_FILE_MB = 18;
const bytesFromMB = (mb) => mb * 1024 * 1024;

// Schema
const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Email is invalid.'),
  details: z.string().min(1, 'Order details required.'),
  // primary file via dropzone
  file: z
    .custom(
      (file) => file instanceof File && file.size > 0,
      'Please upload a design file.',
    )
    .refine(
      (file) => file && file.size <= bytesFromMB(MAX_FILE_MB),
      `Max file size ${MAX_FILE_MB}MB`,
    ),
  // extra fields
  fileFormat: z.enum(['DST', 'PES', 'EMB', 'PDF', 'PNG', 'All'], {
    required_error: 'Choose a format',
  }),
  turnaround: z.enum(['Standard (4–8h)', 'Rush (2–4h)', 'Next Day'], {
    required_error: 'Choose turnaround',
  }),
  complexity: z.enum(['Simple', 'Medium', 'Complex'], {
    required_error: 'Choose complexity',
  }),
  sizeWidth: z.coerce
    .number()
    .min(0.1, 'Enter width')
    .max(100, 'Width too large'),
  sizeHeight: z.coerce
    .number()
    .min(0.1, 'Enter height')
    .max(100, 'Height too large'),
  sizeUnit: z.enum(['in', 'cm']),
});

export default function CustomOrderForm({ orderForm }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      sizeUnit: 'in',
    },
  });

  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const baseField =
    'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-black focus:ring-4 focus:ring-black/10';
  const baseLabel = 'text-sm font-medium text-zinc-800';
  const errorText = 'mt-1 text-sm text-red-600';

  const onDropFiles = useCallback(
    (files) => {
      if (!files?.length) return;
      const file = files[0];
      if (file.size > bytesFromMB(MAX_FILE_MB)) {
        setMessage(`File too large. Max ${MAX_FILE_MB}MB.`);
        return;
      }
      setValue('file', file, { shouldValidate: true });
      setMessage(`Selected: ${file.name}`);
    },
    [setValue],
  );

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onDropFiles(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => inputRef.current?.click();

  const onSubmit = async (data) => {
    const fd = new FormData();
    fd.append('name', data.name);
    fd.append('email', data.email);
    fd.append('details', data.details);
    fd.append('designReference', data.file);
    fd.append('fileFormat', data.fileFormat);
    fd.append('turnaround', data.turnaround);
    fd.append('complexity', data.complexity);
    fd.append('sizeWidth', String(data.sizeWidth));
    fd.append('sizeHeight', String(data.sizeHeight));
    fd.append('sizeUnit', data.sizeUnit);

    setMessage('');
    const res = await fetch('/api/order', { method: 'POST', body: fd });
    const result = await res.json();
    setMessage(result.message || 'Order submitted!');
    reset({ sizeUnit: 'in' });
  };

  return (
    <section id={orderForm} className='mx-auto mb-14 max-w-xl'>
      <h2 className='mb-6 text-center text-2xl font-bold'>Order Form</h2>

      {/* Drag & Drop */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`mb-6 grid cursor-pointer place-items-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition ${
          dragActive ? 'border-black bg-zinc-50' : 'border-zinc-300'
        }`}
      >
        <input
          ref={inputRef}
          type='file'
          accept='image/*,.pdf'
          className='hidden'
          onChange={(e) => onDropFiles(e.target.files)}
        />
        <div className='text-zinc-700'>
          <div className='mb-2 text-3xl'>⬆</div>
          <p className='text-sm font-semibold'>
            Drag & drop your design files here
          </p>
          <p className='text-xs'>or click to upload</p>
          <p className='mt-1 text-xs text-zinc-500'>(Max {MAX_FILE_MB}MB)</p>
        </div>
      </div>
      {errors.file && <p className={errorText}>{errors.file.message}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className='grid gap-4'>
        {/* Name / Email */}
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='grid gap-1'>
            <span className={baseLabel}>Name</span>
            <input
              type='text'
              {...register('name')}
              required
              className={baseField}
            />
            {errors.name && (
              <span className={errorText}>{errors.name.message}</span>
            )}
          </label>
          <label className='grid gap-1'>
            <span className={baseLabel}>Email</span>
            <input
              type='email'
              {...register('email')}
              required
              className={baseField}
            />
            {errors.email && (
              <span className={errorText}>{errors.email.message}</span>
            )}
          </label>
        </div>

        {/* File Format / Turnaround */}
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='grid gap-1'>
            <span className={baseLabel}>File Format</span>
            <select
              {...register('fileFormat')}
              className={baseField}
              defaultValue=''
            >
              <option value='' disabled>
                Choose an option
              </option>
              <option value='DST'>DST</option>
              <option value='PES'>PES</option>
              <option value='EMB'>EMB</option>
              <option value='PDF'>PDF</option>
              <option value='PNG'>PNG</option>
              <option value='All'>All</option>
            </select>
            {errors.fileFormat && (
              <span className={errorText}>{errors.fileFormat.message}</span>
            )}
          </label>

          <label className='grid gap-1'>
            <span className={baseLabel}>Turnaround</span>
            <select
              {...register('turnaround')}
              className={baseField}
              defaultValue=''
            >
              <option value='' disabled>
                Choose an option
              </option>
              <option value='Standard (4–8h)'>Standard (4–8h)</option>
              <option value='Rush (2–4h)'>Rush (2–4h)</option>
              <option value='Next Day'>Next Day</option>
            </select>
            {errors.turnaround && (
              <span className={errorText}>{errors.turnaround.message}</span>
            )}
          </label>
        </div>

        {/* Size / Complexity */}
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='grid gap-1'>
            <span className={baseLabel}>Size</span>
            <div className='flex gap-2'>
              <input
                type='number'
                step='0.1'
                placeholder='Width'
                {...register('sizeWidth')}
                className={baseField}
              />
              <input
                type='number'
                step='0.1'
                placeholder='Height'
                {...register('sizeHeight')}
                className={baseField}
              />
              <select {...register('sizeUnit')} className={baseField}>
                <option value='in'>in</option>
                <option value='cm'>cm</option>
              </select>
            </div>
            {(errors.sizeWidth || errors.sizeHeight) && (
              <span className={errorText}>
                {errors.sizeWidth?.message || errors.sizeHeight?.message}
              </span>
            )}
          </label>

          <label className='grid gap-1'>
            <span className={baseLabel}>Complexity</span>
            <select
              {...register('complexity')}
              className={baseField}
              defaultValue=''
            >
              <option value='' disabled>
                Choose an option
              </option>
              <option value='Simple'>Simple</option>
              <option value='Medium'>Medium</option>
              <option value='Complex'>Complex</option>
            </select>
            {errors.complexity && (
              <span className={errorText}>{errors.complexity.message}</span>
            )}
          </label>
        </div>

        {/* Additional Details */}
        <label className='grid gap-1'>
          <span className={baseLabel}>Additional Details</span>
          <textarea
            rows={4}
            {...register('details')}
            required
            className={baseField}
          />
          {errors.details && (
            <span className={errorText}>{errors.details.message}</span>
          )}
        </label>

        {/* Submit */}
        <button
          type='submit'
          className='rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-white/90 hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-60'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Order'}
        </button>

        {message && (
          <p className='text-sm font-medium text-green-600'>{message}</p>
        )}
      </form>
    </section>
  );
}
