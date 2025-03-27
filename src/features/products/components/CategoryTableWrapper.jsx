'use client';
import UserTable from '@/components/Common/Table';
import { PlusIcon, VerticalDotsIcon } from '@/components/icons';
import { categoryStatusColor } from '@/utils/colorStatus/page';
import { capitalize } from '@/utils/functions/page';
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
  User,
} from '@heroui/react';
import { useCallback, useState } from 'react';
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
  const [categoryFilteredData, setcategoryFilteredData] =
    useState(categoryInitialData);
  const [subCategoryFilteredData, setCategoryFilteredData] = useState(
    subCategoryInitialData,
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: subCategoryIsOpen,
    onOpen: subCategoryOnOpen,
    onOpenChange: subCategoryOnOpenChange,
  } = useDisclosure();

  const categoryFilterData = useCallback(
    (value) => {
      try {
        if (!value) {
          setFilteredData(categoryInitialData);
          return;
        }

        const filtered = categoryInitialData.filter((item) => {
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
        setcategoryFilteredData(filtered);
      } catch (error) {
        console.error('Error filtering data:', error);
        setcategoryFilteredData(categoryInitialData);
      }
    },
    [categoryInitialData, categorySearchableFieldsName],
  );
  const subcategoryFilterData = useCallback(
    (value) => {
      try {
        if (!value) {
          setFilteredData(subCategoryInitialData);
          return;
        }

        const filtered = subCategoryInitialData.filter((item) => {
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
        setCategoryFilteredData(filtered);
      } catch (error) {
        console.error('Error filtering data:', error);
        setCategoryFilteredData(subCategoryInitialData);
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
            ></User>
          );
        case 'name':
          return <div>{categoryItem.name}</div>;

        case 'status':
          return (
            <Chip
              className='capitalize'
              color={categoryStatusColor[categoryItem.status]}
              size='sm'
              variant='flat'
            >
              {capitalize(categoryItem.status)}
            </Chip>
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
                  <DropdownItem key='edit' onPress={() => {}}>
                    Edit
                  </DropdownItem>
                  {categoryItem?.status === 'active' ? (
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
                  )}
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
              ></User>
            );
          case 'name':
            return <div>{subcategoryItem?.name}</div>;

          case 'category':
            return (
              <div className='flex flex-col items-start justify-start gap-4'>
                <div>{subcategoryItem?.category?.name}</div>
              </div>
            );

          case 'status':
            return (
              <Chip
                className='capitalize'
                color={categoryStatusColor[subcategoryItem.status]}
                size='sm'
                variant='flat'
              >
                {capitalize(subcategoryItem.status)}
              </Chip>
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
                    <DropdownItem key='edit' onPress={() => {}}>
                      Edit
                    </DropdownItem>
                    {subcategoryItem?.status === 'active' ? (
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
                    )}
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
        <CategoryModal isOpen={isOpen} onOpenChange={onOpenChange} />
        <SubCategoryModal
          isOpen={subCategoryIsOpen}
          onOpenChange={subCategoryOnOpenChange}
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
