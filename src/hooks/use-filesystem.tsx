import { FilesystemContext } from '@fallcrate/contexts/file-system-context';
import { useContext } from 'react';

export const useFilesystem = () => {
  const context = useContext(FilesystemContext);
  if (context === undefined) {
    throw new Error('useFilesystem must be used within a FilesystemProvider');
  }
  return context;
};
