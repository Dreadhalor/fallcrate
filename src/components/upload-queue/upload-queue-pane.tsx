import { FileUploadProgressBar } from '@fallcrate/components/upload-queue/file-upload-progress-bar';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { FaChevronUp, FaTimes } from 'react-icons/fa';

export const UploadQueuePane = () => {
  const {
    uploadQueue,
    showUploadModal,
    setShowUploadModal,
    getUploadStatus,
    removeUploadModal,
    toggleUploadModal,
  } = useFilesystem();
  const completedUploads = uploadQueue.filter(
    (uploadData) => getUploadStatus(uploadData.id) === 'success',
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
    <div
      className='fixed bottom-0 right-[40px] z-20 flex w-[400px] flex-col border-[1px] bg-white transition-all'
      style={{
        opacity: removeUploadModal ? 0 : 1,
        pointerEvents: removeUploadModal ? 'none' : 'all',
      }}
    >
      <div className='bg-faded_bg flex flex-shrink-0 items-center border-b-[1px] px-[20px] py-[8px] text-sm'>
        {title}
        <button
          className='ml-auto mr-[10px] text-gray-500 hover:text-gray-800'
          onClick={() => toggleUploadModal(false)}
        >
          <FaTimes />
        </button>
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
