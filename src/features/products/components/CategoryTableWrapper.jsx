'use client';
import UserTable from '@/components/Common/Table';
import { PlusIcon, VerticalDotsIcon } from '@/components/icons';
import {
  useGetSinglePublicProductCategoryQuery,
  useGetSinglePublicProductSubCategoryQuery,
} from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
  User,
} from '@heroui/react';
import { useCallback, useEffect, useState, useMemo } from 'react';
import CategoryModal from './CategoryModal';
import SubCategoryModal from './SubCategoryModal';

export default function CategoryTableWrapper({
  categoryInitialData,
  subCategoryInitialData,
  categoryColumns,
  subCategoryColumns,
  categoryPageSize,
  subCategoryPageSize,
  categorySearchableFieldsName,
  subCategorySearchableFieldsName,
}) {
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');

  // States for category pagination
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
  const [subCategoryCurrentPage, setSubCategoryCurrentPage] = useState(1);

  // States for filtered data (for search)
  const [categoryFilteredData, setCategoryFilteredData] = useState(
    categoryInitialData || [],
  );
  const [subCategoryFilteredData, setSubCategoryFilteredData] = useState(
    subCategoryInitialData || [],
  );

  // Update filtered data when initial data changes
  useEffect(() => {
    setCategoryFilteredData(categoryInitialData || []);
  }, [categoryInitialData]);

  useEffect(() => {
    setSubCategoryFilteredData(subCategoryInitialData || []);
  }, [subCategoryInitialData]);


  const { data: getSingleCategoryData } =
    useGetSinglePublicProductCategoryQuery(categoryId);

  const { data: getSingleSubCategoryData } =
    useGetSinglePublicProductSubCategoryQuery(subCategoryId);

  // Memoized paginated data for categories
  const paginatedCategoryData = useMemo(() => {
    const start = (categoryCurrentPage - 1) * categoryPageSize;
    const end = start + categoryPageSize;
    return (categoryFilteredData || []).slice(start, end);
  }, [categoryFilteredData, categoryCurrentPage, categoryPageSize]);

  // Memoized total pages for categories
  const categoryTotalPages = useMemo(() => {
    return Math.ceil((categoryFilteredData?.length || 0) / categoryPageSize);
  }, [categoryFilteredData?.length, categoryPageSize]);

  // Memoized paginated data for subcategories
  const paginatedSubCategoryData = useMemo(() => {
    const start = (subCategoryCurrentPage - 1) * subCategoryPageSize;
    const end = start + subCategoryPageSize;
    return (subCategoryFilteredData || []).slice(start, end);
  }, [subCategoryFilteredData, subCategoryCurrentPage, subCategoryPageSize]);

  // Memoized total pages for subcategories
  const subCategoryTotalPages = useMemo(() => {
    return Math.ceil((subCategoryFilteredData?.length || 0) / subCategoryPageSize);
  }, [subCategoryFilteredData?.length, subCategoryPageSize]);

  const onCategoryPageChange = useCallback((newPage) => {
    setCategoryCurrentPage(newPage);
  }, []);

  const onSubCategoryPageChange = useCallback((newPage) => {
    setSubCategoryCurrentPage(newPage);
  }, []);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: subCategoryIsOpen,
    onOpen: subCategoryOnOpen,
    onOpenChange: subCategoryOnOpenChange,
  } = useDisclosure();

  // Re-introduced filter functions
  const categoryFilterData = useCallback(
    (value) => {
      setCategoryCurrentPage(1); // Reset page on search
      if (!value || value.trim() === '') {
        setCategoryFilteredData(categoryInitialData || []);
        return;
      }

      const filtered = (categoryInitialData || []).filter((item) => {
        const availableFields = categorySearchableFieldsName.filter(
          (field) =>
            item.hasOwnProperty(field) &&
            item[field] !== undefined &&
            item[field] !== null,
        );

        return availableFields.some((field) =>
          item[field].toString().toLowerCase().includes(value.toLowerCase()),
        );
      });

      setCategoryFilteredData(filtered);
    },
    [categoryInitialData, categorySearchableFieldsName],
  );

  const subcategoryFilterData = useCallback(
    (value) => {
      setSubCategoryCurrentPage(1); // Reset page on search
      if (!value || value.trim() === '') {
        setSubCategoryFilteredData(subCategoryInitialData || []);
        return;
      }

      const filtered = (subCategoryInitialData || []).filter((item) => {
        const availableFields = subCategorySearchableFieldsName.filter(
          (field) =>
            item.hasOwnProperty(field) &&
            item[field] !== undefined &&
            item[field] !== null,
        );

        return availableFields.some((field) =>
          item[field].toString().toLowerCase().includes(value.toLowerCase()),
        );
      });

      setSubCategoryFilteredData(filtered);
    },
    [subCategoryInitialData, subCategorySearchableFieldsName],
  );

  const categoryRenderCell = useCallback((categoryItem, categoryColumnKey) => {
    try {
      const cellValue = categoryItem[categoryColumnKey];

      switch (categoryColumnKey) {
        case 'image?.url':
          return (
            <User
              avatarProps={{ radius: 'lg', src: categoryItem?.image?.url }}
              name={cellValue}
            />
          );
        case 'name':
          return <div>{categoryItem.name}</div>;
        case 'actions':
          return (
            <div className='flex justify-start items-center gap-2'>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size='sm' variant='light'>
                    <VerticalDotsIcon className='text-default-300' />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key='edit'
                    onPress={() => {
                      setCategoryId(categoryItem?._id);
                      onOpen();
                    }}
                  >
                    Edit
                  </DropdownItem>
                  {/* {categoryItem?.status === 'active' ? (
                    <DropdownItem
                      key='inactive'
                      onPress={() => {}}
                      className='text-danger'
                      color='danger'
                    >
                      Inactive
                    </DropdownItem>
                  ) : (
                    <DropdownItem
                      key='active'
                      onPress={() => {}}
                      className='text-success'
                      color='success'
                    >
                      Active
                    </DropdownItem>
                  )} */}
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    } catch (error) {
      console.error(`Error rendering cell ${categoryColumnKey}:`, error);
      return <span>Error</span>;
    }
  }, []);

  const subcategoryRenderCell = useCallback(
    (subcategoryItem, subcategoryColumnKey) => {
      try {
        const cellValue = subcategoryItem[subcategoryColumnKey];

        switch (subcategoryColumnKey) {
          case 'image?.url':
            return (
              <User
                avatarProps={{ radius: 'lg', src: subcategoryItem?.image?.url }}
                name={cellValue}
              />
            );
          case 'name':
            return <div>{subcategoryItem?.name}</div>;
          case 'category':
            return (
              <div className='flex flex-col items-start justify-start gap-4'>
                <div>{subcategoryItem?.category?.name}</div>
              </div>
            );
          case 'actions':
            return (
              <div className='flex justify-start items-center gap-2'>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size='sm' variant='light'>
                      <VerticalDotsIcon className='text-default-300' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem
                      key='edit'
                      onPress={() => {
                        setSubCategoryId(subcategoryItem?._id);
                        subCategoryOnOpen();
                      }}
                    >
                      Edit
                    </DropdownItem>
                    {/* {subcategoryItem?.status === 'active' ? (
                      <DropdownItem
                        key='inactive'
                        onPress={() => {}}
                        className='text-danger'
                        color='danger'
                      >
                        Inactive
                      </DropdownItem>
                    ) : (
                      <DropdownItem
                        key='active'
                        onPress={() => {}}
                        className='text-success'
                        color='success'
                      >
                        Active
                      </DropdownItem>
                    )} */}
                  </DropdownMenu>
                </Dropdown>
              </div>
            );
          default:
            return cellValue;
        }
      } catch (error) {
        console.error(`Error rendering cell ${subcategoryColumnKey}:`, error);
        return <span>Error</span>;
      }
    },
    [],
  );

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h1>All Categories & Sub-categories</h1>
        <div className='flex gap-4'>
          <Button
            onPress={onOpen}
            className='bg-foreground text-background'
            endContent={<PlusIcon />}
            size='sm'
          >
            Add Category
          </Button>
          <Button
            onPress={subCategoryOnOpen}
            className='bg-foreground text-background'
            endContent={<PlusIcon />}
            size='sm'
          >
            Add Subcategory
          </Button>
        </div>
        <CategoryModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          category={getSingleCategoryData?.data}
          setCategoryId={setCategoryId}
        />
        <SubCategoryModal
          isOpen={subCategoryIsOpen}
          onOpenChange={subCategoryOnOpenChange}
          subCategory={getSingleSubCategoryData?.data}
          setSubCategoryId={setSubCategoryId}
        />
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <UserTable
          data={paginatedCategoryData}
          columns={categoryColumns}
          pageSize={categoryPageSize}
          renderCell={categoryRenderCell}
          searchableFieldsName={categorySearchableFieldsName}
          onSearchChange={categoryFilterData}
          pagination={{ totalPages: categoryTotalPages, currentPage: categoryCurrentPage }}
          onPageChange={onCategoryPageChange}
        />
        <UserTable
          data={paginatedSubCategoryData}
          columns={subCategoryColumns}
          pageSize={subCategoryPageSize}
          renderCell={subcategoryRenderCell}
          searchableFieldsName={subCategorySearchableFieldsName}
          onSearchChange={subcategoryFilterData}
          pagination={{ totalPages: subCategoryTotalPages, currentPage: subCategoryCurrentPage }}
          onPageChange={onSubCategoryPageChange}
        />
      </div>
    </div>
  );
}
