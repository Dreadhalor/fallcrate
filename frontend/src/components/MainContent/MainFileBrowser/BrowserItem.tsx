import { FaCheck, FaFile, FaFolder } from 'react-icons/fa';
import { CustomFile, DraggedItem } from '@src/types';
import { useFilesystem } from '@hooks/useFilesystem';
import prettyBytes from 'pretty-bytes';
import { useDrag, useDrop } from 'react-dnd';
import TruncatedText from '@components/utilities/TruncatedText';
import { useFileContextMenu } from '@providers/FileContextMenuProvider';
import { Image } from 'antd';
import { useEffect, useState } from 'react';
import { useAchievements } from 'milestone-components';

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
  } = useFilesystem();

  const { unlockAchievementById } = useAchievements();

  const is_selected = selectedFiles.includes(file.id);
  const some_selected = selectedFiles.length > 0;

  // Drag related logic
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: () => {
      selectFilesExclusively([file.id]);
      return { id: file.id };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Drop related logic
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ITEM_TYPE,
      drop: (item: DraggedItem) => {
        if (item.id) moveFiles([item.id], file.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [file.id, moveFiles]
  );

  // Merge drag and drop refs
  const dragDropRef = (el: HTMLDivElement | null) => {
    if (el) {
      drag(el);
      drop(el);
    }
  };

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
  const [preview, setPreview] = useState(false);
  const [url, setUrl] = useState('');
  useEffect(() => {
    getFileUrl(file.id ?? '').then((url) => setUrl(url));
  }, [file.id]);

  const handleClick = () => {
    if (file.type === 'file' && file.mimeType?.startsWith('image')) {
      unlockAchievementById('preview_image');
      return setPreview(true);
    }
    openFile(file.id);
  };

  return (
    <div
      className={`group flex w-full flex-row items-center ${background}`}
      ref={dragDropRef}
    >
      <Image
        style={{ display: 'none' }}
        src={url}
        preview={{
          visible: preview,
          scaleStep: 0.5,
          src: url,
          onVisibleChange: (value) => {
            setPreview(value);
          },
          wrapStyle: {
            zIndex: 1000, // so it's below the achievement notification
          },
        }}
      />
      <div className='p-[10px]'>
        <div
          className={`flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-sm border-gray-500 group-hover:border ${
            some_selected && 'border'
          } ${
            is_selected
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-200'
          }`}
          onClick={() => selectFile(file.id)}
        >
          {is_selected && <FaCheck />}
        </div>
      </div>
      <div
        className={`flex h-full min-w-0 flex-1 cursor-pointer flex-row items-center gap-[10px] border-b border-[rgba(167,146,114,0.2)] border-l-[rgb(0,97,254)] py-[4px] pr-[10px] ${getItemClass()} ${getBackgroundClass()}`}
        onClick={handleClick}
        onContextMenu={(e) => showFileContextMenu(e, file, true)}
      >
        {file.type === 'directory' ? (
          <FaFolder className='flex-shrink-0' />
        ) : (
          <FaFile className='flex-shrink-0' />
        )}
        <TruncatedText text={file.name} />

        <div className='ml-auto flex w-[100px] items-center justify-center'>
          {file.type === 'file' && prettyBytes(file.size ?? 0)}
        </div>
      </div>
    </div>
  );
};

export default BrowserItem;
