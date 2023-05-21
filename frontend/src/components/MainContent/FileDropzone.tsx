import React, { useCallback } from 'react';
import { useFilesystem } from '@hooks/useFilesystem';
import { useAchievements } from 'milestone-components';
import { v4 as uuidv4 } from 'uuid';
import { CustomFileFields } from '@src/types';
import { Timestamp } from 'firebase/firestore';

const FileDropzone = () => {
  const { uploadFileOrFolder, selectFilesExclusively } = useFilesystem();
  const { unlockAchievementById } = useAchievements();

  const createFileObject = (
    file: File,
    parent: string | null
  ): CustomFileFields => ({
    id: uuidv4(),
    name: file.name,
    type: 'file',
    size: file.size,
    parent: parent,
    createdAt: Timestamp.now(),
  });

  const createDirectoryObject = (
    name: string,
    parent: string | null
  ): CustomFileFields => ({
    id: uuidv4(),
    name: name,
    type: 'directory',
    parent: parent,
    createdAt: Timestamp.now(),
  });

  const handleUpload = useCallback(
    async (file: File, parent: string | null) => {
      const fileObject = createFileObject(file, parent);
      console.log(fileObject);
      const uploadedId = await uploadFileOrFolder(file, false);
      return uploadedId || null;
    },
    [uploadFileOrFolder]
  );

  const handleFolderUpload = useCallback(
    async (item: any, parent: string | null): Promise<string | null> => {
      if (item.isFile) {
        return new Promise((resolve) => {
          item.file((f: File) => {
            resolve(handleUpload(f, parent));
          });
        });
      } else if (item.isDirectory) {
        const dirObject = createDirectoryObject(item.name, parent);
        console.log(dirObject);
        let directoryReader = item.createReader();
        directoryReader.readEntries((entries: any) => {
          return Promise.all(
            entries.map((entry: any) => handleFolderUpload(entry, dirObject.id))
          );
        });
      }
      return null;
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      let items = e.dataTransfer.items;

      Promise.all(
        Array.from(items).map((item: any) =>
          handleFolderUpload(item.webkitGetAsEntry(), null)
        )
      ).then((uploaded_ids) => {
        const nonNullIds = uploaded_ids.filter((id) => id !== null);
        selectFilesExclusively(nonNullIds as string[]);
        unlockAchievementById('upload_file');
      });
    },
    [handleUpload, handleFolderUpload]
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
