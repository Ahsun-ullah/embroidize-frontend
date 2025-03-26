import LoadingSpinner from '@/components/Common/LoadingSpinner';
import CategoryTableWrapper from '@/features/products/components/CategoryTableWrapper';
import { Suspense } from 'react';

const categorygetFetchData = async () => {
  const categoriesData = [
    {
      _id: 1,
      name: 'Animals',
      status: 'active',
      image: {
        url: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Wild Animals Overview',
      },
    },
    {
      _id: 2,
      name: 'Flowers',
      status: 'inactive',
      image: {
        url: 'https://images.unsplash.com/photo-1466781783364-36c1eaff0009?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Vibrant Flower Field Preview',
      },
    },
    {
      _id: 3,
      name: 'Kids',
      status: 'active',
      image: {
        url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Kids Playing Together Preview',
      },
    },
    {
      _id: 4,
      name: 'Technology',
      status: 'active',
      image: {
        url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Modern Technology Overview',
      },
    },
    {
      _id: 5,
      name: 'Food',
      status: 'active',
      image: {
        url: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Delicious Food Overview',
      },
    },
    {
      _id: 6,
      name: 'Sports',
      status: 'inactive',
      image: {
        url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Sports Action Overview',
      },
    },
    {
      _id: 7,
      name: 'Travel',
      status: 'active',
      image: {
        url: 'https://images.unsplash.com/photo-1501785888045-9ba7e6e7b058?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Travel Destinations Overview',
      },
    },
    {
      _id: 8,
      name: 'Art',
      status: 'active',
      image: {
        url: 'https://images.unsplash.com/photo-1513366208864-875409d6184d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Artistic Creations Overview',
      },
    },
  ];
  return categoriesData;
};
const subCategorygetFetchData = async () => {
  const subcategoriesData = [
    // Subcategories for Animals
    {
      _id: 11,
      name: 'Mammals',
      category: { name: 'Animals' },
      image: {
        url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Majestic Lion Preview',
      },
    },
    {
      _id: 12,
      name: 'Birds',
      category: { name: 'Animals' },
      image: {
        url: 'https://images.unsplash.com/photo-1444464666168-49d8b4394f34?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Colorful Bird Preview',
      },
    },
    {
      _id: 13,
      name: 'Reptiles',
      category: { name: 'Animals' },
      image: {
        url: 'https://images.unsplash.com/photo-1508180586656-9db6974d1792?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Slithering Snake Preview',
      },
    },
    // Subcategories for Flowers
    {
      _id: 21,
      name: 'Roses',
      category: { name: 'Flowers' },
      image: {
        url: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Elegant Rose Preview',
      },
    },
    {
      _id: 22,
      name: 'Lilies',
      category: { name: 'Flowers' },
      image: {
        url: 'https://images.unsplash.com/photo-1598880903985-8d3e3e95d2e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Graceful Lily Preview',
      },
    },
    {
      _id: 23,
      name: 'Sunflowers',
      category: { name: 'Flowers' },
      image: {
        url: 'https://images.unsplash.com/photo-1503792304471-6c3b7ed16e4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Bright Sunflower Preview',
      },
    },
    // Subcategories for Kids
    {
      _id: 31,
      name: 'Toys',
      category: { name: 'Kids' },
      image: {
        url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Cute Teddy Bear Preview',
      },
    },
    {
      _id: 32,
      name: 'Games',
      category: { name: 'Kids' },
      image: {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Fun Board Game Preview',
      },
    },
    {
      _id: 33,
      name: 'Books',
      category: { name: 'Kids' },
      image: {
        url: 'https://images.unsplash.com/photo-1516979187457-637a632deac8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Colorful Kids Books Preview',
      },
    },
    // Subcategories for Technology
    {
      _id: 41,
      name: 'Gadgets',
      category: { name: 'Technology' },
      image: {
        url: 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Smartphone Preview',
      },
    },
    {
      _id: 42,
      name: 'Computers',
      category: { name: 'Technology' },
      image: {
        url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Laptop Preview',
      },
    },
    {
      _id: 43,
      name: 'Wearables',
      category: { name: 'Technology' },
      image: {
        url: 'https://images.unsplash.com/photo-1529243856184-fdcaf31e6795?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Smartwatch Preview',
      },
    },
    // Subcategories for Food
    {
      _id: 51,
      name: 'Desserts',
      category: { name: 'Food' },
      image: {
        url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Chocolate Cake Preview',
      },
    },
    {
      _id: 52,
      name: 'Beverages',
      category: { name: 'Food' },
      image: {
        url: 'https://images.unsplash.com/photo-1544140708-514c08c041e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Coffee Preview',
      },
    },
    {
      _id: 53,
      name: 'Snacks',
      category: { name: 'Food' },
      image: {
        url: 'https://images.unsplash.com/photo-1496417263033-9276581c503a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Pretzels Preview',
      },
    },
    // Subcategories for Sports
    {
      _id: 61,
      name: 'Football',
      category: { name: 'Sports' },
      image: {
        url: 'https://images.unsplash.com/photo-1575361204480-aadea5ffd8a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Football Game Preview',
      },
    },
    {
      _id: 62,
      name: 'Basketball',
      category: { name: 'Sports' },
      image: {
        url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Basketball Dunk Preview',
      },
    },
    {
      _id: 63,
      name: 'Tennis',
      category: { name: 'Sports' },
      image: {
        url: 'https://images.unsplash.com/photo-1629718268256-7855f74563c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Tennis Match Preview',
      },
    },
    // Subcategories for Travel
    {
      _id: 71,
      name: 'Beaches',
      category: { name: 'Travel' },
      image: {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Tropical Beach Preview',
      },
    },
    {
      _id: 72,
      name: 'Mountains',
      category: { name: 'Travel' },
      image: {
        url: 'https://images.unsplash.com/photo-1483728642387-6c3b5296e87e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Snowy Mountain Preview',
      },
    },
    {
      _id: 73,
      name: 'Cities',
      category: { name: 'Travel' },
      image: {
        url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'City Skyline Preview',
      },
    },
    // Subcategories for Art
    {
      _id: 81,
      name: 'Paintings',
      category: { name: 'Art' },
      image: {
        url: 'https://images.unsplash.com/photo-1579783902614-a3318b38c8e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Abstract Painting Preview',
      },
    },
    {
      _id: 82,
      name: 'Sculptures',
      category: { name: 'Art' },
      image: {
        url: 'https://images.unsplash.com/photo-1579706075579-1a6e4b0c53b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Marble Sculpture Preview',
      },
    },
    {
      _id: 83,
      name: 'Photography',
      category: { name: 'Art' },
      image: {
        url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        alt: 'Landscape Photography Preview',
      },
    },
  ];
  return subcategoriesData;
};

export default async function AllCategoriesAndSubcategoriesListPage() {
  const categoryData = await categorygetFetchData();
  const subCategoryData = await subCategorygetFetchData();

  const categoryColumns = [
    { name: 'IMAGE', uid: 'image?.url' },
    { name: 'CATEGORY NAME', uid: 'name' },
    { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
  ];
  const subCategoryColumns = [
    { name: 'IMAGE', uid: 'image?.url' },
    { name: 'SUB CATEGORY NAME', uid: 'name' },
    { name: 'CATEGORY NAME', uid: 'category' },
    { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div className='flex flex-col gap-3'>
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryTableWrapper
          categoryInitialData={categoryData}
          subCategoryInitialData={subCategoryData}
          categoryColumns={categoryColumns}
          subCategoryColumns={subCategoryColumns}
          categoryPageSize={5}
          subCategoryPageSize={5}
          categorySearchableFieldsName={['name', 'status']}
          subCategorySearchableFieldsName={['name', 'status']}
        />
      </Suspense>
    </div>
  );
}
