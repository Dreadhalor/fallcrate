import { useState, useEffect } from 'react';
import { useDB } from '@hooks/useDB';
import { useAuth } from 'milestone-components';
import { useFiles } from '@hooks/fileserver/useFiles';
import { CustomFileFields } from '@src/types';

export const useStorageManager = () => {
  const { uid } = useAuth();
  const db = useDB(uid);
  const { files = [] } = useFiles();

  const [storageUsed, setStorageUsed] = useState(0);
  const maxStorage = 1000 * 1000 * 1000; // 100MB

  useEffect(() => {
    const fetchStorageUsage = async () => {
      const usage = files.reduce((acc, file) => acc + (file.size ?? 0), 0);
      setStorageUsed(usage);
    };

    fetchStorageUsage();
  }, [uid, db, files]);

  const hasEnoughSpace = (filesToUpload: (File | CustomFileFields)[]) => {
    const sizeNeeded = filesToUpload.reduce(
      (total, file) => total + (file.size ?? 0),
      0
    );
    // Check if the user has enough space for a new upload
    return storageUsed + sizeNeeded <= maxStorage;
  };

  const storageSpaceCheck = (
    filesToUpload: (File | CustomFileFields)[],
    message?: string
  ) => {
    if (!hasEnoughSpace(filesToUpload)) {
      throw new Error(
        message || "You don't have enough storage space for this upload."
      );
    }
    return true;
  };

  return {
    storageUsed,
    maxStorage,
    hasEnoughSpace,
    storageSpaceCheck,
  };
};
