import React, { Children, useState } from 'react';
import { File } from '../helpers';

type Props = {
  isOpen: boolean;
  children: React.ReactNode;
};

const Modal = ({ isOpen, children }: Props) => {
  return (
    // create a modal
    <div style={{ display: isOpen ? 'block' : 'none' }}>
      <div className='fixed inset-0 z-10 overflow-y-auto'>
        <div className='flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
          <div className='fixed inset-0 transition-opacity' aria-hidden='true'>
            <div className='absolute inset-0 bg-gray-500 opacity-75'></div>
          </div>

          <span
            className='hidden sm:inline-block sm:h-screen sm:align-middle'
            aria-hidden='true'
          >
            &#8203;
          </span>
          <div
            className='inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle'
            role='dialog'
            aria-modal='true'
            aria-labelledby='modal-headline'
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
