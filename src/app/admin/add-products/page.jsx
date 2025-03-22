import { ProductsForm } from '@/features/products/ProductsForm';

export default function ContactsPage() {
  return (
    <div className='w-full flex flex-col gap-4'>
      <h1 className='text-lg font-medium tracking-tight leading-5'>
        Product Form
      </h1>
      <ProductsForm
      //   product={'product'}
      />
    </div>
  );
}
