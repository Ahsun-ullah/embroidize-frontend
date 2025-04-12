'use client';
import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  useAddProductCategoryMutation,
  useGetPublicProductCategoriesQuery,
  useUpdateProductCategoryMutation,
} from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import { categorySchema } from '@/lib/zodValidation/productValidation';
import { convertImageUrlToFile } from '@/utils/functions/page';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ImageFileUpload } from './ImageDragAndDropInput';
import { CreatableTagsInput } from './TagsInput';

export default function CategoryModal({
  isOpen,
  onOpenChange,
  category,
  setCategoryId,
}) {
  const [description, setDescription] = useState(category?.description || '');
  const [addProductCategory] = useAddProductCategoryMutation();
  const [updateProductCategory] = useUpdateProductCategoryMutation();
  const { refetch: getProductCategoryRefetch } =
    useGetPublicProductCategoriesQuery();

  // console.log(category?._id);

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
      meta_title: '',
      meta_description: '',
      meta_keywords: [],
      image: null,
    },
  });

  useEffect(() => {
    async function fetchData() {
      const newImg = await convertImageUrlToFile(category?.image?.url);
      // console.log(newImg);
      if (category) {
        reset({
          name: category.name ?? '',
          description: category.description ?? '',
          meta_title: category.meta_title ?? '',
          meta_description: category.meta_description ?? '',
          meta_keywords: category.meta_keywords ?? [],
          image: newImg ?? null,
        });
        setDescription(category.description ?? '');
      }
    }
    fetchData();
  }, [category, reset]);

  const onSubmit = async (data) => {
    console.log('Submitted Data:', data);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'image') {
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

      // If editing, add category ID
      if (category?._id) {
        formData.append('id', category._id);
        const response = await updateProductCategory(formData).unwrap();
        // console.log('API Response:', response);
        if (response.error) {
          ErrorToast('Error', response.error.data.message || 'API Error', 3000);
        } else {
          SuccessToast(
            'Success',
            response.data.message || 'Action successfully done!',
            3000,
          );
          getProductCategoryRefetch();
          reset();
          setDescription('');
          setCategoryId('');
          onOpenChange();
        }
      } else {
        // Here you would typically make an API call
        const response = await addProductCategory(formData).unwrap();
        // console.log('API Response:', response);
        if (response.error) {
          ErrorToast('Error', response.error.data.message || 'API Error', 3000);
        } else {
          SuccessToast(
            'Success',
            response.data.message || 'Action successfully done!',
            3000,
          );
          getProductCategoryRefetch();
          reset();
          setDescription('');
          setCategoryId('');
          onOpenChange();
        }
      }

      console.log('Form Data:', Object.fromEntries(formData));
    } catch (error) {
      console.error('Error submitting form:', error);
      ErrorToast('Error', error || 'API Error', 3000);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {
        setCategoryId(''), reset(), onOpenChange();
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
                {/* meta_title  */}
                <div className='flex flex-col gap-2'>
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
                <div className='flex flex-col gap-2'>
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

                {/* Category Tags */}
                <div className='flex flex-col gap-2'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='meta_keywords'
                  >
                    Category Tags <span className='text-red-600'>*</span>
                  </label>
                  <Controller
                    name='meta_keywords'
                    control={control}
                    render={({ field }) => (
                      <CreatableTagsInput
                        value={field.value || []}
                        onChange={(keyword) => field.onChange(keyword)}
                      />
                    )}
                  />
                  {errors.meta_keywords && (
                    <p className='text-red-500 font-light'>
                      {errors.meta_keywords.message}
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
                  {isSubmitting ? (
                    <LoadingSpinner />
                  ) : (
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
                      {category ? 'Update Category' : 'Create Category'}
                    </button>
                  )}
                </div>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
