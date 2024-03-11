import { FileUploadData, UploadProgress } from '@fallcrate/types';
import { useRef, useState } from 'react';

export const useUploadQueue = () => {
  const progressRefs = useRef(new Map<string, UploadProgress>());
  const [uploadQueue, setUploadQueue] = useState([] as FileUploadData[]);

  const addToUploadQueue = (file: FileUploadData) => {
    setUploadQueue((prev) => [file, ...prev]);
  };

  const dequeueCompletedUpload = (id: string) => {
    setUploadQueue((prev) => prev.filter((uploadData) => uploadData.id !== id));
  };

  const getUploadStatus = (id: string) => {
    const progressRef = progressRefs.current.get(id);
    if (progressRef) return progressRef.state;
    return null;
  };

  return {
    addToUploadQueue,
    dequeueCompletedUpload,
    getUploadStatus,
    progressRefs,
    uploadQueue,
  };
};
