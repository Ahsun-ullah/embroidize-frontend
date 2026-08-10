'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  useBulkQueuePinsMutation,
  useGetBoardsQuery,
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
} from '@heroui/react';
import { AlertCircle, Clock } from 'lucide-react';
import { useState } from 'react';

/**
 * Board picker for bulk pinning. Captions come from the caption template in
 * Settings → Pinterest (falling back to each product's meta description), since
 * editing a hundred captions in a modal is not a workflow anybody wants.
 */
export default function BulkPinToPinterestModal({
  isOpen,
  onClose,
  productIds = [],
}) {
  const { data: boards = [], isFetching: boardsLoading, error: boardsError } =
    useGetBoardsQuery(undefined, { skip: !isOpen });
  const [queuePins, { isLoading }] = useBulkQueuePinsMutation();
  const [boardId, setBoardId] = useState('');

  const count = productIds.length;
  const connectionError = boardsError?.data?.message || '';

  const handleQueue = async () => {
    if (!boardId) {
      ErrorToast('Pick a board', 'Choose which board these pins go to.', 3000);
      return;
    }
    try {
      const board = boards.find((b) => b.id === boardId);
      const res = await queuePins({
        productIds,
        boardId,
        boardName: board?.name || '',
      }).unwrap();

      SuccessToast('Queued', res?.message || `${count} pins queued.`, 5000);
      onClose(true);
    } catch (err) {
      ErrorToast(
        'Could not queue',
        err?.data?.message || 'Failed to queue pins.',
        5000,
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)} size='lg'>
      <ModalContent>
        <ModalHeader className='flex items-center gap-2'>
          <i className='ri-pinterest-fill text-xl' />
          Pin {count} product{count === 1 ? '' : 's'}
        </ModalHeader>

        <ModalBody className='space-y-4'>
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
          ) : (
            <>
              <Select
                label='Board'
                placeholder={boardsLoading ? 'Loading boards…' : 'Select a board'}
                selectedKeys={boardId ? [boardId] : []}
                onSelectionChange={(keys) =>
                  setBoardId(Array.from(keys)[0] || '')
                }
                isDisabled={boardsLoading || boards.length === 0}
              >
                {boards.map((b) => (
                  <SelectItem key={b.id} textValue={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </Select>

              <div className='flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600'>
                <Clock size={16} className='mt-0.5 shrink-0' />
                <p>
                  Pins are posted on a slow queue — roughly one every couple of
                  minutes — because posting in a burst is what gets accounts
                  flagged as spam. You can close this and carry on working;
                  captions come from your template in Settings → Pinterest.
                  Products without an image are skipped.
                </p>
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant='bordered' onPress={() => onClose(false)}>
            Cancel
          </Button>
          <Button
            className='bg-gray-900 text-white'
            isLoading={isLoading}
            isDisabled={!!connectionError || !boardId}
            onPress={handleQueue}
          >
            Queue {count} pin{count === 1 ? '' : 's'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
