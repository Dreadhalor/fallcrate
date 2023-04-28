import { useFilesystem } from '@providers/FilesystemProvider';
import { useState, useEffect, useRef } from 'react';
import { MoonLoader } from 'react-spinners';
import { IoClose } from 'react-icons/io5';

const ImageModal = () => {
  const { imageModal, setImageModal } = useFilesystem();
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const show_loading_delay = 10000;

  const margin_image = 10;
  const modal_viewport_ratio = 0.9;

  const delay_ref = useRef<NodeJS.Timeout | null>(null);
  const clearDelay = () => {
    if (delay_ref.current) {
      clearTimeout(delay_ref.current);
      delay_ref.current = null;
    }
  };

  const updateDimensions = () => {
    if (!imageModal.open) return;

    const img = new Image();
    img.src = imageModal.url ?? '';
    img.onload = () => {
      setImageDimensions(calculateDimensions(img.width, img.height));
      setIsLoading(false);
      clearDelay();
    };

    // Only set isLoading to true if the image is not yet loaded.
    if (!img.complete) {
      setIsLoading(true);
      delay_ref.current = setTimeout(
        () => setIsLoading(false),
        show_loading_delay
      );
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
    if (imageModal.open) {
      setIsLoading(true);
      updateDimensions();
    }
  }, [imageModal.url]);

  useEffect(() => {
    if (imageModal.open) window.addEventListener('resize', updateDimensions);
    else window.removeEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [imageModal.open]);

  if (!imageModal.open) return null;

  const closeModal = () => {
    setImageDimensions({ width: 0, height: 0 });
    setImageModal({ open: false, url: null });
    setIsLoading(false);
    clearDelay();
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
          src={imageModal.url ?? ''}
          alt='Preview'
          className='m-auto'
          style={{
            width: imageDimensions.width,
            height: imageDimensions.height,
          }}
        />
        <button
          className={`close-button absolute top-4 left-4`}
          onClick={closeModal}
        >
          <IoClose />
        </button>
      </div>
    );

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70'
      onClick={closeModal}
    >
      {isLoading ? loadingContent : modalContent}
    </div>
  );
};

export default ImageModal;
