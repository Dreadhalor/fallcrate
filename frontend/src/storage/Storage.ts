import { UploadTaskSnapshot, StorageError } from 'firebase/storage';

export interface Storage {
  uploadFile: (
    file: File,
    path: string,
    onProgress?: (snapshot: UploadTaskSnapshot) => void,
    onError?: (error: StorageError) => void,
    onComplete?: () => void
  ) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
  getDownloadURL: (path: string) => Promise<string>;
}
