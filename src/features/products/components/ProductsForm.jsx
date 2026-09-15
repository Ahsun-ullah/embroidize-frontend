'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  useGetPublicProductCategoriesQuery,
  useGetPublicProductSubCategoriesQuery,
} from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import {
  useAddProductMutation,
  useUpdateProductMutation,
} from '@/lib/redux/admin/protectedProducts/protectedProductSlice';
import { useAllProductsQuery } from '@/lib/redux/public/products/productSlice';
import { productSchema } from '@/lib/zodValidation/productValidation';
import { slugify } from '@/utils/functions/page';
import { zodResolver } from '@hookform/resolvers/zod';
import MDEditor from '@uiw/react-md-editor';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import {
  FileDropTile,
  FilesDropZone,
  matchFileToSlot,
} from './FileDragAndDropInput';
// import { CreatableTagsInput } from './TagsInput';

// Field chrome shared by every input below, so a compact form does not mean a
// dozen repeated utility classes per element.
const SECTION = 'rounded-lg border border-gray-200 bg-white p-4';
const SECTION_TITLE =
  'mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500';
const LABEL = 'mb-1 block text-sm font-medium text-gray-700';
const INPUT =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-900';
const ERROR = 'mt-1 text-xs font-light text-red-500';

// react-select ships at 16px with a 38px+ control; bring it in line with the
// plain inputs beside it.
const SELECT_STYLES = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    borderRadius: 6,
    fontSize: 14,
    boxShadow: 'none',
    borderColor: state.isFocused ? '#111827' : '#d1d5db',
    ':hover': { borderColor: state.isFocused ? '#111827' : '#d1d5db' },
  }),
  menu: (base) => ({ ...base, fontSize: 14, zIndex: 30 }),
  placeholder: (base) => ({ ...base, fontSize: 14 }),
};

