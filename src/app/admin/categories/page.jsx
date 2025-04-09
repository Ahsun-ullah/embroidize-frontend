'use client';

import CategoryTableWrapper from '@/features/products/components/CategoryTableWrapper';
import {
  useGetPublicProductCategoriesQuery,
  useGetPublicProductSubCategoriesQuery,
} from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';

export default function AllCategoriesAndSubcategoriesListPage() {
  const { data: categoryData } = useGetPublicProductCategoriesQuery();
  const { data: subCategoryData } = useGetPublicProductSubCategoriesQuery();

  const categoryColumns = [
    { name: 'IMAGE', uid: 'image?.url' },
    { name: 'CATEGORY NAME', uid: 'name' },
    // { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
  ];
  const subCategoryColumns = [
    { name: 'IMAGE', uid: 'image?.url' },
    { name: 'SUB CATEGORY NAME', uid: 'name' },
    { name: 'CATEGORY NAME', uid: 'category' },
    // { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div className='flex flex-col gap-3'>
      {/* <Suspense fallback={<LoadingSpinner />}> */}
      <CategoryTableWrapper
        categoryInitialData={categoryData?.data}
        subCategoryInitialData={subCategoryData?.data}
        categoryColumns={categoryColumns}
        subCategoryColumns={subCategoryColumns}
        categoryPageSize={5}
        subCategoryPageSize={5}
        categorySearchableFieldsName={['name']}
        subCategorySearchableFieldsName={['name']}
      />
      {/* </Suspense> */}
    </div>
  );
}
