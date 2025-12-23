'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import QuillEditor from '@/components/Common/QuillEditor';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  useAddBlogMutation,
  useAllBlogsQuery,
  useUpdateBlogMutation,
} from '@/lib/redux/admin/blogs/blogsSlice';
import { blogSchema } from '@/lib/zodValidation/productValidation';
import { slugify } from '@/utils/functions/page';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { ImageFileUpload } from './ImageDragAndDropInput';
import { CreatableTagsInput } from './TagsInput';

export function BlogForm({ blog, isOpen, onOpenChange, setBlogId }) {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');

  const [addBlog] = useAddBlogMutation();
  const [updateBlog] = useUpdateBlogMutation();
  const { refetch: allBlogsRefetch } = useAllBlogsQuery();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      doc_type: 'blog',
      slug: '',
      description: '',
      meta_description: '',
      meta_title: '',
      meta_keywords: [],
      image: null,
    },
  });

  // ⭐ Watch doc_type value
  const docTypeValue = watch('doc_type');

  // ⭐ Populate form when blog data changes
  useEffect(() => {
    if (blog && isOpen) {
      reset({
        title: blog.title ?? '',
        doc_type: blog.doc_type ?? 'blog',
        slug: blog.slug ?? '',
        description: blog.description ?? '',
        meta_title: blog.meta_title ?? '',
        meta_description: blog.meta_description ?? '',
        meta_keywords: blog.meta_keywords ?? [],
        image: blog.image ?? null,
      });
      setDescription(blog.description ?? '');
      setSlug(blog.slug ?? '');
    }
  }, [blog, isOpen, reset]);

  // ⭐ Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form to default values
      reset({
        title: '',
        doc_type: '',
        slug: '',
        description: '',
        meta_description: '',
        meta_title: '',
        meta_keywords: [],
        image: null,
      });
      // Clear local state
      setDescription('');
      setSlug('');
      setBlogId('');
    }
  }, [isOpen, reset, setBlogId]);

  const handleNameChange = (e) => {
    const nameValue = e.target.value;
    const generatedSlug = slugify(nameValue);
    setSlug(generatedSlug);
    setValue('title', nameValue);
    setValue('slug', generatedSlug);
  };

  const handleCloseModal = () => {
    // Clean everything before closing
    reset({
      title: '',
      doc_type: '',
      slug: '',
      description: '',
      meta_description: '',
      meta_title: '',
      meta_keywords: [],
      image: null,
    });
    setDescription('');
    setSlug('');
    setBlogId('');
    onOpenChange();
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'image') {
            if (value instanceof File) {
              formData.append(key, value);
            } else if (typeof value === 'string') {
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

      if (blog?._id) {
        // Update existing blog
        formData.append('id', blog._id);
        const response = await updateBlog(formData).unwrap();

        if (response.error) {
          ErrorToast('Error', response.error.data.message || 'API Error', 3000);
        } else {
          SuccessToast(
            'Success',
            response.message || 'Blog updated successfully!',
            3000,
          );
          setBlogId('');
          await allBlogsRefetch();
          handleCloseModal();
          router.push('/admin/all-blogs');
        }
      } else {
        // Create new blog
        const response = await addBlog(formData).unwrap();

        if (response.error) {
          ErrorToast('Error', response.error.data.message || 'API Error', 3000);
        } else {
          SuccessToast(
            'Success',
            response.message || 'Blog created successfully!',
            3000,
          );

          await allBlogsRefetch();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      ErrorToast(
        'Error',
        error?.data?.message || error?.message || 'API Error',
        3000,
      );
    }
  };

  // ⭐ Doc type options
  const docTypeOptions = [
    { value: 'blog', label: 'Blog' },
    { value: 'resource', label: 'Resource' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleCloseModal}
      onClose={handleCloseModal}
      scrollBehavior='inside'
      placement='center'
      size={'full'}
      className='max-w-6xl'
      isDismissable={!isSubmitting}
      isKeyboardDismissDisabled={isSubmitting}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              {blog ? 'Update Blog' : 'Add Blog'}
            </ModalHeader>
            <ModalBody>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='grid grid-cols-3 gap-4'
              >
                {/* Blog Title */}
                <div className='col-span-2'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='title'
                  >
                    Title <span className='text-red-600'>*</span>
                  </label>
                  <input
                    id='title'
                    placeholder='Blog Title'
                    {...register('title')}
                    onChange={handleNameChange}
                    className='flex w-full flex-wrap md:flex-nowrap gap-4 border-[1.8px] rounded-[4px] p-2'
                  />
                  {errors.title && (
                    <p className='text-red-500 font-light'>
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Doc Type */}
                <div className='col-span-1'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='doc_type'
                  >
                    Doc Type <span className='text-red-600'>*</span>
                  </label>
                  <Controller
                    name='doc_type'
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={docTypeOptions}
                        onChange={(selected) => {
                          field.onChange(selected?.value || 'blog');
                        }}
                        value={docTypeOptions.find(
                          (option) => option.value === field.value,
                        )}
                        placeholder='Select document type'
                        className='react-select-container'
                        classNamePrefix='react-select'
                        isDisabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.doc_type && (
                    <p className='text-red-500 font-light'>
                      {errors.doc_type.message}
                    </p>
                  )}
                </div>

                {/* Blog Slug */}
                <div className='col-span-3'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='slug'
                  >
                    Slug <span className='text-red-600'>*</span>
                  </label>
                  <input
                    id='slug'
                    placeholder='blog-slug'
                    value={slug}
                    onChange={(e) => {
                      const newSlug = slugify(e.target.value);
                      setSlug(newSlug);
                      setValue('slug', newSlug);
                    }}
                    className='flex w-full flex-wrap md:flex-nowrap gap-4 border-[1.8px] rounded-[4px] p-2'
                  />
                  {errors.slug && (
                    <p className='text-red-500 font-light'>
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className='col-span-3 mb-10'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='description'
                  >
                    Description <span className='text-red-600'>*</span>
                  </label>
                  {isOpen && (
                    <Controller
                      name='description'
                      control={control}
                      render={({ field }) => (
                        <QuillEditor
                          {...field}
                          value={description}
                          onChange={(value) => {
                            setDescription(value);
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                  )}
                  {errors.description && (
                    <p className='text-red-500 font-light'>
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Meta Title */}
                <div className='col-span-3'>
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

                {/* Blog Tags */}
                <div className='col-span-3'>
                  <label
                    className='text-lg font-medium tracking-tight leading-5'
                    htmlFor='meta_keywords'
                  >
                    Blog Tags <span className='text-red-600'>*</span>
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

                {/* Blog Image Upload */}
                <div className='col-span-3'>
                  <label className='text-lg font-medium tracking-tight leading-5'>
                    Blog Image <span className='text-red-600'>*</span>
                  </label>
                  <ImageFileUpload
                    label='Upload blog image (.jpg, .png, .webp). Min: 580px × 386px, Max: 5000px × 5000px'
                    accept='image/png,image/jpg,image/webp,image/jpeg'
                    onDrop={(file) =>
                      setValue('image', file, { shouldDirty: true })
                    }
                    error={errors.image?.message}
                    itemData={blog}
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
              disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-all duration-300 ease-in-out
              ${isSubmitting ? 'cursor-wait' : ''}`}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner />
                    ) : blog ? (
                      'Update Blog'
                    ) : (
                      'Create Blog'
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
