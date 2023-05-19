import { useEffect, useState } from 'react';
// import { clearSelfParents, resetCircularBranches, resetOrphanBranches } from './useFilesHelpers';
import { CustomFile } from '@src/types';
import { useDB } from '../useDB';
import { useAuth } from 'milestone-components';

// does this need to be a context? I don't fully understand each use of contexts yet
export const useFiles = () => {
  const [files, setFiles] = useState<CustomFile[]>([]);

  const { uid } = useAuth();

  const db = useDB(uid);

  useEffect(() => {
    const userFilesUnsubscribe = db.subscribeToFiles((data) =>
      setFiles(data)
    );

    return () => {
      userFilesUnsubscribe();
    };
  }, [uid]);

  // I don't think this actually writes state anymore so fix that
  // useEffect(() => {
  //   clearSelfParents(files);
  //   resetOrphanBranches(files);
  //   resetCircularBranches(files);
  // }, [files]);

  return {
    files,
  };
};