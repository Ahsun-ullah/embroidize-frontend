'use client';

import MDEditor from '@uiw/react-md-editor';
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
import { PlusIcon, VerticalDotsIcon } from '@/components/icons';
import {
  Button,
  Checkbox,
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
  Pagination,
  Textarea,
} from '@heroui/react';
import { Download, Heart, ImageOff } from 'lucide-react';

// Redux & Utils
import AdminChoiceToggle from '@/components/Common/AdminChoiceToggle';
import { ErrorToast } from '@/components/Common/ErrorToast';
import ProductFlagToggle from '@/components/Common/ProductFlagToggle';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  useGetPublicProductCategoriesQuery,
  useGetPublicProductSubCategoriesQuery,
} from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import { useDeleteProductMutation } from '@/lib/redux/admin/protectedProducts/protectedProductSlice';
import { slugify } from '@/utils/functions/page';

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
  const [bundleDescription, setBundleDescription] = useState('');
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

  // Selection is a plain Set of product ids, driven by the per-card checkboxes.
  const selectedIds = useMemo(() => {
    if (selectedKeys === 'all') return initialData.map((item) => item._id);
    return Array.from(selectedKeys);
  }, [selectedKeys, initialData]);

  const toggleSelect = useCallback((id) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev === 'all' ? [] : prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllOnPage = useCallback(() => {
    setSelectedKeys(new Set(initialData.map((p) => p._id)));
  }, [initialData]);

  const clearSelection = useCallback(() => setSelectedKeys(new Set()), []);

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
    setBundleDescription('');
    setBundleMetaTitle('');
    setBundleMetaDescription('');
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
      formData.append('description', bundleDescription || '');
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

  const renderProductCard = useCallback(
    (product, isSelected) => {
      const slug = product.slug;
      const imageUrl = product?.image?.url;
      const editHref = `/admin/add-products?productId=${product._id}`;
      const downloadCount = product.downloadCount ?? 0;
      const favoriteCount = product.favoriteCount ?? 0;

      return (
        <div
          key={product._id}
          className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
            isSelected ? 'border-black ring-1 ring-black' : 'border-gray-100'
          }`}
        >
          {/* ── Image + overlays ── */}
          <div className='relative aspect-[16/10] overflow-hidden bg-gray-50'>
            {/* Selection checkbox */}
            <div className='absolute left-2 top-2 z-10 rounded-md bg-white/95 p-0.5 shadow-sm backdrop-blur-sm'>
              <Checkbox
                size='sm'
                isSelected={isSelected}
                onValueChange={() => toggleSelect(product._id)}
                aria-label={`Select ${product.name}`}
              />
            </div>

            {/* Admin Choice star toggle (renders only for admins) */}
            <div className='absolute right-2 top-2 z-10'>
              <AdminChoiceToggle
                productId={product._id}
                initialStatus={product.isAdminChoice}
              />
            </div>

            <Link
              href={slug ? `/product/${slug}` : '#'}
              target={slug ? '_blank' : undefined}
              rel='noopener noreferrer'
              className='block h-full w-full'
              title={slug ? 'Open product page' : undefined}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={product.name || 'design'}
                  className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center text-gray-300'>
                  <ImageOff size={48} />
                </div>
              )}
            </Link>
          </div>

          {/* ── Body ── */}
          <div className='flex flex-1 flex-col gap-2 p-3'>
            <div className='flex items-start justify-between gap-2'>
              <Link
                href={slug ? `/product/${slug}` : '#'}
                target={slug ? '_blank' : undefined}
                rel='noopener noreferrer'
                className='line-clamp-2 text-sm font-semibold leading-snug hover:underline'
              >
                {product.name || '—'}
              </Link>
            </div>

            <div className='text-xs text-gray-700 space-y-0.5'>
              <p className='flex gap-1'>
                <span className='text-gray-400 shrink-0'>Category:</span>
                <span className='font-medium line-clamp-1'>
                  {product.category?.name || '—'}
                </span>
              </p>
              <p className='flex gap-1'>
                <span className='text-gray-400 shrink-0'>Subcategory:</span>
                <span className='font-medium line-clamp-1'>
                  {product.sub_category?.name || '—'}
                </span>
              </p>
            </div>

            {/* Stats row: downloads + favourites (compact) */}
            <div className='grid grid-cols-2 gap-1.5'>
              <div
                className='flex items-center justify-center gap-1 rounded-md bg-gradient-to-br from-gray-900 to-gray-700 text-white py-1'
                title={`${downloadCount} downloads`}
              >
                <Download size={12} />
                <span className='text-xs font-bold leading-none'>
                  {downloadCount}
                </span>
              </div>
              <div
                className='flex items-center justify-center gap-1 rounded-md border border-gray-300 py-1'
                title={`${favoriteCount} favourites`}
              >
                <Heart size={12} className='fill-gray-900 text-gray-900' />
                <span className='text-xs font-bold leading-none'>
                  {favoriteCount}
                </span>
              </div>
            </div>

            <div className='flex items-center justify-between text-xs'>
              <span className='font-semibold text-gray-900'>
                {product.serial_no != null && (
                  <span className='shrink-0 font-mono text-[11px] text-gray-400'>
                    #{product.serial_no}
                  </span>
                )}
              </span>
              <span className='text-gray-950'>
                SKU: {product.sku_code || '—'}
              </span>
            </div>

            {/* Tier + Status toggles */}
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <ProductFlagToggle
                productId={product._id}
                field='isFree'
                initialValue={product.isFree === true}
                onConfig={{
                  label: 'Free',
                  className:
                    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
                }}
                offConfig={{
                  label: 'Premium',
                  className: 'bg-gray-900 text-white hover:bg-gray-700',
                }}
                messages={{ on: 'Marked as Free', off: 'Marked as Premium' }}
              />
              <ProductFlagToggle
                productId={product._id}
                field='isActive'
                initialValue={product.isActive !== false}
                onConfig={{
                  label: 'Active',
                  className:
                    'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
                }}
                offConfig={{
                  label: 'Inactive',
                  className: 'bg-red-100 text-red-700 hover:bg-red-200',
                }}
                messages={{
                  on: 'Product activated',
                  off: 'Product deactivated',
                }}
              />
            </div>

            {/* Actions */}
            <div className='mt-auto flex items-center gap-2 pt-1'>
              <Button
                size='sm'
                variant='flat'
                className='flex-1'
                onPress={() => router.push(editHref)}
              >
                Edit
              </Button>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size='sm' variant='light'>
                    <VerticalDotsIcon className='text-default-300' />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label='Product actions'>
                  <DropdownItem
                    key='edit'
                    onPress={() => router.push(editHref)}
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
          </div>
        </div>
      );
    },
    [deleteProduct, router, toggleSelect],
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

  // Derived selection helpers for the card grid.
  const selectedSet =
    selectedKeys === 'all'
      ? new Set(initialData.map((p) => p._id))
      : selectedKeys;
  const allOnPageSelected =
    initialData.length > 0 && initialData.every((p) => selectedSet.has(p._id));

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

      {/* Filters + bulk-action bar */}
      {topContent}

      {/* Select-all / clear row */}
      {initialData.length > 0 && (
        <div className='mb-3 flex items-center gap-4 text-sm'>
          <Checkbox
            size='sm'
            isSelected={allOnPageSelected}
            isIndeterminate={selectedIds.length > 0 && !allOnPageSelected}
            onValueChange={(checked) =>
              checked ? selectAllOnPage() : clearSelection()
            }
          >
            Select all on this page
          </Checkbox>
          {selectedIds.length > 0 && (
            <button
              type='button'
              onClick={clearSelection}
              className='font-medium text-red-500 hover:text-red-700'
            >
              Clear selection ({selectedIds.length})
            </button>
          )}
        </div>
      )}

      {/* Product cards */}
      {initialData.length === 0 ? (
        <div className='py-16 text-center text-gray-400'>No products found</div>
      ) : (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
          {initialData.map((product) =>
            renderProductCard(product, selectedSet.has(product._id)),
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className='mt-8 flex justify-center'>
          <Pagination
            isCompact
            showControls
            showShadow
            color='primary'
            page={pagination?.page || 1}
            total={pagination.totalPages}
            onChange={onPageChange}
          />
        </div>
      )}

      <Modal
        isOpen={isBundleModalOpen}
        onClose={handleCloseBundleModal}
        size='3xl'
        backdrop='blur'
        scrollBehavior='outside'
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
            <div className='flex flex-col gap-1'>
              <label className='text-sm font-medium text-gray-700'>
                Description
              </label>
              <div data-color-mode='light'>
                <MDEditor
                  value={bundleDescription}
                  onChange={(val) => setBundleDescription(val || '')}
                  height={220}
                  preview='edit'
                />
              </div>
            </div>
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
