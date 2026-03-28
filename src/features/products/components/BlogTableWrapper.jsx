'use client';
import UserTable from '@/components/Common/Table';
import { PlusIcon, VerticalDotsIcon } from '@/components/icons';
import { useSingleBlogQuery } from '@/lib/redux/admin/blogs/blogsSlice';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
  User,
} from '@heroui/react';
import { useCallback, useState } from 'react';
import { BlogForm } from './BlogForm';

export default function BlogTableWrapper({
  blogInitialData,
  blogColumns,
  blogPageSize,
  totalPages,
  currentPage,
  setPage,
  setSearch,
}) {
  const [blogId, setBlogId] = useState('');

  const { data: getSingleBlogData } = useSingleBlogQuery(blogId, {
    skip: !blogId,
    refetchOnMountOrArgChange: true,
  });

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // ✅ Server-side search trigger
  const handleSearch = useCallback(
    (value) => {
      setPage(1);
      setSearch(value);
    },
    [setSearch, setPage],
  );

  const handleEditBlog = useCallback(
    (id) => {
      setBlogId(id);
      setTimeout(() => onOpen(), 0);
    },
    [onOpen],
  );

  const handleAddBlog = useCallback(() => {
    setBlogId('');
    onOpen();
  }, [onOpen]);

  const handleCloseModal = useCallback(() => {
    onOpenChange();
    setTimeout(() => setBlogId(''), 300);
  }, [onOpenChange]);

  const blogRenderCell = useCallback(
    (blogItem, blogColumnKey) => {
      switch (blogColumnKey) {
        case 'image':
          return (
            <User
              avatarProps={{ radius: 'lg', src: blogItem?.image?.url }}
              name=''
            />
          );

        case 'title':
          return <div className='capitalize'>{blogItem.title}</div>;

        case 'doc_type':
          return (
            <div className='capitalize'>
              {blogItem.doc_type === 'blog' ? (
                <span className='text-blue-600'>Blog</span>
              ) : (
                <span className='text-green-600'>Resource</span>
              )}
            </div>
          );

        case 'actions':
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size='sm' variant='light'>
                  <VerticalDotsIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key='edit'
                  onPress={() => handleEditBlog(blogItem?._id)}
                >
                  Edit
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );

        default:
          return blogItem[blogColumnKey];
      }
    },
    [handleEditBlog],
  );

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h1>All Blogs</h1>

        <Button
          onPress={handleAddBlog}
          className='bg-foreground text-background'
          endContent={<PlusIcon />}
          size='sm'
        >
          Add Blog
        </Button>
      </div>

      <UserTable
        data={blogInitialData}
        columns={blogColumns}
        pageSize={blogPageSize}
        renderCell={blogRenderCell}
        onSearchChange={handleSearch}
        pagination={{
          totalPages,
          currentPage,
        }}
        onPageChange={setPage}
      />

      <BlogForm
        isOpen={isOpen}
        onOpenChange={handleCloseModal}
        blog={blogId ? getSingleBlogData?.data : null}
        setBlogId={setBlogId}
      />
    </div>
  );
}
