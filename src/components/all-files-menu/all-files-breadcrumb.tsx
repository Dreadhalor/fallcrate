import { DraggedItems } from '@fallcrate/types';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { useDrop } from 'react-dnd';
import { MouseEvent } from 'react';
import { TruncatedText } from '@fallcrate/components/utilities/truncated-text';

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
      drop: (items: DraggedItems) => {
        if (items.ids.length > 0) moveFiles(items.ids, null);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [moveFiles],
  );

  return (
    // overflow-hideen here + TruncatedText below is just so that "All Files" doesn't wrap to a second line while
    // the sidebar closes
    <div className='relative overflow-hidden px-[4px] py-[2px]'>
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
        <TruncatedText text='All Files' />
      </button>
    </div>
  );
};

export { AllFilesBreadcrumb };
