'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from '@heroui/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

function getToken() {
  const row = document.cookie.split('; ').find((r) => r.startsWith('token='));
  return row ? row.split('=').slice(1).join('=') : undefined;
}

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

function authHeaders() {
  const token = getToken();
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

const emptyForm = {
  source: '',
  destination: '',
  type: 301,
  note: '',
  isActive: true,
};

export default function RedirectsWrapper({ items: initialItems }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems || []);
  const [query, setQuery] = useState('');

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onOpenChange: onFormChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteChange,
  } = useDisclosure();

  const [form, setForm] = useState(emptyForm);
  const [editTarget, setEditTarget] = useState(null); // null = add mode
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.source?.toLowerCase().includes(q) ||
        it.destination?.toLowerCase().includes(q),
    );
  }, [items, query]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    onFormOpen();
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setForm({
      source: item.source || '',
      destination: item.destination || '',
      type: item.type === 302 ? 302 : 301,
      note: item.note || '',
      isActive: item.isActive !== false,
    });
    onFormOpen();
  };

  const submitForm = async () => {
    const source = form.source.trim();
    const destination = form.destination.trim();

    if (!source || !destination) {
      ErrorToast('Validation', 'Source and destination are required.', 3000);
      return;
    }
    if (!source.startsWith('/')) {
      ErrorToast('Validation', 'Source must start with "/".', 3000);
      return;
    }

    setIsSaving(true);
    try {
      const isEdit = !!editTarget;
      const url = isEdit
        ? `${apiBase()}/admin/redirects/${editTarget._id}`
        : `${apiBase()}/admin/redirects`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          source,
          destination,
          type: Number(form.type) === 302 ? 302 : 301,
          note: form.note.trim(),
          isActive: form.isActive,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save redirect');

      const saved = result.data;
      if (isEdit) {
        setItems((prev) =>
          prev.map((it) => (it._id === saved._id ? saved : it)),
        );
        SuccessToast('Success', 'Redirect updated.', 3000);
      } else {
        if (saved) setItems((prev) => [saved, ...prev]);
        SuccessToast('Success', 'Redirect added.', 3000);
      }
      onFormChange(false);
      router.refresh();
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to save redirect', 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (item) => {
    setTogglingId(item._id);
    try {
      const res = await fetch(`${apiBase()}/admin/redirects/${item._id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to update');
      const saved = result.data;
      setItems((prev) => prev.map((it) => (it._id === saved._id ? saved : it)));
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to update', 3000);
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${apiBase()}/admin/redirects/${deleteTarget._id}`,
        {
          method: 'DELETE',
          headers: authHeaders(),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to remove');
      setItems((prev) => prev.filter((it) => it._id !== deleteTarget._id));
      SuccessToast('Success', 'Redirect removed.', 3000);
      onDeleteChange(false);
      setDeleteTarget(null);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to remove redirect', 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { uid: 'source', name: 'SOURCE (FROM)' },
    { uid: 'destination', name: 'DESTINATION (TO)' },
    { uid: 'type', name: 'TYPE' },
    { uid: 'status', name: 'STATUS' },
    { uid: 'hits', name: 'HITS' },
    { uid: 'actions', name: 'ACTIONS' },
  ];

  const renderCell = (item, key) => {
    switch (key) {
      case 'source':
        return (
          <span className='text-sm font-medium break-all'>{item.source}</span>
        );
      case 'destination':
        return (
          <span className='text-sm text-gray-600 dark:text-gray-300 break-all'>
            {item.destination}
          </span>
        );
      case 'type':
        return (
          <Chip size='sm' variant='flat' className='font-mono'>
            {item.type === 302 ? '302' : '301'}
          </Chip>
        );
      case 'status':
        return (
          <Switch
            size='sm'
            isSelected={item.isActive !== false}
            isDisabled={togglingId === item._id}
            onValueChange={() => toggleActive(item)}
            aria-label='Toggle redirect active'
          />
        );
      case 'hits':
        return (
          <span className='text-xs text-gray-500'>{item.hits ?? 0}</span>
        );
      case 'actions':
        return (
          <div className='flex items-center gap-1'>
            <Tooltip content='Edit'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                onPress={() => openEdit(item)}
                aria-label='Edit redirect'
              >
                <Pencil size={15} />
              </Button>
            </Tooltip>
            <Tooltip content='Delete' color='danger'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                color='danger'
                onPress={() => {
                  setDeleteTarget(item);
                  onDeleteOpen();
                }}
                aria-label='Delete redirect'
              >
                <Trash2 size={15} />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between gap-4 flex-wrap'>
        <div>
          <h1 className='text-2xl font-bold'>URL Redirects</h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            {items.length} redirect{items.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Button
          color='primary'
          startContent={<Plus size={16} />}
          onPress={openAdd}
        >
          Add Redirect
        </Button>
      </div>

      <div className='bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-1'>
        <p className='text-xs text-gray-600 dark:text-gray-300'>
          <strong>How it works:</strong> When a visitor opens the{' '}
          <em>source</em> path, they are sent to the <em>destination</em>.
          Changes apply live within ~1 minute — no redeploy needed.
        </p>
        <p className='text-xs text-gray-600 dark:text-gray-300'>
          <strong>301</strong> = permanent (passes SEO ranking, use for renamed
          URLs). <strong>302</strong> = temporary. Source must be a path like{' '}
          <code className='font-mono'>/old-page</code>; destination can be a path
          or a full <code className='font-mono'>https://</code> URL.
        </p>
      </div>

      <Input
        placeholder='Search by source or destination…'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        isClearable
        onClear={() => setQuery('')}
        className='max-w-md'
      />

      <Table aria-label='URL redirects' removeWrapper>
        <TableHeader columns={columns}>
          {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
        </TableHeader>
        <TableBody
          items={filtered}
          emptyContent={
            <div className='py-12 text-center text-gray-400 text-sm'>
              {query
                ? 'No redirects match your search.'
                : 'No redirects yet. Click "Add Redirect" to create one.'}
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

      {/* ── Add / Edit Modal ── */}
      <Modal isOpen={isFormOpen} onOpenChange={onFormChange} backdrop='blur' size='lg'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editTarget ? 'Edit Redirect' : 'Add Redirect'}
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <Input
                    label='Source path (from)'
                    placeholder='/old-page'
                    value={form.source}
                    onChange={(e) => setField('source', e.target.value)}
                    description='The incoming path to match. Must start with "/".'
                    isRequired
                    autoFocus
                  />
                  <Input
                    label='Destination (to)'
                    placeholder='/new-page  or  https://embroidize.com/new-page'
                    value={form.destination}
                    onChange={(e) => setField('destination', e.target.value)}
                    description='Where to send the visitor. A path or a full URL.'
                    isRequired
                  />
                  <Select
                    label='Redirect type'
                    selectedKeys={[String(form.type)]}
                    onChange={(e) => setField('type', Number(e.target.value))}
                  >
                    <SelectItem key='301'>301 — Permanent (SEO)</SelectItem>
                    <SelectItem key='302'>302 — Temporary</SelectItem>
                  </Select>
                  <Input
                    label='Note (optional)'
                    placeholder='e.g. Category renamed Oct 2026'
                    value={form.note}
                    onChange={(e) => setField('note', e.target.value)}
                  />
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium'>Active</p>
                      <p className='text-xs text-gray-500'>
                        Inactive redirects are stored but not applied.
                      </p>
                    </div>
                    <Switch
                      isSelected={form.isActive}
                      onValueChange={(v) => setField('isActive', v)}
                      aria-label='Active'
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button color='primary' isLoading={isSaving} onPress={submitForm}>
                  {editTarget ? 'Save Changes' : 'Add Redirect'}
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
              <ModalHeader>Remove Redirect</ModalHeader>
              <ModalBody>
                <p className='text-sm'>
                  Delete the redirect from{' '}
                  <strong className='break-all'>{deleteTarget?.source}</strong>?
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  Visitors hitting that path will no longer be redirected.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button color='danger' isLoading={isDeleting} onPress={confirmDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
