import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  checkDirectoryForNameConflict,
  checkForCircularBranch,
  checkForCircularReference,
  getFileDeleteTreeIDs,
  sortFiles,
} from '@src/helpers';
import { useDB } from '@src/hooks/useDB';
import { useStorage } from '@src/hooks/useStorage';
import { CustomFile } from '@src/types';
import { v4 as uuidv4 } from 'uuid';
import { useAchievements } from 'milestone-components';

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

  const db = useDB();
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
    db.createFolder(name, currentDirectory).then((data) => {
      setFiles((prev) => [...prev, data]);
    });
    unlockAchievementById('create_folder');
  };

  const deleteFile = async (file_id: string) => {
    const delete_tree = getFileDeleteTreeIDs(file_id, files);

    // Perform individual delete operations for each file ID in the delete tree
    for (const id of delete_tree) {
      await db.deleteFile(id);
      // if file is a file, delete it from storage
      if (files.find((file) => file.id === id)?.type === 'file') {
        const path = `uploads/${id}`;
        storage.deleteFile(path).catch((err) => {
          console.log(err);
        });
      }
    }

    // Update the files state and deselect the deleted files in one step
    setFiles((prev) => {
      const remainingFiles = prev.filter(
        (file) => !delete_tree.includes(file.id)
      );
      setSelectedFiles((prevSelected) =>
        prevSelected.filter((id) => !delete_tree.includes(id))
      );
      return remainingFiles;
    });

    return delete_tree;
  };

  const deleteFiles = async (file_ids: string[]) => {
    // Run deleteFile operations concurrently for each file ID
    let deleted_ids: Set<string> = new Set();
    await Promise.all(file_ids.map((file_id) => deleteFile(file_id))).then(
      (data) => {
        data.forEach((ids) => {
          ids.forEach((id) => deleted_ids.add(id));
        });
      }
    );

    // Update state in one step
    setFiles((prev) => prev.filter((file) => !file_ids.includes(file.id)));
    setSelectedFiles((prev) => prev.filter((id) => !file_ids.includes(id)));

    if (deleted_ids.size > 1) unlockAchievementById('delete_file');
    if (deleted_ids.size > 5) unlockAchievementById('mass_delete');
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

    db.renameFile(file_id, name)
      .then((data) => {
        setFiles((prev) =>
          prev.map((file) => (file.id === file_id ? data : file))
        );
      })
      .then((_) => {
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
        setFiles((prev) =>
          prev.map((file) => (file.id === data.id ? data : file))
        );
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
    };

    const result = await db.createFile(newFile);
    setFiles((prev) => [...prev, result]);
    unlockAchievementById('upload_file');
  };

  useEffect(() => {
    db.fetchFiles().then((data) => setFiles(clearSelfParents(data)));
  }, []);

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
