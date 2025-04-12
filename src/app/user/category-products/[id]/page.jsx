import ProductCard from '@/components/Common/ProductCard';
import { cookies } from 'next/headers';
import Pagination from '../../../../components/Common/Pagination';

export async function getProducts() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    const headers = new Headers();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/product`,
      {
        headers,
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

const CategoryProducts = async () => {
  // const [currentPage, setCurrentPage] = useState(0);
  // const [perPageData, setPerPageData] = useState(1);

  const allProducts = await getProducts();

  return (
    <>
      <div className='min-h-screen flex flex-col justify-between'>
        <section className='text-black my-8 py-6 border-b-2'>
          <section className='text-black my-8 py-6'>
            <div className='container mx-auto px-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10'>
                {allProducts?.data.map((item, index) => (
                  <ProductCard key={index} item={item} />
                ))}
              </div>
            </div>
          </section>
          <div className='flex items-center justify-center mt-6'>
            <Pagination
              style={{
                position: 'relative',
                bottom: 0,
                right: 20,
              }}
              data={allProducts?.data}
              currentPage={0}
              setCurrentPage={0}
              perPageData={1}
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default CategoryProducts;
