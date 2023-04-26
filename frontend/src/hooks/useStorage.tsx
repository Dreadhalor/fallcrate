import { Storage } from '../storage/Storage';
import { useFirebaseStorage } from '../storage/useFirebaseStorage';

export const useStorage = (): Storage => {
  return useFirebaseStorage();
};
