import { FilesystemContext } from '@src/contexts/FilesystemContext';
import { useContext } from 'react';

export const useFilesystem = () => {
  return useContext(FilesystemContext);
};
