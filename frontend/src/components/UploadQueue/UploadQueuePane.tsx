import { FileUploadProgressBar } from '@components/UploadQueue/FileUploadProgressBar';
import { useFilesystem } from '@hooks/useFilesystem';
import { useState } from 'react';
import { FaChevronUp } from 'react-icons/fa';
import './styles.scss';

type Props = {};

export const UploadQueuePane = (props: Props) => {
  const [hidden, setHidden] = useState(true);
  const { uploadQueue } = useFilesystem();

  const innerHeight = hidden ? 0 : 350;

  return (
    <div className='fixed bottom-0 right-[40px] z-10 flex w-[400px] flex-col border-[1px] bg-white'>
      <div className='flex flex-shrink-0 items-center justify-between border-b-[1px] bg-faded_bg py-[5px] px-[20px]'>
        Uploads
        <button
          className='text-gray-500 hover:text-gray-800'
          onClick={() => setHidden((prev) => !prev)}
        >
          <FaChevronUp
            className='transition-transform'
            style={hidden ? {} : { transform: 'rotate(180deg)' }}
          />
        </button>
      </div>
      <div
        className='queue-body flex flex-1 flex-col overflow-auto transition-all duration-200'
        style={{ maxHeight: `${innerHeight}px`, minHeight: `${innerHeight}px` }}
      >
        {uploadQueue.map((upload) => (
          <FileUploadProgressBar upload={upload} key={upload.uploadData.id} />
        ))}
      </div>
    </div>
  );
};
