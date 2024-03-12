import { FaCheck, FaFile, FaFolder } from 'react-icons/fa';
import { CustomFile, DraggedItems } from '@fallcrate/types';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import prettyBytes from 'pretty-bytes';
import { useDrag, useDrop } from 'react-dnd';
import { useFileContextMenu } from '@fallcrate/providers/file-context-menu-provider';
import { Image as AntdImage } from 'antd';
import { useEffect, useState } from 'react';
import { useAchievements } from 'dread-ui';
import { createDragPreview } from '@fallcrate/create-drag-preview';
import { FcImageFile } from 'react-icons/fc';
import { BrowserItemName } from './browser-item-name';
import { BsCameraVideoFill } from 'react-icons/bs';

type Props = {
  file: CustomFile;
};

const ITEM_TYPE = 'file';

const BrowserItem = ({ file }: Props) => {
  const {
    moveFiles,
    selectedFiles,
    selectFile,
    openFile,
    getFileUrl,
    selectFilesExclusively,
    setRenamingFileId,
  } = useFilesystem();

  const { isUnlockable, unlockAchievementById } = useAchievements();

  const is_selected = selectedFiles.includes(file.id);
  const some_selected = selectedFiles.length > 0;

  // Drag related logic
  const [previewImage, setPreviewImage] = useState<HTMLImageElement | null>(
    null,
  );

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ITEM_TYPE,
      item: () => {
        // this just doesn't work so let's comment it out
        // if (selectedFiles.includes(file.id)) {
        //   return { ids: selectedFiles };
        // }
        setRenamingFileId(null);
        selectFilesExclusively([file.id]);
        return { ids: [file.id] };
      },

      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [file.id, selectedFiles, selectFilesExclusively],
  );

  // Drop related logic
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ITEM_TYPE,
      drop: (items: DraggedItems) => {
        if (file.type === 'directory' && items.ids.length > 0) {
          moveFiles(items.ids, file.id);
        }
      },
      canDrop: () => file.type === 'directory',
      collect: (monitor) => ({
        isOver: file.type === 'directory' && monitor.isOver(),
      }),
    }),
    [file.id, moveFiles],
  );

  // Merge drag and drop refs
  const dragDropRef = (el: HTMLDivElement | null) => {
    if (el) {
      drag(el);
      drop(el);
    }
  };

  useEffect(() => {
    createDragPreview(file.name, file.type === 'directory', 1).then((img) => {
      img.onload = () => setPreviewImage(img);
    });
  }, [file.name, file.type, preview]);

  // Set the preview image as the drag preview
  useEffect(() => {
    preview(previewImage, {
      offsetX: 0,
      offsetY: 0,
    });
  }, [previewImage]);

  const background = isOver && !isDragging ? 'bg-[rgba(0,97,254,0.16)]' : '';

  const getItemClass = () => {
    const item_selected = `border-l-[2px] pl-[8px]`;
    const item_unselected = `pl-[10px]`;
    return is_selected ? item_selected : item_unselected;
  };

  const getBackgroundClass = () => {
    const possible_bgs = {
      unselected: 'group-hover:bg-[#f5f5f5]',
      selected: 'bg-[rgba(0,97,254,0.16)]',
      dragging: is_selected ? 'bg-[rgba(0,97,254,0.16)]' : 'bg-[#f5f5f5]',
    };
    if (isDragging) return possible_bgs.dragging;
    if (is_selected) return possible_bgs.selected;
    return possible_bgs.unselected;
  };

  const { showFileContextMenu } = useFileContextMenu();
  const [showPreview, setShowPreview] = useState(false);
  const [url, setUrl] = useState('');
  useEffect(() => {
    getFileUrl(file.id ?? '').then((url) => setUrl(url));
  }, [file.id]);

  const handleClick = () => {
    if (file.type === 'file' && file.mimeType?.startsWith('image')) {
      unlockAchievementById('preview_image', 'fallcrate');
      return setShowPreview(true);
    }
    openFile(file.id);
  };

  const getIcon = () => {
    if (file.type === 'directory')
      return <FaFolder className='flex-shrink-0' />;
    if (file.mimeType?.startsWith('image'))
      return <FcImageFile size={18} className='flex-shrink-0' />;
    if (file.mimeType?.startsWith('video'))
      return (
        <BsCameraVideoFill size={18} className='flex-shrink-0 text-blue-400' />
      );
    return <FaFile className='flex-shrink-0' />;
  };

  return (
    <div
      className={`group flex w-full flex-row items-center ${background}`}
      ref={dragDropRef}
    >
      <AntdImage
        style={{ display: 'none' }}
        src={url}
        preview={{
          visible: showPreview,
          scaleStep: 0.5,
          src: url,
          onVisibleChange: (value) => setShowPreview(value),
          onTransform: (e) => {
            const {
              transform: { scale },
            } = e;
            if (scale <= 1) return;
            if (isUnlockable('zoom_into_preview', 'fallcrate'))
              unlockAchievementById('zoom_into_preview', 'fallcrate');
          },
        }}
      />
      <div className='p-[10px]'>
        <button
          className={`flex h-[25px] w-[25px] items-center justify-center rounded-sm border-gray-500 group-hover:border ${
            some_selected && 'border'
          } ${
            is_selected
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-200'
          }`}
          onClick={() => selectFile(file.id)}
        >
          {is_selected && <FaCheck />}
        </button>
      </div>
      <div
        className={`flex h-full min-w-0 flex-1 cursor-pointer flex-row items-center gap-[10px] border-b border-[rgba(167,146,114,0.2)] border-l-[rgb(0,97,254)] py-[4px] pr-[10px] ${getItemClass()} ${getBackgroundClass()}`}
        onClick={handleClick}
        onContextMenu={(e) => showFileContextMenu(e, file, true)}
        style={{ opacity: isDragging ? 0.6 : 1 }}
      >
        <div className='flex w-[20px] flex-shrink-0 items-center justify-center'>
          {getIcon()}
        </div>

        <BrowserItemName file={file} />

        <div className='ml-auto flex w-[100px] items-center justify-center'>
          {file.type === 'file' && prettyBytes(file.size ?? 0)}
        </div>
      </div>
    </div>
  );
};

export { BrowserItem };
