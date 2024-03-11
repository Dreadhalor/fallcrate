import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { DotLoader } from 'react-spinners';
import { MdOutlineCancel } from 'react-icons/md';
import { AiOutlineClockCircle } from 'react-icons/ai';
import { TruncatedText } from '@fallcrate/components/utilities/truncated-text';
import { useEffect } from 'react';
import { FileUploadData } from '@fallcrate/types';

type Props = {
  uploadData: FileUploadData;
};

export const FileUploadProgressBar = ({ uploadData }: Props) => {
  const { getParent, dequeueCompletedUpload, openDirectory, progressRefs } =
    useFilesystem();
  const parent = getParent(uploadData);

  useEffect(() => {
    requestAnimationFrame(animate);

    return () => {
      progressRefs.current.delete(uploadData.id);
    };
  }, []);

  const animate = () => {
    const progressRef = progressRefs.current.get(uploadData.id) ?? {
      lastFrame: 0,
      progress: 0,
      id: uploadData.id,
      state: null,
    };
    const { lastFrame, progress, id, state } = progressRef;
    const waitingIcon = document.getElementById(`waiting-icon-${id}`);
    const loadingIcon = document.getElementById(`loading-icon-${id}`);
    const successIcon = document.getElementById(`success-icon-${id}`);
    const hasIcons = waitingIcon && loadingIcon && successIcon;
    const progressBarContainer = document.getElementById(
      `progress-bar-container-${id}`,
    );
    if (lastFrame !== progress) {
      const progressBar = document.getElementById(`progress-bar-${id}`);
      if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
      }
      const percentLabel = document.getElementById(`percent-label-${id}`);
      if (percentLabel) {
        percentLabel.innerText = `${Math.trunc(progress * 100 * 100) / 100}%`;
      }

      if (hasIcons) {
        if (!state || state === 'paused') {
          waitingIcon.style.display = 'flex';
          loadingIcon.style.display = 'none';
          successIcon.style.display = 'none';
        }
        if (state === 'running') {
          waitingIcon.style.display = 'none';
          loadingIcon.style.display = 'flex';
          successIcon.style.display = 'none';
        }
      }
      progressRef.lastFrame = progress;
    }
    if (state !== 'success') {
      requestAnimationFrame(animate);
    } else {
      if (hasIcons) {
        waitingIcon.style.display = 'none';
        loadingIcon.style.display = 'none';
        successIcon.style.display = 'flex';
      }
      if (progressBarContainer) {
        progressBarContainer.style.opacity = '0';
      }
      const uploadingToLabel = document.getElementById(`uploading-to-${id}`);
      if (uploadingToLabel) {
        uploadingToLabel.innerText = 'Uploaded to';
      }
    }
  };

  return (
    <div className='flex flex-col gap-[7px] border-b-[1px] border-b-[#e0e0e0] pt-[10px]'>
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
            <div
              id={`waiting-icon-${uploadData.id}`}
              style={{ display: 'flex' }}
              className='absolute inset-0 flex items-center justify-center group-hover:opacity-0'
            >
              <AiOutlineClockCircle />
            </div>
            <div
              id={`loading-icon-${uploadData.id}`}
              style={{ display: 'none' }}
              className='absolute inset-0 flex items-center justify-center group-hover:opacity-0'
            >
              <DotLoader size={12} />
            </div>
            <div
              id={`success-icon-${uploadData.id}`}
              style={{ display: 'none' }}
              className='absolute inset-0 flex items-center justify-center group-hover:opacity-0'
            >
              <IoCheckmarkCircleOutline size={16} />
            </div>
          </button>
        </div>

        <div className='flex min-w-0 flex-1 flex-col gap-[10px] pr-[15px]'>
          <div className='flex flex-row items-center justify-between text-sm'>
            <div className='flex min-w-0 flex-col gap-[2px] text-xs'>
              <TruncatedText text={uploadData.name} />
              <span className='text-gray-500'>
                <span id={`uploading-to-${uploadData.id}`}>Uploading to</span>
                &nbsp;
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
        id={`progress-bar-container-${uploadData.id}`}
        className='relative h-[4px] w-full bg-gray-200'
      >
        <div
          id={`progress-bar-${uploadData.id}`}
          className='absolute left-0 top-0 h-full bg-blue-500 transition-[width] duration-75'
          style={{
            width: 0,
          }}
        ></div>
      </div>
    </div>
  );
};
