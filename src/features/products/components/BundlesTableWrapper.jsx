'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
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

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedBundleId, setSelectedBundleId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
            src={bundle.image?.url || '/og-banner.jpg'}
            alt={bundle.name}
            width={60}
            height={60}
            className='rounded-md'
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
              href={`/admin/bundle-products/${bundle.slug}`}
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

  const handleDelete = (id) => {
    setSelectedBundleId(id);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!selectedBundleId) return;

    setIsDeleting(true);

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      // 2. Base API URL
      const apiUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
        process.env.NEXT_PUBLIC_BASE_API_URL;

      // 3. Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 4. Await response object first to check .ok
      const res = await fetch(`${apiUrl}/bundles/${selectedBundleId}`, {
        method: 'DELETE',
        headers,
      });

      // 5. Parse the JSON body
      const result = await res.json();

      // 6. Handle HTTP errors
      if (!res.ok) {
        throw new Error(result.message || 'Failed to delete bundle');
      }

      // Success Handling
      SuccessToast(
        'Success',
        result?.message || 'Action successfully done!',
        3000,
      );

      // Refresh or update local state here if needed
      startTransition(() => {
        router.refresh();
        onOpenChange(false);
      });
    } catch (error) {
      ErrorToast('Error', error.message || 'Action Failed', 3000);
    } finally {
      setIsDeleting(false);
      setSelectedBundleId(null);
    }
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

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop='blur'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Confirm Deletion
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete this bundle? This action can
                  be undone later as it is a soft delete.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='danger'
                  isLoading={isDeleting}
                  onPress={confirmDelete}
                >
                  Delete Bundle
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
