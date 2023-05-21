// FileDropzone.tsx
import React, { useCallback } from 'react';
import { useFilesystem } from '@hooks/useFilesystem';
import { useAchievements } from 'milestone-components';

const FileDropzone = () => {
  const { uploadFileOrFolder, selectFilesExclusively } = useFilesystem();
  const { unlockAchievementById } = useAchievements();

  const handleUpload = useCallback(
    async (file: File) => uploadFileOrFolder(file, false), // Use the uploadFile method from the useFilesystem hook
    [uploadFileOrFolder] // Update the dependency array to include currentDirectory <--- what???
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const files = e.dataTransfer.files;

      Promise.all(Array.from(files).map((file) => handleUpload(file))).then(
        (uploaded_ids) => {
          selectFilesExclusively(uploaded_ids);
          unlockAchievementById('upload_file');
        }
      );
    },
    [handleUpload]
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
      Drop files here to upload
    </div>
  );
};

export default FileDropzone;
