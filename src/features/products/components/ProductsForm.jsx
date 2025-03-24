'use client';

import { productSchema } from '@/lib/zodValidation/productValidation';
import { animals } from '@/utils/data/page';
import { Card } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { ZipFileUpload } from './FileDragAndDropInput';
import { ImageFileUpload } from './ImageDragAndDropInput';
import { CreatableTagsInput } from './TagsInput';

export function ProductsForm({ product }) {
  const [description, setDescription] = useState(product?.description || '');

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      price: null,
      description: '',
      metaDescription: '',
      tags: [],
      images: null,
      designFile: null,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name ?? '',
        category: product.category?.value ?? '',
        price: product.price ?? null,
        description: product.description ?? '',
        metaDescription: product.metaDescription ?? '',
        tags: product.tags ?? [],
        images: product.images ?? null,
        designFile: product.designFile ?? null,
      });
      setDescription(product.description ?? '');
    }
  }, [product, reset]);

  const onSubmit = async (data) => {
    console.log('Submitted Data:', data);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'images' || key === 'designFile') {
            if (value instanceof File) {
              formData.append(key, value);
            }
          } else if (key === 'tags') {
            value.forEach((tag, index) => {
              formData.append(`tags[${index}]`, tag);
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      // If editing, add product ID
      if (product?.id) {
        formData.append('id', product.id);
      }

      // Here you would typically make an API call
      // const response = await fetch(product ? '/api/products/update' : '/api/products/create', {
      //   method: product ? 'PUT' : 'POST',
      //   body: formData,
      // });

      console.log('Form Data:', Object.fromEntries(formData));

      // Reset form if creating new product
      // if (!product) {
      //   reset();
      //   setDescription('');
      // }
    } catch (error) {
      console.error('Error submitting form:', error);
      // You might want to set an error state here to display to the user
    }
  };

  return (
    <Card className='w-full p-6'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='grid grid-cols-3 gap-4'
      >
        {/* Product Name */}
        <div>
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
            className='flex w-full flex-wrap md:flex-nowrap gap-4 border-[1.8px] rounded-[4px] p-2'
          />
          {errors.name && (
            <p className='text-red-500 font-light'>{errors.name.message}</p>
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
            render={({ field }) => {
              const currentValue =
                field.value && typeof field.value === 'object'
                  ? field.value
                  : { value: field.value, label: field.value };

              const options =
                currentValue?.value &&
                !animals.some((a) => a.value === currentValue.value)
                  ? [
                      ...animals,
                      { value: currentValue.value, label: currentValue.label },
                    ]
                  : animals;

              const selectOptions = options.map((animal) => ({
                value: animal.value,
                label: animal.label,
              }));

              return (
                <Select
                  {...field}
                  options={selectOptions}
                  onChange={(selectedOption) => {
                    const newValue = selectedOption
                      ? {
                          value: selectedOption.value,
                          label: selectedOption.label,
                        }
                      : selectedOption.value;
                    field.onChange(newValue?.value);
                  }}
                  value={
                    selectOptions.find(
                      (option) => option.value === currentValue?.value,
                    ) || null
                  }
                  placeholder='Select a category'
                  aria-label='Category'
                  styles={{
                    control: (base) => ({
                      ...base,
                    }),
                  }}
                />
              );
            }}
          />
          {errors.category && (
            <p className='text-red-500 font-light'>{errors.category.message}</p>
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

        {/* Meta Description */}
        <div className='col-span-3'>
          <label
            className='text-lg font-medium tracking-tight leading-5'
            htmlFor='metaDescription'
          >
            Meta Description <span className='text-red-600'>*</span>
          </label>
          <textarea
            rows={8}
            id='metaDescription'
            placeholder='Meta description'
            {...register('metaDescription')}
            className='flex w-full flex-wrap md:flex-nowrap gap-4 border-[1.8px] rounded-[4px] p-2'
          />
          {errors.metaDescription && (
            <p className='text-red-500 font-light'>
              {errors.metaDescription.message}
            </p>
          )}
        </div>

        {/* Product Tags */}
        <div>
          <label
            className='text-lg font-medium tracking-tight leading-5'
            htmlFor='tags'
          >
            Product Tags <span className='text-red-600'>*</span>
          </label>
          <Controller
            name='tags'
            control={control}
            render={({ field }) => (
              <CreatableTagsInput
                value={field.value || []}
                onChange={(tags) => field.onChange(tags)}
              />
            )}
          />
          {errors.tags && (
            <p className='text-red-500 font-light'>{errors.tags.message}</p>
          )}
        </div>

        {/* Product Image Upload */}
        <div className='col-span-2'>
          <label className='text-lg font-medium tracking-tight leading-5'>
            Product Image <span className='text-red-600'>*</span>
          </label>
          <ImageFileUpload
            label='Upload product image (.jpg, .png). Min: 580px × 386px, Max: 5000px × 5000px'
            accept={{ 'image/jpeg': [], 'image/png': [] }}
            onDrop={(file) =>
              setValue('images', file, { shouldValidate: true })
            }
            error={errors.images?.message}
            product={product}
          />
        </div>

        {/* Design File Upload */}
        <div className='col-span-3'>
          <label className='text-lg font-medium tracking-tight leading-5'>
            Design File (Zip only) <span className='text-red-600'>*</span>
          </label>
          <ZipFileUpload
            label='Upload embroidery files (.zip only)'
            accept={{ 'application/zip': [] }}
            onDrop={(file) =>
              setValue('designFile', file, { shouldValidate: true })
            }
            error={errors.designFile?.message}
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
              hover:bg-teal-600  hover:shadow-lg
              disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
              transition-all duration-300 ease-in-out
              ${isSubmitting ? 'cursor-wait' : ''}`}
          >
            {isSubmitting
              ? 'Processing...'
              : product
                ? 'Update Product'
                : 'Create Product'}
          </button>
        </div>
      </form>
    </Card>
  );
}
