import { useFilesystem } from '@hooks/useFilesystem';
import { Button } from 'antd';
import { FaTimes } from 'react-icons/fa';
import {
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiChevronLeft,
  HiChevronRight,
  HiZoomIn,
  HiZoomOut,
} from 'react-icons/hi';

type Props = {
  pageNumber: number;
  numPages: number;
  previousPage: () => void;
  nextPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  containOrFill: 'contain' | 'fill';
  setContainOrFill: (arg: 'contain' | 'fill') => void;
};

export const PDFViewerToolbar = ({
  pageNumber,
  numPages,
  previousPage,
  nextPage,
  firstPage,
  lastPage,
  containOrFill,
  setContainOrFill,
}: Props) => {
  const { closeImageModal } = useFilesystem();
  const iconSize = 24;
  const enabledClasses = 'text-blue-500 hover:text-blue-700';
  const disabledClasses = 'text-gray-300';
  return (
    <div
      id='pdf-toolbar'
      className='flex w-full items-center justify-between border-b-[1px] border-b-faded_border bg-white p-[10px]'
    >
      <Button onClick={closeImageModal}>
        <FaTimes />
      </Button>
      <span className='mx-auto flex items-center gap-[5px]'>
        <button
          disabled={pageNumber <= 1}
          onClick={firstPage}
          className={pageNumber <= 1 ? disabledClasses : enabledClasses}
        >
          <HiChevronDoubleLeft size={iconSize} />
        </button>
        <button
          disabled={pageNumber <= 1}
          onClick={previousPage}
          className={pageNumber <= 1 ? disabledClasses : enabledClasses}
        >
          <HiChevronLeft size={iconSize} />
        </button>
        <span className='flex w-[80px] justify-center text-[15px]'>
          {pageNumber} / {numPages}
        </span>
        <button
          disabled={pageNumber >= numPages}
          onClick={nextPage}
          className={pageNumber >= numPages ? disabledClasses : enabledClasses}
        >
          <HiChevronRight size={iconSize} />
        </button>
        <button
          disabled={pageNumber >= numPages}
          onClick={lastPage}
          className={pageNumber >= numPages ? disabledClasses : enabledClasses}
        >
          <HiChevronDoubleRight size={iconSize} />
        </button>
      </span>
      <span className='flex items-center gap-[5px]'>
        <button
          disabled={containOrFill === 'contain'}
          onClick={() => setContainOrFill('contain')}
          className={
            containOrFill === 'contain' ? disabledClasses : enabledClasses
          }
        >
          <HiZoomOut size={iconSize} />
        </button>
        <button
          disabled={containOrFill === 'fill'}
          onClick={() => setContainOrFill('fill')}
          className={
            containOrFill === 'fill' ? disabledClasses : enabledClasses
          }
        >
          <HiZoomIn size={iconSize} />
        </button>
      </span>
    </div>
  );
};
