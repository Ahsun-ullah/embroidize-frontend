import { getPosts } from '@/lib/wordpress';
import { Divider } from '@heroui/divider';
import Link from 'next/link';

export default async function BlogPageSidebarContent() {
  const recentPosts = await getPosts();

  const usefulLinks = [
    { label: 'Useful Link 01', href: '/link1' },
    { label: 'Useful Link 02', href: '/link2' },
    { label: 'Useful Link 03', href: '/link3' },
    { label: 'Useful Link 04', href: '/link4' },
    { label: 'Useful Link 05', href: '/link5' },
  ];

  return (
    <aside className='w-full lg:w-1/3 space-y-8'>
      {/* Recent Blog Posts */}
      {recentPosts?.length > 0 && (
        <div>
          <h2 className='text-xl font-semibold mb-4'>Recent Blog Posts</h2>
          <div className='space-y-12'>
            {recentPosts.slice(0, 6).map((post, index) => (
              <Link
                href={`/blog/${post.slug}`}
                key={index}
                className='flex flex-col gap-4 w-60% lg:w-full'
              >
                {/* Thumbnail */}
                <div className='h- bg-gray-200 rounded-lg overflow-hidden shadow-md'>
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title.rendered}
                      className='w-full h-full object-cover'
                    />
                  ) : null}
                </div>

                {/* Title */}
                <p className='text-sm text-start hover:underline break-words line-clamp-2'>
                  {post.title.rendered}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Divider orientation='horizontal' className=' bg-gray-300' />

      {/* Useful Links */}
      {/* {usefulLinks?.length > 0 && (
        <div>
          <h2 className='text-xl font-semibold mb-4'>Useful Links</h2>
          <ul className='space-y-2 text-sm text-blue-600'>
            {usefulLinks.map((link, index) => (
              <li key={index}>
                <Link href={link.href || '#'} className='hover:underline'>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </aside>
  );
}
