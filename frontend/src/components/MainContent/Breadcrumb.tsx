import React, { useState } from 'react';
import { CustomFile } from '@src/types';
import { useFileManagement } from '@providers/FileManagementProvider';

type Props = {
  file: CustomFile | null;
};

const Breadcrumb = ({ file }: Props) => {
  const [dragover, setDragover] = useState(false);

  const { currentDirectory, openDirectory, moveFiles } = useFileManagement();

  const file_id = file?.id ?? null;
  const is_current_directory = (file?.id ?? null) === currentDirectory;
  const color = is_current_directory ? 'text-black' : 'text-gray-400';
  const mouseover = is_current_directory
    ? ''
    : 'hover:underline hover:text-black';

  const allowDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragover(true);
  };
  const drag = (e: React.DragEvent<HTMLButtonElement>) => {
    if (file_id) {
      e.dataTransfer.setData('file_id', file_id);
    }
  };
  const drop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const child_file_id = e.dataTransfer.getData('file_id');
    if (child_file_id) {
      moveFiles([child_file_id], file_id);
    }
    setDragover(false);
  };

  return (
    <div className='flex items-center'>
      <div className='relative mx-[4px] py-[2px] px-[4px]'>
        <div
          className='pointer-events-none absolute inset-[1px] z-20'
          style={{ border: dragover ? '2px solid blue' : 'none' }}
        ></div>
        <button
          draggable={file_id !== null}
          onDragStart={drag}
          onDrop={drop}
          onDragOver={allowDrop}
          onDragLeave={() => setDragover(false)}
          disabled={is_current_directory}
          className={`${mouseover} ${color}`}
          onClick={() => openDirectory(file?.id ?? null)}
        >
          {file?.name ?? 'Fallcrate'}
        </button>
      </div>

      {!is_current_directory && <span className={color}>/</span>}
    </div>
  );
};

export default Breadcrumb;
