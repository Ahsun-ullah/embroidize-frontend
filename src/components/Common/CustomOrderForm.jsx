'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ErrorToast } from './ErrorToast';
import { SuccessToast } from './SuccessToast';

const MAX_FILE_MB = 18;
const bytesFromMB = (mb) => mb * 1024 * 1024;

// Accepted design-source formats (validated by extension — vector files often
// report a generic MIME type). The backend enforces the same allowlist.
const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf',
  '.ai', '.eps', '.cdr', '.psd',
];
const extOf = (name) => '.' + (name.split('.').pop() || '').toLowerCase();

const FABRIC_TYPES = [
  'Cap / Hat', 'Polo / Shirt', 'Jacket / Hoodie', 'Bag', 'Towel', 'Patch', 'Other',
];
const MACHINE_FORMATS = [
  'DST', 'PES', 'JEF', 'VP3', 'HUS', 'EMB', 'EXP', 'XXX', 'Not Sure',
];
const DESIGN_TYPES = [
  'Logo', 'Text / Monogram', 'Crest / Patch', '3D Puff', 'Appliqué', 'Other',
];

const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Email is invalid.'),

  file: z
    .custom((file) => file instanceof File && file.size > 0, {
      message: 'Please upload your design file.',
    })
    .refine(
      (file) => !file || file.size <= bytesFromMB(MAX_FILE_MB),
      `Max file size ${MAX_FILE_MB}MB`,
    ),

  finishedSize: z.string().min(1, 'Finished size is required.'),
  fabricType: z.string().min(1, 'Please choose a fabric / garment type.'),
  machineFormat: z.string().min(1, 'Please choose a machine format.'),

  designType: z.string().optional().or(z.literal('')),
  // Optional USD amount. Empty input → undefined (passes); anything else must be
  // a non-negative number.
  preferredBudget: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z
      .number({ invalid_type_error: 'Enter a valid amount.' })
      .nonnegative('Budget cannot be negative.')
      .optional(),
  ),
  specialInstructions: z.string().optional(),
  rushOrder: z.boolean().optional(),
});

