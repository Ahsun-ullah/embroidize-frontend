'use client';

import {
  Button,
  Image,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { Eye, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function BundlesTableWrapper({
  initialData,
  pagination,
  columns,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || '',
  );

  console.log(pagination);

  const handleSearch = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
      params.set('page', '1');
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const renderCell = (bundle, columnKey) => {
    switch (columnKey) {
      case 'image':
        return (
          <Image
            src={bundle.image?.url}
            alt={bundle.name}
            width={60}
            height={60}
            className='rounded-md object-cover'
          />
        );
      case 'name':
        return <div className='font-semibold'>{bundle.name}</div>;
      case 'products':
        return (
          <div className='text-sm'>{bundle.products?.length || 0} products</div>
        );
      case 'createdBy':
        return (
          <div className='text-sm'>
            {bundle.createdBy?.name || bundle.createdBy?.email || 'N/A'}
          </div>
        );
      case 'createdAt':
        return (
          <div className='text-sm'>
            {new Date(bundle.createdAt).toLocaleDateString()}
          </div>
        );
      case 'actions':
        return (
          <div className='flex gap-2'>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              as={Link}
              href={`/admin/bundle-products/${bundle._id}`}
            >
              <Eye size={18} />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              color='danger'
              onClick={() => handleDelete(bundle._id)}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        );
      default:
        return bundle[columnKey];
    }
  };

  const handleDelete = async (id) => {
    // Implement delete logic
    console.log('Delete bundle:', id);
  };

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>All Bundles</h1>
        <Link
          href='/admin/all-products'
          className='button flex items-center gap-2'
        >
          <Plus size={18} /> Create Bundle
        </Link>
      </div>

      {/* Search */}
      <Input
        isClearable
        placeholder={`Search...`}
        startContent={<Search size={18} />}
        value={searchValue}
        onValueChange={setSearchValue}
        onClear={() => handleSearch('')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(searchValue);
          }
        }}
      />

      {/* Table */}
      <Table aria-label='Bundles table'>
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={initialData}>
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className='flex justify-center'>
        <Pagination
          total={pagination.totalPages}
          initialPage={pagination.page}
          onChange={handlePageChange}
          showControls
          isCompact
          showShadow
        />
      </div>
    </div>
  );
}
