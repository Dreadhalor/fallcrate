import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { useEffect, useRef, useState } from 'react';
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
  setPageNumber: (page: number) => void;
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
  setPageNumber,
  numPages,
  previousPage,
  nextPage,
  firstPage,
  lastPage,
  containOrFill,
  setContainOrFill,
}: Props) => {
  const { closeFileViewer } = useFilesystem();
  const iconSize = 24;
  const enabledClasses = 'text-blue-500 hover:text-blue-700';
  const disabledClasses = 'text-gray-300';

  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePageNumberChange = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pageNumberInput = parseInt(e.target.value);
    if (!isNaN(pageNumberInput)) {
      setPageNumber(Math.max(1, Math.min(pageNumberInput, numPages)));
    }
    setIsEditing(false);
  };

  const handlePageNumberSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pageNumberInput = parseInt(
      (e.currentTarget.elements[0] as HTMLInputElement).value,
    );
    if (!isNaN(pageNumberInput)) {
      setPageNumber(Math.max(1, Math.min(pageNumberInput, numPages)));
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <div
      id='pdf-toolbar'
      className='border-b-faded_border flex w-full items-center justify-between border-b-[1px] bg-white p-[10px]'
    >
      <button onClick={closeFileViewer} className={enabledClasses}>
        <FaTimes />
      </button>
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
          {isEditing ? (
            <form onSubmit={handlePageNumberSubmit}>
              <input
                ref={inputRef}
                defaultValue={pageNumber}
                onBlur={handlePageNumberChange}
                style={{ width: '30px' }}
              />
            </form>
          ) : (
            <button
              className='cursor-pointer'
              onClick={() => setIsEditing(true)}
            >
              {pageNumber}
            </button>
          )}
          &nbsp;/&nbsp;{numPages || '?'}
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
