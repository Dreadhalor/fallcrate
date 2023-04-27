import React, { useState } from 'react';
import { CustomFile } from '@src/types';
import { useFilesystem } from '@providers/FilesystemProvider';
import { useDragAndDrop } from '@providers/DragAndDropProvider';

type Props = {
  file: CustomFile | null;
};

const Breadcrumb = ({ file }: Props) => {
  const [dragover, setDragover] = useState(false);

  const { currentDirectory, openDirectory, moveFiles } = useFilesystem();

  const file_id = file?.id ?? null;
  const is_current_directory = (file?.id ?? null) === currentDirectory;
  const color = is_current_directory ? 'text-black' : 'text-gray-400';
  const mouseover = is_current_directory
    ? ''
    : 'hover:underline hover:text-black';

  const { state, setState } = useDragAndDrop();
  const allowDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragover(true);
  };
  const drag = (e: React.DragEvent<HTMLButtonElement>) => {
    if (file_id) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
      setState({
        draggedFileId: file_id,
        source: 'Breadcrumb',
      });
    }
  };
  const drop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const child_file_id = state.draggedFileId;
    if (child_file_id) {
      moveFiles([child_file_id], file_id);
    }
    setDragover(false);
    setState({ draggedFileId: null, source: null });
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
