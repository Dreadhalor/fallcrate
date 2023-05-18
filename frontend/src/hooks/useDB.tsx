import { useCreateDB } from '../db/DBConfig';
import { Database } from '../db/Database';

export const useDB = (uid: string): Database => {
  return useCreateDB(uid);
};
