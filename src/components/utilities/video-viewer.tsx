import { useEffect, useState } from 'react';
import { Modal } from './modal';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { useFileViewer } from '@fallcrate/providers/file-viewer-provider';
import { FaTimes } from 'react-icons/fa';

export const VideoViewer = () => {
  const [url, setUrl] = useState('');

  const { getFileUrl } = useFilesystem();
  const { open, setOpen, file, closeFileViewer } = useFileViewer();

  useEffect(() => {
    const fetchUrl = async () => {
      const url = await getFileUrl(file?.id ?? '');
      setUrl(url);
    };
    fetchUrl();
  }, [file]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeFileViewer();
  };

  const mimeType = file?.mimeType ?? '';

  return (
    <div>
      <Modal
        open={open && mimeType.includes('video')}
        onClose={closeFileViewer}
        setOpen={setOpen}
      >
        <div
          className='relative flex h-full w-full'
          onClick={handleBackdropClick}
        >
          <button
            className='absolute left-0 top-0 z-10 m-2'
            onClick={closeFileViewer}
          >
            <FaTimes className='text-2xl text-white' />
          </button>

          <video
            className='m-auto max-h-full max-w-full object-contain'
            src={url}
            controls
          />
        </div>
      </Modal>
    </div>
  );
};
