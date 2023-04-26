import { CustomFile } from '@src/types';

export interface Database {
  fetchFiles: () => Promise<CustomFile[]>;
  createFile: (file: any) => Promise<CustomFile>;
  renameFile: (file_id: string, name: string) => Promise<CustomFile>;
  moveFile: (file_id: string, parent_id: string | null) => Promise<CustomFile>;
  // deleteFile returns the id of the deleted file, even though it's not used
  deleteFile: (file_id: string) => Promise<string>;
  createFolder: (name: string, parent: string | null) => Promise<CustomFile>;
}
