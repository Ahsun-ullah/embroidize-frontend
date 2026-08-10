'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  useCreatePinMutation,
  useGetBoardsQuery,
  useGetPinDraftQuery,
} from '@/lib/redux/admin/pinterest/pinterestSlice';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Pinterest's own field limits, echoed by the API in `draft.limits`. Kept as a
// fallback so the counters still work if the draft call is slow.
const FALLBACK_LIMITS = { title: 100, description: 800 };

export default function PinToPinterestModal({ isOpen, onClose, productId }) {
  const { data: draft, isFetching: draftLoading, error: draftError } =
    useGetPinDraftQuery(productId, { skip: !isOpen || !productId });
  const { data: boards = [], isFetching: boardsLoading, error: boardsError } =
    useGetBoardsQuery(undefined, { skip: !isOpen });

  const [createPin, { isLoading: isPosting }] = useCreatePinMutation();

  const [form, setForm] = useState({ boardId: '', title: '', description: '' });
  const [touched, setTouched] = useState(false);

  const limits = draft?.limits || FALLBACK_LIMITS;

  // Seed the form once the draft lands. `touched` guards the admin's edits from
  // being clobbered if the query refetches while the modal is open.
  useEffect(() => {
    if (!draft || touched) return;
    setForm({
      boardId: draft.defaultBoardId || '',
      title: draft.title || '',
      description: draft.description || '',
    });
  }, [draft, touched]);

  // Reset when the modal closes so the next product opens clean.
  useEffect(() => {
    if (!isOpen) setTouched(false);
  }, [isOpen]);

  const setField = (k, v) => {
    setTouched(true);
    setForm((f) => ({ ...f, [k]: v }));
  };

  const connectionError =
    draftError?.data?.message || boardsError?.data?.message || '';

  const handlePost = async () => {
    if (!form.boardId) {
      ErrorToast('Pick a board', 'Choose which board this pin goes to.', 3000);
      return;
    }
    try {
      const board = boards.find((b) => b.id === form.boardId);
      const res = await createPin({
        productId,
        boardId: form.boardId,
        boardName: board?.name || '',
        title: form.title,
        description: form.description,
      }).unwrap();

      SuccessToast(
        'Pinned',
        board?.name ? `Posted to ${board.name}.` : 'Posted to Pinterest.',
        4000,
      );
      onClose(res?.data || null);
    } catch (err) {
      // Pinterest's rejection text names the offending field — showing it
      // verbatim is the difference between a fixable and a mystifying error.
      ErrorToast(
        'Could not pin',
        err?.data?.message || 'Pinterest rejected the pin.',
        6000,
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(null)}
      size='2xl'
      scrollBehavior='inside'
    >
      <ModalContent>
        <ModalHeader className='flex items-center gap-2'>
          <i className='ri-pinterest-fill text-xl' />
          Pin to Pinterest
        </ModalHeader>

        <ModalBody>
          {connectionError ? (
            <div className='flex items-start gap-2 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700'>
              <AlertCircle size={18} className='mt-0.5 shrink-0' />
              <div>
                <p className='font-semibold text-gray-900'>
                  Pinterest isn&apos;t ready
                </p>
                <p className='mt-1'>{connectionError}</p>
              </div>
            </div>
          ) : draftLoading ? (
            <div className='flex items-center gap-3 py-10 text-gray-500'>
              <Loader2 size={18} className='animate-spin' />
              <span>Preparing pin…</span>
            </div>
          ) : (
            <div className='flex flex-col gap-5 sm:flex-row'>
              {/* Preview */}
              <div className='shrink-0'>
                <div className='relative h-[300px] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 sm:w-[200px]'>
                  {draft?.imageUrl ? (
                    <Image
                      src={draft.imageUrl}
                      alt={form.title || 'Product image'}
                      fill
                      unoptimized
                      sizes='200px'
                      className='object-cover'
                    />
                  ) : (
                    <div className='flex h-full items-center justify-center px-3 text-center text-xs text-gray-400'>
                      No image — this product cannot be pinned
                    </div>
                  )}
                </div>

                {draft?.lastPinnedAt && (
                  <p className='mt-2 text-center text-xs text-gray-500'>
                    Last pinned{' '}
                    {new Date(draft.lastPinnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Fields */}
              <div className='flex-1 space-y-4'>
                <Select
                  label='Board'
                  placeholder={
                    boardsLoading ? 'Loading boards…' : 'Select a board'
                  }
                  selectedKeys={form.boardId ? [form.boardId] : []}
                  onSelectionChange={(keys) =>
                    setField('boardId', Array.from(keys)[0] || '')
                  }
                  isDisabled={boardsLoading || boards.length === 0}
                >
                  {boards.map((b) => (
                    <SelectItem key={b.id} textValue={b.name}>
                      {b.name}
                    </SelectItem>
                  ))}
                </Select>

                <Textarea
                  label='Title'
                  minRows={1}
                  maxRows={2}
                  value={form.title}
                  onValueChange={(v) => setField('title', v.slice(0, limits.title))}
                  description={`${form.title.length}/${limits.title}`}
                />

                <Textarea
                  label='Description'
                  minRows={5}
                  value={form.description}
                  onValueChange={(v) =>
                    setField('description', v.slice(0, limits.description))
                  }
                  description={`${form.description.length}/${limits.description}`}
                />

                <div className='rounded-lg border border-gray-200 bg-gray-50 p-3'>
                  <p className='text-xs font-semibold text-gray-500'>
                    Destination link
                  </p>
                  <p className='mt-1 break-all font-mono text-xs text-gray-700'>
                    {draft?.link || '—'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant='bordered' onPress={() => onClose(null)}>
            Cancel
          </Button>
          <Button
            className='bg-gray-900 text-white'
            isLoading={isPosting}
            isDisabled={
              !!connectionError || draftLoading || !draft?.imageUrl || !form.boardId
            }
            startContent={!isPosting && <ExternalLink size={16} />}
            onPress={handlePost}
          >
            Post pin
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
