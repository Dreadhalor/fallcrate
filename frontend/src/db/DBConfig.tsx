import { Database } from './Database';
import useFirestoreDB from './useFirestoreDB';
import useJsonServerDB from './useJsonServerDB';

export interface DBConfig {
  type: 'json-server' | 'firestore';
}

const defaultDBType = import.meta.env.VITE_DATABASE_TYPE || 'firestore';

export const useCreateDB = (
  config: DBConfig = { type: defaultDBType as 'json-server' | 'firestore' }
): Database => {
  switch (config.type) {
    case 'json-server':
      return useJsonServerDB();
    case 'firestore':
      return useFirestoreDB();
    default:
      throw new Error('Invalid database type');
  }
};
