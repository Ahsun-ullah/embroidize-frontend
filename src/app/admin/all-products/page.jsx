import ProductsTableWrapper from '@/features/products/components/ProductsTableWrapper';
import { getAllProductsForDashboard } from '@/lib/apis/public/products';

export default async function AllProductsListPage({ searchParams }) {
  const params = await searchParams;

  const page = Number(params?.page) || 1;
  const search = params?.search || '';
  const categoryId = params?.category || '';
  const subCategoryId = params?.sub_category || '';
  const perPage = 10;

  // 2. Fetch Data on the Server
  const { products, totalCount, totalPages } = await getAllProductsForDashboard(
    search,
    page,
    perPage,
    categoryId,
    subCategoryId,
  );


  const columns = [
    { name: 'Admin Choice', uid: 'isAdminChoice' },
    { name: 'SL NO', uid: 'serial_no' },
    { name: 'NAME', uid: 'name' },
    { name: 'CATEGORY', uid: 'category' },
    { name: 'SUB CATEGORY', uid: 'sub_category' },
    { name: 'PRICE', uid: 'price' },
    { name: 'SKU', uid: 'sku_code' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <>
      <ProductsTableWrapper
        // Pass Data
        initialData={products}
        // Pass Pagination Info
        pagination={{
          total: totalCount,
          page: page,
          totalPages: totalPages,
          limit: perPage,
        }}
        // Pass Configuration
        columns={columns}
        searchableFieldsName={['name', 'category', 'price', 'sub_category']}
      />
    </>
  );
}
