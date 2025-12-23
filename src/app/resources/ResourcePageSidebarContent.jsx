import { getResources } from '@/lib/apis/public/blog';
import { Divider } from '@heroui/divider';
import Link from 'next/link';

export default async function ResourcesPageSidebarContent() {
  // const recentPosts = await getPosts();

  const resourcesData = await getResources();

  const recentPosts = resourcesData?.resources;

  return (
    <aside className='w-full lg:w-1/3 space-y-8'>
      {/* Recent Resources Posts */}
      {recentPosts?.length > 0 && (
        <div>
          <h2 className='text-xl font-semibold mb-4'>Recent Resources Posts</h2>
          <div className='space-y-12'>
            {recentPosts.slice(0, 6).map((post, index) => (
              <Link
                href={`/resources/${post.slug}`}
                prefetch={false}
                key={index}
                className='flex flex-col gap-4 w-60% lg:w-full'
              >
                {/* Thumbnail */}
                <div className=' bg-gray-200  aspect-[3/2] rounded-lg overflow-hidden shadow-md'>
                  {post?.image?.url ? (
                    // post.featuredImage
                    <img
                      src={
                        post?.image?.url
                        // post.featuredImage
                      }
                      alt={
                        post.title
                        // post.title.rendered
                      }
                      className='w-full h-full object-cover'
                    />
                  ) : null}
                </div>

                {/* Title */}
                <p className='text-sm text-start hover:underline break-words line-clamp-2'>
                  {
                    post.title
                    // post.title.rendered
                  }
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
