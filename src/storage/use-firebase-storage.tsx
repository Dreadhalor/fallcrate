import {
  UploadTaskSnapshot,
  StorageError,
  ref,
  uploadBytesResumable,
  deleteObject,
  getDownloadURL as firebaseGetDownloadURL,
  getStorage,
} from 'firebase/storage';
import { Storage } from './storage';

export const useFirebaseStorage = (): Storage => {
  const storage = getStorage();

  const uploadFile = async (
    file: File,
    path: string,
    onProgress?: (snapshot: UploadTaskSnapshot) => void,
    onError?: (error: StorageError) => void,
    onComplete?: () => void,
  ): Promise<void> => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        onProgress,
        (error) => {
          if (onError) {
            onError(error);
          }
          reject(error);
        },
        async () => {
          if (onComplete) {
            onComplete();
          }
          resolve();
        },
      );
    });
  };

  const uploadBlob = async (
    blob: Blob,
    path: string,
    onProgress?: (snapshot: UploadTaskSnapshot) => void,
    onError?: (error: StorageError) => void,
    onComplete?: () => void,
  ): Promise<void> => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        onProgress,
        (error) => {
          if (onError) {
            onError(error);
          }
          reject(error);
        },
        async () => {
          if (onComplete) {
            onComplete();
          }
          resolve();
        },
      );
    });
  };

  const deleteFile = async (id: string) => {
    const path = `uploads/${id}`;
    const storageRef = ref(storage, path);
    return await deleteObject(storageRef);
  };
  const deleteFiles = async (ids: string[]) =>
    Promise.all(ids.map((id) => deleteFile(id)));

  const getDownloadURL = async (path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    return await firebaseGetDownloadURL(storageRef);
  };

  return {
    uploadFile,
    uploadBlob,
    deleteFiles,
    getDownloadURL,
  };
};
