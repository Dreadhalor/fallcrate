import React, { useCallback, useState } from 'react';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { useDrop, useDragLayer } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

const FileDropzone = () => {
  const [isHovering, setIsHovering] = useState(false);
  const { processDragNDrop } = useFilesystem();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      let items = e.dataTransfer.items;
      processDragNDrop(items);
      setIsHovering(false);
    },
    [processDragNDrop],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    setIsHovering(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsHovering(false);
  };

  // we can't use react-dnd for the upload because it doesn't support folders
  // but we can use it for visual feedback
  const [, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
  }));

  const { isDraggingFile } = useDragLayer((monitor) => ({
    type: monitor.getItemType(),
    isDraggingFile: monitor.isDragging() && monitor.getItemType() === 'file',
  }));

  const hoverClasses = isHovering ? 'border-blue-300 bg-blue-50' : '';
  const showDropzone = !isDraggingFile;

  return (
    <div
      ref={drop}
      className={`m-[10px] flex min-h-[100px] items-center justify-center rounded-lg
          border-2 border-dashed border-gray-300 text-gray-400 transition-[opacity] ${hoverClasses}`}
      style={{
        opacity: showDropzone ? 1 : 0,
        pointerEvents: showDropzone ? 'auto' : 'none',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      Drop files or folders here to upload
    </div>
  );
};

export { FileDropzone };
