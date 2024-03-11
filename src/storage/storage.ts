import { UploadTaskSnapshot, StorageError } from 'firebase/storage';

export interface Storage {
  uploadFile: (
    file: File,
    path: string,
    onProgress?: (snapshot: UploadTaskSnapshot) => void,
    onError?: (error: StorageError) => void,
    onComplete?: () => void
  ) => Promise<void>;
  uploadBlob: (
    blob: Blob,
    path: string,
    onProgress?: (snapshot: UploadTaskSnapshot) => void,
    onError?: (error: StorageError) => void,
    onComplete?: () => void
  ) => Promise<void>;

  deleteFiles: (file_ids: string[]) => Promise<void[]>;
  getDownloadURL: (path: string) => Promise<string>;
}
