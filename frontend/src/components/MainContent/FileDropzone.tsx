// FileDropzone.tsx
import React, { useCallback } from 'react';
import { useFilesystem } from '@providers/FilesystemProvider';

const FileDropzone = () => {
  const { uploadFile } = useFilesystem();

  const handleUpload = useCallback(
    async (file: File) => uploadFile(file), // Use the uploadFile method from the useFilesystem hook
    [uploadFile] // Update the dependency array to include currentDirectory
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      // e.stopPropagation();

      const files = e.dataTransfer.files;

      for (let i = 0; i < files.length; i++) {
        handleUpload(files[i]);
      }
    },
    [handleUpload]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // e.stopPropagation();
  };

  return (
    <div
      className='m-[10px] flex min-h-[100px] items-center justify-center
        rounded-lg border-2 border-dashed border-gray-300 text-gray-400'
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      Drop files here to upload
    </div>
  );
};

export default FileDropzone;
