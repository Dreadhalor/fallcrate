import { useStorageManager } from '@fallcrate/hooks/fileserver/use-storage-manager';
import { Modal } from 'antd';
import prettyBytes from 'pretty-bytes';
import { useState } from 'react';
import { MoreStorageModalContent } from './more-storage-modal-content';

export const StorageUsedBar = () => {
  const { storageUsed, maxStorage } = useStorageManager();
  const barColor = storageUsed > maxStorage ? 'bg-red-400' : 'bg-blue-500';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className='flex flex-col gap-[10px] overflow-hidden p-[15px]'>
        <div className='flex flex-row items-center justify-between'>
          <div className='text-sm font-bold'>Storage Used</div>
          <div className='text-sm font-bold'>
            {prettyBytes(storageUsed)} / {prettyBytes(maxStorage)}
          </div>
        </div>
        <div className='flex flex-col gap-[2px]'>
          <div className='relative h-[8px] w-full rounded-full bg-gray-200'>
            <div
              className={`absolute left-0 top-0 h-full rounded-full ${barColor}`}
              style={{
                width: `${(storageUsed / maxStorage) * 100}%`,
              }}
            ></div>
            {storageUsed > maxStorage && (
              <div
                className='absolute left-0 top-0 h-full rounded-full bg-blue-500'
                style={{
                  width: '100%',
                }}
              ></div>
            )}
          </div>
          <button
            className='self-end text-xs text-blue-400 hover:text-blue-500'
            onClick={showModal}
          >
            Get more storage
          </button>
        </div>
      </div>
      <Modal
        title='Get more storage'
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <MoreStorageModalContent />
      </Modal>
    </>
  );
};
