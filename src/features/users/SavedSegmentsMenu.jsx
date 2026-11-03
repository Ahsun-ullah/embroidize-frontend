'use client';
import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { Bookmark } from 'lucide-react';
import Cookies from 'js-cookie';
import { useCallback, useEffect, useState } from 'react';

const apiUrl = () => process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
const authHeaders = () => {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Named filter combinations for an admin list page. A segment is the page's
 * filter query string, so opening one is navigating to it, and the filters
 * themselves stay defined only in the URL.
 *
 * `currentQuery` is the current filter query string (no page / perPage);
 * `onOpen(query)` navigates to a saved one.
 */
export default function SavedSegmentsMenu({ page = 'users', currentQuery, onOpen }) {
  const [segments, setSegments] = useState([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl()}/admin/saved-segments?page=${page}`, {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const json = await res.json();
      setSegments(json?.data?.segments || []);
    } catch {
      // Non-fatal: the menu just shows no saved segments.
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const current = segments.find((s) => s.query === currentQuery);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl()}/admin/saved-segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name: trimmed, page, query: currentQuery }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Could not save the segment.');
      SuccessToast('Saved', `Segment "${trimmed}" saved.`, 3000);
      setSaveOpen(false);
      setName('');
      load();
    } catch (err) {
      ErrorToast('Error', err.message || 'Could not save the segment.', 3000);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (segment) => {
    setDeleting(true);
    try {
      const res = await fetch(`${apiUrl()}/admin/saved-segments/${segment._id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Could not delete the segment.');
      SuccessToast('Deleted', `Segment "${segment.name}" deleted.`, 3000);
      load();
    } catch (err) {
      ErrorToast('Error', err.message || 'Could not delete the segment.', 3000);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const onAction = (key) => {
    if (key === '__save') {
      setName(current?.name || '');
      setSaveOpen(true);
    } else if (key === '__delete' && current) {
      setConfirmDelete(current);
    } else {
      const seg = segments.find((s) => s._id === key);
      if (seg) onOpen(seg.query);
    }
  };

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button
            size='sm'
            variant={current ? 'solid' : 'flat'}
            className={current ? 'bg-black text-white' : ''}
            startContent={<Bookmark size={14} />}
          >
            {current ? current.name : 'Saved segments'}
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label='Saved segments' onAction={onAction}>
          <DropdownSection showDivider title={segments.length ? 'Open' : 'None saved yet'}>
            {segments.map((s) => (
              <DropdownItem key={s._id}>{s.name}</DropdownItem>
            ))}
          </DropdownSection>
          <DropdownSection>
            <DropdownItem key='__save' description='Save the filters you have now'>
              {current ? 'Save again under a name…' : 'Save current filters…'}
            </DropdownItem>
            {current ? (
              <DropdownItem key='__delete' className='text-danger' color='danger'>
                Delete &quot;{current.name}&quot;
              </DropdownItem>
            ) : null}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={saveOpen} onClose={() => !saving && setSaveOpen(false)} size='sm'>
        <ModalContent>
          <ModalHeader>Save segment</ModalHeader>
          <ModalBody>
            <Input
              autoFocus
              size='sm'
              label='Name'
              labelPlacement='outside'
              placeholder='e.g. US free-only regulars'
              maxLength={80}
              value={name}
              onValueChange={setName}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
            <p className='text-xs text-gray-500'>
              Saving under an existing name replaces that segment.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={() => setSaveOpen(false)} isDisabled={saving}>
              Cancel
            </Button>
            <Button color='primary' onPress={save} isLoading={saving} isDisabled={!name.trim()}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => !deleting && setConfirmDelete(null)} size='sm'>
        <ModalContent>
          <ModalHeader>Delete segment?</ModalHeader>
          <ModalBody className='text-sm text-gray-600'>
            Delete &quot;{confirmDelete?.name}&quot;? The users are not affected; only
            the saved filters are removed.
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={() => setConfirmDelete(null)} isDisabled={deleting}>
              Cancel
            </Button>
            <Button color='danger' onPress={() => remove(confirmDelete)} isLoading={deleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
