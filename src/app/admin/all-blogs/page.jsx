'use client';
import BlogTableWrapper from '@/features/products/components/BlogTableWrapper';
import { useAllBlogsQuery } from '@/lib/redux/admin/blogs/blogsSlice';
import { useState } from 'react';

export default function BlogPageInAdmin() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  const { data: blogsData, isLoading } = useAllBlogsQuery({
    page,
    limit,
    search,
  });

  const blogColumns = [
    { name: 'IMAGE', uid: 'image' },
    { name: 'BLOG TITLE', uid: 'title' },
    { name: 'DOC TYPE', uid: 'doc_type' },
    { name: 'ACTIONS', uid: 'actions' },
  ];


  return (
    <div>
      <BlogTableWrapper
        blogInitialData={blogsData?.data?.blogs}
        totalPages={blogsData?.data?.pagination?.totalPages}
        currentPage={page}
        setPage={setPage}
        setSearch={setSearch}
        blogColumns={blogColumns}
        blogPageSize={limit}
      />
    </div>
  );
}
