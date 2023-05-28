import { useStorageManager } from '@hooks/fileserver/useStorageManager';
import prettyBytes from 'pretty-bytes';

export const StorageUsedBar = () => {
  const { storageUsed, maxStorage } = useStorageManager();
  const barColor = storageUsed > maxStorage ? 'bg-red-400' : 'bg-blue-500';
  return (
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
            className={`absolute top-0 left-0 h-full rounded-full ${barColor}`}
            style={{
              width: `${(storageUsed / maxStorage) * 100}%`,
            }}
          ></div>
          {storageUsed > maxStorage && (
            <div
              className='absolute top-0 left-0 h-full rounded-full bg-blue-500'
              style={{
                width: '100%',
              }}
            ></div>
          )}
        </div>
        <button className='self-end text-xs text-blue-400'>
          Get more storage
        </button>
      </div>
    </div>
  );
};
