'use client';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { subCategorySchema } from '@/lib/zodValidation/productValidation';
import { subCategoryList } from '@/utils/data/page';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { ImageFileUpload } from './ImageDragAndDropInput';
import { CreatableTagsInput } from './TagsInput';

export default function SubCategoryModal({
  isOpen,
  onOpenChange,
  subCategory,
}) {
  const [description, setDescription] = useState(
    subCategory?.description || '',
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      metaDescription: '',
      tags: [],
      image: null,
    },
  });

  useEffect(() => {
    if (subCategory) {
      reset({
        name: subCategory.name ?? '',
        category: product.category?.value ?? '',
        description: subCategory.description ?? '',
        metaDescription: subCategory.metaDescription ?? '',
        tags: subCategory.tags ?? [],
        image: subCategory.image ?? null,
      });
      setDescription(subCategory.description ?? '');
    }
  }, [subCategory, reset]);

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

    //   // If editing, add subCategory ID
    //   if (subCategory?.id) {
    //     formData.append('id', subCategory.id);
    //   }

    //   // Here you would typically make an API call
    //   // const response = await fetch(subCategory ? '/api/subCategorys/update' : '/api/subCategorys/create', {
    //   //   method: subCategory ? 'PUT' : 'POST',
    //   //   body: formData,
    //   // });

    //   console.log('Form Data:', Object.fromEntries(formData));

    //   // Reset form if creating new subCategory
    //   // if (!subCategory) {
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
              {subCategory ? 'Update subCategory' : 'Add subCategory'}
            </ModalHeader>
            <ModalBody>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='flex flex-col gap-4'
              >
                {/* subCategory Name */}
                <div className='flex flex-col gap-2'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='name'
                  >
                    subCategory Name <span className='text-red-600'>*</span>
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
                        !subCategoryList.some(
                          (a) => a.value === currentValue.value,
                        )
                          ? [
                              ...subCategoryList,
                              {
                                value: currentValue.value,
                                label: currentValue.label,
                              },
                            ]
                          : subCategoryList;

                      const selectOptions =
                        options.map((options) => ({
                          value: options.value ?? '',
                          label: options.label ?? '',
                        })) || [];

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
                            field.onChange(newValue);
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
                    <p className='text-red-500 font-light'>
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div data-color-mode='light' className='flex flex-col gap-2'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='description'
                  >
                    subCategory Description{' '}
                    <span className='text-red-600'>*</span>
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
                          placeholder: 'Enter subCategory Description',
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

                {/* subCategory Tags */}
                <div className='flex flex-col gap-2'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='tags'
                  >
                    subCategory Tags <span className='text-red-600'>*</span>
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

                {/* subCategory Image Upload */}
                <div className='flex flex-col gap-2'>
                  <label className='text-lg font-medium tracking-tight leading-5'>
                    subCategory Image <span className='text-red-600'>*</span>
                  </label>
                  <ImageFileUpload
                    label='Upload subCategory image (.jpg, .png). Min: 580px × 386px, Max: 5000px × 5000px'
                    accept={{ 'image/jpeg': [], 'image/png': [] }}
                    onDrop={(file) =>
                      setValue('image', file, { shouldValidate: true })
                    }
                    error={errors.image?.message}
                    itemData={subCategory}
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
                    ) : subCategory ? (
                      'Update subCategory'
                    ) : (
                      'Create subCategory'
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
