import { sortFiles } from '@src/helpers';
import { CustomFile } from '@src/types';
import { useState, useEffect } from 'react';
import { useFiles } from './useFiles';

export const useCurrentDirectory = () => {
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
  const [currentDirectoryFiles, setCurrentDirectoryFiles] = useState<CustomFile[]>([]);

  const { files } = useFiles();

  useEffect(() => {
    openDirectory(currentDirectory);
  }, [files]);

  const openDirectory = (directory_id: string | null) => {
    setCurrentDirectory(directory_id);
    const newCurrentDirectoryFiles = files
      .filter((file) => file.parent === directory_id)
      .sort(sortFiles);
    setCurrentDirectoryFiles(newCurrentDirectoryFiles);
  };

  return {
    currentDirectory,
    setCurrentDirectory,
    currentDirectoryFiles,
    setCurrentDirectoryFiles,
    openDirectory
  }
}
