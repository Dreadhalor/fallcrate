import React, { useCallback } from 'react';
import { useFilesystem } from '@hooks/useFilesystem';

const FileDropzone = () => {
  const { processDragNDrop } = useFilesystem();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      let items = e.dataTransfer.items;
      processDragNDrop(items);
    },
    [processDragNDrop]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className='m-[10px] flex min-h-[100px] items-center justify-center
        rounded-lg border-2 border-dashed border-gray-300 text-gray-400'
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      Drop files or folders here to upload
    </div>
  );
};

export default FileDropzone;
