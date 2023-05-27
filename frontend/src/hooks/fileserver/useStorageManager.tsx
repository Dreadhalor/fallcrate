import { useState, useEffect } from 'react';
import { useDB } from '@hooks/useDB';
import { useAuth } from 'milestone-components';
import { useFiles } from '@hooks/fileserver/useFiles';
import { FileUploadData } from '@src/types';

export const useStorageManager = () => {
  const { uid } = useAuth();
  const db = useDB(uid);
  const { files = [] } = useFiles();

  const [storageUsed, setStorageUsed] = useState(0);
  const maxStorage = 1000 * 1000 * 1000; // 1GB

  useEffect(() => {
    const fetchStorageUsage = async () => {
      const usage = files.reduce((acc, file) => acc + (file.size ?? 0), 0);
      setStorageUsed(usage);
    };

    fetchStorageUsage();
  }, [uid, db, files]);

  const hasEnoughSpace = (filesToUpload: (File | FileUploadData)[]) => {
    const sizeNeeded = filesToUpload.reduce(
      (total, file) => total + (file.size ?? 0),
      0
    );
    // Check if the user has enough space for a new upload
    return storageUsed + sizeNeeded <= maxStorage;
  };

  return {
    storageUsed,
    maxStorage,
    hasEnoughSpace,
  };
};