export default function CustomOrderForm() {
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
      name: '',
      email: '',
      file: null,
      finishedSize: '',
      fabricType: '',
      machineFormat: '',
      designType: '',
      preferredBudget: '',
      specialInstructions: '',
      rushOrder: false,
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

      if (file.size > bytesFromMB(MAX_FILE_MB)) {
        setFileMessage({
          type: 'error',
          text: `File too large. Maximum size is ${MAX_FILE_MB}MB.`,
        });
        return;
      }

      if (!ALLOWED_EXTENSIONS.includes(extOf(file.name))) {
        setFileMessage({
          type: 'error',
          text: 'Invalid file type. Accepted: JPG, PNG, PDF, AI, EPS, CDR, PSD, SVG.',
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
    setValue('file', null, { shouldValidate: true });
    setSelectedFile(null);
    setFileMessage({ type: '', text: '' });
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const resetForm = () => {
    reset({
      name: '',
      email: '',
      file: null,
      finishedSize: '',
      fabricType: '',
      machineFormat: '',
      designType: '',
      preferredBudget: '',
      specialInstructions: '',
      rushOrder: false,
    });
    setSelectedFile(null);
    setFileMessage({ type: '', text: '' });
    if (inputRef.current) inputRef.current.value = '';
  };

  const onSubmit = async (data) => {
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('email', data.email);
      fd.append('designReference', data.file);
      fd.append('finishedSize', data.finishedSize);
      fd.append('fabricType', data.fabricType);
      fd.append('machineFormat', data.machineFormat);
      if (data.designType) fd.append('designType', data.designType);
      if (data.preferredBudget != null)
        fd.append('preferredBudget', String(data.preferredBudget));
      if (data.specialInstructions)
        fd.append('specialInstructions', data.specialInstructions);
      fd.append('rushOrder', data.rushOrder ? 'true' : 'false');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/orders/custom`,
        { method: 'POST', body: fd },
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to submit order');

      const orderLine = result.data?.orderNumber
        ? ` Order #${result.data.orderNumber}.`
        : '';
      SuccessToast(
        'Thank you!',
        `We've received your design and will deliver your digitized file within 1–24 hours. Check your inbox — including your spam folder.${orderLine}`,
        5000,
      );

      resetForm();
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
    <div className='mx-auto max-w-2xl'>
      {/* Drag & Drop file upload (required) */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={selectedFile ? undefined : openFileDialog}
        className={`mb-6 rounded-xl border-2 border-dashed px-4 py-10 text-center transition ${
          dragActive ? 'border-black bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400'
        } ${selectedFile ? '' : 'cursor-pointer'}`}
      >
        <input
          ref={inputRef}
          type='file'
          accept='image/*,.pdf,.svg,.ai,.eps,.cdr,.psd'
          className='hidden'
          onChange={(e) => onDropFiles(e.target.files)}
          disabled={isSubmitting}
        />

        {selectedFile ? (
          <div className='text-left'>
            <div className='flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4'>
              <div className='flex min-w-0 flex-1 items-center gap-3'>
                <div className='flex-shrink-0 text-3xl'>📄</div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-semibold text-zinc-800'>
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
                className='ml-3 flex-shrink-0 text-sm font-semibold text-red-600 hover:text-red-800'
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
              Drag & drop your design file here <span className='text-red-500'>*</span>
            </p>
            <p className='mt-1 text-xs'>or click to upload</p>
            <p className='mt-2 text-xs text-zinc-500'>
              JPG, PNG, PDF, AI, EPS, CDR, PSD, SVG · Max {MAX_FILE_MB}MB
            </p>
          </div>
        )}
      </div>
      {errors.file && <p className={errorText}>{errors.file.message}</p>}
      {fileMessage.text && fileMessage.type === 'error' && (
        <p className={errorText}>{fileMessage.text}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className='grid gap-4'>
        {/* Name / Email */}
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='grid gap-1'>
            <span className={baseLabel}>
              Your Name <span className='text-red-500'>*</span>
            </span>
            <input
              type='text'
              {...register('name')}
              disabled={isSubmitting}
              placeholder='John Doe'
              className={baseField}
            />
            {errors.name && <span className={errorText}>{errors.name.message}</span>}
          </label>
          <label className='grid gap-1'>
            <span className={baseLabel}>
              Email Address <span className='text-red-500'>*</span>
            </span>
            <input
              type='email'
              {...register('email')}
              disabled={isSubmitting}
              placeholder='john@example.com'
              className={baseField}
            />
            <span className='text-xs text-zinc-500'>Used for file delivery.</span>
            {errors.email && <span className={errorText}>{errors.email.message}</span>}
          </label>
        </div>

        {/* Finished Size / Fabric */}
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='grid gap-1'>
            <span className={baseLabel}>
              Finished Size <span className='text-red-500'>*</span>
            </span>
            <input
              type='text'
              {...register('finishedSize')}
              disabled={isSubmitting}
              placeholder='e.g. 4 inch wide / 80mm x 50mm'
              className={baseField}
            />
            {errors.finishedSize && (
              <span className={errorText}>{errors.finishedSize.message}</span>
            )}
          </label>
          <label className='grid gap-1'>
            <span className={baseLabel}>
              Fabric / Garment Type <span className='text-red-500'>*</span>
            </span>
            <select
              {...register('fabricType')}
              disabled={isSubmitting}
              className={baseField}
            >
              <option value=''>Choose an option</option>
              {FABRIC_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.fabricType && (
              <span className={errorText}>{errors.fabricType.message}</span>
            )}
          </label>
        </div>

        {/* Machine Format / Design Type */}
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='grid gap-1'>
            <span className={baseLabel}>
              Machine Format <span className='text-red-500'>*</span>
            </span>
            <select
              {...register('machineFormat')}
              disabled={isSubmitting}
              className={baseField}
            >
              <option value=''>Choose an option</option>
              {MACHINE_FORMATS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.machineFormat && (
              <span className={errorText}>{errors.machineFormat.message}</span>
            )}
          </label>
          <label className='grid gap-1'>
            <span className={baseLabel}>Design Type</span>
            <select
              {...register('designType')}
              disabled={isSubmitting}
              className={baseField}
            >
              <option value=''>Choose an option</option>
              {DESIGN_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Preferred Budget */}
        <label className='grid gap-1'>
          <span className={baseLabel}>
            Preferred Budget{' '}
            <span className='font-normal text-zinc-400'>(optional, USD)</span>
          </span>
          <div className='relative'>
            <span className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500'>
              $
            </span>
            <input
              type='number'
              min='0'
              step='1'
              inputMode='decimal'
              {...register('preferredBudget')}
              disabled={isSubmitting}
              placeholder='e.g. 15'
              className={`${baseField} pl-7`}
            />
          </div>
          {errors.preferredBudget && (
            <span className={errorText}>{errors.preferredBudget.message}</span>
          )}
        </label>

        {/* Special Instructions */}
        <label className='grid gap-1'>
          <span className={baseLabel}>Special Instructions</span>
          <textarea
            rows={4}
            {...register('specialInstructions')}
            disabled={isSubmitting}
            placeholder='Anything else we should know — placement, density, deadlines, etc.'
            className={baseField}
          />
        </label>

        {/* Rush order */}
        <label className='flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3'>
          <input
            type='checkbox'
            {...register('rushOrder')}
            disabled={isSubmitting}
            className='mt-1 h-4 w-4 accent-black'
          />
          <span className='text-sm text-zinc-800'>
            <span className='font-semibold'>Rush Order</span> — deliver within 2 hours{' '}
            <span className='font-semibold'>(+$5)</span>
          </span>
        </label>

        {/* Submit */}
        <button
          type='submit'
          className='rounded-lg bg-black px-5 py-3.5 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className='flex items-center justify-center gap-2'>
              <svg className='h-5 w-5 animate-spin' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
              Submitting Order...
            </span>
          ) : (
            'Send My Design & Place Order →'
          )}
        </button>

        <p className='text-center text-xs text-gray-600'>
          By submitting this form, you agree to our terms and conditions.
        </p>
      </form>

      {/* Contact-first note */}
      <p className='mt-6 text-center text-sm text-zinc-600'>
        Prefer to contact us first?{' '}
        <a href='/contact-us' className='font-semibold text-black underline'>
          Email us
        </a>{' '}
        — we respond within 1 hour.
      </p>
    </div>
  );
}
