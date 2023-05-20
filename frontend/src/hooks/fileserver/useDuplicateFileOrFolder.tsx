import { useStorage } from '@hooks/useStorage';
import { CustomFile, CustomFileFields } from '@src/types';
import { v4 as uuidv4 } from 'uuid';
import { getValidDuplicatedName } from './helpers';
import { useAchievements, useAuth } from 'milestone-components';
import { useDB } from '@hooks/useDB';
import { getNestedFilesOnly, orderFilesByDirectory } from '@src/helpers';
import { useFiles } from './useFiles';

export const useDuplicateFileOrFolder = () => {

  const { uid } = useAuth();
  const storage = useStorage();
  const db = useDB(uid);
  const { unlockAchievementById } = useAchievements();
  // ugh the pain but let's not think about how we're creating a new instance of useFiles here
  const { files } = useFiles();

  const duplicateFileOrFolder = async (file_id: string) => {
    const file = files.find((file) => file.id === file_id);
    if (!file) return;
    const parent = file.parent;
    const directoryFiles = files.filter((file) => file.parent === parent);
    const new_name = getValidDuplicatedName(file.name, directoryFiles);
    if (file.type === 'directory') {
      duplicateFolderWithName(file, new_name);
      unlockAchievementById('duplicate_folder');
    } else {
      duplicateSingleFileWithName(file, new_name);
      unlockAchievementById('duplicate_file');
    }
  };

  const duplicateBlob = async (
    old_file_id: string,
    duplicated_file: CustomFile
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
    new_file: CustomFileFields
  ) => {
    if (!new_file || new_file.type !== 'file') return;
    await db
      .createFile(new_file)
      .then((created_file) => duplicateBlob(old_id, created_file));
  };

  const duplicateSingleFileWithName = async (
    file: CustomFile,
    new_name: string
  ) => {
    if (!file || file.type !== 'file') return;
    const new_file = { ...file, name: new_name, id: uuidv4() };
    saveDuplicatedFile(file.id, new_file);
  };

  const duplicateFolderWithName = async (
    folder: CustomFile,
    new_name: string
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
      Array.from(duplication_map.values())
    );

    await Promise.all(
      orderedFiles.map((file) => {
        if (file.type === 'directory') return db.createFile(file);
        else {
          const old_id = reverse_duplication_map.get(file.id)?.id;
          return saveDuplicatedFile(old_id || '', file);
        }
      })
    );
  };

  return { duplicateFileOrFolder };
}