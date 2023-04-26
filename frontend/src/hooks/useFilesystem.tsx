import { CustomFile } from '../types';
import { useDB } from '@src/hooks/useDB';
import { useStorage } from '@src/hooks/useStorage';
import { v4 as uuidv4 } from 'uuid';

export interface Filesystem {
  uploadFile: (file: File, parent: string | null) => Promise<CustomFile>;
  // Add more methods here
}

export const useFilesystem = (): Filesystem => {
  const db = useDB();
  const storage = useStorage();

  const uploadFile = async (
    file: File,
    parent: string | null
  ): Promise<CustomFile> => {
    // Upload the file to storage
    const path = `uploads/${uuidv4()}_${file.name}`;
    await storage.uploadFile(file, path);

    // Create a file entry in the database
    const newFile: CustomFile = {
      id: uuidv4(),
      name: file.name,
      type: 'file',
      size: file.size,
      parent: parent ?? null,
      url: await storage.getDownloadURL(path),
    };

    await db.createFile(newFile.name, newFile.parent);
    return newFile;
  };

  return {
    uploadFile,
    // Add more methods here
  };
};
