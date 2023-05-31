import { sortFiles } from '@src/helpers';
import { CustomFile } from '@src/types';
import { useState, useEffect } from 'react';
import { useFiles } from './useFiles';
import { useAuth } from 'milestone-components';

// okay pretty sure the only reason stuff like this is kosher as a hook instead of a context is because it's
// only instantiated once thru FilesystemProvider & then that instance is passed to every other component that needs it
export const useCurrentDirectory = () => {
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
  const [currentDirectoryFiles, setCurrentDirectoryFiles] = useState<
    CustomFile[]
  >([]);

  // which also means useFiles is dangerous but since all instances use Firestore as the source of truth it's fine
  // FOR NOW
  const { files } = useFiles();
  const { uid } = useAuth();

  useEffect(() => {
    openDirectory(currentDirectory);
  }, [files]);

  useEffect(() => openDirectory(null), [uid]);

  const openDirectory = (directory_id: string | null) => {
    setCurrentDirectory(directory_id);
    const newCurrentDirectoryFiles = files
      .filter((file) => file.parent === directory_id)
      .sort(sortFiles);
    setCurrentDirectoryFiles(newCurrentDirectoryFiles);
  };

  return {
    currentDirectory,
    currentDirectoryFiles,
    openDirectory,
  };
};
