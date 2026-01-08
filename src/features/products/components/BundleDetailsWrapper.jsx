'use client';

import BundleModal from '@/components/Common/BundleForm';
import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Image,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@heroui/react';
import { ArrowLeft, Calendar, Edit, Package, Trash2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function BundleDetailsWrapper({ bundle }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modal Controls
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- API Configuration ---
  const apiUrl =
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL;
  const getToken = () =>
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

  // --- Handle Update ---
  const handleUpdateBundle = async (formData) => {
    setIsUpdating(true);
    try {
      const token = getToken();
      const data = new FormData();

      // 1. Append Text Data
      data.append('name', formData.name);
      data.append('slug', formData.slug);
      data.append('meta_title', formData.meta_title || '');
      data.append('meta_description', formData.meta_description || '');

      // 2. Append Image only if it is a new File object
      if (formData.image instanceof File) {
        data.append('image', formData.image);
      }

      // 3. API Call
      const response = await fetch(`${apiUrl}/bundles/${bundle._id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type header; fetch does it for FormData [web:51]
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Update failed');
      }

      // 4. Success UI Feedback
      SuccessToast('Success', 'Bundle updated successfully', 3000);

      // 5. Sync Server State and Close Modal [web:77][web:86]
      startTransition(() => {
        router.refresh();
        onEditClose();
      });
    } catch (error) {
      ErrorToast('Error', error.message || 'Action Failed', 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Handle Delete ---
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = getToken();
      const response = await fetch(`${apiUrl}/admin/bundle/${bundle._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Bundle deleted successfully');
        router.push('/admin/bundle-products');
        router.refresh();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
      onDeleteClose();
    }
  };

  const totalPrice = bundle.products.reduce(
    (sum, product) => sum + product.price,
    0,
  );

  const productColumns = [
    { name: 'IMAGE', uid: 'image' },
    { name: 'NAME', uid: 'name' },
    { name: 'CATEGORY', uid: 'category' },
    { name: 'SUB CATEGORY', uid: 'sub_category' },
    { name: 'PRICE', uid: 'price' },
    { name: 'SKU', uid: 'sku_code' },
  ];

  const renderProductCell = (product, columnKey) => {
    switch (columnKey) {
      case 'image':
        return (
          <Image
            src={product.image?.url || '/placeholder.png'}
            alt={product.name}
            width={50}
            height={50}
            className='rounded-md'
          />
        );
      case 'name':
        return <span className='font-medium'>{product.name}</span>;
      case 'category':
        return product.category?.name || 'N/A';
      case 'sub_category':
        return product.sub_category?.name || 'N/A';
      case 'price':
        return `$${product.price.toFixed(2)}`;
      case 'sku_code':
        return product.sku_code || 'N/A';
      default:
        return product[columnKey];
    }
  };

  return (
    <>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button isIconOnly variant='light' onClick={() => router.back()}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className='text-3xl font-bold'>Bundle Details</h1>
          </div>
          <div className='flex gap-2'>
            <Button
              color='primary'
              variant='flat'
              startContent={<Edit size={18} />}
              onClick={onEditOpen}
            >
              Edit
            </Button>
            <Button
              color='danger'
              variant='flat'
              startContent={<Trash2 size={18} />}
              onClick={onDeleteOpen}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Bundle Info Card */}
        <Card>
          <CardHeader className='flex-col items-start gap-2 px-6'>
            <div className='flex w-full items-start gap-6'>
              <Image
                src={bundle.image?.url}
                alt={bundle.name}
                width={200}
                height={200}
                className='rounded-lg '
              />
              <div className='flex-1 space-y-4'>
                <h2 className='text-2xl font-bold capitalize'>{bundle.name}</h2>
                <div className='flex flex-wrap gap-4'>
                  <div className='flex items-center gap-2'>
                    <Package size={18} className='text-gray-500' />
                    <span className='text-sm'>
                      {bundle.products.length} Products
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <User size={18} className='text-gray-500' />
                    <span className='text-sm'>
                      {bundle.createdBy?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar size={18} className='text-gray-500' />
                    <span className='text-sm'>
                      {new Date(bundle.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <Divider />
                <div className='flex items-center gap-4'>
                  <span className='text-sm text-gray-500'>Total Value:</span>
                  <Chip color='success' variant='flat' size='lg'>
                    ${totalPrice.toFixed(2)}
                  </Chip>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader className='px-6'>
            <h3 className='text-xl font-semibold'>Bundle Products</h3>
          </CardHeader>
          <CardBody className='px-6'>
            <Table aria-label='Bundle products table'>
              <TableHeader columns={productColumns}>
                {(column) => (
                  <TableColumn key={column.uid}>{column.name}</TableColumn>
                )}
              </TableHeader>
              <TableBody items={bundle.products}>
                {(item) => (
                  <TableRow key={item._id}>
                    {(columnKey) => (
                      <TableCell>
                        {renderProductCell(item, columnKey)}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Edit Modal [web:30] */}
      <BundleModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        initialData={bundle}
        onSubmit={handleUpdateBundle}
        isLoading={isUpdating}
      />

      {/* Delete Confirmation Modal [web:37] */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        title='Delete Bundle'
        message='Are you sure you want to delete'
        itemName={bundle.name}
        confirmText='Delete'
        cancelText='Cancel'
        confirmColor='danger'
        isLoading={isDeleting}
      />
    </>
  );
}
