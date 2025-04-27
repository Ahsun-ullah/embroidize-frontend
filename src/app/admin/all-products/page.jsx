import ProductsTableWrapper from '@/features/products/components/ProductsTableWrapper';

export default function AllProductsListPage() {
  const columns = [
    { name: 'NAME', uid: 'name' },
    { name: 'CATEGORY', uid: 'category' },
    { name: 'SUB CATEGORY', uid: 'sub_category' },
    { name: 'PRICE', uid: 'price' },
    { name: 'DESCRIPTION', uid: 'description' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div className='flex flex-col gap-3'>
      <ProductsTableWrapper
        columns={columns}
        pageSize={10}
        searchableFieldsName={['name', 'category', 'price', 'tags']}
      />
    </div>
  );
}
