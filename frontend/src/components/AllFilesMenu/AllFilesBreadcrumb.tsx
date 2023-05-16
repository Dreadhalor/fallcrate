import { DraggedItem } from '@src/types';
import { useFilesystem } from '@providers/FilesystemProvider';
import { useDrop } from 'react-dnd';
import { MouseEvent } from 'react';

type Props = {
  onMouseEnter?: (event: MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLButtonElement>) => void;
};

const ITEM_TYPE = 'file';

const AllFilesBreadcrumb = ({ onMouseEnter, onMouseLeave }: Props) => {
  const { openDirectory, moveFiles } = useFilesystem();

  // Drop related logic
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ITEM_TYPE,
      drop: (item: DraggedItem) => {
        if (item.id) moveFiles([item.id], null);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [moveFiles]
  );

  return (
    <div className='relative py-[2px] px-[4px]'>
      {isOver && (
        <div
          className='pointer-events-none absolute inset-[1px] z-20'
          style={{ border: '2px solid blue' }}
        ></div>
      )}
      <button
        ref={drop}
        className='cursor-pointer text-black hover:underline'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openDirectory(null);
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        All Files
      </button>
    </div>
  );
};

export default AllFilesBreadcrumb;
