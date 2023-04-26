import { Database } from './Database';
// import useFirestoreDB from './useFirebaseServerDB';
import useJsonServerDB from './useJsonServerDB';

export interface DBConfig {
  type: 'json-server' | 'firestore';
}

export const createDB = (config: DBConfig): Database => {
  switch (config.type) {
    case 'json-server':
      return useJsonServerDB();
    // case 'firestore':
    //   return useFirestoreDB();
    default:
      throw new Error('Invalid database type');
  }
};
