import { getDownloadStats } from '@/lib/apis/protected/users';
import Image from 'next/image';
import Link from 'next/link';

export default async function MostDownloadedProducts({ searchParams }) {
  const page = parseInt(searchParams.page || '1', 10);
  const perPage = parseInt(searchParams.perPage || '10', 10);

  const statsResponse = await getDownloadStats(page, perPage);
  const { data, pagination } = statsResponse;



  return (
    <div className='bg-white border-2 rounded-2xl shadow-xl'>
      <h1 className='text-xl font-bold mb-4 p-3'>MOst Downloaded Products</h1>

      <table className='w-full text-sm border border-gray-300 '>
        <thead className='bg-gray-300'>
          <tr>
            <th className='p-2 border'>Image</th>
            <th className='p-2 border'>Product</th>
            <th className='p-2 border'>Category</th>
            <th className='p-2 border'>Subcategory</th>
            <th className='p-2 border'>Downloads</th>
            <th className='p-2 border'>File Types</th>
          </tr>
        </thead>
        <tbody>
          {data.map((stat) => (
            <tr key={stat._id} className='text-center border-b-2'>
              <td className='p-2 border'>
                <Image
                  src={stat.product.image?.url}
                  alt={stat.product.name}
                  height={60}
                  width={60}
                />
              </td>
              <td className='p-2 border'>{stat.product.name}</td>
              <td className='p-2 border'>
                {stat.product.category?.name || '-'}
              </td>
              <td className='p-2 border'>
                {stat.product.sub_category?.name || '-'}
              </td>
              <td className='p-2 border'>{stat.totalDownloads}</td>
              <td className='p-2 border'>
                {stat.fileTypes?.join(', ') || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className='flex items-center justify-between mt-6'>
        <Link
          href={`?page=${Math.max(page - 1, 1)}&perPage=${perPage}`}
          className={`px-4 py-2 border-2 rounded ${
            page === 1 ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          Previous
        </Link>

        <span>
          Page {page} of {pagination.totalPages}
        </span>

        <Link
          href={`?page=${Math.min(page + 1, pagination.totalPages)}&perPage=${perPage}`}
          className={`px-4 py-2 border-2 rounded ${
            page >= pagination.totalPages
              ? 'opacity-50 pointer-events-none'
              : ''
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
