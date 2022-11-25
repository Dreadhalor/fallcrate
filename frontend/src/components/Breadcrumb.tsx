import React, { useRef, useState } from 'react';
import { File } from '../helpers';

type Props = {
  file: File | null;
  currentDirectory: string | null;
  openDirectory: (file_id: string | null) => void;
  moveFiles: (file_ids: string[], destination_id: string | null) => void;
};

const Breadcrumb = ({
  file,
  currentDirectory,
  openDirectory,
  moveFiles,
}: Props) => {
  const [dragover, setDragover] = useState(false);

  const file_id = file?.id ?? null;
  const is_current_directory = (file?.id ?? null) === currentDirectory;
  const color = is_current_directory ? 'text-black' : 'text-gray-500';
  const hover = is_current_directory ? '' : 'hover:underline';
  const underline = dragover ? 'underline' : '';

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
    <div>
      <button
        draggable={file_id !== null}
        onDragStart={drag}
        onDrop={drop}
        onDragOver={allowDrop}
        onDragLeave={() => setDragover(false)}
        disabled={is_current_directory}
        className={`${hover} ${color} ${underline}`}
        onClick={() => openDirectory(file?.id ?? null)}
      >
        {file?.name ?? 'Fallcrate'}
      </button>
      {!is_current_directory && <span className={color}>&nbsp;/&nbsp;</span>}
    </div>
  );
};

export default Breadcrumb;
