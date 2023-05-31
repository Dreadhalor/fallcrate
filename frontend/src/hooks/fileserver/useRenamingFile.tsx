import { useEffect, useState } from 'react';
import { useFiles } from './useFiles';
import { checkDirectoryForNameConflict } from '@src/helpers';
import { CustomFile } from '@src/types';
import { useDB } from '@hooks/useDB';
import { useAuth } from 'milestone-components';

export const useRenamingFile = () => {
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [file, setFile] = useState<CustomFile | null>(null);

  const { uid } = useAuth();
  const { files } = useFiles();
  const db = useDB(uid);

  useEffect(() => {
    setFile(files.find((_file) => _file.id === renamingFileId) ?? null);
  }, [files, renamingFileId]);

  const requestRename = async (name: string) => {
    if (!renamingFileId || !name || name === file?.name)
      return setRenamingFileId(null);

    if (
      checkDirectoryForNameConflict(
        name,
        renamingFileId,
        file?.parent || null,
        files
      )
    ) {
      setRenamingFileId(null);
      throw `A file with the name "${name}" already exists in the current directory!`;
    }
    await db.renameFile(renamingFileId, name);
    setRenamingFileId(null);
  };

  return {
    renamingFileId,
    setRenamingFileId,
    requestRename,
  };
};
