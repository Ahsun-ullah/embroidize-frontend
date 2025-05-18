'use client';
import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  useAddProductSubCategoryMutation,
  useGetPublicProductCategoriesQuery,
  useGetPublicProductSubCategoriesQuery,
  useUpdateProductSubCategoryMutation,
} from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import { subCategorySchema } from '@/lib/zodValidation/productValidation';
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
  setSubCategoryId,
}) {
  const [description, setDescription] = useState(
    subCategory?.description || '',
  );
  const [categoryOption, setCategoryOption] = useState([]);

  const { data: categoryData } = useGetPublicProductCategoriesQuery();

  const [addProductSubCategory] = useAddProductSubCategoryMutation();
  const [updateProductSubCategory] = useUpdateProductSubCategoryMutation();
  const { refetch: getProductSubCategoryRefetch } =
    useGetPublicProductSubCategoriesQuery();

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
      meta_title: '',
      meta_description: '',
      meta_keywords: [],
      image: null,
    },
  });

  useEffect(() => {
    if (subCategory) {
      reset({
        name: subCategory.name || '',
        category: subCategory.category?._id || '',
        description: subCategory.description || '',
        meta_title: subCategory.meta_title || '',
        meta_description: subCategory.meta_description || '',
        meta_keywords: subCategory.meta_keywords || [],
        image: subCategory.image || null,
      });
      setDescription(subCategory.description || '');
    }
  }, [subCategory, reset]);

  useEffect(() => {
    if (categoryData?.data?.length > 0) {
      console.log('categoryData:', categoryData);
      const formattedCategory = categoryData.data.map((cat) => ({
        label: cat?.name,
        value: cat?._id,
      }));
      setCategoryOption(formattedCategory);
    }
  }, [categoryData]);

  const onSubmit = async (data) => {
    console.log('Submitted Data:', data);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category', data.category);
      formData.append('description', data.description);
      formData.append('meta_title', data.meta_title);
      formData.append('meta_description', data.meta_description);
      if (data.meta_keywords) {
        data.meta_keywords.forEach((tag, index) => {
          formData.append(`meta_keywords[${index}]`, tag);
        });
      }
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }

      if (subCategory?._id) {
        formData.append('id', subCategory._id);
        const response = await updateProductSubCategory(formData).unwrap();
        // console.log('API Response:', response);
        if (response.error) {
          ErrorToast('Error', response.error.data.message || 'API Error', 3000);
        } else {
          SuccessToast(
            'Success',
            response.data.message || 'Action successfully done!',
            3000,
          );
          getProductSubCategoryRefetch();
          reset();
          setDescription('');
          setSubCategoryId('');
          onOpenChange();
        }
      } else {
        const response = await addProductSubCategory(formData).unwrap();
        console.log('API Response:', response);

        if (response.error) {
          ErrorToast(
            'Error',
            response.error.data?.message || 'API Error',
            3000,
          );
        } else {
          SuccessToast(
            'Success',
            response.data?.message || 'Subcategory added!',
            3000,
          );
          getProductSubCategoryRefetch();
          reset();
          setDescription('');
          onOpenChange();
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      ErrorToast('Error', error.message || 'Failed to submit form', 3000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {
        setSubCategoryId('');
        reset();
        onOpenChange();
      }}
      scrollBehavior='inside'
      placement='center'
      size='5xl'
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              {subCategory ? 'Update Subcategory' : 'Add Subcategory'}
            </ModalHeader>
            <ModalBody>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='flex flex-col gap-4'
              >
                {/* Subcategory Name */}
                <div className='flex flex-col gap-2'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='name'
                  >
                    Subcategory Name <span className='text-red-600'>*</span>
                  </label>
                  <input
                    id='name'
                    placeholder='Subcategory Name'
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
                    render={({ field }) => (
                      <Select
                        options={categoryOption}
                        onChange={(selected) =>
                          field.onChange(selected ? selected.value : '')
                        }
                        value={
                          categoryOption.find(
                            (option) => option.value === field.value,
                          ) || null
                        }
                        placeholder='Select a category'
                        aria-label='Category'
                      />
                    )}
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
                    Subcategory Description{' '}
                    <span className='text-red-600'>*</span>
                  </label>
                  <Controller
                    name='description'
                    control={control}
                    render={({ field }) => (
                      <MDEditor
                        value={description}
                        onChange={(value) => {
                          setDescription(value);
                          field.onChange(value);
                        }}
                        preview='edit'
                        height={300}
                        textareaProps={{
                          placeholder: 'Enter Subcategory Description',
                        }}
                        previewOptions={{ disallowedElements: ['style'] }}
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

                {/* Meta Title */}
                <div className='flex flex-col gap-2'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='meta_title'
                  >
                    Meta Title <span className='text-red-600'>*</span>
                  </label>
                  <input
                    id='meta_title'
                    placeholder='Meta Title'
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

                {/* Subcategory Tags */}
                <div className='flex flex-col gap-2'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='meta_keywords'
                  >
                    Subcategory Tags <span className='text-red-600'>*</span>
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

                {/* Subcategory Image Upload */}
                <div className='flex flex-col gap-2'>
                  <label className='text-lg font-medium tracking-tight leading-5'>
                    Subcategory Image <span className='text-red-600'>*</span>
                  </label>
                  <ImageFileUpload
                    label='Upload subcategory image (.jpg, .png). Min: 580px × 386px, Max: 5000px × 5000px'
                    accept={{ 'image/jpeg': [], 'image/png': [] }}
                    onDrop={(file) =>
                      setValue('image', file, { shouldValidate: true })
                    }
                    error={errors.image?.message}
                    itemData={subCategory}
                  />
                </div>

                {/* Submit Button */}
                <div className='col-span-3 flex justify-center w-full my-8'>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className={`w-full md:w-auto px-4 py-2 rounded-md font-medium text-white bg-slate-800 hover:bg-black hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out ${isSubmitting ? 'cursor-wait' : ''}`}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner />
                    ) : subCategory ? (
                      'Update Subcategory'
                    ) : (
                      'Create Subcategory'
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
