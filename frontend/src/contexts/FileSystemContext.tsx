import { CustomFile } from "@src/types";
import { createContext } from "react";

interface FilesystemContextValue {
  files: CustomFile[];
  selectedFiles: string[];
  currentDirectory: string | null;
  currentDirectoryFiles: CustomFile[];
  openDirectory: (directory_id: string | null) => void;
  selectFile: (file_id: string) => void;
  selectFileExclusively: (file_id: string, overrideDirectoryRestriction?: boolean) => void;
  massToggleSelectFiles: () => void;
  openFile: (file_id?: string) => void;
  createFolder: (name: string) => void;
  deleteFiles: (file_ids: string[]) => void;
  promptNewFolder: () => void;
  promptRenameFile: (file_id: string) => void;
  moveFiles: (file_ids_to_move: string[], parent_id: string | null) => void;
  uploadFile: (file: File) => void;
  promptUploadFiles: () => void;
  promptUploadFolder: () => void;
  openImageModal: (file: CustomFile) => void;
  getParent: (file: CustomFile) => CustomFile | null;
  getFile: (file_id: string) => CustomFile | null;
  nestedSelectedFiles: string[];
  duplicateFileOrFolder: (file_id: string) => Promise<void>;
  getFileUrl: (file_id: string) => Promise<string>;
  downloadFilesOrFolders: (file_ids: string[]) => Promise<void>;
}

export const FilesystemContext = createContext<FilesystemContextValue>(
  {} as FilesystemContextValue
);