import React, { useCallback } from 'react';
import { useFilesystem } from '@hooks/useFilesystem';
import { useAchievements } from 'milestone-components';
import { v4 as uuidv4 } from 'uuid';
import { CustomFileFields, CustomUploadFields } from '@src/types';
import { Timestamp } from 'firebase/firestore';

const FileDropzone = () => {
  const { uploadFileOrFolder, selectFilesExclusively, uploadFilesOrFolders } =
    useFilesystem();
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
      if (file) {
        // check if file is defined
        const fileObject = createFileObject(file, parent);
        const uploadedId = await uploadFileOrFolder(file, false);

        // If uploaded successfully, return the fileObject with file included, otherwise an empty array
        return uploadedId ? [{ ...fileObject, file }] : [];
      }
      return [];
    },
    [uploadFileOrFolder, createFileObject]
  );

  const handleFolderUpload = useCallback(
    (item: any, parent: string | null): Promise<CustomUploadFields[]> => {
      return new Promise((resolve) => {
        let files: CustomUploadFields[] = [];

        if (item.isFile) {
          item.file((f: File) => {
            if (f) {
              // check if file is defined
              const fileObject = createFileObject(f, parent);
              files.push({ ...fileObject, file: f }); // include file blob data
            }
            resolve(files);
          });
        } else if (item.isDirectory) {
          const dirObject = createDirectoryObject(item.name, parent);
          files.push(dirObject);
          let directoryReader = item.createReader();
          directoryReader.readEntries(async (entries: any) => {
            for (const entry of entries) {
              const nestedFiles = await handleFolderUpload(entry, dirObject.id);
              files = files.concat(nestedFiles);
            }
            resolve(files);
          });
        }
      });
    },
    [createFileObject, createDirectoryObject]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      let items = e.dataTransfer.items;

      const itemPromises = Array.from(items).map((item: any) => {
        let entry = item.webkitGetAsEntry();
        if (entry.isFile) {
          return new Promise<CustomUploadFields[]>((resolve) =>
            entry.file((file: File) => resolve(handleUpload(file, null)))
          );
        } else if (entry.isDirectory) {
          return handleFolderUpload(entry, null);
        }
        // Provide a fallback return
        return Promise.resolve([]);
      });

      Promise.all(itemPromises).then((uploaded_files) => {
        const nonEmptyFiles = uploaded_files
          .flat()
          .filter((file) => file && file.id !== null);
        uploadFilesOrFolders(nonEmptyFiles).then((uploaded_ids) => {
          const nonNullIds = uploaded_ids.filter((id) => id !== null);
          selectFilesExclusively(nonNullIds as string[]);
          unlockAchievementById('upload_file');
        });
      });
    },
    [
      handleFolderUpload,
      handleUpload,
      uploadFilesOrFolders,
      selectFilesExclusively,
      unlockAchievementById,
    ]
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
