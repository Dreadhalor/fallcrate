import { useState } from 'react';
import { FaCheck, FaFile, FaFolder } from 'react-icons/fa';
import { CustomFile } from '@src/types';
import { useFilesystem } from '@providers/FilesystemProvider';
import prettyBytes from 'pretty-bytes';
import { useDragAndDrop } from '@providers/DragAndDropProvider';

type Props = {
  file: CustomFile;
};

const BrowserItem = ({ file }: Props) => {
  const { moveFiles, selectedFiles, selectFile, openFile } = useFilesystem();

  const is_selected = selectedFiles.includes(file.id);
  const some_selected = selectedFiles.length > 0;

  const { state, setState } = useDragAndDrop();
  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragover(true);
  };
  const drag = (e: React.DragEvent<HTMLDivElement>) => {
    setDragging(true);
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    setState({
      draggedFileId: file.id,
      source: 'BrowserItem',
    });
  };

  const drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const file_id = state.draggedFileId;
    if (file_id) {
      moveFiles([file_id], file.id);
      // e.stopPropagation();
    }
    setDragover(false);
    setDragging(false);
    setState({ draggedFileId: null, source: null });
  };

  const [dragover, setDragover] = useState(false);
  const [dragging, setDragging] = useState(false);

  const background = dragover && !dragging ? 'bg-[rgba(0,97,254,0.16)]' : '';

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
    if (dragging) return possible_bgs.dragging;
    if (is_selected) return possible_bgs.selected;
    return possible_bgs.unselected;
  };

  return (
    <div
      className={`group flex w-full flex-row items-center ${background}`}
      draggable
      onDragStart={drag}
      onDragOver={allowDrop}
      onDragLeave={() => {
        setDragover(false);
      }}
      onDrop={drop}
      onDragEnd={() => {
        setDragging(false);
      }}
    >
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
        className={`flex h-full flex-1 cursor-pointer flex-row items-center gap-[10px] border-b border-[rgba(167,146,114,0.2)] border-l-[rgb(0,97,254)] py-[4px] pr-[10px] ${getItemClass()} ${getBackgroundClass()}`}
        onClick={() => openFile(file.id)}
      >
        {file.type === 'directory' ? <FaFolder /> : <FaFile />}
        <span className='flex-1'>{file.name}</span>
        {file.type === 'file' && (
          <div className='flex w-[100px] items-center justify-center'>
            {prettyBytes(file.size ?? 0)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserItem;
