import { useFilesystem } from '@hooks/useFilesystem';
import { FileUpload } from '@src/types';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { DotLoader } from 'react-spinners';
import { MdOutlineCancel } from 'react-icons/md';
import { AiOutlineClockCircle } from 'react-icons/ai';
import './styles.scss';
import TruncatedText from '@components/utilities/TruncatedText';
import { useEffect } from 'react';

type Props = {
  upload: FileUpload;
};

export const FileUploadProgressBar = ({
  upload: { uploadData, status },
}: Props) => {
  const { getParent, dequeueCompletedUpload, openDirectory, progressRefs } =
    useFilesystem();
  const waiting = status === 'waiting';
  const complete = status === 'complete';
  const parent = getParent(uploadData);
  const icon = waiting ? (
    <AiOutlineClockCircle />
  ) : complete ? (
    <IoCheckmarkCircleOutline size={16} />
  ) : (
    <DotLoader size={12} />
  );

  useEffect(() => {
    requestAnimationFrame(animate);

    return () => {
      const i = progressRefs.current.delete(uploadData.id);
      if (i) {
        console.log(`deleted progress ref for ${uploadData.id}`);
      }
    };
  }, []);

  const animate = () => {
    const progressRef = progressRefs.current.get(uploadData.id) ?? {
      lastFrame: 0,
      progress: 0,
      id: uploadData.id,
    };
    const { lastFrame, progress, id } = progressRef;
    console.log(`progress ${uploadData.name}:`, progress);
    if (lastFrame !== progress) {
      const progressBar = document.getElementById(`progress-bar-${id}`);
      const percentLabel = document.getElementById(`percent-label-${id}`);
      if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
      }
      if (percentLabel) {
        percentLabel.innerText = `${Math.trunc(progress * 100 * 100) / 100}%`;
      }
      progressRef.lastFrame = progress;
    }
    if (progress !== 1) {
      requestAnimationFrame(animate);
    }
  };

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
            <span id={`percent-label-${uploadData.id}`} className='ml-[10px]'>
              0%
            </span>
          </div>
        </div>
      </div>
      <div
        className={`relative h-[4px] w-full bg-gray-200 ${
          complete ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          id={`progress-bar-${uploadData.id}`}
          className='absolute top-0 left-0 h-full bg-blue-500'
          style={{
            width: 0,
          }}
        ></div>
      </div>
    </div>
  );
};
