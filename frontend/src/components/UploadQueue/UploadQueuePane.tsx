import { FileUploadProgressBar } from '@components/UploadQueue/FileUploadProgressBar';
import { useFilesystem } from '@hooks/useFilesystem';
import { FaChevronUp } from 'react-icons/fa';

export const UploadQueuePane = () => {
  const { uploadQueue, showUploadModal, setShowUploadModal, getUploadStatus } =
    useFilesystem();
  const completedUploads = uploadQueue.filter(
    (uploadData) => getUploadStatus(uploadData.id) === 'success'
  ).length;
  const totalUploads = uploadQueue.length;
  const title =
    totalUploads === 0
      ? 'Uploads'
      : completedUploads === totalUploads
      ? `${completedUploads} of ${totalUploads} uploads complete`
      : `Uploading ${completedUploads} of ${totalUploads} files`;

  const innerHeight = showUploadModal ? 350 : 0;

  return (
    <div className='fixed bottom-0 right-[40px] z-10 flex w-[400px] flex-col border-[1px] bg-white'>
      <div className='flex flex-shrink-0 items-center justify-between border-b-[1px] bg-faded_bg py-[8px] px-[20px] text-sm'>
        {title}
        <button
          className='text-gray-500 hover:text-gray-800'
          onClick={() => setShowUploadModal((prev) => !prev)}
        >
          <FaChevronUp
            className='transition-transform'
            style={showUploadModal ? { transform: 'rotate(180deg)' } : {}}
          />
        </button>
      </div>
      <div
        className='flex flex-1 flex-col overflow-auto transition-all duration-200'
        style={{ maxHeight: `${innerHeight}px`, minHeight: `${innerHeight}px` }}
      >
        {uploadQueue.map((uploadData) => (
          <FileUploadProgressBar uploadData={uploadData} key={uploadData.id} />
        ))}
      </div>
    </div>
  );
};
