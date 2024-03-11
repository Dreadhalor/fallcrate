import { CustomFile, DraggedItems } from '@fallcrate/types';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { useDrag, useDrop } from 'react-dnd';
import { useAchievements } from 'dread-ui';
import { useEffect, useRef, useState } from 'react';
import { createDragPreview } from '@fallcrate/create-drag-preview';
import { calculateDragOffset } from '@fallcrate/helpers';

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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [{}, drag, preview] = useDrag(() => ({
    type: ITEM_TYPE,
    item: (monitor) => {
      setDragOffset(calculateDragOffset(monitor));
      return { ids: [file_id] };
    },
    canDrag: !!file_id,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  // Create a ref for the preview Image
  const previewImageRef = useRef<HTMLImageElement | null>(null);

  // Load the preview image and assign to the preview ref
  useEffect(() => {
    createDragPreview(file?.name ?? '', true, 1).then((img) => {
      if (img) {
        previewImageRef.current = img;
        previewImageRef.current.onload = () => {
          if (previewImageRef.current) {
            preview(previewImageRef.current, {
              offsetX: -dragOffset.x,
              offsetY: -dragOffset.y,
            });
          }
        };
      }
    });
  }, [file?.name, file?.type, preview]);

  // Drop related logic
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ITEM_TYPE,
      drop: (items: DraggedItems) => {
        if (items.ids.length > 0) moveFiles(items.ids, file_id);
      },
      collect: (monitor) => ({
        isOver:
          monitor.isOver() &&
          (!file_id || !monitor.getItem().ids.includes(file_id)),
      }),
    }),
    [file_id, moveFiles],
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
    unlockAchievementById('breadcrumb_navigation', 'fallcrate');
  };

  return (
    <div className='flex items-center'>
      <div className='relative mx-[4px] px-[4px] py-[2px]'>
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

export { Breadcrumb };
