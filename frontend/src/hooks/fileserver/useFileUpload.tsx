import { useDB } from '@hooks/useDB';
import { useStorage } from '@hooks/useStorage';
import { v4 as uuidv4 } from 'uuid';
import { CustomFile, CustomFileFields, CustomUploadFields } from '@src/types';
import { Timestamp } from 'firebase/firestore';
import { useAchievements, useAuth } from 'milestone-components';
import { getValidDuplicatedName } from './helpers';
import { orderFilesByDirectory, parseFileArray } from '@src/helpers';

export const useFileUpload = (
  currentDirectory: string | null,
  currentDirectoryFiles: CustomFile[]
) => {
  const { uid } = useAuth();
  const { unlockAchievementById } = useAchievements();
  const db = useDB(uid);
  const storage = useStorage();

  const uploadCustomUploadFields = async (
    fields: CustomUploadFields
  ): Promise<string> => {
    const { id, file, type } = fields;
    if (type === 'file' && file) {
      const path = `uploads/${id}`;
      await storage.uploadFile(file, path);
    }
    await db.createFile(fields);
    return id;
  };

  const uploadFilesOrFolders = async (
    items: CustomUploadFields[]
  ): Promise<string[]> => {
    // order items by directory structure
    const orderedItems = orderFilesByDirectory(items);

    const uploadPromises = orderedItems.map((item) =>
      uploadCustomUploadFields(item)
    );
    const ids = await Promise.all(uploadPromises);
    return ids;
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

  const uploadFolder = async (
    files: CustomUploadFields[]
  ): Promise<string[]> => {
    const folder = files[0];
    folder.parent = currentDirectory ?? null;
    folder.name = getValidDuplicatedName(folder.name, currentDirectoryFiles);
    const uploadPromises = files.map((file) => uploadCustomUploadFields(file));
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

  const promptUploadFiles = (): Promise<string[]> => {
    return promptUpload(false, async (files) => {
      const uploadPromises = files.map((file) =>
        uploadFileOrFolder(file, false)
      );
      const ids = await Promise.all(uploadPromises);
      unlockAchievementById('upload_file');
      return ids;
    });
  };

  const promptUploadFolder = (): Promise<string[]> => {
    return promptUpload(true, async (files) => {
      const parsedFiles = parseFileArray(files);
      const ids = await uploadFolder(parsedFiles);
      return ids;
    });
  };

  return {
    uploadFileOrFolder,
    promptUploadFiles,
    promptUploadFolder,
    uploadFolder,
    uploadFilesOrFolders,
  };
};
