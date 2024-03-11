import { useStorage } from '@fallcrate/hooks/use-storage';
import { useUploadModal } from './use-upload-modal';
import { useUploadQueue } from './use-upload-queue';
import { useAchievements, useAuth } from 'dread-ui';
import { useDB } from '@fallcrate/hooks/use-db';
import { CustomFile, FileUploadData } from '@fallcrate/types';
import { Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { parseFileArray } from '@fallcrate/helpers';
import { useEffect } from 'react';
import { useStorageManager } from '@fallcrate/hooks/fileserver/use-storage-manager';
import { deduplicateFilenames, getValidDuplicatedName } from '../helpers';

export const useFileUploader = (
  currentDirectory: string | null,
  currentDirectoryFiles: CustomFile[],
) => {
  const { uid } = useAuth();
  const db = useDB(uid!);
  const storage = useStorage();
  const { unlockAchievementById } = useAchievements();

  const {
    addToUploadQueue,
    dequeueCompletedUpload,
    getUploadStatus,
    progressRefs,
    uploadQueue,
  } = useUploadQueue();

  const {
    showUploadModal,
    setShowUploadModal,
    removeUploadModal,
    toggleUploadModal,
  } = useUploadModal();

  const { storageSpaceCheck } = useStorageManager();

  useEffect(() => {
    const processQueue = async () => {
      const waitingUploads = uploadQueue.filter(
        (uploadData) => getUploadStatus(uploadData.id) === null,
      );
      for (const upload of waitingUploads) {
        toggleUploadModal(true);
        await startUpload(upload);
      }
    };
    processQueue();
  }, [uploadQueue]);

  const unlockTopLevelDragAchievements = (topLevelFiles: FileUploadData[]) => {
    const has_file = topLevelFiles.some((file) => file.type === 'file');
    const has_folder = topLevelFiles.some((file) => file.type === 'directory');
    if (has_file || has_folder) {
      // using the same achievement for both files and folders
      unlockAchievementById('upload_file_drag', 'fallcrate');
    }
    if (has_file) {
      unlockAchievementById('upload_file', 'fallcrate');
    }
    if (has_folder) {
      unlockAchievementById('upload_folder', 'fallcrate');
    }
    if (has_file && has_folder) {
      unlockAchievementById('upload_files_and_folders', 'fallcrate');
    }
  };

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
              reject(error);
            },
            async () => {
              const progressRef = progressRefs.current.get(id);
              if (progressRef) {
                progressRef.state = 'success';
              }
              await db.createFile(uploadData);
              resolve(id);
            },
          );
        } catch (error) {
          reject(error);
        }
      }
    });
  };

  const parseFile = (
    file: File,
    parent: string | null = currentDirectory,
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
    callback: (files: File[]) => Promise<FileUploadData[]>,
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
            storageSpaceCheck(files);
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
    return promptUpload(false, (files) => {
      const result = files.map((file) => parseFile(file, currentDirectory));
      const deduplicatedFiles = deduplicateFilenames(
        result,
        currentDirectoryFiles,
      );
      return Promise.resolve(deduplicatedFiles);
    }).then((uploadDataPlural) => {
      unlockAchievementById('upload_file', 'fallcrate');
      uploadDataPlural.forEach(addToUploadQueue);
    });
  };

  const promptUploadFolder = async (): Promise<void> => {
    return promptUpload(true, parseFileArray)
      .then((uploadDataPlural: FileUploadData[]) => {
        const topLevelDirectory = uploadDataPlural.find((file) => !file.parent);
        if (topLevelDirectory) {
          const validName = getValidDuplicatedName(
            topLevelDirectory.name,
            currentDirectoryFiles,
          );
          topLevelDirectory.name = validName;
          unlockAchievementById('upload_folder', 'fallcrate');
        }
        return processOutDirectories(uploadDataPlural);
      })
      .then((uploadDataPlural) => {
        uploadDataPlural.forEach(addToUploadQueue);
      });
  };

  const processOutDirectories = async (
    uploadDataPlural: FileUploadData[],
  ): Promise<FileUploadData[]> => {
    const directories = uploadDataPlural.filter(
      (uploadData) => uploadData.type === 'directory',
    );
    directories.forEach(async (directory) => {
      if (!directory.parent) directory.parent = currentDirectory ?? null;
      await db.createFile(directory);
    });
    return uploadDataPlural.filter((uploadData) => uploadData.type === 'file');
  };

  const processDragNDrop = async (
    items: DataTransferItemList,
  ): Promise<void> => {
    const itemPromises = Array.from(items).map((item) => {
      let entry = item.webkitGetAsEntry();
      if (entry) {
        if (entry.isFile) {
          return new Promise<FileUploadData[]>((resolve) =>
            (entry as any).file((file: File) => {
              const fields = parseFile(file);
              resolve([fields]);
            }),
          );
        } else if (entry.isDirectory) {
          return parseDirectoryEntry(entry as any, null);
        }
      }
      // Provide a fallback return
      return Promise.resolve([]);
    });

    return Promise.all(itemPromises)
      .then((uploadDataPlural: FileUploadData[][]) => {
        const nonEmptyFiles = uploadDataPlural
          .flat()
          .filter((file) => file && file.id !== null);
        return nonEmptyFiles;
      })
      .then((uploadDataPlural) => {
        storageSpaceCheck(uploadDataPlural);
        // feels kinda hacky but I've stopped caring
        const topLevelFiles = uploadDataPlural.filter(
          (file) => !file.parent || file.parent === currentDirectory,
        );
        const deduplicatedFilenames = deduplicateFilenames(
          topLevelFiles,
          currentDirectoryFiles,
        );
        for (const dedupedFile of deduplicatedFilenames) {
          const file = uploadDataPlural.find(
            (_file) => _file.id === dedupedFile.id,
          );
          if (file) file.name = dedupedFile.name;
        }
        unlockTopLevelDragAchievements(topLevelFiles);
        return processOutDirectories(uploadDataPlural);
      })
      .then((uploadDataPlural) => {
        uploadDataPlural.forEach(addToUploadQueue);
      });
  };

  const parseDirectoryEntry = (
    entry: any,
    parent: string | null,
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
              dirFields.id,
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