// Status and pricing tier are one click each, so they get a click-sized
// control rather than a labelled block apiece.
const Segmented = ({ value, onChange, options }) => (
  <div className='inline-flex shrink-0 overflow-hidden rounded-md border border-gray-300'>
    {options.map((option) => (
      <button
        key={String(option.value)}
        type='button'
        onClick={() => onChange(option.value)}
        className={`px-3 py-1 text-[11px] font-semibold transition-colors ${
          value === option.value
            ? option.tone === 'danger'
              ? 'bg-red-600 text-white'
              : 'bg-gray-900 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export function ProductsForm({ product }) {
  const router = useRouter();
  const [categoryOption, setCategoryOption] = useState([]);
  const [subCategoryOption, setSubCategoryOption] = useState([]);
  const [description, setDescription] = useState(product?.description || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [slug, setSlug] = useState(product?.slug || '');
  const searchParams = useSearchParams();
  const pageNumber = searchParams.get('pageNumber') || '1';
  const { data: categoryData } = useGetPublicProductCategoriesQuery();
  const { data: subCategoryData } = useGetPublicProductSubCategoriesQuery();
  const [addProduct] = useAddProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const { refetch: allProductRefetch } = useAllProductsQuery();

  // `dropError` reports files dropped on the Files section that belong in no
  // slot — a per-tile error has nowhere to appear for those.
  const [dropError, setDropError] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    // The file tiles render from the form value, so a file routed by a section
    // drop shows up on the right tile without any local state to keep in sync.
    watch,
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      price: null,
      sku_code: '',
      description: '',
      category: '',
      sub_category: '',
      meta_description: '',
      meta_title: '',
      meta_keywords: [],
      image: null,
      file: null,
      emb_file: null,
      product_pdf: null,
      // New products default to premium + active.
      isFree: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name ?? '',
        slug: product.slug ?? '',
        category: product.category?._id ?? '',
        sub_category: product.sub_category?._id ?? '',
        price: product.price ?? null,
        sku_code: product.sku_code ?? '',
        description: product.description ?? '',
        meta_title: product.meta_title ?? '',
        meta_description: product.meta_description ?? '',
        meta_keywords: product.meta_keywords ?? [],
        image: product.image ?? null,
        file: product.file ?? null,
        // Always blank on load: the EMB slot is an action ("merge this file
        // in"), not a stored value, so it must not look pre-filled on an edit.
        emb_file: null,
        product_pdf: product.product_pdf ?? null,
        // Missing flags fall back to premium + active (matches the backend).
        isFree: product.isFree ?? false,
        isActive: product.isActive ?? true,
      });
      setDescription(product.description ?? '');
      setSlug(product.slug ?? '');
    }
    if (product?.category?._id) {
      setSelectedCategory(product.category._id);
    }
  }, [product, reset]);

  useEffect(() => {
    if (categoryData?.data) {
      if (Array.isArray(categoryData.data) && categoryData.data.length > 0) {
        const formattedCategory = categoryData.data.map((cat) => ({
          label: cat.name || 'Unnamed Category',
          value: cat._id,
        }));
        setCategoryOption(formattedCategory);
      } else {
        setCategoryOption([]);
      }
    }

    if (subCategoryData?.data) {
      if (
        Array.isArray(subCategoryData.data) &&
        subCategoryData.data.length > 0
      ) {
        const formattedSubCategory = subCategoryData.data.map((subcat) => ({
          label: subcat.name || 'Unnamed Subcategory',
          value: subcat._id,
          categoryId: subcat.category,
        }));
        setSubCategoryOption(formattedSubCategory);
      } else {
        setSubCategoryOption([]);
      }
    }
  }, [categoryData, subCategoryData]);

  const handleNameChange = (e) => {
    const nameValue = e.target.value;
    setSlug(slugify(nameValue));
    setValue('name', nameValue);
  };

  const onSubmit = async (data) => {
    try {
      // The design file is marked required on the label but is optional in the
      // shared zod schema (edits legitimately omit it). Enforce it here for
      // creates only — a product published without a ZIP shows an empty format
      // list to customers and cannot be downloaded at all.
      if (!product?._id && !(data.file instanceof File)) {
        ErrorToast(
          'Design file missing',
          'Attach the .zip design pack before saving a new product.',
          4000,
        );
        return;
      }

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (
            key === 'image' ||
            key === 'file' ||
            key === 'emb_file' ||
            key === 'product_pdf'
          ) {
            if (value instanceof File) {
              formData.append(key, value);
            }
          } else if (key === 'meta_keywords') {
            value.forEach((tag, index) => {
              formData.append(`meta_keywords[${index}]`, tag);
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      if (product?._id) {
        formData.append('id', product._id);
        const response = await updateProduct(formData).unwrap();
        if (response.error) {
          ErrorToast('Error', response.error.data.message || 'API Error', 3000);
        } else {
          SuccessToast(
            'Success',
            response.data.message || 'Action successfully done!',
            3000,
          );
          try {
            await allProductRefetch();
            reset();
            setDescription('');
            router.push(`/admin/all-products?page=${pageNumber}`);
            router.refresh();
          } catch (err) {
            console.error('Refetch failed:', err);
            ErrorToast('Error', 'Failed to refresh product list.', 3000);
          }
        }
      } else {
        // Here you would typically make an API call
        const response = await addProduct(formData).unwrap();
        if (response.error) {
          ErrorToast('Error', response.error.data.message || 'API Error', 3000);
        } else {
          SuccessToast(
            'Success',
            response.data.message || 'Action successfully done!',
            3000,
          );
          allProductRefetch();
          reset();
          setDescription('');
          router.push('/admin/all-products');
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      ErrorToast('Error', error?.data?.message, 3000);
    }
  };

  // The EMB slot replaces an existing .emb rather than adding a second one, so
  // the hint under it has to say which of the two is about to happen.
  const hasEmb =
    Array.isArray(product?.available_file_types) &&
    product.available_file_types.some((t) => String(t).toLowerCase() === 'emb');

  // A drop on the Files section as a whole: sort each file into its slot by
  // what it is, so the admin can drag the cover, the pack, the EMB and the PDF
  // over in one go instead of aiming at four separate targets.
  const handleDroppedFiles = (files) => {
    const rejected = [];

    files.forEach((file) => {
      const field = matchFileToSlot(file);
      if (!field || file.size === 0) {
        rejected.push(file.name);
        return;
      }
      setValue(field, file, { shouldDirty: true });
    });

    setDropError(
      rejected.length
        ? `Not accepted: ${rejected.join(', ')} — drop a .zip, .emb, .pdf or an image.`
        : null,
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
      {/* Action bar — stays in view so saving never means scrolling back up */}
      <div className='sticky top-0 z-20 mb-4 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3'>
        <div className='min-w-0'>
          <h2 className='text-base font-semibold text-gray-900'>
            {product ? 'Edit product' : 'New product'}
          </h2>
          {product?.name && (
            <p className='truncate text-xs text-gray-500'>{product.name}</p>
          )}
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <button
            type='button'
            onClick={() =>
              router.push(`/admin/all-products?page=${pageNumber}`)
            }
            className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isSubmitting}
            className={`rounded-md bg-slate-800 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400 ${
              isSubmitting ? 'cursor-wait' : ''
            }`}
          >
            {isSubmitting ? (
              <LoadingSpinner />
            ) : product ? (
              'Update Product'
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        {/* ---------------- Main column ---------------- */}
        <div className='flex flex-col gap-4 lg:col-span-2'>
          <section className={SECTION}>
            <h3 className={SECTION_TITLE}>Product details</h3>

            <div className='mb-3'>
              <label className={LABEL} htmlFor='name'>
                Product Name <span className='text-red-600'>*</span>
              </label>
              <input
                id='name'
                placeholder='Product Name'
                {...register('name')}
                onChange={handleNameChange}
                className={INPUT}
              />
              {errors.name && <p className={ERROR}>{errors.name.message}</p>}
            </div>

            <div className='mb-3'>
              <label className={LABEL} htmlFor='slug'>
                Slug <span className='text-red-600'>*</span>
              </label>
              <input
                id='slug'
                placeholder='product-slug'
                {...register('slug')}
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className={INPUT}
              />
              {errors.slug && <p className={ERROR}>{errors.slug.message}</p>}
            </div>

            <div data-color-mode='light'>
              <label className={LABEL} htmlFor='description'>
                Description <span className='text-red-600'>*</span>
              </label>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <MDEditor
                    {...field}
                    value={description}
                    onChange={(value) => {
                      setDescription(value);
                      field.onChange(value);
                    }}
                    preview='edit'
                    height={220}
                    textareaProps={{
                      placeholder: 'Enter Product Description',
                    }}
                    previewOptions={{
                      disallowedElements: ['style'],
                    }}
                    className='overflow-hidden rounded-md'
                  />
                )}
              />
              {errors.description && (
                <p className={ERROR}>{errors.description.message}</p>
              )}
            </div>
          </section>

          <section className={SECTION}>
            <h3 className={SECTION_TITLE}>Search engine listing</h3>

            <div className='mb-3'>
              <label className={LABEL} htmlFor='meta_title'>
                Meta Title <span className='text-red-600'>*</span>
              </label>
              <input
                id='meta_title'
                placeholder='Meta title'
                {...register('meta_title')}
                className={INPUT}
              />
              {errors.meta_title && (
                <p className={ERROR}>{errors.meta_title.message}</p>
              )}
            </div>

            <div className='mb-3'>
              <label className={LABEL} htmlFor='meta_description'>
                Meta Description <span className='text-red-600'>*</span>
              </label>
              <textarea
                rows={3}
                id='meta_description'
                placeholder='Meta description'
                {...register('meta_description')}
                className={INPUT}
              />
              {errors.meta_description && (
                <p className={ERROR}>{errors.meta_description.message}</p>
              )}
            </div>
            {/*
            <div>
              <label className={LABEL} htmlFor='meta_keywords'>
                Product Tags <span className='text-red-600'>*</span>
              </label>
              <Controller
                name='meta_keywords'
                control={control}
                render={({ field }) => (
                  <CreatableTagsInput
                    value={field.value || []}
                    onChange={(tags) => field.onChange(tags)}
                  />
                )}
              />
              {errors.meta_keywords && (
                <p className={ERROR}>{errors.meta_keywords.message}</p>
              )}
            </div> */}
          </section>
        </div>

        {/* ---------------- Sidebar ---------------- */}
        <div className='flex flex-col gap-4'>
          <section className={SECTION}>
            <h3 className={SECTION_TITLE}>Visibility</h3>

            <div className='flex items-center justify-between gap-3'>
              <span className='text-sm text-gray-700'>Status</span>
              <Controller
                name='isActive'
                control={control}
                render={({ field }) => (
                  <Segmented
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { label: 'Active', value: true },
                      { label: 'Inactive', value: false, tone: 'danger' },
                    ]}
                  />
                )}
              />
            </div>

            <div className='mt-2 flex items-center justify-between gap-3'>
              <span className='text-sm text-gray-700'>Pricing</span>
              <Controller
                name='isFree'
                control={control}
                render={({ field }) => (
                  <Segmented
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { label: 'Premium', value: false },
                      { label: 'Free', value: true },
                    ]}
                  />
                )}
              />
            </div>
          </section>

          <section className={SECTION}>
            <h3 className={SECTION_TITLE}>Organisation</h3>

            <div className='mb-3'>
              <label className={LABEL} htmlFor='category'>
                Category <span className='text-red-600'>*</span>
              </label>
              <Controller
                name='category'
                control={control}
                render={({ field }) => (
                  <Select
                    options={categoryOption}
                    styles={SELECT_STYLES}
                    onChange={(selected) => {
                      const value = selected ? selected.value : '';
                      setSelectedCategory(value);
                      field.onChange(value);
                      setValue('sub_category', '');
                    }}
                    value={
                      categoryOption.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    placeholder='Select a category'
                  />
                )}
              />
              {errors.category && (
                <p className={ERROR}>{errors.category.message}</p>
              )}
            </div>

            <div className='mb-3'>
              <label className={LABEL} htmlFor='sub_category'>
                Sub Category <span className='text-red-600'>*</span>
              </label>
              <Controller
                name='sub_category'
                control={control}
                render={({ field }) => {
                  const filteredSubCategories = subCategoryOption.filter(
                    (sub) => sub?.categoryId?._id === selectedCategory,
                  );

                  return (
                    <Select
                      options={filteredSubCategories}
                      styles={SELECT_STYLES}
                      onChange={(selected) =>
                        field.onChange(selected ? selected.value : '')
                      }
                      value={
                        filteredSubCategories.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      placeholder={
                        selectedCategory
                          ? 'Select a subcategory'
                          : 'Select a category first'
                      }
                      isDisabled={!selectedCategory}
                    />
                  );
                }}
              />
              {errors.sub_category && (
                <p className={ERROR}>{errors.sub_category.message}</p>
              )}
            </div>

            <div className='mb-3'>
              <label className={LABEL} htmlFor='price'>
                Price <span className='text-red-600'>*</span>
              </label>
              <input
                id='price'
                type='number'
                step='0.01'
                placeholder='0.00'
                {...register('price', { valueAsNumber: true })}
                className={INPUT}
              />
              {errors.price && <p className={ERROR}>{errors.price.message}</p>}
            </div>

            <div>
              <label className={LABEL} htmlFor='sku_code'>
                SKU Code <span className='text-red-600'>*</span>
              </label>
              <input
                id='sku_code'
                placeholder='SKU'
                {...register('sku_code')}
                className={INPUT}
              />
              {errors.sku_code && (
                <p className={ERROR}>{errors.sku_code.message}</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Files — full width so the four slots sit in one row and the whole
          block is a single drop target. */}
      <section className={`${SECTION} mt-4`}>
        <div className='mb-3 flex flex-wrap items-baseline justify-between gap-2'>
          <h3 className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
            Files
          </h3>
          <p className='text-xs text-gray-400'>
            Drag files anywhere in this box — each one lands in its own slot.
          </p>
        </div>

        <FilesDropZone onFiles={handleDroppedFiles}>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <FileDropTile
              id='image-upload'
              title='Product Image'
              badge='IMG'
              required
              isImage
              accept='image/png,image/jpeg,image/jpg,image/webp'
              hint='.jpg, .png, .webp'
              error={errors.image?.message}
              file={watch('image')}
              existingPreview={product?.image?.url}
              existingName={product?.image?.url ? 'Current image' : null}
              onSelect={(file) =>
                setValue('image', file, { shouldDirty: true })
              }
            />

            <FileDropTile
              id='zip-upload'
              title='Design Pack'
              badge='ZIP'
              required
              extension='zip'
              accept='.zip,application/zip,application/x-zip-compressed'
              hint={
                product
                  ? 'A new ZIP replaces every file on this design, including the EMB.'
                  : 'All embroidery formats in one .zip'
              }
              error={errors.file?.message}
              file={watch('file')}
              onSelect={(file) => setValue('file', file, { shouldDirty: true })}
            />

            <FileDropTile
              id='emb-upload'
              title='EMB File'
              badge='EMB'
              extension='emb'
              accept='.emb'
              hint={
                product
                  ? hasEmb
                    ? 'Optional. Replaces the EMB on this design; other formats stay.'
                    : 'Optional. Added to the existing formats; nothing is removed.'
                  : 'Optional. Added alongside the formats inside the ZIP.'
              }
              error={errors.emb_file?.message}
              file={watch('emb_file')}
              onSelect={(file) =>
                setValue('emb_file', file, { shouldDirty: true })
              }
            />

            <FileDropTile
              id='pdf-upload'
              title='PDF Guide'
              badge='PDF'
              extension='pdf'
              accept='application/pdf'
              hint='Optional instruction sheet.'
              error={errors.product_pdf?.message}
              file={watch('product_pdf')}
              existingName={product?.product_pdf?.url ? 'Current PDF' : null}
              onSelect={(file) =>
                setValue('product_pdf', file, { shouldDirty: true })
              }
            />
          </div>
        </FilesDropZone>

        <div className='mt-3 flex flex-wrap items-center justify-between gap-2'>
          {product?.available_file_types?.length > 0 ? (
            <p className='text-xs text-gray-500'>
              Current formats:{' '}
              <span className='font-medium text-gray-700'>
                {product.available_file_types.join(', ').toUpperCase()}
              </span>
            </p>
          ) : (
            <span />
          )}

          {dropError && (
            <p className='text-xs font-light text-red-500'>{dropError}</p>
          )}
        </div>
      </section>

      {/* The sticky bar above is the primary action; this is its small-screen
          counterpart, where a long form makes scrolling back up expensive. */}
      <div className='mt-4 lg:hidden'>
        <button
          type='submit'
          disabled={isSubmitting}
          className={`w-full rounded-md bg-slate-800 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400 ${
            isSubmitting ? 'cursor-wait' : ''
          }`}
        >
          {isSubmitting ? (
            <LoadingSpinner />
          ) : product ? (
            'Update Product'
          ) : (
            'Create Product'
          )}
        </button>
      </div>
    </form>
  );
}
