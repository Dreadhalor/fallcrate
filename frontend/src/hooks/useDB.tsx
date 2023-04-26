import { DBConfig, createDB } from '../db/DBConfig';
import { Database } from '../db/Database';

const useDB = (): Database => {
  const config: DBConfig = { type: 'json-server' }; // or 'firestore'
  return createDB(config);
};

export default useDB;
