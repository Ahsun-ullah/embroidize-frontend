'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'danger',
  isLoading = false,
  itemName,
}) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          {typeof message === 'string' ? (
            <p>
              {message}
              {itemName && (
                <>
                  {' '}
                  <strong>{itemName}</strong>?
                </>
              )}
            </p>
          ) : (
            message
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={onClose} isDisabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            color={confirmColor}
            onPress={handleConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
