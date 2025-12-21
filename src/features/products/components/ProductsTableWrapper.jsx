'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Select from 'react-select';

// UI Components
import UserTable from '@/components/Common/Table';
import { PlusIcon, VerticalDotsIcon } from '@/components/icons';
import {
  Button,
  Chip,
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
import { productStatusColor } from '@/utils/colorStatus/page';
import { capitalize } from '@/utils/functions/page';

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
  pagination = {},
  columns,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [isCreatingBundle, setIsCreatingBundle] = useState(false);
  const [isCreatingChoice, setIsCreatingChoice] = useState(false);

  // Bundle Modal State
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [bundleName, setBundleName] = useState('');
  const [bundleImage, setBundleImage] = useState(null);
  const [bundleImagePreview, setBundleImagePreview] = useState('');

  // --- API Hooks ---
  const { data: categoryData } = useGetPublicProductCategoriesQuery();
  const { data: subCategoryData } = useGetPublicProductSubCategoriesQuery();
  const [deleteProduct] = useDeleteProductMutation();

  // --- LOCAL STATE FOR INSTANT TYPING ---
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || '',
  );

  // Sync local state when URL changes
  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
  }, [searchParams]);

  // --- Memoized Options ---
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

  // --- Selected IDs Logic ---
  const selectedIds = useMemo(() => {
    if (selectedKeys === 'all') {
      return initialData.map((item) => item._id);
    }
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

  // --- Close Bundle Modal ---
  const handleCloseBundleModal = () => {
    setIsBundleModalOpen(false);
    setBundleName('');
    setBundleImage(null);
    setBundleImagePreview('');
  };

  // --- Submit Bundle Creation ---
  const handleSubmitBundle = async () => {
    if (!bundleName.trim()) {
      ErrorToast('Error', 'Please enter a bundle name', 3000);
      return;
    }

    if (!bundleImage) {
      ErrorToast('Error', 'Please select a bundle image', 3000);
      return;
    }

    setIsCreatingBundle(true);
    try {
      // Get token from cookies (client-side)
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      console.log(token);

      const formData = new FormData();
      formData.append('name', bundleName.trim());
      formData.append('productIds', JSON.stringify(selectedIds));
      formData.append('image', bundleImage);

      const apiUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
        process.env.NEXT_PUBLIC_BASE_API_URL;

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/admin/bundle-product`, {
        method: 'POST',
        headers: headers, // ⭐ Now headers are passed correctly
        body: formData,
        credentials: 'include', // ⭐ Send cookies automatically
      });

      const data = await response.json();

      if (response.ok) {
        SuccessToast(
          'Success',
          data.message || 'Bundle created successfully',
          3000,
        );
        handleCloseBundleModal();
        setSelectedKeys(new Set([]));
        router.refresh();
      } else {
        ErrorToast('Error', data.message || 'Failed to create bundle', 3000);
      }
    } catch (error) {
      console.error('Bundle creation error:', error);
      ErrorToast('Error', 'Something went wrong', 3000);
    } finally {
      setIsCreatingBundle(false);
    }
  };

  // --- Embroidize Choice Handler ---
  const handleCreateEmbroidizeChoice = async () => {
    if (selectedIds.length === 0) {
      ErrorToast('Error', 'Please select at least one product', 3000);
      return;
    }

    setIsCreatingChoice(true);
    try {
      const response = await fetch('/api/admin/embroidize-choice/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: selectedIds }),
      });

      const data = await response.json();

      if (response.ok) {
        SuccessToast(
          'Success',
          data.message || 'Embroidize Choice created successfully',
          3000,
        );
        setSelectedKeys(new Set([]));
        router.refresh();
      } else {
        ErrorToast(
          'Error',
          data.message || 'Failed to create Embroidize Choice',
          3000,
        );
      }
    } catch (error) {
      ErrorToast('Error', 'Something went wrong', 3000);
    } finally {
      setIsCreatingChoice(false);
    }
  };

  // --- Render Cell ---
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
        case 'status':
          return (
            <Chip
              className='capitalize'
              color={productStatusColor[product.status]}
              size='sm'
              variant='flat'
            >
              {capitalize(product.status)}
            </Chip>
          );
        case 'category':
          return <span>{capitalize(product?.category?.name || '-')}</span>;
        case 'sub_category':
          return <span>{capitalize(product?.sub_category?.name || '-')}</span>;
        case 'actions':
          return (
            <div className='relative flex justify-center items-center gap-2'>
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
                    onPress={async () => await deleteProduct(product._id)}
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

  // --- Top Content ---
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
                variant='solid'
                onPress={handleOpenBundleModal}
              >
                Create Bundle Design
              </Button>
              <Button
                size='sm'
                color='primary'
                variant='solid'
                isLoading={isCreatingChoice}
                onPress={handleCreateEmbroidizeChoice}
              >
                Embroidize Choice
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
      isCreatingChoice,
      onSearchChange,
      onSearchClear,
      onCategoryChange,
      onSubCategoryChange,
      handleClearAllFilters,
      handleOpenBundleModal,
      handleCreateEmbroidizeChoice,
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

      {/* Bundle Creation Modal */}
      <Modal
        isOpen={isBundleModalOpen}
        onClose={handleCloseBundleModal}
        size='2xl'
        backdrop='blur'
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            Create Bundle Design
          </ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              {/* Selected Products Info */}
              <div className='p-3 bg-blue-50 rounded-lg'>
                <p className='text-sm text-blue-700'>
                  Creating bundle with {selectedIds.length} product
                  {selectedIds.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* Bundle Name Input */}
              <Input
                label='Bundle Name'
                placeholder='Enter bundle name'
                value={bundleName}
                onValueChange={setBundleName}
                isRequired
                variant='bordered'
              />

              {/* Image Upload */}
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium'>
                  Bundle Image <span className='text-red-500'>*</span>
                </label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleBundleImageChange}
                  className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                />
                {bundleImagePreview && (
                  <div className='mt-2'>
                    <img
                      src={bundleImagePreview}
                      alt='Bundle preview'
                      className='w-32 h-32 object-cover rounded-lg border-2 border-gray-200'
                    />
                  </div>
                )}
              </div>
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
              onPress={handleSubmitBundle}
              isLoading={isCreatingBundle}
            >
              Create Bundle
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
