import { CustomFile } from '@src/types';

export interface Database {
  fetchFiles: () => Promise<CustomFile[]>;
  createFile: (file: any) => Promise<CustomFile>;
  renameFile: (file_id: string, name: string) => Promise<CustomFile>;
  moveFile: (file_id: string, parent_id: string | null) => Promise<CustomFile>;
  deleteFiles: (file_ids: string[]) => Promise<string[]>; // return deleted file ids
  createFolder: (name: string, parent: string | null) => Promise<CustomFile>;

  subscribeToFiles: (callback: (files: CustomFile[]) => void) => () => void;
}
