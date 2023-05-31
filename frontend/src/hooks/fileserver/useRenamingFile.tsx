import { useEffect, useState } from 'react';
import { useFiles } from './useFiles';
import { CustomFile } from '@src/types';
import { useDB } from '@hooks/useDB';
import { useAchievements, useAuth } from 'milestone-components';
import { getValidDuplicatedName } from './helpers';

export const useRenamingFile = () => {
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [file, setFile] = useState<CustomFile | null>(null);

  const { uid } = useAuth();
  const { files } = useFiles();
  const db = useDB(uid);
  const { unlockAchievementById } = useAchievements();

  useEffect(() => {
    setFile(files.find((_file) => _file.id === renamingFileId) ?? null);
  }, [files, renamingFileId]);

  const requestRename = async (name: string) => {
    if (!renamingFileId || !name || name === file?.name || !file)
      return setRenamingFileId(null);

    const siblingFiles = files.filter(
      (_file) => _file.parent === file.parent && _file.id !== file.id
    );
    const validName = getValidDuplicatedName(name, siblingFiles);
    if (validName !== name) {
      unlockAchievementById('filename_conflict');
    }

    setRenamingFileId(null);

    await db.renameFile(renamingFileId, validName);
  };

  return {
    renamingFileId,
    setRenamingFileId,
    requestRename,
  };
};
