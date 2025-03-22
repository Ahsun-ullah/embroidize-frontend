'use client';

import { SelectorIcon } from '@/components/icons';
import { Card, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(1, 'Price must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  metaDescription: z.string().min(1, 'Meta Description is required'),
  tags: z.string().optional(),
  images: z.any().optional(),
  designFile: z.any().optional(),
});

const FileUpload = ({ label, accept, onDrop, error }) => {
  const [preview, setPreview] = useState(null);

  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setPreview(URL.createObjectURL(file));
      onDrop(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept,
    onDrop: handleDrop,
  });

  return (
    <div
      {...getRootProps()}
      className='flex items-center justify-center h-full w-full'
    >
      <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-60 w-full flex flex-col items-center justify-center'>
        <input {...getInputProps()} />
        <p className='text-gray-600'>{label}</p>
        <button className='mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-md'>
          Drag and Drop files here or Browse Files
        </button>

        {preview && (
          <div className='mt-4 flex flex-col items-center'>
            <p className='text-gray-700'>Preview:</p>
            <img
              src={preview}
              alt='Preview'
              className='mt-2 w-40 h-40 object-cover rounded-md shadow-md'
            />
          </div>
        )}

        {error && <p className='text-red-500 font-light mt-2'>{error}</p>}
      </div>
    </div>
  );
};

export function ProductsForm({ product }) {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      category: product?.category ?? '',
      price: product?.price ?? null,
      description: product?.description ?? '',
      tags: product?.tags ?? '',
      images: product?.images ?? null,
      designFile: product?.designFile ?? null,
    },
  });

  async function onSubmit(data) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value ?? '');
    });

    console.log('Form Data:', formData);
    console.log('Data:', data);

    try {
      // Simulate form submission logic
      console.log('Form submitted successfully');
    } catch (error) {
      console.error('Error submitting form', error);
    }
  }

  const animals = [
    { key: 'cat', label: 'Cat' },
    { key: 'dog', label: 'Dog' },
    { key: 'elephant', label: 'Elephant' },
    { key: 'lion', label: 'Lion' },
    { key: 'tiger', label: 'Tiger' },
    { key: 'giraffe', label: 'Giraffe' },
    { key: 'dolphin', label: 'Dolphin' },
    { key: 'penguin', label: 'Penguin' },
    { key: 'zebra', label: 'Zebra' },
    { key: 'shark', label: 'Shark' },
    { key: 'whale', label: 'Whale' },
    { key: 'otter', label: 'Otter' },
    { key: 'crocodile', label: 'Crocodile' },
  ];

  return (
    <Card className='w-full p-6'>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='grid grid-cols-3 gap-4'
      >
        {/* Product Name */}
        <div>
          <label htmlFor='name'>Product Name *</label>
          <Input
            id='name'
            placeholder='Product Name'
            {...form.register('name')}
            className='input'
          />
          {form.formState.errors.name && (
            <p className='text-red-500 font-light'>
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor='category' aria-label='Category'>
            Category *
          </label>
          <Select
            {...form.register('category', { required: 'Category is required' })} // Register with react-hook-form
            disableSelectorIconRotation
            labelPlacement='outside'
            placeholder='Select a category'
            selectorIcon={<SelectorIcon />}
            aria-label='Category'
          >
            {animals.map((animal) => (
              <SelectItem key={animal.key} value={animal.key}>
                {animal.label}
              </SelectItem>
            ))}
          </Select>
          {form.formState.errors.category && (
            <p className='text-red-500 font-light'>
              {form.formState.errors.category.message}
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label htmlFor='price'>Price *</label>
          <Input
            id='price'
            type='number'
            placeholder='Price'
            {...form.register('price', {
              valueAsNumber: true, // Ensure price is treated as a number
            })}
            className='input'
          />
          {form.formState.errors.price && (
            <p className='text-red-500 font-light'>
              {form.formState.errors.price.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className='col-span-3'>
          <label htmlFor='description'>Product Description *</label>
          <Textarea
            id='description'
            placeholder='Product description'
            {...form.register('description', {
              required: 'Description is required',
            })}
            className='input'
          />
          {form.formState.errors.description && (
            <p className='text-red-500 font-light'>
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        {/* Meta Description */}
        <div className='col-span-3'>
          <label htmlFor='metaDescription'>Meta Description *</label>
          <Textarea
            id='metaDescription'
            placeholder='Meta description'
            {...form.register('metaDescription')}
            className='input'
          />
          {form.formState.errors.metaDescription && (
            <p className='text-red-500 font-light'>
              {form.formState.errors.metaDescription.message}
            </p>
          )}
        </div>

        {/* Product Tags */}
        <div>
          <label htmlFor='tags'>Product Tags</label>
          <Input
            id='tags'
            placeholder='Enter product tags'
            {...form.register('tags')}
            className='input'
          />
        </div>

        {/* Product Image Upload */}
        <div className='col-span-2 '>
          <label>Product Image</label>

          <FileUpload
            label='Upload product image (.jpg, .png). Min: 580px × 386px, Max: 5000px × 5000px.'
            accept={{ 'image/jpeg': [], 'image/png': [] }}
            onDrop={(file) => form.setValue('images', file)}
            error={form.formState.errors.images?.message}
          />
        </div>

        {/* Design File Upload */}
        <div className='col-span-3'>
          <label>Design File (Zip only)</label>
          <FileUpload
            label='Upload embroidery files (.zip only).'
            accept={{ 'application/zip': [] }}
            onDrop={(file) => form.setValue('designFile', file)}
            error={form.formState.errors.designFile?.message}
          />
        </div>

        {/* Submit Button */}
        <div className='col-span-3 flex justify-center w-full my-20'>
          <button type='submit' disabled={''} className='button'>
            {product ? 'Update' : 'Create'} Product
          </button>
        </div>
      </form>
    </Card>
  );
}
