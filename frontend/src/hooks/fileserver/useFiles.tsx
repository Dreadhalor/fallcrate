import { useEffect, useState } from 'react';
import { clearSelfParents, resetCircularBranches, resetOrphanBranches } from './useFilesHelpers';
import { CustomFile } from '@src/types';
import { useDB } from '../useDB';
import { useAuth } from 'milestone-components';

export const useFiles = () => {
  const [files, setFiles] = useState<CustomFile[]>([]);

  const { uid } = useAuth();

  const db = useDB(uid);

  useEffect(() => {
    const userFilesUnsubscribe = db.subscribeToFiles((data) =>
      setFiles(clearSelfParents(data))
    );

    return () => {
      userFilesUnsubscribe();
    };
  }, [uid]);

  // I don't think this actually writes state anymore so fix that
  useEffect(() => {
    clearSelfParents(files);
    resetOrphanBranches(files);
    resetCircularBranches(files);
  }, [files]);

  return {
    files,
  };
};