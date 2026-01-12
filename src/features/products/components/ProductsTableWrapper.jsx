'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Select from 'react-select';

// UI Components
import UserTable from '@/components/Common/Table';
import { PlusIcon, VerticalDotsIcon } from '@/components/icons';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  User,
} from '@heroui/react';

// Redux & Utils
import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  useGetPublicProductCategoriesQuery,
  useGetPublicProductSubCategoriesQuery,
} from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import { useDeleteProductMutation } from '@/lib/redux/admin/protectedProducts/protectedProductSlice';
import { capitalize, slugify } from '@/utils/functions/page';

// React-Select Custom Styles
const customSelectStyles = {
  control: (base) => ({
    ...base,
    minHeight: '40px',
    borderRadius: '12px',
    borderColor: '#e5e7eb',
    fontSize: '0.875rem',
    boxShadow: 'none',
    '&:hover': { borderColor: '#d1d5db' },
  }),
  menu: (base) => ({ ...base, zIndex: 50, fontSize: '0.875rem' }),
};

export default function ProductsTableWrapper({
  initialData = [],
  pagination,
  columns,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [isCreatingBundle, setIsCreatingBundle] = useState(false);
  const [isUpdatingChoice, setIsUpdatingChoice] = useState(false);

  // Bundle Modal State
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [bundleName, setBundleName] = useState('');
  const [bundleImage, setBundleImage] = useState(null);
  const [bundleImagePreview, setBundleImagePreview] = useState('');
  const [bundleSlug, setBundleSlug] = useState('');
  const [bundleMetaTitle, setBundleMetaTitle] = useState('');
  const [bundleMetaDescription, setBundleMetaDescription] = useState('');

  // --- API Hooks ---
  const { data: categoryData } = useGetPublicProductCategoriesQuery();
  const { data: subCategoryData } = useGetPublicProductSubCategoriesQuery();
  const [deleteProduct] = useDeleteProductMutation();

  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || '',
  );

  // Sync local state when URL changes
  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
  }, [searchParams]);

  const categoryOptions = useMemo(() => {
    return (categoryData?.data || []).map((cat) => ({
      label: cat.name,
      value: cat._id,
    }));
  }, [categoryData]);

  const selectedCategoryId = searchParams.get('category');
  const selectedSubCategoryId = searchParams.get('sub_category');

  const subCategoryOptions = useMemo(() => {
    if (!selectedCategoryId) return [];
    return (subCategoryData?.data || [])
      .filter((sub) => {
        const subCatId =
          typeof sub.category === 'object' ? sub.category?._id : sub.category;
        return subCatId === selectedCategoryId;
      })
      .map((sub) => ({
        label: sub.name,
        value: sub._id,
      }));
  }, [subCategoryData, selectedCategoryId]);

  const activeCategoryOption =
    categoryOptions.find((c) => c.value === selectedCategoryId) || null;
  const activeSubCategoryOption =
    subCategoryOptions.find((s) => s.value === selectedSubCategoryId) || null;

  const selectedIds = useMemo(() => {
    if (selectedKeys === 'all') return initialData.map((item) => item._id);
    return Array.from(selectedKeys);
  }, [selectedKeys, initialData]);

  // --- URL Update Logic ---
  const updateURL = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      if ('category' in updates) {
        params.delete('sub_category');
      }

      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  // --- Handlers ---
  const onSearchChange = useCallback(
    (val) => {
      setSearchValue(val);
      updateURL({ search: val });
    },
    [updateURL],
  );

  const onSearchClear = useCallback(() => {
    setSearchValue('');
    updateURL({ search: '' });
  }, [updateURL]);

  const onCategoryChange = useCallback(
    (option) => {
      updateURL({ category: option?.value || '' });
    },
    [updateURL],
  );

  const onSubCategoryChange = useCallback(
    (option) => {
      updateURL({ sub_category: option?.value || '' });
    },
    [updateURL],
  );

  const handleClearAllFilters = useCallback(() => {
    setSearchValue('');
    router.push('?page=1');
  }, [router]);

  const onPageChange = useCallback(
    (newPage) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  // --- Bundle Image Handler ---
  const handleBundleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        ErrorToast('Error', 'Please select a valid image file', 3000);
        return;
      }
      setBundleImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBundleImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Open Bundle Modal ---
  const handleOpenBundleModal = () => {
    if (selectedIds.length === 0) {
      ErrorToast('Error', 'Please select at least one product', 3000);
      return;
    }
    setIsBundleModalOpen(true);
  };

  // Update bundleName handler
  const handleBundleNameChange = (value) => {
    setBundleName(value);
    // Auto-generate slug using slugify
    setBundleSlug(slugify(value, { lower: true, strict: true }));
  };

  const handleCloseBundleModal = () => {
    setIsBundleModalOpen(false);
    setBundleName('');
    setBundleImage(null);
    setBundleImagePreview('');
    setBundleSlug('');
  };

  const handleSubmitBundle = async () => {
    if (!bundleName.trim() || !bundleSlug)
      return ErrorToast('Error', 'Required fields missing', 3000);
    setIsCreatingBundle(true);
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];
      const apiUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
        process.env.NEXT_PUBLIC_BASE_API_URL;
      const formData = new FormData();
      formData.append('name', bundleName.trim());
      formData.append('productIds', JSON.stringify(selectedIds));
      formData.append('slug', bundleSlug);
      formData.append('meta_title', bundleMetaTitle || '');
      formData.append('meta_description', bundleMetaDescription || '');
      if (bundleImage) formData.append('image', bundleImage);

      const res = await fetch(`${apiUrl}/admin/bundle-product`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        SuccessToast('Success', 'Bundle created successfully', 3000);
        handleCloseBundleModal();
        setSelectedKeys(new Set([]));
        router.push('/admin/bundle-products');
        router.refresh();
      }
    } catch (error) {
      ErrorToast('Error', 'Something went wrong', 3000);
    } finally {
      setIsCreatingBundle(false);
    }
  };

  const handleSetAdminChoice = async (status) => {
    if (selectedIds.length === 0) return;
    setIsUpdatingChoice(true);
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];
      const apiUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
        process.env.NEXT_PUBLIC_BASE_API_URL;

      const res = await fetch(`${apiUrl}/admin/embroidize-choice/create`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds: selectedIds, status }),
      });

      if (res.ok) {
        SuccessToast(
          'Success',
          `Admin Choice ${status ? 'Added' : 'Removed'}`,
          3000,
        );
        startTransition(() => {
          setSelectedKeys(new Set([]));
          router.refresh();
        });
      }
    } catch (error) {
      ErrorToast('Error', 'Update failed', 3000);
    } finally {
      setIsUpdatingChoice(false);
    }
  };

  const renderCell = useCallback(
    (product, columnKey) => {
      const cellValue = product[columnKey];
      switch (columnKey) {
        case 'name':
          return (
            <User
              avatarProps={{ radius: 'lg', src: product?.image?.url }}
              name={cellValue}
            >
              {product.name}
            </User>
          );
        case 'isAdminChoice':
          return (
            <div className='flex justify-center'>
              {product.isAdminChoice ? (
                <i className='ri-shield-star-fill text-2xl text-primary'></i>
              ) : (
                <span className='text-gray-300'>-</span>
              )}
            </div>
          );
        case 'category':
          return <span>{capitalize(product?.category?.name || '-')}</span>;
        case 'sub_category':
          return <span>{capitalize(product?.sub_category?.name || '-')}</span>;
        case 'actions':
          return (
            <div className='flex justify-center items-center'>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size='sm' variant='light'>
                    <VerticalDotsIcon className='text-default-300' />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key='edit'
                    onPress={() =>
                      router.push(
                        `/admin/add-products?productId=${product._id}`,
                      )
                    }
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key='delete'
                    className='text-danger'
                    color='danger'
                    onPress={() => deleteProduct(product._id)}
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [deleteProduct, router],
  );

  const topContent = useMemo(
    () => (
      <div className='flex flex-col gap-4 mb-4'>
        <div className='flex flex-wrap gap-3 items-end justify-start relative'>
          {/* Search Input */}
          <Input
            isClearable
            className='w-full sm:max-w-[30%]'
            placeholder='Search name...'
            value={searchValue}
            onValueChange={onSearchChange}
            onClear={onSearchClear}
          />

          {/* Category Select */}
          <div className='w-full sm:max-w-[20%]'>
            <Select
              instanceId='category-select'
              placeholder='Category'
              options={categoryOptions}
              value={activeCategoryOption}
              onChange={onCategoryChange}
              styles={customSelectStyles}
            />
          </div>

          {/* Sub-Category Select */}
          <div className='w-full sm:max-w-[20%]'>
            <Select
              instanceId='sub-category-select'
              placeholder='Sub-Category'
              isDisabled={
                !selectedCategoryId || subCategoryOptions.length === 0
              }
              options={subCategoryOptions}
              value={activeSubCategoryOption}
              onChange={onSubCategoryChange}
              styles={customSelectStyles}
              noOptionsMessage={() =>
                selectedCategoryId
                  ? 'No sub-categories found'
                  : 'Select a category first'
              }
            />
          </div>

          {/* Clear All Button */}
          {(searchValue || selectedCategoryId || selectedSubCategoryId) && (
            <button
              className='text-red-500 hover:text-red-700 font-bold ml-2 self-center'
              onClick={handleClearAllFilters}
              title='Clear all filters'
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Buttons when items are selected */}
        {selectedIds.length > 0 && (
          <div className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200'>
            <span className='text-sm font-medium text-blue-700'>
              {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''}{' '}
              selected
            </span>
            <div className='flex gap-2 ml-auto'>
              <Button
                size='sm'
                color='primary'
                onPress={() => setIsBundleModalOpen(true)}
              >
                Create Bundle
              </Button>
              <Button
                size='sm'
                color='primary'
                isLoading={isUpdatingChoice}
                onPress={() => handleSetAdminChoice(true)}
              >
                Add Choice
              </Button>
              <Button
                size='sm'
                variant='flat'
                color='danger'
                isLoading={isUpdatingChoice}
                onPress={() => handleSetAdminChoice(false)}
              >
                Remove Choice
              </Button>
            </div>
          </div>
        )}
      </div>
    ),
    [
      searchValue,
      categoryOptions,
      subCategoryOptions,
      activeCategoryOption,
      activeSubCategoryOption,
      selectedCategoryId,
      selectedSubCategoryId,
      selectedIds.length,
      onSearchChange,
      onSearchClear,
      onCategoryChange,
      onSubCategoryChange,
      handleClearAllFilters,
      handleOpenBundleModal,
    ],
  );

  return (
    <>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-xl font-bold'>
          Total {pagination?.total || 0} Products
        </h1>
        <Link href='/admin/add-products' prefetch={false}>
          <Button
            className='bg-foreground text-background'
            endContent={<PlusIcon />}
            size='sm'
          >
            Add New
          </Button>
        </Link>
      </div>

      <UserTable
        data={initialData}
        columns={columns}
        pageSize={pagination?.limit || 10}
        renderCell={renderCell}
        onPageChange={onPageChange}
        pagination={pagination}
        topContent={topContent}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      />

      <Modal
        isOpen={isBundleModalOpen}
        onClose={handleCloseBundleModal}
        size='3xl'
        backdrop='blur'
        scrollBehavior='inside'
      >
        <ModalContent>
          <ModalHeader>Create Bundle Design</ModalHeader>
          <ModalBody className='gap-4'>
            <Input
              label='Bundle Name'
              value={bundleName}
              onValueChange={(v) => {
                setBundleName(v);
                setBundleSlug(slugify(v, { lower: true, strict: true }));
              }}
              isRequired
              variant='bordered'
            />
            <Input
              label='Bundle Slug'
              value={bundleSlug}
              onValueChange={setBundleSlug}
              isRequired
              variant='bordered'
            />
            <Input
              label='Meta Title'
              value={bundleMetaTitle}
              onValueChange={setBundleMetaTitle}
              variant='bordered'
            />
            <Textarea
              label='Meta Description'
              value={bundleMetaDescription}
              onValueChange={setBundleMetaDescription}
              variant='bordered'
              minRows={3}
            />
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>
                Bundle Image <span className='text-red-500'>*</span>
              </label>
              <input
                type='file'
                accept='image/*'
                onChange={handleBundleImageChange}
                className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              />
              {bundleImagePreview && (
                <img
                  src={bundleImagePreview}
                  className='w-32 h-32 object-cover rounded-lg border-2'
                  alt='preview'
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color='danger'
              variant='light'
              onPress={handleCloseBundleModal}
            >
              Cancel
            </Button>
            <Button
              color='primary'
              isLoading={isCreatingBundle}
              onPress={handleSubmitBundle}
            >
              Create Bundle
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
