import { ProductsForm } from '@/features/products/components/ProductsForm';

export default function ContactsPage() {
  const dummyProduct = {
    id: '12345',
    name: 'Cozy Cotton Blanket',
    category: { value: 9, label: 'Zebra' },
    sub_category: { value: 9, label: 'Zebra' },
    price: 49.99,
    description:
      '## Cozy Cotton Blanket\n\nA soft and warm blanket made from 100% organic cotton. Perfect for chilly nights!',
    metaDescription:
      'Soft, warm, and eco-friendly cotton blanket for your home.',
    tags: ['cotton', 'cozy', 'home-decor'],
    image: {
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      alt: 'Cozy Cotton Blanket Preview',
    },

    designFile: {
      name: 'blanket_design.zip',
      url: 'data:application/zip;base64,...',
      type: 'application/zip',
      size: 116,
    },
  };
  return (
    <div className='w-full flex flex-col gap-4'>
      <h1 className='text-lg font-medium tracking-tight leading-5'>
        Product Form
      </h1>
      <ProductsForm product={dummyProduct} />
    </div>
  );
}
