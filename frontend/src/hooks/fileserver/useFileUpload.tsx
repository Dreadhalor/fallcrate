import { useDB } from '@hooks/useDB';
import { useStorage } from '@hooks/useStorage';
import { v4 as uuidv4 } from 'uuid';
import {
  CustomFile,
  CustomFileFields,
  FileUpload,
  FileUploadData,
} from '@src/types';
import { Timestamp } from 'firebase/firestore';
import { useAchievements, useAuth } from 'milestone-components';
import { getValidDuplicatedName } from './helpers';
import { orderFilesByDirectory, parseFileArray } from '@src/helpers';
import { useEffect, useState } from 'react';

export const useFileUpload = (
  currentDirectory: string | null,
  currentDirectoryFiles: CustomFile[]
) => {
  const { uid } = useAuth();
  const { unlockAchievementById } = useAchievements();
  const db = useDB(uid);
  const storage = useStorage();

  const [uploadQueue, setUploadQueue] = useState([] as FileUpload[]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const addToUploadQueue = (file: FileUploadData) => {
    const newUpload: FileUpload = {
      uploadData: file,
      bytesUploaded: 0,
      totalBytes: file.size ?? 0,
      status: 'waiting',
    };
    setUploadQueue((prev) => [newUpload, ...prev]);
  };
  const dequeueCompletedUpload = (id: string) => {
    setUploadQueue((prev) =>
      prev.filter((upload) => upload.uploadData.id !== id)
    );
  };

  useEffect(() => {
    const processQueue = async () => {
      const waitingUploads = uploadQueue.filter(
        (upload) => upload.status === 'waiting'
      );
      for (const upload of waitingUploads) {
        setShowUploadModal(true);
        await startUpload(upload);
      }
    };
    processQueue();
  }, [uploadQueue]);

  const startUpload = (upload: FileUpload) => {
    return new Promise(async (resolve, reject) => {
      upload.status = 'uploading';
      const { uploadData } = upload;
      const { id, file, type } = uploadData;
      if (type === 'file' && file) {
        const path = `uploads/${id}`;
        try {
          await storage.uploadFile(
            file,
            path,
            (snapshot) => {
              upload.totalBytes = snapshot.totalBytes;
              upload.bytesUploaded = snapshot.bytesTransferred;
            },
            (error) => {
              console.log(`Error (${file.name}:`, error);
              reject(error);
            },
            async () => {
              upload.status = 'complete';
              await db.createFile(uploadData);
              resolve(id);
            }
          );
        } catch (error) {
          console.log('Upload error:', error);
          reject(error);
        }
      }
    });
  };

  const uploadSingleFileUploadData = async (
    fields: FileUploadData
  ): Promise<string> => {
    const { id, file, type } = fields;
    if (type === 'file' && file) {
      const path = `uploads/${id}`;
      await storage.uploadFile(file, path);
    }
    await db.createFile(fields);
    return id;
  };

  const uploadFilesOrFolders2 = async (
    items: FileUploadData[]
  ): Promise<string[]> => {
    // order items by directory structure
    const orderedItems = orderFilesByDirectory(items);
    const topLevelItems = orderedItems.filter((item) => item.parent === null);
    topLevelItems.forEach((item) => {
      item.parent = currentDirectory ?? null;
      item.name = getValidDuplicatedName(item.name, currentDirectoryFiles);
    });

    const uploadPromises = orderedItems.map(
      async (item) => await uploadSingleFileUploadData(item)
    );
    const ids = await Promise.all(uploadPromises);
    return ids;
  };

  const uploadFilesOrFolders = async (
    items: FileUploadData[]
  ): Promise<string[]> => {
    // order items by directory structure
    const orderedItems = orderFilesByDirectory(items);

    const uploadPromises = orderedItems.map((item) =>
      uploadSingleFileUploadData(item)
    );
    const ids = await Promise.all(uploadPromises);
    return ids;
  };

  const parseFile = (file: File) => {
    const id = uuidv4();
    const fields: FileUploadData = {
      id,
      name: file.name,
      type: 'file',
      size: file.size,
      parent: currentDirectory ?? null, // do we even need this null coalescer?
      createdAt: Timestamp.now(),
      file,
    };
    return fields;
  };

  const uploadFileOrFolder = async (
    file: File,
    achievementsEnabled = true
  ): Promise<string> => {
    const id = uuidv4();
    const path = `uploads/${id}`;
    await storage.uploadFile(file, path);

    const newFile: CustomFileFields = {
      id,
      name: getValidDuplicatedName(file.name, currentDirectoryFiles),
      type: 'file',
      size: file.size,
      parent: currentDirectory ?? null,
      createdAt: Timestamp.now(),
    };

    await db.createFile(newFile);
    if (achievementsEnabled) unlockAchievementById('upload_file');
    return id;
  };

  const uploadFolder = async (files: FileUploadData[]): Promise<string[]> => {
    const folder = files[0];
    folder.parent = currentDirectory ?? null;
    folder.name = getValidDuplicatedName(folder.name, currentDirectoryFiles);
    const uploadPromises = files.map((file) =>
      uploadSingleFileUploadData(file)
    );
    await Promise.all(uploadPromises);
    unlockAchievementById('upload_folder');
    return Promise.resolve([folder.id]);
  };

  const promptUpload = (
    isDirectory: boolean,
    callback: (files: File[]) => Promise<string[]>
  ): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.webkitdirectory = isDirectory;
      input.onchange = async () => {
        if (!input.files) {
          resolve([]);
        } else {
          try {
            const files = Array.from(input.files);
            const result = await callback(files);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      };
      input.onerror = (error) => {
        reject(error);
      };
      input.click();
    });
  };

  const promptUploadFiles2 = (): Promise<string[]> => {
    return promptUpload(false, async (files) => {
      const uploadPromises = files.map((file) =>
        uploadFileOrFolder(file, false)
      );
      const ids = await Promise.all(uploadPromises);
      unlockAchievementById('upload_file');
      return ids;
    });
  };

  const promptUploadFiles = async () => {
    return new Promise<FileUploadData[]>((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.onchange = async () => {
        if (!input.files) {
          resolve([]);
        } else {
          try {
            const files = Array.from(input.files);
            const result = files.map(parseFile);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      };
      input.onerror = (error) => reject(error);

      input.click();
    }).then((uploadDataPlural: FileUploadData[]) => {
      uploadDataPlural.forEach(addToUploadQueue);
    });
  };

  const promptUploadFolder = async (): Promise<string[]> => {
    return promptUpload(true, async (files) => {
      const parsedFiles = parseFileArray(files);
      console.log('parsedFiles:', parsedFiles);
      const directories = parsedFiles.filter(
        (file) => file.type === 'directory'
      );
      const _files = parsedFiles.filter((file) => file.type === 'file');
      console.log(_files);
      directories.forEach(async (directory) => {
        directory.parent = currentDirectory ?? null;
        await db.createFile(directory);
      });
      _files.forEach(addToUploadQueue);
    });
  };

  return {
    uploadFileOrFolder,
    promptUploadFiles,
    promptUploadFolder,
    uploadFilesOrFolders,
    uploadQueue,
    dequeueCompletedUpload,
    showUploadModal,
    setShowUploadModal,
  };
};
