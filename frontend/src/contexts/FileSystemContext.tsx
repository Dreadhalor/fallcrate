import {
  CustomFile,
  CustomFileFields,
  FileUploadData,
  UploadProgress,
} from '@src/types';
import { TaskState } from 'firebase/storage';
import { MutableRefObject, createContext } from 'react';

interface FilesystemContextValue {
  files: CustomFile[];
  selectedFiles: string[];
  currentDirectory: string | null;
  currentDirectoryFiles: CustomFile[];
  openDirectory: (directory_id: string | null) => void;
  selectFile: (file_id: string) => void;
  selectFilesExclusively: (
    file_ids: string[],
    overrideDirectoryRestriction?: boolean
  ) => void;
  massToggleSelectFiles: () => void;
  openFile: (file_id?: string) => void;
  createFolder: (name: string) => void;
  deleteFiles: (file_ids: string[]) => void;
  promptNewFolder: () => void;
  promptRenameFile: (file_id: string) => void;
  moveFiles: (file_ids_to_move: string[], parent_id: string | null) => void;
  promptUploadFiles: () => Promise<void>;
  promptUploadFolder: () => Promise<void>;
  getParent: (file: CustomFileFields) => CustomFileFields | null;
  getFile: (file_id: string) => CustomFile | null;
  nestedSelectedFiles: string[];
  duplicateFileOrFolder: (file_id: string) => Promise<void>;
  duplicateSuspense: boolean;
  getFileUrl: (file_id: string) => Promise<string>;
  downloadFilesOrFolders: (file_ids: string[]) => Promise<void>;
  downloadSuspense: boolean;
  uploadQueue: FileUploadData[];
  dequeueCompletedUpload: (id: string) => void;
  showUploadModal: boolean;
  setShowUploadModal: React.Dispatch<React.SetStateAction<boolean>>;
  removeUploadModal: boolean;
  toggleUploadModal: (show: boolean) => void;
  processDragNDrop: (items: DataTransferItemList) => Promise<void>;
  progressRefs: MutableRefObject<Map<string, UploadProgress>>;
  getUploadStatus: (id: string) => TaskState | null;
  openImageModal: (file: CustomFile) => void;
  closeImageModal: () => void;
}

export const FilesystemContext = createContext<FilesystemContextValue>(
  {} as FilesystemContextValue
);
