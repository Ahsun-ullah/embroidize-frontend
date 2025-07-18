'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';

import QuillEditor from '@/components/Common/QuillEditor';
import {
  useAddBlogMutation,
  useAllBlogsQuery,
  useUpdateBlogMutation,
} from '@/lib/redux/admin/blogs/blogsSlice';
import { blogSchema } from '@/lib/zodValidation/productValidation';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ImageFileUpload } from './ImageDragAndDropInput';
import { CreatableTagsInput } from './TagsInput';

export function BlogForm({ blog, isOpen, onOpenChange, setBlogId }) {
  const router = useRouter();
  const [description, setDescription] = useState(blog?.description || '');

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
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      description: '',
      meta_description: '',
      meta_title: '',
      meta_keywords: [],
      image: null,
    },
  });

  useEffect(() => {
    if (blog) {
      reset({
        title: blog.title ?? '',
        description: blog.description ?? '',
        meta_title: blog.meta_title ?? '',
        meta_description: blog.meta_description ?? '',
        meta_keywords: blog.meta_keywords ?? [],
        image: blog.image ?? null,
      });
      setDescription(blog.description ?? '');
    }
    if (blog?.blog?._id) {
      setSelectedCategory(blog.blog._id);
    }
  }, [blog, reset]);

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

      // formData.forEach((value, key) => {
      //   console.log(`${key}:`, value);
      // });

      if (blog?._id) {
        formData.append('id', blog._id);
        const response = await updateBlog(formData).unwrap();
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
            await allBlogsRefetch();
            reset();
            setDescription('');
            setBlogId('');
            onOpenChange();
            router.push('/admin/all-blogs');
          } catch (err) {
            console.error('Refetch failed:', err);
            ErrorToast('Error', 'Failed to refresh blog list.', 3000);
          }
        }
      } else {
        const response = await addBlog(formData).unwrap();
        // console.log('API Response:', response);
        if (response.error) {
          ErrorToast('Error', response.error.data.message || 'API Error', 3000);
        } else {
          SuccessToast(
            'Success',
            response.data.message || 'Action successfully done!',
            3000,
          );
          allBlogsRefetch();
          // reset();
          // setDescription('');
          // router.push('/admin/all-blogs');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      ErrorToast('Error', error || 'API Error', 3000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {
        setBlogId(''), reset(), onOpenChange();
      }}
      scrollBehavior='inside'
      placement='center'
      size={'5xl'}
      className='max-w-6xl'
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              {blog ? 'Update Category' : 'Add Category'}
            </ModalHeader>
            <ModalBody>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='grid grid-cols-3 gap-4'
              >
                {/* blog Name */}
                <div className='col-span-3'>
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
                    className='flex w-full flex-wrap md:flex-nowrap gap-4 border-[1.8px] rounded-[4px] p-2'
                  />
                  {errors.title && (
                    <p className='text-red-500 font-light'>
                      {errors.title.message}
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
                    accept={
                      ('image/png', 'image/jpg', 'image/webp', 'image/jpeg')
                    }
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
              disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
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
