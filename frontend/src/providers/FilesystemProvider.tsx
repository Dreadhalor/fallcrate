import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  checkDirectoryForNameConflict,
  checkForCircularBranch,
  checkForCircularReference,
  getUnionFileDeleteTreeIDs,
  sortFiles,
} from '@src/helpers';
import { useDB } from '@src/hooks/useDB';
import { useStorage } from '@src/hooks/useStorage';
import { CustomFile } from '@src/types';
import { v4 as uuidv4 } from 'uuid';
import { useAchievements, useAuth } from 'milestone-components';
import { Timestamp } from 'firebase/firestore';

interface FilesystemContextValue {
  files: CustomFile[];
  selectedFiles: string[];
  currentDirectory: string | null;
  currentDirectoryFiles: CustomFile[];
  openDirectory: (directory_id: string | null) => void;
  selectFile: (file_id: string) => void;
  selectFileExclusively: (file_id: string) => void;
  massToggleSelectFiles: () => void;
  openFile: (file_id?: string) => void;
  createFolder: (name: string) => void;
  deleteFiles: (file_ids: string[]) => void;
  promptNewFolder: () => void;
  promptRenameFile: (file_id: string) => void;
  moveFiles: (file_ids_to_move: string[], parent_id: string | null) => void;
  uploadFile: (file: File) => void;
  imageModal: { open: boolean; url: string | null };
  setImageModal: React.Dispatch<
    React.SetStateAction<{ open: boolean; url: string | null }>
  >;
  openImageModal: (url: string) => void;
  getParent: (file: CustomFile) => CustomFile | null;
  getFile: (file_id: string) => CustomFile | null;
}

const FilesystemContext = createContext<FilesystemContextValue>(
  {} as FilesystemContextValue
);

export const useFilesystem = () => {
  return useContext(FilesystemContext);
};

type Props = {
  children: React.ReactNode;
};

