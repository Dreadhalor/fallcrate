import { Storage } from '../storage/storage';
import { useFirebaseStorage } from '../storage/use-firebase-storage';

export const useStorage = (): Storage => {
  return useFirebaseStorage();
};
