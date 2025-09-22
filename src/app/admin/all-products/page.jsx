import ProductsTableWrapper from '@/features/products/components/ProductsTableWrapper';

export default function AllProductsListPage({ searchParams }) {
  const page = Number(searchParams.page) || 1;

  const columns = [
    { name: 'NAME', uid: 'name' },
    { name: 'CATEGORY', uid: 'category' },
    { name: 'SUB CATEGORY', uid: 'sub_category' },
    { name: 'PRICE', uid: 'price' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <>
      <ProductsTableWrapper
        columns={columns}
        pageSize={10}
        pageNumber={page}
        searchableFieldsName={['name', 'category', 'price', 'sub_category']}
      />
    </>
  );
}
