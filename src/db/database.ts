import { CustomFile, CustomFileFields } from '@fallcrate/types';

export interface Database {
  fetchFiles: () => Promise<CustomFile[]>;
  createFile: (file: CustomFileFields) => Promise<CustomFile>;
  renameFile: (file_id: string, name: string) => Promise<CustomFile>;
  moveFile: (file_id: string, parent_id: string | null) => Promise<CustomFile>;
  deleteFiles: (file_ids: string[]) => Promise<string[]>; // return deleted file ids
  createFolder: (
    name: string,
    parent: string | null,
    id?: string,
  ) => Promise<CustomFile>;

  subscribeToFiles: (callback: (files: CustomFile[]) => void) => () => void;

  transferFiles: (localUid: string, remoteUid: string) => Promise<void>;
}
