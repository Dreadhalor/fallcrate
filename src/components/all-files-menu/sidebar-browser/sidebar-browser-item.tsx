import { useEffect, useRef, useState } from 'react';
import { FaChevronRight, FaFolder } from 'react-icons/fa';
import { BsDot } from 'react-icons/bs';
import { Collapse } from 'react-collapse';
import { Tooltip } from 'react-tooltip';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { TruncatedText } from '@fallcrate/components/utilities/truncated-text';
import { CustomFile, DraggedItems } from '@fallcrate/types';
import { useDrag, useDrop } from 'react-dnd';
import { calculateDragOffset } from '@fallcrate/helpers';
import { createDragPreview } from '@fallcrate/create-drag-preview';
import { useAchievements } from 'dread-ui';

type Props = {
  file: CustomFile;
  indentLevel?: number;
};

const ITEM_TYPE = 'file';

const SidebarBrowserItem = ({ file, indentLevel = 0 }: Props) => {
  const { unlockAchievementById } = useAchievements();
  const [childFolders, setChildFolders] = useState<CustomFile[]>([]);
  const canExpand = file.type === 'directory' && childFolders.length > 0;
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (isOpen && canExpand)
      unlockAchievementById('expand_folder', 'fallcrate');
  }, [isOpen]);

  const display_id = `file-${file.id}`;

  const { files, currentDirectory, openDirectory, moveFiles } = useFilesystem();

  useEffect(() => {
    const childFolders = files.filter(
      (f) => f.parent === file.id && f.type === 'directory',
    );
    setChildFolders(childFolders);
    if (isOpen && childFolders.length === 0) setIsOpen(false);
  }, [files, file.id]);

  const isCurrentDirectory = currentDirectory === file.id;

  // Drag related logic
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ITEM_TYPE,
    item: (monitor) => {
      setDragOffset(calculateDragOffset(monitor));
      return { ids: [file.id] };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Create a ref for the preview Image
  const previewImageRef = useRef<HTMLImageElement | null>(null);

  // Load the preview image and assign to the preview ref
  useEffect(() => {
    createDragPreview(file.name, true, 1).then((img) => {
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
  }, [file.name, file.type, preview]);

  // Drop related logic
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ITEM_TYPE,
      drop: (items: DraggedItems) => {
        if (items.ids.length > 0) moveFiles(items.ids, file.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [file.id, moveFiles],
  );

  // Merge drag and drop refs
  const dragDropRef = (el: HTMLDivElement | null) => {
    drag(el);
    drop(el);
  };

  const background_1 = isCurrentDirectory
    ? 'bg-[rgba(0,97,254,0.16)]'
    : 'hover:bg-gray-100';
  const background_2 =
    isDragging || isOver ? 'bg-[rgba(0,97,254,0.16)]' : 'hover:bg-gray-100';
  const background = isDragging || isOver ? background_2 : background_1;

  const left_margin = 20;
  const indent_margin = 10;

  const [isTruncated, setIsTruncated] = useState(false);

  return (
    <div className='flex cursor-pointer flex-col text-xs'>
      <div
        ref={dragDropRef}
        className={`flex flex-row items-center gap-[5px] px-[4px] ${background} group`}
        style={{
          paddingLeft: `${indentLevel * indent_margin + left_margin}px`,
          opacity: isDragging ? 0.5 : 1,
        }}
        onClick={() => {
          if (isCurrentDirectory) setIsOpen((prev) => !prev);
          else openDirectory(file.id);
        }}
      >
        {childFolders.length > 0 ? (
          <div
            className={`rounded-sm p-[5px] transition-colors duration-200 hover:bg-gray-300 ${
              isCurrentDirectory ? 'group-hover:bg-[#c0c6ce]' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
          >
            <FaChevronRight
              size={8}
              className='transition-transform duration-100'
              style={{
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
          </div>
        ) : (
          <div className='p-[5px]'>
            <BsDot size={8} />
          </div>
        )}
        <FaFolder className='flex-shrink-0' />
        {/* add a tooltip of the file name when hovering over the file name */}
        <div className='min-w-0 py-[4px]' id={display_id}>
          <TruncatedText text={file.name} truncationChange={setIsTruncated} />
        </div>
        {isTruncated && (
          <Tooltip
            anchorSelect={`#${display_id}`}
            content={file.name}
            positionStrategy='fixed'
            style={{ maxWidth: '300px' }}
          />
        )}
      </div>
      <Collapse isOpened={isOpen}>
        {childFolders.map((child) => (
          <SidebarBrowserItem
            file={child}
            indentLevel={indentLevel + 1}
            key={child.id}
          />
        ))}
      </Collapse>
    </div>
  );
};

export { SidebarBrowserItem };
