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
import { useCallback, useEffect, useState, useMemo } from 'react';
import { BlogForm } from './BlogForm';

export default function BlogTableWrapper({
  blogInitialData,
  blogColumns,
  blogPageSize,
  blogSearchableFieldsName,
}) {
  const [blogId, setBlogId] = useState('');
  
  // State for blog pagination
  const [blogCurrentPage, setBlogCurrentPage] = useState(1);

  // State for filtered data (for search)
  const [blogFilteredData, setBlogFilteredData] = useState(
    blogInitialData || [],
  );

  // Update filtered data when initial data changes
  useEffect(() => {
    setBlogFilteredData(blogInitialData || []);
  }, [blogInitialData]);

  const { data: getSingleBlogData } = useSingleBlogQuery(blogId);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Memoized paginated data for blogs
  const paginatedBlogData = useMemo(() => {
    const start = (blogCurrentPage - 1) * blogPageSize;
    const end = start + blogPageSize;
    return (blogFilteredData || []).slice(start, end);
  }, [blogFilteredData, blogCurrentPage, blogPageSize]);

  // Memoized total pages for blogs
  const blogTotalPages = useMemo(() => {
    return Math.ceil((blogFilteredData?.length || 0) / blogPageSize);
  }, [blogFilteredData?.length, blogPageSize]);

  const onBlogPageChange = useCallback((newPage) => {
    setBlogCurrentPage(newPage);
  }, []);

  const blogFilterData = useCallback(
    (value) => {
      setBlogCurrentPage(1); // Reset page on search
      try {
        if (!value || value.trim() === '') {
          setBlogFilteredData(blogInitialData || []);
          return;
        }

        const filtered = (blogInitialData || []).filter((item) => {
          const availableFields = blogSearchableFieldsName.filter(
            (field) =>
              item.hasOwnProperty(field) &&
              item[field] !== undefined &&
              item[field] !== null,
          );

          return availableFields.some((field) =>
            item[field].toString().toLowerCase().includes(value.toLowerCase()),
          );
        });

        setBlogFilteredData(filtered);
      } catch (error) {
        console.error('Error filtering data:', error);
        setBlogFilteredData(blogInitialData || []);
      }
    },
    [blogInitialData, blogSearchableFieldsName],
  );

  const blogRenderCell = useCallback((blogItem, blogColumnKey) => {
    try {
      const cellValue = blogItem[blogColumnKey];

      switch (blogColumnKey) {
        case 'image?.url':
          return (
            <User
              avatarProps={{ radius: 'lg', src: blogItem?.image?.url }}
              name={cellValue}
            />
          );
        case 'title':
          return <div className='capitalize'>{blogItem.title}</div>;
        case 'actions':
          return (
            <div className='flex justify-start items-center gap-2'>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size='sm' variant='light'>
                    <VerticalDotsIcon className='text-default-300' />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key='edit'
                    onPress={() => {
                      setBlogId(blogItem?._id);
                      onOpen();
                    }}
                  >
                    Edit
                  </DropdownItem>
                  {/* {blogItem?.status === 'active' ? (
                    <DropdownItem
                      key='inactive'
                      onPress={() => {}}
                      className='text-danger'
                      color='danger'
                    >
                      Inactive
                    </DropdownItem>
                  ) : (
                    <DropdownItem
                      key='active'
                      onPress={() => {}}
                      className='text-success'
                      color='success'
                    >
                      Active
                    </DropdownItem>
                  )} */}
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    } catch (error) {
      console.error(`Error rendering cell ${blogColumnKey}:`, error);
      return <span>Error</span>;
    }
  }, []);

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h1>All Blogs</h1>
        <div className='flex gap-4'>
          <Button
            onPress={onOpen}
            className='bg-foreground text-background'
            endContent={<PlusIcon />}
            size='sm'
          >
            Add Blog
          </Button>
        </div>
        <BlogForm
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          blog={getSingleBlogData?.data}
          setBlogId={setBlogId}
        />
      </div>
      <UserTable
        data={paginatedBlogData}
        columns={blogColumns}
        pageSize={blogPageSize}
        renderCell={blogRenderCell}
        searchableFieldsName={blogSearchableFieldsName}
        onSearchChange={blogFilterData}
        pagination={{ totalPages: blogTotalPages, currentPage: blogCurrentPage }}
        onPageChange={onBlogPageChange}
      />
    </div>
  );
}