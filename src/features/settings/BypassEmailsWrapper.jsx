'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@heroui/react';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function getToken() {
  const row = document.cookie.split('; ').find((r) => r.startsWith('token='));
  return row ? row.split('=').slice(1).join('=') : undefined;
}

function apiBase() {
  return process.env.NEXT_PUBLIC_BASE_API_URL_PROD || process.env.NEXT_PUBLIC_BASE_API_URL;
}

function authHeaders() {
  const token = getToken();
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function BypassEmailsWrapper({ items: initialItems }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems || []);

  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteChange } = useDisclosure();

  const [form, setForm] = useState({ email: '', note: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const openAdd = () => {
    setForm({ email: '', note: '' });
    onAddOpen();
  };

  const submitAdd = async () => {
    const email = form.email.trim();
    if (!email) {
      ErrorToast('Validation', 'Email is required.', 3000);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      ErrorToast('Validation', 'Please enter a valid email address.', 3000);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${apiBase()}/admin/bypass-emails`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email, note: form.note.trim() }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to add email');

      SuccessToast('Success', 'Bypass email added.', 3000);
      onAddChange(false);
      const created = result.data;
      if (created) setItems((prev) => [created, ...prev]);
      router.refresh();
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to add email', 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${apiBase()}/admin/bypass-emails/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to remove');
      setItems((prev) => prev.filter((it) => it._id !== deleteTarget._id));
      SuccessToast('Success', 'Bypass email removed.', 3000);
      onDeleteChange(false);
      setDeleteTarget(null);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to remove email', 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { uid: 'email', name: 'EMAIL' },
    { uid: 'note', name: 'NOTE' },
    { uid: 'addedBy', name: 'ADDED BY' },
    { uid: 'createdAt', name: 'ADDED ON' },
    { uid: 'actions', name: 'ACTIONS' },
  ];

  const renderCell = (item, key) => {
    switch (key) {
      case 'email':
        return <span className='text-sm font-medium break-all'>{item.email}</span>;
      case 'note':
        return (
          <span className='text-xs text-gray-600 dark:text-gray-300'>
            {item.note?.trim() ? item.note : '—'}
          </span>
        );
      case 'addedBy':
        return (
          <div className='text-xs'>
            <p className='font-medium'>{item.addedBy?.name || 'Admin'}</p>
            {item.addedBy?.email && (
              <p className='text-gray-500 dark:text-gray-400'>{item.addedBy.email}</p>
            )}
          </div>
        );
      case 'createdAt':
        return <span className='text-xs text-gray-500'>{formatDate(item.createdAt)}</span>;
      case 'actions':
        return (
          <Button
            isIconOnly
            size='sm'
            variant='light'
            color='danger'
            onPress={() => {
              setDeleteTarget(item);
              onDeleteOpen();
            }}
            aria-label='Remove email'
          >
            <Trash2 size={15} />
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Registration Bypass Emails</h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            {items.length} email{items.length !== 1 ? 's' : ''} on the bypass list
          </p>
        </div>
        <Button color='primary' startContent={<Plus size={16} />} onPress={openAdd}>
          Add Email
        </Button>
      </div>

      <div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 space-y-1'>
        <p className='text-xs text-amber-700 dark:text-amber-300'>
          <strong>What this does:</strong> Emails on this list can register a new account
          even when the device or IP is already used by another account. All other auth
          checks (OTP, password rules, rate limits) still apply.
        </p>
        <p className='text-xs text-amber-700 dark:text-amber-300'>
          <strong>Gmail aliases:</strong> Adding{' '}
          <code className='font-mono'>you@gmail.com</code> automatically allows{' '}
          <code className='font-mono'>you+test@gmail.com</code>,{' '}
          <code className='font-mono'>you+qa@gmail.com</code>, etc. — they all deliver to
          the same Gmail inbox.
        </p>
        <p className='text-xs text-amber-700 dark:text-amber-300'>
          <strong>Removing an email:</strong> any account already registered keeps working,
          but no new <em>+alias</em> variants will be allowed to bypass after removal.
        </p>
      </div>

      <Table aria-label='Bypass emails' removeWrapper>
        <TableHeader columns={columns}>
          {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
        </TableHeader>
        <TableBody
          items={items}
          emptyContent={
            <div className='py-12 text-center text-gray-400 text-sm'>
              No bypass emails yet. Click &quot;Add Email&quot; to add one.
            </div>
          }
        >
          {(item) => (
            <TableRow key={item._id}>
              {(colKey) => <TableCell>{renderCell(item, colKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ── Add Modal ── */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddChange} backdrop='blur' size='md'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add Bypass Email</ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <Input
                    label='Email'
                    placeholder='you@gmail.com'
                    type='email'
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    isRequired
                    autoFocus
                  />
                  <Input
                    label='Note (optional)'
                    placeholder='e.g. QA tester, dev account'
                    value={form.note}
                    onChange={(e) => setField('note', e.target.value)}
                    description='Helps you remember why this email is on the list.'
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button color='primary' isLoading={isSaving} onPress={submitAdd}>
                  Add Email
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteChange} backdrop='blur' size='sm'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Remove Bypass Email</ModalHeader>
              <ModalBody>
                <p className='text-sm'>
                  Remove <strong className='break-all'>{deleteTarget?.email}</strong> from
                  the bypass list?
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  Existing accounts created with this email keep working. Future +alias
                  registrations from the same device will be blocked again.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button color='danger' isLoading={isDeleting} onPress={confirmDelete}>
                  Remove
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
