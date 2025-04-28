'use client';

import { LockIcon, MailIcon } from '@/components/icons';
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const OpenModal = () => {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <Modal
        isOpen={true}
        defaultOpen={true}
        placement='top-center'
        onOpenChange={handleClose}
      >
        <ModalContent>
          {(handleClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Log in</ModalHeader>
              <ModalBody>
                <Input
                  endContent={
                    <MailIcon className='text-2xl text-default-400 pointer-events-none flex-shrink-0' />
                  }
                  label='Email'
                  placeholder='Enter your email'
                  variant='bordered'
                />
                <Input
                  endContent={
                    <LockIcon className='text-2xl text-default-400 pointer-events-none flex-shrink-0' />
                  }
                  label='Password'
                  placeholder='Enter your password'
                  type='password'
                  variant='bordered'
                />
                <div className='flex py-2 px-1 justify-between'>
                  <Checkbox
                    classNames={{
                      label: 'text-small',
                    }}
                  >
                    Remember me
                  </Checkbox>
                  <Link color='primary' href='#' size='sm'>
                    Forgot password?
                  </Link>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='flat' onPress={handleClose}>
                  Close
                </Button>
                <Button color='primary' onPress={handleClose}>
                  Sign in
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
