import { useDB } from '@hooks/useDB';
import { useStorage } from '@hooks/useStorage';
import { v4 as uuidv4 } from 'uuid';
import { CustomFile, CustomFileFields, CustomUploadFields } from '@src/types';
import { Timestamp } from 'firebase/firestore';
import { useAchievements, useAuth } from 'milestone-components';
import { getValidDuplicatedName } from './helpers';
import { parseFileArray } from '@src/helpers';

export const useFileUpload = (currentDirectory: string | null, currentDirectoryFiles: CustomFile[]) => {
  const { uid } = useAuth();
  const { unlockAchievementById } = useAchievements();
  const db = useDB(uid);
  const storage = useStorage();

  const uploadCustomUploadFields = async (fields: CustomUploadFields) => {
    // Generate a unique id for the file
    const { id, file } = fields;

    // If not a folder, upload the file to storage
    if (fields.type === 'file' && file) { // redundant but Typescript doesn't know that
      const path = `uploads/${id}`;
      await storage.uploadFile(file, path);
    }

    await db.createFile(fields);
  }

  const uploadFileOrFolder = async (file: File) => {
    // Generate a unique id for the file
    const id = uuidv4();

    // Upload the file to storage
    const path = `uploads/${id}`;
    await storage.uploadFile(file, path);

    // Create a file entry in the database
    const newFile: CustomFileFields = {
      id,
      name: getValidDuplicatedName(file.name, currentDirectoryFiles),
      type: 'file',
      size: file.size,
      parent: currentDirectory ?? null,
      createdAt: Timestamp.now(),
    };

    await db
      .createFile(newFile)
      .then((_) => unlockAchievementById('upload_file'));
  };

  const uploadFolder = async (files: CustomUploadFields[]) => {
    // we assume that the folder is the first file in the array
    const folder = files[0];
    folder.parent = currentDirectory ?? null;
    // sanitize the folder name
    folder.name = getValidDuplicatedName(folder.name, currentDirectoryFiles);
    const uploadPromises = files.map((file) => uploadCustomUploadFields(file));
    await Promise.all(uploadPromises);
    unlockAchievementById('upload_folder');
  };

  const promptUpload = (isDirectory: boolean, callback: (files: File[]) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.webkitdirectory = isDirectory;
    input.onchange = () => {
      if (!input.files) return;
      const files = Array.from(input.files);
      callback(files);
    };
    input.click();
  };

  const promptUploadFiles = () => {
    promptUpload(false, (files) => {
      const uploadPromises = files.map((file) => uploadFileOrFolder(file));
      Promise.all(uploadPromises);
    });
  };

  const promptUploadFolder = () => {
    promptUpload(true, (files) => {
      const parsedFiles = parseFileArray(files);
      uploadFolder(parsedFiles);
    });
  };

  return {
    uploadFile: uploadFileOrFolder,
    promptUploadFiles,
    promptUploadFolder,
  };
};
