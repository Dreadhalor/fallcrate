import { Database } from './database';
import { useFirestoreDB } from './use-firestore-db';

export interface DBConfig {
  type: 'firestore';
}

const defaultDBType = import.meta.env.VITE_DATABASE_TYPE || 'firestore';

export const useCreateDB = (
  uid: string,
  config: DBConfig = { type: defaultDBType as 'firestore' },
): Database => {
  switch (config.type) {
    case 'firestore':
      return useFirestoreDB(uid);
    default:
      throw new Error('Invalid database type');
  }
};
