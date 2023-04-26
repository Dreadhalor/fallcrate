import { useStorage } from 'reactfire';
import {
  UploadTaskSnapshot,
  StorageError,
  ref,
  uploadBytesResumable,
  deleteObject,
  getDownloadURL as firebaseGetDownloadURL,
} from 'firebase/storage';
import { Storage } from './Storage';

export const useFirebaseStorage = (): Storage => {
  const storage = useStorage();

  const uploadFile = async (
    file: File,
    path: string,
    onProgress?: (snapshot: UploadTaskSnapshot) => void,
    onError?: (error: StorageError) => void,
    onComplete?: () => void
  ): Promise<string> => {
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
          const downloadURL = await firebaseGetDownloadURL(
            uploadTask.snapshot.ref
          );
          resolve(downloadURL);
        }
      );
    });
  };

  const deleteFile = async (path: string) => {
    const storageRef = ref(storage, path);
    return await deleteObject(storageRef);
  };

  const getDownloadURL = async (path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    return await firebaseGetDownloadURL(storageRef);
  };

  return {
    uploadFile,
    deleteFile,
    getDownloadURL,
  };
};