export const FilesystemProvider = ({ children }: Props) => {
  const [files, setFiles] = useState<CustomFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
  const [currentDirectoryFiles, setCurrentDirectoryFiles] = useState<
    CustomFile[]
  >([]);
  const [imageModal, setImageModal] = useState<{
    open: boolean;
    url: string | null;
  }>({ open: false, url: null });

  const { uid } = useAuth();
  const db = useDB(uid);
  const storage = useStorage();

  const { unlockAchievementById } = useAchievements();

  const openImageModal = (url: string) => {
    setImageModal({ open: true, url });
  };

  // Helper functions
  const handleOperationError = (message: string) => {
    alert(message);
  };

  const getParent = (file: CustomFile) => {
    if (file.parent === null) return null;
    return files.find((candidate) => candidate.id === file.parent) ?? null;
  };
  const getFile = (file_id: string) =>
    files.find((file) => file.id === file_id) ?? null;

  const clearSelfParents = (files: CustomFile[]) => {
    files.forEach((file) => {
      if (file.parent === file.id) moveFiles([file.id], null, false);
    });
    return files;
  };
  const resetOrphanBranches = (files: CustomFile[]) => {
    files.forEach((file) => {
      if (file.parent === null) return;
      if (!files.find((candidate) => candidate.id === file.parent)) {
        console.log('relocating orphaned file:', file);
        moveFiles([file.id], null, false);
      }
    });
    return files;
  };
  const resetCircularBranches = (files: CustomFile[]) => {
    files.forEach((file) => {
      const branch = checkForCircularBranch(file.id, files);
      if (branch.length > 0) {
        console.log('relocating circular branch:', branch);
        moveFiles(branch, null, false);
      }
    });
    return files;
  };

  // Directory and file management functions
  const openDirectory = (directory_id: string | null) => {
    // clear selected files, unless the directory is simply being refreshed
    if (directory_id !== currentDirectory) setSelectedFiles([]);
    setCurrentDirectory(directory_id);
    const newCurrentDirectoryFiles = files
      .filter((file) => file.parent === directory_id)
      .sort(sortFiles);
    setCurrentDirectoryFiles(newCurrentDirectoryFiles);
  };

  const selectFile = (file_id: string) => {
    // if the currentDirectoryFiles does not include the file_id, bail
    if (!currentDirectoryFiles.find((file) => file.id === file_id)) return;
    setSelectedFiles((prev) => {
      if (prev.includes(file_id))
        return prev.filter((candidate_id) => candidate_id !== file_id);
      else {
        unlockAchievementById('select_file');
        return [...prev, file_id];
      }
    });
  };
  // doesn't trigger the achievement for selecting a file - this is intentional
  const selectFileExclusively = (file_id: string) => {
    // if the currentDirectoryFiles does not include the file_id, bail
    if (!currentDirectoryFiles.find((file) => file.id === file_id)) return;
    setSelectedFiles([file_id]);
  };

  const massToggleSelectFiles = () => {
    if (selectedFiles.length > 0) setSelectedFiles([]);
    else {
      setSelectedFiles(currentDirectoryFiles.map((file) => file.id));
      unlockAchievementById('mass_select');
    }
  };

  const openFile = (file_id?: string) => {
    if (!file_id) return;
    const file = files.find((file) => file.id === file_id);
    if (!file) return;
    if (file.type === 'directory') return openDirectory(file_id);
    if (file.type === 'file') {
      // open the file in a new tab
      // window.open(file.url, '_blank');
      openImageModal(file.url ?? '');
      unlockAchievementById('preview_image');
    }
  };

  // CRUD operations
  const createFolder = (name: string) => {
    if (checkDirectoryForNameConflict(name, '', currentDirectory, files)) {
      handleOperationError(
        `A folder with the name "${name}" already exists in this directory!`
      );
      return;
    }
    db.createFolder(name, currentDirectory);
    unlockAchievementById('create_folder');
  };

  const filterBlobStorageIds = (files: CustomFile[], selection: string[]) =>
    files
      .filter((file) => selection.includes(file.id))
      .filter((file) => file.type === 'file')
      .map((file) => file.id);

  const deleteFiles = async (file_ids: string[]) => {
    const delete_tree = getUnionFileDeleteTreeIDs(file_ids, files);
    //get the blob ids before deleting the files from the database
    const blob_ids = filterBlobStorageIds(files, delete_tree);
    const deleted_ids = await db.deleteFiles(delete_tree);
    // only delete the files from storage if they were successfully deleted from the database
    await storage.deleteFiles(
      deleted_ids.filter((id) => blob_ids.includes(id))
    );
    setSelectedFiles((prev) => prev.filter((id) => !file_ids.includes(id)));

    if (deleted_ids.length > 0) unlockAchievementById('delete_file');
    if (deleted_ids.length >= 5) unlockAchievementById('mass_delete');
  };

  const promptNewFolder = () => {
    const name = prompt('Enter a folder name');
    if (name) createFolder(name);
  };

  const promptRenameFile = (file_id: string) => {
    const file = files.find((file) => file.id === file_id);
    const name = prompt('Enter a new file name', file?.name);

    if (!name || name === file?.name) return;

    if (
      checkDirectoryForNameConflict(name, file_id, file?.parent || null, files)
    ) {
      handleOperationError(
        `A file with the name "${name}" already exists in the current directory!`
      );
      unlockAchievementById('filename_conflict');
      return;
    }

    db.renameFile(file_id, name).then((_) => {
      unlockAchievementById('rename_file');
    });
  };

  const moveFiles = (
    file_ids_to_move: string[],
    parent_id: string | null,
    achievementsEnabled = true
  ) => {
    file_ids_to_move.forEach((file_id) => {
      const file = files.find((file) => file.id === file_id);
      const parent = files.find((file) => file.id === parent_id);

      if (file_id === parent_id) return;

      if (
        checkDirectoryForNameConflict(
          file?.name || '',
          file_id,
          parent_id,
          files
        )
      ) {
        handleOperationError(
          `A file with the name "${file?.name}" already exists in the destination folder!`
        );
        return;
      }

      if (checkForCircularReference(file_id, parent_id, files)) {
        handleOperationError(
          `Failed to move "${file?.name}" into "${parent?.name}": Cannot move a folder into its own subfolder!`
        );
        if (achievementsEnabled) unlockAchievementById('parent_into_child');
        return;
      }

      if (parent && parent.type !== 'directory') {
        handleOperationError(
          `Failed to move "${file?.name}" into "${parent?.name}": Cannot move a file into a file!`
        );
        if (achievementsEnabled) unlockAchievementById('file_into_file');
        return;
      }

      db.moveFile(file_id, parent_id).then((data) => {
        // if the file was moved to a different directory, deselect it
        if (parent_id !== currentDirectory)
          setSelectedFiles((prev) => prev.filter((id) => id !== file_id));
        if (achievementsEnabled && parent_id)
          unlockAchievementById('folder_into_folder');
      });
    });
  };

  const uploadFile = async (file: File) => {
    // Generate a unique id for the file
    const id = uuidv4();

    // Upload the file to storage
    const path = `uploads/${id}`;
    await storage.uploadFile(file, path);

    // Create a file entry in the database
    const newFile: CustomFile = {
      id,
      name: file.name,
      type: 'file',
      size: file.size,
      parent: currentDirectory ?? null,
      url: await storage.getDownloadURL(path),
      createdAt: Timestamp.now(),
      uploadedBy: uid,
    };

    await db
      .createFile(newFile)
      .then((_) => unlockAchievementById('upload_file'));
  };

  // useEffect(() => {
  //   db.fetchFiles(uid).then((data) => setFiles(clearSelfParents(data)));
  // }, [uid]);

  useEffect(() => {
    const userFilesUnsubscribe = db.subscribeToFiles((data) =>
      setFiles(clearSelfParents(data))
    );

    return () => {
      userFilesUnsubscribe();
    };
  }, [uid]);

  useEffect(() => {
    clearSelfParents(files);
    resetOrphanBranches(files);
    resetCircularBranches(files);
    openDirectory(currentDirectory);
  }, [files]);

  return (
    <FilesystemContext.Provider
      value={{
        files,
        selectedFiles,
        currentDirectory,
        currentDirectoryFiles,
        openDirectory,
        selectFile,
        selectFileExclusively,
        massToggleSelectFiles,
        openFile,
        createFolder,
        deleteFiles,
        promptNewFolder,
        promptRenameFile,
        moveFiles,
        uploadFile,
        imageModal,
        setImageModal,
        openImageModal,
        getParent,
        getFile,
      }}
    >
      {children}
    </FilesystemContext.Provider>
  );
};
