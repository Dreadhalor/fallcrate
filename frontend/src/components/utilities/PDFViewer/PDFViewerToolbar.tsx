import { useFilesystem } from '@hooks/useFilesystem';
import { Button } from 'antd';
import { FaTimes } from 'react-icons/fa';

type Props = {
  pageNumber: number;
  numPages: number;
  previousPage: () => void;
  nextPage: () => void;
};

export const PDFViewerToolbar = ({
  pageNumber,
  numPages,
  previousPage,
  nextPage,
}: Props) => {
  const { closeImageModal } = useFilesystem();
  return (
    <div className='flex items-center justify-between border-b-[1px] border-b-faded_border bg-white p-[10px]'>
      <span className='flex gap-[5px]'>
        <Button onClick={closeImageModal}>
          <FaTimes />
        </Button>
        <Button
          disabled={pageNumber <= 1}
          onClick={previousPage}
          className='w-[100px]'
        >
          Previous
        </Button>
      </span>
      <span>
        {pageNumber} / {numPages}
      </span>
      <Button
        disabled={pageNumber >= numPages}
        onClick={nextPage}
        className='w-[100px]'
      >
        Next
      </Button>
    </div>
  );
};
