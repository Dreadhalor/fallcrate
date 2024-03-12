import { useStorage } from '@fallcrate/hooks/use-storage';
import { CustomFile, CustomFileFields } from '@fallcrate/types';
import { v4 as uuidv4 } from 'uuid';
import { getValidDuplicatedName } from './helpers';
import { useAchievements, useAuth } from 'dread-ui';
import { useDB } from '@fallcrate/hooks/use-db';
import { getNestedFilesOnly, orderFilesByDirectory } from '@fallcrate/helpers';
import { useFiles } from './use-files';
import { useState } from 'react';
import { useStorageManager } from '@fallcrate/hooks/fileserver/use-storage-manager';

export const useDuplicateFileOrFolder = () => {
  const [suspense, setSuspense] = useState(false);

  const { uid } = useAuth();
  const storage = useStorage();
  const db = useDB(uid!);
  const { unlockAchievementById } = useAchievements();
  const { storageSpaceCheck } = useStorageManager();
  // ugh the pain but let's not think about how we're creating a new instance of useFiles here
  const { files } = useFiles();

  const duplicateFileOrFolder = async (file_id: string) => {
    if (suspense) return;
    setSuspense(true); // start suspense
    try {
      const file = files.find((file) => file.id === file_id);
      if (!file) return;
      const parent = file.parent;
      const directoryFiles = files.filter((file) => file.parent === parent);
      const new_name = getValidDuplicatedName(file.name, directoryFiles);
      if (file.type === 'directory') {
        const nestedFiles = getNestedFilesOnly(file.id, files);
        // Include the parent directory in the storage check.
        storageSpaceCheck(
          [file, ...nestedFiles],
          "You don't have enough storage space to duplicate this folder.",
        );
        await duplicateFolderWithName(file, new_name);
        // use the same achievement for both files and folders
        unlockAchievementById('duplicate_file', 'fallcrate');
      } else {
        storageSpaceCheck(
          [file],
          "You don't have enough storage space to duplicate this file.",
        );
        await duplicateSingleFileWithName(file, new_name);
        unlockAchievementById('duplicate_file', 'fallcrate');
      }
    } finally {
      setSuspense(false); // end suspense
    }
  };

  const duplicateBlob = async (
    old_file_id: string,
    duplicated_file: CustomFileFields,
  ) => {
    if (duplicated_file.type !== 'file') return;
    const blob = await storage
      .getDownloadURL(`uploads/${old_file_id}`)
      .then((url) => fetch(url).then((r) => r.blob()));
    const path = `uploads/${duplicated_file.id}`;
    await storage.uploadBlob(blob, path);
  };

  const saveDuplicatedFile = async (
    old_id: string,
    new_file: CustomFileFields,
  ) => {
    if (!new_file || new_file.type !== 'file') return;
    await duplicateBlob(old_id, new_file).then(() => {
      db.createFile(new_file);
    });
  };

  const duplicateSingleFileWithName = async (
    file: CustomFile,
    new_name: string,
  ) => {
    if (!file || file.type !== 'file') return;
    const new_file = { ...file, name: new_name, id: uuidv4() };
    await saveDuplicatedFile(file.id, new_file);
  };

  const duplicateFolderWithName = async (
    folder: CustomFile,
    new_name: string,
  ) => {
    if (!folder || folder.type !== 'directory') return;

    const duplication_map = new Map<string, CustomFileFields>();
    const reverse_duplication_map = new Map<string, CustomFileFields>();

    const nestedFiles = getNestedFilesOnly(folder.id, files);

    // Added the new folder as an entry in the duplication map
    const initial_folder = { ...folder, id: uuidv4(), name: new_name };
    duplication_map.set(folder.id, initial_folder);
    reverse_duplication_map.set(initial_folder.id, folder);

    nestedFiles.forEach((file) => {
      const new_file = { ...file, id: uuidv4() };
      duplication_map.set(file.id, new_file);
      reverse_duplication_map.set(new_file.id, file);
    });

    duplication_map.forEach((file) => {
      file.parent = duplication_map.get(file.parent || '')?.id || null;
    });

    const orderedFiles = orderFilesByDirectory(
      Array.from(duplication_map.values()),
    );

    return await Promise.all(
      orderedFiles.map((file) => {
        if (file.type === 'directory') return db.createFile(file);
        else {
          const old_id = reverse_duplication_map.get(file.id)?.id;
          return saveDuplicatedFile(old_id || '', file);
        }
      }),
    );
  };

  return { duplicateFileOrFolder, suspense };
};
