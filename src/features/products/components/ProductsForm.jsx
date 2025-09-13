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
import { Card } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import MDEditor from '@uiw/react-md-editor';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { ZipFileUpload } from './FileDragAndDropInput';
import { ImageFileUpload } from './ImageDragAndDropInput';
import { CreatableTagsInput } from './TagsInput';

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

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      price: null,
      description: '',
      category: '',
      sub_category: '',
      meta_description: '',
      meta_title: '',
      meta_keywords: [],
      image: null,
      file: null,
      product_pdf: null,
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
        description: product.description ?? '',
        meta_title: product.meta_title ?? '',
        meta_description: product.meta_description ?? '',
        meta_keywords: product.meta_keywords ?? [],
        image: product.image ?? null,
        file: product.file ?? null,
        product_pdf: product.product_pdf ?? null,
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
      console.log('categoryData:', categoryData);

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
      console.log('subCategoryData:', subCategoryData);

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
    console.log('Submitted Data:', data);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'image' || key === 'file' || key === 'product_pdf') {
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

      // formData.forEach((value, key) => {
      //   console.log(`${key}:`, value);
      // });

      if (product?._id) {
        formData.append('id', product._id);
        const response = await updateProduct(formData).unwrap();
        // console.log('API Response:', response);
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
        // console.log('API Response:', response);
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

  return (
    <Card className='w-full p-6'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='grid grid-cols-3 gap-4'
      >
        {/* Product Name */}
        <div className='col-span-3'>
          <label
            className='text-lg font-medium tracking-tight leading-5'
            htmlFor='name'
          >
            Product Name <span className='text-red-600'>*</span>
          </label>
          <input
            id='name'
            placeholder='Product Name'
            {...register('name')}
            onChange={handleNameChange}
            className='flex w-full flex-wrap md:flex-nowrap gap-4 border-[1.8px] rounded-[4px] p-2'
          />
          {errors.name && (
            <p className='text-red-500 font-light'>{errors.name.message}</p>
          )}
        </div>

        {/* Product slug */}
        <div className='col-span-3'>
          <label
            className='text-lg font-medium tracking-tight leading-5'
            htmlFor='slug'
          >
            Product Slug <span className='text-red-600'>*</span>
          </label>
          <input
            id='slug'
            placeholder='Product Slug'
            {...register('slug')}
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className='flex w-full flex-wrap md:flex-nowrap gap-4 border-[1.8px] rounded-[4px] p-2'
          />
          {errors.slug && (
            <p className='text-red-500 font-light'>{errors.slug.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label
            className='text-lg font-medium tracking-tight leading-5'
            htmlFor='category'
          >
            Category <span className='text-red-600'>*</span>
          </label>

          <Controller
            name='category'
            control={control}
            render={({ field }) => (
              <Select
                options={categoryOption}
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
            <p className='text-red-500 font-light'>{errors.category.message}</p>
          )}
        </div>

        {/* sub_category */}
        <div>
          <label
            className='text-lg font-medium tracking-tight leading-5'
            htmlFor='sub_category'
          >
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
                      : 'Please select a category first'
                  }
                  isDisabled={!selectedCategory}
                />
              );
            }}
          />

          {errors.sub_category && (
            <p className='text-red-500 font-light'>
              {errors.sub_category.message}
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label
            className='text-lg font-medium tracking-tight leading-5'
            htmlFor='price'
          >
            Price <span className='text-red-600'>*</span>
          </label>
          <input
            id='price'
            type='number'
            step='0.01'
            placeholder='Price'
            {...register('price', { valueAsNumber: true })}
            className='flex w-full flex-wrap md:flex-nowrap gap-4 border-[1.8px] rounded-[4px] p-2'
          />
          {errors.price && (
            <p className='text-red-500 font-light'>{errors.price.message}</p>
          )}
        </div>

        {/* Description */}
        <div data-color-mode='light' className='col-span-3'>
          <label
            className='text-lg font-medium tracking-tight leading-5'
            htmlFor='description'
          >
            Product Description <span className='text-red-600'>*</span>
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
                height={300}
                textareaProps={{
                  placeholder: 'Enter Product Description',
                }}
                previewOptions={{
                  disallowedElements: ['style'],
                }}
                className='rounded-[4px] p-2 overflow-hidden'
              />
            )}
          />
          {errors.description && (
            <p className='text-red-500 font-light'>
              {errors.description.message}
            </p>
          )}
        </div>

        {/* meta_title  */}
        <div className='col-span-3'>
          <label
            className='text-lg font-medium tracking-tight leading-5'
            htmlFor='meta_title'
          >
            Meta Title <span className='text-red-600'>*</span>
          </label>
          <input
            id='meta_title'
            placeholder='Category Name'
            {...register('meta_title')}
            className='flex w-full flex-wrap md:flex-nowrap gap-4 border-[1.8px] rounded-[4px] p-2'
          />
          {errors.meta_title && (
            <p className='text-red-500 font-light'>
              {errors.meta_title.message}
            </p>
          )}
        </div>

        {/* Meta Description */}
        <div className='col-span-3'>
          <label
            className='text-lg font-medium tracking-tight leading-5'
            htmlFor='meta_description'
          >
            Meta Description <span className='text-red-600'>*</span>
          </label>
          <textarea
            rows={8}
            id='meta_description'
            placeholder='Meta description'
            {...register('meta_description')}
            className='flex w-full flex-wrap md:flex-nowrap gap-4 border-[1.8px] rounded-[4px] p-2'
          />
          {errors.meta_description && (
            <p className='text-red-500 font-light'>
              {errors.meta_description.message}
            </p>
          )}
        </div>

        {/* Product Tags */}
        <div className='col-span-2'>
          <label
            className='text-lg font-medium tracking-tight leading-5'
            htmlFor='meta_keywords'
          >
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
            <p className='text-red-500 font-light'>
              {errors.meta_keywords.message}
            </p>
          )}
        </div>

        <div className='col-span-1'>
          <label
            className='text-lg font-medium tracking-tight leading-5'
            htmlFor='meta_keywords'
          >
            PDF File <span className='text-red-600'>*</span>
          </label>
          <input
            type='file'
            accept='application/pdf'
            onChange={(e) =>
              setValue('product_pdf', e.target.files?.[0], {
                shouldDirty: true,
              })
            }
            className='
    block w-full border-[1.8px] rounded-[4px] p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full
    file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700
    hover:file:bg-slate-200 transition
  '
          />

          {errors.product_pdf && (
            <p className='text-red-500 font-light'>
              {errors.product_pdf.message}
            </p>
          )}
        </div>

        {/* Product Image Upload */}
        <div className='col-span-3'>
          <label className='text-lg font-medium tracking-tight leading-5'>
            Product Image <span className='text-red-600'>*</span>
          </label>
          <ImageFileUpload
            label='Upload product image (.jpg, .png, .webp). Min: 580px × 386px, Max: 5000px × 5000px'
            accept={('image/png', 'image/jpg', 'image/webp', 'image/jpeg')}
            onDrop={(file) => setValue('image', file, { shouldDirty: true })}
            error={errors.image?.message}
            itemData={product}
          />
        </div>

        {/* Design File Upload */}
        <div className='col-span-3'>
          <label className='text-lg font-medium tracking-tight leading-5'>
            Design File (Zip only) <span className='text-red-600'>*</span>
          </label>
          <ZipFileUpload
            label='Upload embroidery files (.zip only)'
            accept={'application/zip'}
            onDrop={(file) => setValue('file', file, { shouldDirty: true })}
            error={errors.file?.message}
            product={product}
          />
        </div>

        {/* Submit Button */}
        <div className='col-span-3 flex justify-center w-full my-20'>
          <button
            type='submit'
            disabled={isSubmitting}
            className={`w-full md:w-auto px-6 py-3 rounded-md font-medium text-white
             bg-slate-800
              hover:bg-black  hover:shadow-lg
              disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
              transition-all duration-300 ease-in-out
              ${isSubmitting ? 'cursor-wait' : ''}`}
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
    </Card>
  );
}
