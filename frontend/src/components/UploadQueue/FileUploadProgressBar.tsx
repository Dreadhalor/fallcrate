import { useFilesystem } from '@hooks/useFilesystem';
import { FileUpload } from '@src/types';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { DotLoader } from 'react-spinners';
import './styles.scss';
import { MdClear } from 'react-icons/md';

type Props = {
  upload: FileUpload;
};

export const FileUploadProgressBar = ({
  upload: { bytesUploaded, totalBytes, uploadData },
}: Props) => {
  const { getParent, dequeueCompletedUpload, openDirectory } = useFilesystem();
  const percent = bytesUploaded / totalBytes;
  const truncatedPercent = Math.trunc(percent * 100 * 100) / 100;
  // const complete = percent === 1;
  // const complete = false;
  const complete = true;
  const parent = getParent(uploadData);

  return (
    <div className='queue-item flex items-center py-[10px]'>
      <div className='flex items-center justify-center px-[10px]'>
        <button
          className='group'
          onClick={() => dequeueCompletedUpload(uploadData.id)}
        >
          <MdClear className='hidden group-hover:block' />
          <span className='group-hover:hidden'>
            {complete ? (
              <IoCheckmarkCircleOutline size={16} />
            ) : (
              <DotLoader size={12} />
            )}
          </span>
        </button>
      </div>

      <div className='flex flex-1 flex-col gap-[10px] pr-[15px]'>
        <div className='flex flex-row items-center justify-between text-sm'>
          <div className='flex flex-col gap-[2px] text-xs'>
            <span>{uploadData.name}</span>
            <span className='text-gray-500'>
              Uploaded to&nbsp;
              <button
                className='cursor-pointer underline hover:text-black'
                onClick={() => openDirectory(parent?.id ?? null)}
              >
                {parent?.name ?? 'All Files'}
              </button>
            </span>
          </div>
          {truncatedPercent}%
        </div>
        <div className='relative h-2 w-full rounded-full bg-gray-200'>
          <div
            className='absolute top-0 left-0 h-full rounded-full bg-blue-500'
            style={{
              width: `${percent * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
