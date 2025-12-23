'use client';
import BlogTableWrapper from '@/features/products/components/BlogTableWrapper';
import { useAllBlogsQuery } from '@/lib/redux/admin/blogs/blogsSlice';

export default function BlogPageInAdmin() {
  const { data: blogsData, refetch: allBlogsRefetch } = useAllBlogsQuery();

  const blogColumns = [
    { name: 'IMAGE', uid: 'image?.url' },
    { name: 'BLOG TITLE', uid: 'title' },
    { name: 'DOC TYPE', uid: 'doc_type' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <div>
      <BlogTableWrapper
        blogInitialData={blogsData?.data?.blogs}
        blogColumns={blogColumns}
        blogPageSize={5}
        blogSearchableFieldsName={['title', 'doc_type']}
      />
    </div>
  );
}
