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
import { useCallback, useEffect, useState } from 'react';
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
  const [categoryFilteredData, setCategoryFilteredData] = useState(
    categoryInitialData || [],
  );
  const [subCategoryFilteredData, setSubCategoryFilteredData] = useState(
    subCategoryInitialData || [],
  );

  const { data: getSingleCategoryData } =
    useGetSinglePublicProductCategoryQuery(categoryId);

  const { data: getSingleSubCategoryData } =
    useGetSinglePublicProductSubCategoryQuery(subCategoryId);

  console.log('subCategoryId', subCategoryId);
  console.log('getSingleSubCategoryData', getSingleSubCategoryData);

  useEffect(() => {
    // console.log('categoryInitialData updated:', categoryInitialData);
    setCategoryFilteredData(categoryInitialData || []);
  }, [categoryInitialData]);

  useEffect(() => {
    // console.log('subCategoryInitialData updated:', subCategoryInitialData);
    setSubCategoryFilteredData(subCategoryInitialData || []);
  }, [subCategoryInitialData]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: subCategoryIsOpen,
    onOpen: subCategoryOnOpen,
    onOpenChange: subCategoryOnOpenChange,
  } = useDisclosure();

  const categoryFilterData = useCallback(
    (value) => {
      try {
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
      } catch (error) {
        console.error('Error filtering data:', error);
        setCategoryFilteredData(categoryInitialData || []);
      }
    },
    [categoryInitialData, categorySearchableFieldsName],
  );

  const subcategoryFilterData = useCallback(
    (value) => {
      try {
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
      } catch (error) {
        console.error('Error filtering data:', error);
        setSubCategoryFilteredData(subCategoryInitialData || []);
      }
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

  // Log filtered data before rendering
  // console.log('Rendering - categoryFilteredData:', categoryFilteredData);
  // console.log('Rendering - subCategoryFilteredData:', subCategoryFilteredData);

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
          data={categoryFilteredData}
          columns={categoryColumns}
          pageSize={categoryPageSize}
          renderCell={categoryRenderCell}
          searchableFieldsName={categorySearchableFieldsName}
          onSearchChange={categoryFilterData}
        />
        <UserTable
          data={subCategoryFilteredData}
          columns={subCategoryColumns}
          pageSize={subCategoryPageSize}
          renderCell={subcategoryRenderCell}
          searchableFieldsName={subCategorySearchableFieldsName}
          onSearchChange={subcategoryFilterData}
        />
      </div>
    </div>
  );
}
