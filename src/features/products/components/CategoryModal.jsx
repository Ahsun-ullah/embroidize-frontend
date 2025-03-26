'use client';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { categorySchema } from '@/lib/zodValidation/productValidation';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ImageFileUpload } from './ImageDragAndDropInput';
import { CreatableTagsInput } from './TagsInput';

export default function CategoryModal({ isOpen, onOpenChange, category }) {
  const [description, setDescription] = useState(category?.description || '');

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      metaDescription: '',
      tags: [],
      image: null,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name ?? '',
        description: category.description ?? '',
        metaDescription: category.metaDescription ?? '',
        tags: category.tags ?? [],
        image: category.image ?? null,
      });
      setDescription(category.description ?? '');
    }
  }, [category, reset]);

  const onSubmit = async (data) => {
    console.log('Submitted Data:', data);
    // try {
    //   const formData = new FormData();
    //   Object.entries(data).forEach(([key, value]) => {
    //     if (value !== null && value !== undefined) {
    //       if (key === 'image') {
    //         if (value instanceof File) {
    //           formData.append(key, value);
    //         }
    //       } else if (key === 'tags') {
    //         value.forEach((tag, index) => {
    //           formData.append(`tags[${index}]`, tag);
    //         });
    //       } else {
    //         formData.append(key, value);
    //       }
    //     }
    //   });

    //   // If editing, add category ID
    //   if (category?.id) {
    //     formData.append('id', category.id);
    //   }

    //   // Here you would typically make an API call
    //   // const response = await fetch(category ? '/api/categorys/update' : '/api/categorys/create', {
    //   //   method: category ? 'PUT' : 'POST',
    //   //   body: formData,
    //   // });

    //   console.log('Form Data:', Object.fromEntries(formData));

    //   // Reset form if creating new category
    //   // if (!category) {
    //   //   reset();
    //   //   setDescription('');
    //   // }
    // } catch (error) {
    //   console.error('Error submitting form:', error);
    //   // You might want to set an error state here to display to the user
    // }
  };
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {
        reset(), onOpenChange();
      }}
      scrollBehavior='inside'
      placement='center'
      size={'5xl'}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              {category ? 'Update Category' : 'Add Category'}
            </ModalHeader>
            <ModalBody>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='flex flex-col gap-4'
              >
                {/* Category Name */}
                <div className='flex flex-col gap-2'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='name'
                  >
                    Category Name <span className='text-red-600'>*</span>
                  </label>
                  <input
                    id='name'
                    placeholder='Category Name'
                    {...register('name')}
                    className='flex w-full flex-wrap md:flex-nowrap gap-4 border-[1.8px] rounded-[4px] p-2'
                  />
                  {errors.name && (
                    <p className='text-red-500 font-light'>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div data-color-mode='light' className='flex flex-col gap-2'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='description'
                  >
                    Category Description <span className='text-red-600'>*</span>
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
                          placeholder: 'Enter Category Description',
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
                <div className='flex flex-col gap-2'>
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

                {/* Category Tags */}
                <div className='flex flex-col gap-2'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='tags'
                  >
                    Category Tags <span className='text-red-600'>*</span>
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
                    <p className='text-red-500 font-light'>
                      {errors.tags.message}
                    </p>
                  )}
                </div>

                {/* Category Image Upload */}
                <div className='flex flex-col gap-2'>
                  <label className='text-lg font-medium tracking-tight leading-5'>
                    Category Image <span className='text-red-600'>*</span>
                  </label>
                  <ImageFileUpload
                    label='Upload category image (.jpg, .png). Min: 580px × 386px, Max: 5000px × 5000px'
                    accept={{ 'image/jpeg': [], 'image/png': [] }}
                    onDrop={(file) =>
                      setValue('image', file, { shouldValidate: true })
                    }
                    error={errors.image?.message}
                    itemData={category}
                  />
                </div>

                {/* Submit Button */}
                <div className='col-span-3 flex justify-center w-full my-8 '>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className={`w-full md:w-auto px-4 py-2 rounded-md font-medium text-white
             bg-slate-800
              hover:bg-teal-600  hover:shadow-lg
              disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
              transition-all duration-300 ease-in-out
              ${isSubmitting ? 'cursor-wait' : ''}`}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner />
                    ) : category ? (
                      'Update Category'
                    ) : (
                      'Create Category'
                    )}
                  </button>
                </div>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
