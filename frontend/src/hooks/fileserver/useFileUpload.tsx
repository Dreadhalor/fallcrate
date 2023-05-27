import { useDB } from '@hooks/useDB';
import { useStorage } from '@hooks/useStorage';
import { v4 as uuidv4 } from 'uuid';
import { CustomFile, FileUploadData } from '@src/types';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from 'milestone-components';
// import { getValidDuplicatedName } from './helpers';
import { parseFileArray } from '@src/helpers';
import { useEffect, useState } from 'react';

import { useRef } from 'react';
import { TaskState } from 'firebase/storage';

export type UploadProgress = {
  id: string;
  progress: number;
  lastFrame: number;
  state: TaskState | null;
};

export const useFileUpload = (
  currentDirectory: string | null,
  currentDirectoryFiles: CustomFile[]
) => {
  const { uid } = useAuth();
  const db = useDB(uid);
  const storage = useStorage();

  const [uploadQueue, setUploadQueue] = useState([] as FileUploadData[]);
  const progressRefs = useRef(new Map<string, UploadProgress>());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [removeUploadModal, setRemoveUploadModal] = useState(true);
  const addToUploadQueue = (file: FileUploadData) => {
    setUploadQueue((prev) => [file, ...prev]);
  };
  const dequeueCompletedUpload = (id: string) => {
    setUploadQueue((prev) => prev.filter((uploadData) => uploadData.id !== id));
  };

  const toggleUploadModal = (show: boolean) => {
    if (show) {
      setShowUploadModal(true);
      setRemoveUploadModal(false);
    } else {
      setShowUploadModal(false);
      setRemoveUploadModal(true);
    }
  };

  const getUploadStatus = (id: string) => {
    const progressRef = progressRefs.current.get(id);
    if (progressRef) return progressRef.state;
    return null;
  };

  useEffect(() => {
    const processQueue = async () => {
      const waitingUploads = uploadQueue.filter(
        (uploadData) => getUploadStatus(uploadData.id) === null
      );
      for (const upload of waitingUploads) {
        toggleUploadModal(true);
        await startUpload(upload);
      }
    };
    processQueue();
  }, [uploadQueue]);

  const startUpload = (uploadData: FileUploadData) => {
    return new Promise(async (resolve, reject) => {
      const { id, file, type } = uploadData;
      if (type === 'file' && file) {
        const path = `uploads/${id}`;
        try {
          await storage.uploadFile(
            file,
            path,
            (snapshot) => {
              if (!progressRefs.current.has(id)) {
                progressRefs.current.set(id, {
                  id,
                  progress: 0,
                  lastFrame: 0,
                  state: snapshot.state,
                });
              }

              const progressRef = progressRefs.current.get(id);

              if (progressRef) {
                progressRef.progress =
                  snapshot.bytesTransferred / snapshot.totalBytes;
              }
            },
            (error) => {
              console.log(`Error (${file.name}:`, error);
              reject(error);
            },
            async () => {
              const progressRef = progressRefs.current.get(id);
              if (progressRef) {
                progressRef.state = 'success';
              }
              await db.createFile(uploadData);
              resolve(id);
            }
          );
        } catch (error) {
          console.log('Upload error:', error);
          reject(error);
        }
      }
    });
  };

  const parseFile = (
    file: File,
    parent: string | null = currentDirectory
  ): FileUploadData => {
    const id = uuidv4();
    const fields: FileUploadData = {
      id,
      name: file.name,
      type: 'file',
      mimeType: file.type,
      size: file.size,
      parent: parent ?? null, // do we even need this null coalescer?
      createdAt: Timestamp.now(),
      file,
    };
    return fields;
  };

  const promptUpload = (
    isDirectory: boolean,
    callback: (files: File[]) => Promise<FileUploadData[]>
  ): Promise<FileUploadData[]> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.webkitdirectory = isDirectory;
      input.onchange = async () => {
        if (!input.files) {
          resolve([]);
        } else {
          try {
            const files = Array.from(input.files);
            const result = await callback(files);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      };
      input.onerror = (error) => {
        reject(error);
      };
      input.click();
    });
  };

  const promptUploadFiles = async (): Promise<void> => {
    promptUpload(false, (files) => {
      const result = files.map((file) => parseFile(file, currentDirectory));
      return Promise.resolve(result);
    }).then((uploadDataPlural) => {
      uploadDataPlural.forEach(addToUploadQueue);
    });
  };

  const promptUploadFolder = async (): Promise<void> => {
    promptUpload(true, parseFileArray)
      .then((uploadDataPlural: FileUploadData[]) =>
        processOutDirectories(uploadDataPlural)
      )
      .then((uploadDataPlural) => {
        uploadDataPlural.forEach(addToUploadQueue);
      });
  };

  const processOutDirectories = async (
    uploadDataPlural: FileUploadData[]
  ): Promise<FileUploadData[]> => {
    const directories = uploadDataPlural.filter(
      (uploadData) => uploadData.type === 'directory'
    );
    directories.forEach(async (directory) => {
      if (!directory.parent) directory.parent = currentDirectory ?? null;
      await db.createFile(directory);
    });
    return uploadDataPlural.filter((uploadData) => uploadData.type === 'file');
  };

  const processDragNDrop = async (
    items: DataTransferItemList
  ): Promise<void> => {
    const itemPromises = Array.from(items).map((item) => {
      let entry = item.webkitGetAsEntry();
      if (entry) {
        if (entry.isFile) {
          return new Promise<FileUploadData[]>((resolve) =>
            (entry as any).file((file: File) => {
              const fields = parseFile(file);
              resolve([fields]);
            })
          );
        } else if (entry.isDirectory) {
          return parseDirectoryEntry(entry as any, null);
        }
      }
      // Provide a fallback return
      return Promise.resolve([]);
    });

    Promise.all(itemPromises)
      .then((uploadDataPlural: FileUploadData[][]) => {
        const nonEmptyFiles = uploadDataPlural
          .flat()
          .filter((file) => file && file.id !== null);
        return nonEmptyFiles;
      })
      .then((uploadDataPlural) => processOutDirectories(uploadDataPlural))
      .then((uploadDataPlural) => {
        uploadDataPlural.forEach(addToUploadQueue);
      });
  };

  const parseDirectoryEntry = (
    entry: any,
    parent: string | null
  ): Promise<FileUploadData[]> => {
    return new Promise((resolve) => {
      let files: FileUploadData[] = [];

      if (entry.isFile) {
        entry.file((file: File) => {
          if (file) {
            // check if file is defined
            const fileFields = parseFile(file, parent);
            files.push(fileFields);
          }
          resolve(files);
        });
      } else if (entry.isDirectory) {
        const id = uuidv4();
        const dirFields: FileUploadData = {
          id,
          name: entry.name,
          type: 'directory',
          parent: parent,
          createdAt: Timestamp.now(),
        };
        files.push(dirFields);
        let directoryReader = entry.createReader();
        directoryReader.readEntries(async (entries: any) => {
          for (const subEntry of entries) {
            const nestedFiles = await parseDirectoryEntry(
              subEntry,
              dirFields.id
            );
            files = files.concat(nestedFiles);
          }
          resolve(files);
        });
      }
    });
  };

  return {
    promptUploadFiles,
    promptUploadFolder,
    processDragNDrop,
    uploadQueue,
    dequeueCompletedUpload,
    showUploadModal,
    setShowUploadModal,
    removeUploadModal,
    toggleUploadModal,
    progressRefs,
    getUploadStatus,
  };
};
