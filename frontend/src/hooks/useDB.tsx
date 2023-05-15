import { useCreateDB } from '../db/DBConfig';
import { Database } from '../db/Database';

export const useDB = (): Database => {
  return useCreateDB();
};
