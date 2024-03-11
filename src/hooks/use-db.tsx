import { useCreateDB } from '../db/db-config';
import { Database } from '../db/database';

export const useDB = (uid: string): Database => {
  return useCreateDB(uid);
};
