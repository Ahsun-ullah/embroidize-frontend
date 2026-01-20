'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ErrorToast } from './ErrorToast';
import { SuccessToast } from './SuccessToast';

const MAX_FILE_MB = 18;
const bytesFromMB = (mb) => mb * 1024 * 1024;

// Schema: only name & email required
const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Email is invalid.'),
  details: z.string().optional(),

  file: z
    .custom((file) => !file || (file instanceof File && file.size > 0))
    .refine(
      (file) => !file || file.size <= bytesFromMB(MAX_FILE_MB),
      `Max file size ${MAX_FILE_MB}MB`,
    )
    .optional(),

  // Transform empty strings to undefined, then make optional
  fileFormat: z
    .enum(['DST', 'PES', 'EMB', 'PDF', 'PNG', 'All'])
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  turnaround: z
    .enum(['Standard (4–8h)', 'Rush (2–4h)', 'Next Day'])
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  complexity: z
    .enum(['Simple', 'Medium', 'Complex'])
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  sizeWidth: z
    .string()
    .transform((val) => (val === '' ? undefined : parseFloat(val)))
    .pipe(z.number().min(0.1).max(100).optional()),

  sizeHeight: z
    .string()
    .transform((val) => (val === '' ? undefined : parseFloat(val)))
    .pipe(z.number().min(0.1).max(100).optional()),

  sizeUnit: z
    .enum(['in', 'cm'])
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
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
      name: '',
      email: '',
      details: '',
      file: null,
      fileFormat: '',
      turnaround: '',
      complexity: '',
      sizeWidth: '',
      sizeHeight: '',
    },
  });

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMessage, setFileMessage] = useState({ type: '', text: '' });
  const inputRef = useRef(null);

  const baseField =
    'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-black focus:ring-4 focus:ring-black/10 disabled:bg-gray-100 disabled:cursor-not-allowed';
  const baseLabel = 'text-sm font-medium text-zinc-800';
  const errorText = 'mt-1 text-sm text-red-600';

  const onDropFiles = useCallback(
    (files) => {
      if (!files?.length) return;
      const file = files[0];

      // Validate file size
      if (file.size > bytesFromMB(MAX_FILE_MB)) {
        setFileMessage({
          type: 'error',
          text: `File too large. Maximum size is ${MAX_FILE_MB}MB.`,
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'image/svg+xml',
      ];

      if (!allowedTypes.includes(file.type)) {
        setFileMessage({
          type: 'error',
          text: 'Invalid file type. Please upload an image or PDF file.',
        });
        return;
      }

      setValue('file', file, { shouldValidate: true });
      setSelectedFile(file);
      setFileMessage({ type: 'success', text: `Selected: ${file.name}` });
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

  const clearFile = () => {
    setValue('file', null);
    setSelectedFile(null);
    setFileMessage({ type: '', text: '' });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const onSubmit = async (data) => {
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('email', data.email);
      if (data.details) fd.append('details', data.details);
      if (data.file) fd.append('designReference', data.file);
      if (data.fileFormat) fd.append('fileFormat', data.fileFormat);
      if (data.turnaround) fd.append('turnaround', data.turnaround);
      if (data.complexity) fd.append('complexity', data.complexity);
      if (data.sizeWidth) fd.append('sizeWidth', String(data.sizeWidth));
      if (data.sizeHeight) fd.append('sizeHeight', String(data.sizeHeight));
      if (data.sizeUnit) fd.append('sizeUnit', data.sizeUnit);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/orders/custom`,
        {
          method: 'POST',
          body: fd,
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to submit order');
      }

      const successMessage = result.data?.orderNumber
        ? `${result.message || 'Order submitted successfully!'} Order #${result.data.orderNumber}`
        : result.message || 'Order submitted successfully!';

      SuccessToast('Success', successMessage, 3000);

      // Reset form completely
      reset({
        sizeUnit: 'in',
        name: '',
        email: '',
        details: '',
        file: null,
        fileFormat: '',
        turnaround: '',
        complexity: '',
        sizeWidth: '',
        sizeHeight: '',
      });

      setSelectedFile(null);
      setFileMessage({ type: '', text: '' });
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      console.error('Order submission error:', error);
      ErrorToast(
        'Error',
        error?.message || 'Failed to submit order. Please try again.',
        3000,
      );
    }
  };

  return (
    <section id={orderForm} className='mx-auto mb-14 max-w-xl px-4 sm:px-0'>
      <h2 className='mb-6 text-center text-2xl font-bold'>Custom Order Form</h2>

      {/* Drag & Drop */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={selectedFile ? undefined : openFileDialog}
        className={`mb-6 rounded-xl border-2 border-dashed px-4 py-10 text-center transition ${
          dragActive
            ? 'border-black bg-zinc-50'
            : 'border-zinc-300 hover:border-zinc-400'
        } ${selectedFile ? '' : 'cursor-pointer'}`}
      >
        <input
          ref={inputRef}
          type='file'
          accept='image/*,.pdf,.svg'
          className='hidden'
          onChange={(e) => onDropFiles(e.target.files)}
          disabled={isSubmitting}
        />

        {selectedFile ? (
          <div className='text-left'>
            <div className='flex items-center justify-between bg-white rounded-lg p-4 border border-zinc-200'>
              <div className='flex items-center gap-3 flex-1 min-w-0'>
                <div className='text-3xl flex-shrink-0'>📄</div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-zinc-800 truncate'>
                    {selectedFile.name}
                  </p>
                  <p className='text-xs text-zinc-500'>
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className='ml-3 text-red-600 hover:text-red-800 font-semibold text-sm flex-shrink-0'
                disabled={isSubmitting}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className='text-zinc-700'>
            <div className='mb-2 text-3xl'>⬆️</div>
            <p className='text-sm font-semibold'>
              Drag & drop your design files here
            </p>
            <p className='text-xs mt-1'>or click to upload</p>
            <p className='mt-2 text-xs text-zinc-500'>
              Supported: Images, PDF, SVG (Max {MAX_FILE_MB}MB)
            </p>
          </div>
        )}
      </div>
      {errors.file && <p className={errorText}>{errors.file.message}</p>}
      {fileMessage.text && fileMessage.type === 'error' && (
        <p className={errorText}>{fileMessage.text}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className='grid gap-4'>
        {/* Name / Email (required) */}
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='grid gap-1'>
            <span className={baseLabel}>
              Name <span className='text-red-500'>*</span>
            </span>
            <input
              type='text'
              {...register('name')}
              required
              disabled={isSubmitting}
              placeholder='John Doe'
              className={baseField}
            />
            {errors.name && (
              <span className={errorText}>{errors.name.message}</span>
            )}
          </label>
          <label className='grid gap-1'>
            <span className={baseLabel}>
              Email <span className='text-red-500'>*</span>
            </span>
            <input
              type='email'
              {...register('email')}
              required
              disabled={isSubmitting}
              placeholder='john@example.com'
              className={baseField}
            />
            {errors.email && (
              <span className={errorText}>{errors.email.message}</span>
            )}
          </label>
        </div>

        {/* File Format / Turnaround (optional) */}
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='grid gap-1'>
            <span className={baseLabel}>File Format</span>
            <select
              {...register('fileFormat')}
              className={baseField}
              disabled={isSubmitting}
            >
              <option value=''>Choose an option</option>
              <option value='DST'>DST</option>
              <option value='PES'>PES</option>
              <option value='EMB'>EMB</option>
              <option value='PDF'>PDF</option>
              <option value='PNG'>PNG</option>
              <option value='All'>All Formats</option>
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
              disabled={isSubmitting}
            >
              <option value=''>Choose an option</option>
              <option value='Standard (4–8h)'>Standard (4–8h)</option>
              <option value='Rush (2–4h)'>Rush (2–4h)</option>
              <option value='Next Day'>Next Day</option>
            </select>
            {errors.turnaround && (
              <span className={errorText}>{errors.turnaround.message}</span>
            )}
          </label>
        </div>

        {/* Size / Complexity (optional) */}
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='grid gap-1'>
            <span className={baseLabel}>Size</span>
            <div className='flex gap-2'>
              <input
                type='number'
                step='0.1'
                placeholder='Width'
                disabled={isSubmitting}
                {...register('sizeWidth')}
                className={baseField}
              />
              <input
                type='number'
                step='0.1'
                placeholder='Height'
                disabled={isSubmitting}
                {...register('sizeHeight')}
                className={baseField}
              />
              <select
                {...register('sizeUnit')}
                disabled={isSubmitting}
                className={baseField}
              >
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
              disabled={isSubmitting}
            >
              <option value=''>Choose an option</option>
              <option value='Simple'>Simple</option>
              <option value='Medium'>Medium</option>
              <option value='Complex'>Complex</option>
            </select>
            {errors.complexity && (
              <span className={errorText}>{errors.complexity.message}</span>
            )}
          </label>
        </div>

        {/* Additional Details (optional) */}
        <label className='grid gap-1'>
          <span className={baseLabel}>Additional Details</span>
          <textarea
            rows={4}
            {...register('details')}
            disabled={isSubmitting}
            placeholder='Please describe your design requirements, color preferences, special instructions, etc.'
            className={baseField}
          />
          {errors.details && (
            <span className={errorText}>{errors.details.message}</span>
          )}
        </label>

        {/* Submit */}
        <button
          type='submit'
          className='rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className='flex items-center justify-center gap-2'>
              <svg
                className='animate-spin h-5 w-5'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Submitting Order...
            </span>
          ) : (
            'Submit Order'
          )}
        </button>

        <p className='text-xs text-center text-gray-600'>
          By submitting this form, you agree to our terms and conditions.
        </p>
      </form>
    </section>
  );
}
