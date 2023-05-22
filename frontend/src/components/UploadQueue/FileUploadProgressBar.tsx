import { useFilesystem } from '@hooks/useFilesystem';
import { FileUpload } from '@src/types';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { DotLoader } from 'react-spinners';
import { MdOutlineCancel } from 'react-icons/md';
import { AiOutlineClockCircle } from 'react-icons/ai';
import './styles.scss';
import TruncatedText from '@components/utilities/TruncatedText';

type Props = {
  upload: FileUpload;
};

export const FileUploadProgressBar = ({
  upload: { bytesUploaded, totalBytes, uploadData, status },
}: Props) => {
  const { getParent, dequeueCompletedUpload, openDirectory } = useFilesystem();
  const percent = bytesUploaded / totalBytes;
  const truncatedPercent = Math.trunc(percent * 100 * 100) / 100;
  const waiting = status === 'waiting';
  const complete = percent === 1;
  const parent = getParent(uploadData);
  const icon = waiting ? (
    <AiOutlineClockCircle />
  ) : complete ? (
    <IoCheckmarkCircleOutline size={16} />
  ) : (
    <DotLoader size={12} />
  );

  return (
    <div className='queue-item flex flex-col gap-[7px] pt-[10px]'>
      <div className='flex items-center'>
        <div className='flex w-[36px] flex-shrink-0 items-center justify-center'>
          <button
            className='group relative flex'
            onClick={() => dequeueCompletedUpload(uploadData.id)}
          >
            <MdOutlineCancel className='opacity-0' />
            <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100'>
              <MdOutlineCancel />
            </div>
            <div className='absolute inset-0 flex items-center justify-center group-hover:opacity-0'>
              {icon}
            </div>
          </button>
        </div>

        <div className='flex min-w-0 flex-1 flex-col gap-[10px] pr-[15px]'>
          <div className='flex flex-row items-center justify-between text-sm'>
            <div className='flex min-w-0 flex-col gap-[2px] text-xs'>
              <TruncatedText text={uploadData.name} />
              <span className='text-gray-500'>
                {complete ? 'Uploaded to' : 'Uploading to'}&nbsp;
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
        </div>
      </div>
      <div
        className={`relative h-[4px] w-full bg-gray-200 ${
          complete ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className='absolute top-0 left-0 h-full bg-blue-500'
          style={{
            width: `${percent * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
};
