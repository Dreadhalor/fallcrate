import { useEffect, useState } from 'react';
// import { clearSelfParents, resetCircularBranches, resetOrphanBranches } from './useFilesHelpers';
import { CustomFile } from '@fallcrate/types';
import { useDB } from '../use-db';
import { useAuth } from 'dread-ui';

// does this need to be a context? I don't fully understand each use of contexts yet
// okay I think maybe it 'should' but doesn't need to because all of the instances still use Firestore as the source of truth
// sounds dangerous as hell but I don't need to think about that right now awww yeah
export const useFiles = () => {
  const [files, setFiles] = useState<CustomFile[]>([]);

  const { uid } = useAuth();

  const db = useDB(uid!);

  useEffect(() => {
    const userFilesUnsubscribe = db.subscribeToFiles((data) => setFiles(data));

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
