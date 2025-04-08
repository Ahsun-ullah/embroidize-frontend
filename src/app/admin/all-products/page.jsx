import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ProductsTableWrapper from '@/features/products/components/ProductsTableWrapper';
import { Suspense } from 'react';

export const getProducts = async () => {
  const productData = [
    {
      _id: '12345',
      name: 'Cozy Cotton Blanket',
      category: { value: 'zebra', label: 'Zebra' },
      price: 49.99,
      description:
        '## Cozy Cotton Blanket\n\nA soft and warm blanket made from 100% organic cotton. Perfect for chilly nights!',
      metaDescription:
        'Soft, warm, and eco-friendly cotton blanket for your home.',
      tags: ['cotton', 'cozy', 'home-decor'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          alt: 'Cozy Cotton Blanket Preview',
        },
      ],
      designFile: {
        name: 'blanket_design.zip',
        url: 'data:application/zip;base64,...',
        type: 'application/zip',
        size: 116,
      },
      status: 'in-stock',
    },
    {
      _id: '12346',
      name: 'Silky Bamboo Pillow',
      category: { value: 'bedding', label: 'Bedding' },
      price: 29.99,
      description:
        '## Silky Bamboo Pillow\n\nA luxurious pillow made from sustainable bamboo fibers. Ideal for a restful sleep.',
      metaDescription: 'Eco-friendly bamboo pillow for ultimate comfort.',
      tags: ['bamboo', 'pillow', 'bedding'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1584100936595-35e0b8b22551?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          alt: 'Silky Bamboo Pillow Preview',
        },
      ],
      designFile: {
        name: 'pillow_design.zip',
        url: 'data:application/zip;base64,...',
        type: 'application/zip',
        size: 98,
      },
      status: 'out-of-stock',
    },
    {
      _id: '12347',
      name: 'Rustic Wooden Shelf',
      category: { value: 'furniture', label: 'Furniture' },
      price: 79.99,
      description:
        '## Rustic Wooden Shelf\n\nA handcrafted wooden shelf with a rustic finish. Perfect for home organization.',
      metaDescription: 'Handcrafted rustic wooden shelf for stylish storage.',
      tags: ['wood', 'rustic', 'furniture'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          alt: 'Rustic Wooden Shelf Preview',
        },
      ],
      designFile: {
        name: 'shelf_design.zip',
        url: 'data:application/zip;base64,...',
        type: 'application/zip',
        size: 142,
      },
      status: 'in-stock',
    },
    {
      _id: '12348',
      name: 'Velvet Throw Cushion',
      category: { value: 'decor', label: 'Decor' },
      price: 19.99,
      description:
        '## Velvet Throw Cushion\n\nA plush velvet cushion to add a touch of elegance to your living space.',
      metaDescription: 'Plush velvet cushion for elegant home decor.',
      tags: ['velvet', 'cushion', 'decor'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1573865526326-3d26a81f5342?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          alt: 'Velvet Throw Cushion Preview',
        },
      ],
      designFile: {
        name: 'cushion_design.zip',
        url: 'data:application/zip;base64,...',
        type: 'application/zip',
        size: 85,
      },
      status: 'low-stock',
    },
    {
      _id: '12349',
      name: 'Ceramic Coffee Mug',
      category: { value: 'kitchen', label: 'Kitchen' },
      price: 14.99,
      description:
        '## Ceramic Coffee Mug\n\nA beautifully glazed ceramic mug for your daily coffee or tea.',
      metaDescription: 'Hand-glazed ceramic mug for hot beverages.',
      tags: ['ceramic', 'mug', 'kitchen'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1602030028438-4cf153c00d94?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          alt: 'Ceramic Coffee Mug Preview',
        },
      ],
      designFile: {
        name: 'mug_design.zip',
        url: 'data:application/zip;base64,...',
        type: 'application/zip',
        size: 73,
      },
      status: 'in-stock',
    },
    {
      _id: '12350',
      name: 'Linen Table Runner',
      category: { value: 'dining', label: 'Dining' },
      price: 34.99,
      description:
        '## Linen Table Runner\n\nA stylish linen runner to elevate your dining table decor.',
      metaDescription: 'Elegant linen table runner for dining.',
      tags: ['linen', 'runner', 'dining'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          alt: 'Linen Table Runner Preview',
        },
      ],
      designFile: {
        name: 'runner_design.zip',
        url: 'data:application/zip;base64,...',
        type: 'application/zip',
        size: 105,
      },
      status: 'discontinued',
    },
  ];

  return productData;
};

export default async function AllProductsListPage() {
  const data = await getProducts();

  const columns = [
    { name: 'NAME', uid: 'name' },
    { name: 'CATEGORY', uid: 'category' },
    { name: 'PRICE', uid: 'price' },
    { name: 'DESCRIPTION', uid: 'description' },
    { name: 'METADESCRIPTION', uid: 'metaDescription' },
    { name: 'TAGS', uid: 'tags' },
    { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div className='flex flex-col gap-3'>
      <Suspense fallback={<LoadingSpinner />}>
        <ProductsTableWrapper
          initialData={data}
          columns={columns}
          pageSize={5}
          searchableFieldsName={['name', 'category', 'price', 'tags']}
        />
      </Suspense>
    </div>
  );
}
