import { useState } from 'react';
import { FaCheck, FaFile, FaFolder } from 'react-icons/fa';
import { File } from '../../helpers';
import './styles.scss';

type Props = {
  file: File;
  selectedFiles: string[];
  selectFile: (file_id: string) => void;
  openFile: (file_id: string) => void;
  moveFiles: (file_ids_to_move: string[], parent_id: string | null) => void;
};

const BrowserItem = ({
  file,
  selectedFiles,
  selectFile,
  openFile,
  moveFiles,
}: Props) => {
  const is_selected = selectedFiles.includes(file.id);
  const selected_class = is_selected ? 'item-selected' : 'item-unselected';
  const some_selected = selectedFiles.length > 0;

  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragover(true);
  };
  const drag = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('file_id', file.id);
  };
  const drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file_id = e.dataTransfer.getData('file_id');
    moveFiles([file_id], file.id);
    setDragover(false);
  };

  const [dragover, setDragover] = useState(false);

  return (
    <div
      className={`browser-item group flex w-full flex-row items-center ${
        dragover ? 'bg-blue-400' : 'bg-white'
      }`}
      draggable
      onDragStart={drag}
      onDragOver={allowDrop}
      onDragLeave={() => setDragover(false)}
      onDrop={drop}
    >
      <div className='p-[6px]'>
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
        className={`flex h-full flex-1 cursor-pointer flex-row items-center gap-[10px] border-b border-[rgba(167,146,114,0.2)] border-l-[rgb(0,97,254)] py-[4px] pr-[10px] ${selected_class}`}
        onClick={() => openFile(file.id)}
      >
        {file.type === 'directory' ? <FaFolder /> : <FaFile />}
        {file.name}
      </div>
    </div>
  );
};

export default BrowserItem;
