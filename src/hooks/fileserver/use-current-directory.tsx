import { sortFiles } from '@fallcrate/helpers';
import { CustomFile } from '@fallcrate/types';
import { useState, useEffect } from 'react';
import { useFiles } from './use-files';
import { useAchievements, useAuth } from 'dread-ui';

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
  const { unlockAchievementById, isUnlockable } = useAchievements();

  useEffect(() => {
    openDirectory(currentDirectory);
  }, [files]);

  useEffect(() => openDirectory(null), [uid]);

  const openDirectory = (directory_id: string | null) => {
    if (isUnlockable('navigation_depth', 'fallcrate')) {
      let level = 0;
      let file = files.find((_file) => _file.id === directory_id);
      while (file && level < 7) {
        level++;
        file = files.find((_file) => _file.id === file?.parent);
      }
      if (level >= 7) unlockAchievementById('navigation_depth', 'fallcrate');
    }
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
