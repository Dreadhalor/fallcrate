import { createDB } from '../db/DBConfig';
import { Database } from '../db/Database';

const useDB = (): Database => {
  return createDB();
};

export default useDB;
