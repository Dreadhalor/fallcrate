import { CustomFile, DraggedItem } from '@src/types';
import { useFilesystem } from '@providers/FilesystemProvider';
import { useDrag, useDrop } from 'react-dnd';
import { useAchievements } from 'milestone-components';

type Props = {
  file: CustomFile | null;
};

const ITEM_TYPE = 'file';

const Breadcrumb = ({ file }: Props) => {
  const { currentDirectory, openDirectory, moveFiles } = useFilesystem();
  const { unlockAchievementById } = useAchievements();

  const file_id = file?.id ?? null;
  const is_current_directory = (file?.id ?? null) === currentDirectory;
  const color = is_current_directory ? 'text-black' : 'text-gray-400';
  const mouseover = is_current_directory
    ? ''
    : 'hover:underline hover:text-black';

  // Drag related logic
  const [{}, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: file_id },
    canDrag: !!file_id,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Drop related logic
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ITEM_TYPE,
      drop: (item: DraggedItem) => {
        if (item.id) moveFiles([item.id], file_id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver() && monitor.getItem().id !== file_id,
      }),
    }),
    [file_id, moveFiles]
  );

  // Merge drag and drop refs
  const dragDropRef = (el: HTMLButtonElement | null) => {
    if (el) {
      drag(el);
      drop(el);
    }
  };

  const handleClick = () => {
    openDirectory(file?.id ?? null);
    unlockAchievementById('breadcrumb_navigation');
  };

  return (
    <div className='flex items-center'>
      <div className='relative mx-[4px] py-[2px] px-[4px]'>
        {isOver && (
          <div
            className='pointer-events-none absolute inset-[1px] z-20'
            style={{ border: '2px solid blue' }}
          ></div>
        )}
        <button
          ref={dragDropRef}
          disabled={is_current_directory}
          className={`${mouseover} ${color}`}
          onClick={handleClick}
        >
          {file?.name ?? 'Fallcrate'}
        </button>
      </div>

      {!is_current_directory && <span className={color}>/</span>}
    </div>
  );
};

export default Breadcrumb;
