import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { useState, useEffect } from 'react';
import { MoonLoader } from 'react-spinners';
import { IoClose } from 'react-icons/io5';
import { useFileViewer } from '@fallcrate/providers/file-viewer-provider';
import { Modal } from 'antd';

const ImageViewerModal = () => {
  const { open, setOpen, file, setFile } = useFileViewer();
  const { getFileUrl } = useFilesystem();

  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [url, setUrl] = useState('');

  const margin_image = 10;
  const modal_viewport_ratio = 0.9;

  const updateDimensions = async () => {
    if (!open) return;

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageDimensions(calculateDimensions(img.width, img.height));
      setIsLoading(false);
    };

    // Only set isLoading to true if the image is not yet loaded.
    if (!img.complete) {
      setIsLoading(true);
    }
  };

  // Calculate the dimensions of the image such that it prefers to render at native
  // size, but its size has an upper bound where it must fit inside the modal
  // with a border of margin_image around it while the image maintains its original
  // aspect ratio & the modal at its biggest fits inside the viewport with the
  // larger dimension being modal_viewport_ratio * viewport_dimension
  const calculateDimensions = (width: number, height: number) => {
    const viewport_width = window.innerWidth;
    const viewport_height = window.innerHeight;

    const max_width = viewport_width * modal_viewport_ratio - 2 * margin_image;
    const max_height =
      viewport_height * modal_viewport_ratio - 2 * margin_image;

    if (width <= max_width && height <= max_height) {
      return { width, height };
    }

    const width_ratio = width / max_width;
    const height_ratio = height / max_height;

    if (width_ratio > height_ratio) {
      return { width: max_width, height: height / width_ratio };
    }

    return { width: width / height_ratio, height: max_height };
  };

  useEffect(() => {
    if (!file) setUrl('');
    getFileUrl(file?.id ?? '').then((url) => setUrl(url));
  }, [file]);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      updateDimensions();
    }
  }, [url]);

  useEffect(() => {
    if (open) window.addEventListener('resize', updateDimensions);
    else {
      window.removeEventListener('resize', updateDimensions);
      setIsLoading(true);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [open]);

  if (!open) return null;

  const closeModal = () => {
    setImageDimensions({ width: 0, height: 0 });
    setOpen(false);
    setFile(null);
    setIsLoading(false);
  };

  const loadingContent = (
    <div className='flex flex-col items-center text-white'>
      <span className='loading-text mb-4'>Loading...</span>
      <MoonLoader color='white' />
    </div>
  );

  const modalContent = imageDimensions.width > 0 &&
    imageDimensions.height > 0 && (
      <div
        className='relative flex rounded-lg bg-white'
        onClick={(e) => e.stopPropagation()}
        style={{
          width: imageDimensions.width + 2 * margin_image,
          height: imageDimensions.height + 2 * margin_image,
        }}
      >
        <img
          src={url}
          alt='Preview'
          className='m-auto'
          style={{
            width: imageDimensions.width,
            height: imageDimensions.height,
          }}
        />
        <button
          className={`close-button absolute left-4 top-4`}
          onClick={closeModal}
        >
          <IoClose />
        </button>
      </div>
    );

  return (
    <Modal
      open={open && !(file?.mimeType === 'application/pdf')}
      onCancel={closeModal}
      bodyStyle={{ marginInline: -1, padding: 0 }} // remove padding
      footer={null} // no footer
      closable={false} // no close button
      destroyOnClose // destroy popovers when modal closes
    >
      <div className='fixed inset-0 flex flex-col items-center justify-center'>
        {isLoading ? loadingContent : modalContent}
      </div>
    </Modal>
  );
};

export { ImageViewerModal };
