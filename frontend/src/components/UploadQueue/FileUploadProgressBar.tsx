import { useFilesystem } from '@hooks/useFilesystem';
import { FileUpload } from '@src/types';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { DotLoader } from 'react-spinners';
import { MdOutlineCancel } from 'react-icons/md';
import './styles.scss';

type Props = {
  upload: FileUpload;
};

export const FileUploadProgressBar = ({
  upload: { bytesUploaded, totalBytes, uploadData },
}: Props) => {
  const { getParent, dequeueCompletedUpload, openDirectory } = useFilesystem();
  const percent = bytesUploaded / totalBytes;
  const truncatedPercent = Math.trunc(percent * 100 * 100) / 100;
  const complete = percent === 1;
  const parent = getParent(uploadData);

  return (
    <div className='queue-item flex items-center py-[10px]'>
      <div className='flex w-[36px] items-center justify-center'>
        <button
          className='group relative flex'
          onClick={() => dequeueCompletedUpload(uploadData.id)}
        >
          <MdOutlineCancel className='opacity-0' />
          <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100'>
            <MdOutlineCancel />
          </div>
          <div className='absolute inset-0 flex items-center justify-center group-hover:opacity-0'>
            {complete ? (
              <IoCheckmarkCircleOutline size={16} />
            ) : (
              <DotLoader size={12} />
            )}
          </div>
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
