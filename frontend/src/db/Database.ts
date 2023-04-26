export interface Database {
  fetchFiles: () => Promise<any[]>;
  createFile: (name: string, parent: string | null) => Promise<any>;
  renameFile: (file_id: string, name: string) => Promise<any>;
  moveFile: (file_id: string, parent_id: string | null) => Promise<any>;
  deleteFile: (file_id: string) => Promise<any>;
  createFolder: (name: string, parent: string | null) => Promise<any>;
}
