'use client';

import { slugify } from '@/utils/functions/page';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import { useEffect, useState } from 'react';

const BundleModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  selectedCount = 0,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState('');

  // 1. Populate fields if initialData is provided (Update Mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        meta_title: initialData.meta_title || '',
        meta_description: initialData.meta_description || '',
        image: null, // Image remains null unless a new one is picked
      });
      setImagePreview(initialData.image?.url || '');
    } else {
      // Clear fields for Create Mode
      setFormData({
        name: '',
        slug: '',
        meta_title: '',
        meta_description: '',
        image: null,
      });
      setImagePreview('');
    }
  }, [initialData, isOpen]);

  const handleNameChange = (name) => {
    setFormData((prev) => ({
      ...prev,
      name,
      // Auto-generate slug only in Create Mode
      slug: !initialData
        ? slugify(name, { lower: true, strict: true })
        : prev.slug,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='3xl'
      backdrop='blur'
      scrollBehavior='inside'
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          {initialData ? 'Update Bundle Design' : 'Create Bundle Design'}
        </ModalHeader>
        <ModalBody>
          <div className='flex flex-col gap-4'>
            {!initialData && (
              <div className='p-3 bg-blue-50 rounded-lg text-sm text-blue-700'>
                Creating bundle with {selectedCount} product
                {selectedCount > 1 ? 's' : ''}
              </div>
            )}

            <Input
              label='Bundle Name'
              placeholder='Enter bundle name'
              value={formData.name}
              onValueChange={handleNameChange}
              isRequired
              variant='bordered'
            />

            <Input
              label='Bundle Slug'
              placeholder='bundle-name-slug'
              value={formData.slug}
              onValueChange={(val) =>
                setFormData({
                  ...formData,
                  slug: slugify(val, { lower: true, strict: true }),
                })
              }
              isRequired
              variant='bordered'
              description='URL-friendly version (lowercase, hyphens only)'
            />

            <Input
              label='Meta Title'
              placeholder='SEO title'
              value={formData.meta_title}
              onValueChange={(val) =>
                setFormData({ ...formData, meta_title: val })
              }
              variant='bordered'
            />

            <Textarea
              label='Meta Description'
              placeholder='Brief SEO description'
              value={formData.meta_description}
              onValueChange={(val) =>
                setFormData({ ...formData, meta_description: val })
              }
              variant='bordered'
              minRows={3}
            />

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>
                Bundle Image{' '}
                {!initialData && <span className='text-red-500'>*</span>}
              </label>
              <input
                type='file'
                accept='image/*'
                onChange={handleImageChange}
                className='text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  className='w-32 h-32 object-cover rounded-lg border-2'
                  alt='Preview'
                />
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='danger' variant='light' onPress={onClose}>
            Cancel
          </Button>
          <Button color='primary' onPress={handleSubmit} isLoading={isLoading}>
            {initialData ? 'Update Bundle' : 'Create Bundle'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BundleModal;
