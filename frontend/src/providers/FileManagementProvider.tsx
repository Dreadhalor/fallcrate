import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  checkForCircularReference,
  getFileDeleteTreeIDs,
  sortFiles,
} from '../helpers';
import { useDB } from '@src/hooks/useDB';
import { CustomFile } from '@src/types';

interface FileManagementContextValue {
  files: CustomFile[];
  selectedFiles: string[];
  currentDirectory: string | null;
  currentDirectoryFiles: CustomFile[];
  openDirectory: (directory_id: string | null) => void;
  selectFile: (file_id: string) => void;
  massToggleSelectFiles: () => void;
  openFile: (file_id: string) => void;
  createFile: (name: string) => void;
  createFolder: (name: string) => void;
  deleteFile: (file_id: string) => void;
  deleteFiles: (file_ids: string[]) => void;
  promptNewFile: () => void;
  promptNewFolder: () => void;
  promptRenameFile: (file_id: string) => void;
  moveFiles: (file_ids_to_move: string[], parent_id: string | null) => void;
}

const FileManagementContext = createContext<FileManagementContextValue>(
  {} as FileManagementContextValue
);

export const useFileManagement = () => {
  return useContext(FileManagementContext);
};

type Props = {
  children: React.ReactNode;
};

export const FileManagementProvider = ({ children }: Props) => {
  const [files, setFiles] = useState<CustomFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
  const [currentDirectoryFiles, setCurrentDirectoryFiles] = useState<
    CustomFile[]
  >([]);

  const db = useDB();

  // Helper functions
  const handleOperationError = (message: string) => {
    alert(message);
  };

  const clearSelfParents = (files: CustomFile[]) => {
    files.forEach((file) => {
      if (file.parent === file.id) {
        moveFiles([file.id], null);
      }
    });
    return files;
  };

  const checkDirectoryForNameConflict = (
    name: string,
    file_id: string,
    parent_id: string | null
  ) => {
    const files_in_directory = files.filter(
      (file) => file.parent === parent_id
    );
    return files_in_directory.some(
      (file) => file.name === name && file.id !== file_id
    );
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
    setSelectedFiles((prev) => {
      if (prev.includes(file_id))
        return prev.filter((candidate_id) => candidate_id !== file_id);
      else return [...prev, file_id];
    });
  };

  const massToggleSelectFiles = () => {
    if (selectedFiles.length > 0) setSelectedFiles([]);
    else setSelectedFiles(currentDirectoryFiles.map((file) => file.id));
  };

  const openFile = (file_id: string) => {
    if (files.find((file) => file.id === file_id)?.type === 'directory')
      openDirectory(file_id);
  };

  // CRUD operations
  const createFile = (name: string) => {
    db.createFile(name, currentDirectory).then((data) => {
      setFiles((prev) => [...prev, data]);
    });
  };

  const createFolder = (name: string) => {
    if (checkDirectoryForNameConflict(name, '', currentDirectory)) {
      handleOperationError(
        `A folder with the name "${name}" already exists in this directory!`
      );
      return;
    }
    db.createFolder(name, currentDirectory).then((data) => {
      setFiles((prev) => [...prev, data]);
    });
  };

  const deleteFile = async (file_id: string) => {
    const delete_tree = getFileDeleteTreeIDs(file_id, files);

    // Perform individual delete operations for each file ID in the delete tree
    for (const id of delete_tree) {
      await db.deleteFile(id);
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
  };

  const deleteFiles = async (file_ids: string[]) => {
    const allDeleteTrees = new Set<string>();

    for (const file_id of file_ids) {
      const delete_tree = getFileDeleteTreeIDs(file_id, files);
      for (const id of delete_tree) {
        allDeleteTrees.add(id);
      }
    }

    // Run delete operations concurrently
    await Promise.all(
      Array.from(allDeleteTrees).map((id) => db.deleteFile(id))
    );

    // Update state in one step
    setFiles((prev) => prev.filter((file) => !allDeleteTrees.has(file.id)));
    setSelectedFiles((prev) => prev.filter((id) => !allDeleteTrees.has(id)));
  };

  const promptNewFile = () => {
    const name = prompt('Enter a file name');
    if (name) {
      createFile(name);
    }
  };

  const promptNewFolder = () => {
    const name = prompt('Enter a folder name');
    if (name) {
      createFolder(name);
    }
  };

  const promptRenameFile = (file_id: string) => {
    const file = files.find((file) => file.id === file_id);
    const name = prompt('Enter a new file name', file?.name);

    if (!name || name === file?.name) {
      return;
    }

    if (checkDirectoryForNameConflict(name, file_id, file?.parent || null)) {
      handleOperationError(
        `A file with the name "${name}" already exists in the current directory!`
      );
      return;
    }

    db.renameFile(file_id, name).then((data) => {
      setFiles((prev) =>
        prev.map((file) => (file.id === file_id ? data : file))
      );
    });
  };

  const moveFiles = (file_ids_to_move: string[], parent_id: string | null) => {
    file_ids_to_move.forEach((file_id) => {
      const file = files.find((file) => file.id === file_id);
      const parent = files.find((file) => file.id === parent_id);

      if (file_id === parent_id) {
        return;
      }

      if (checkDirectoryForNameConflict(file?.name || '', file_id, parent_id)) {
        handleOperationError(
          `A file with the name "${file?.name}" already exists in the destination folder!`
        );
        return;
      }

      if (checkForCircularReference(file_id, parent_id, files)) {
        handleOperationError(
          `Failed to move "${file?.name}" into "${parent?.name}": Cannot move a folder into its own subfolder!`
        );
        return;
      }

      if (parent && parent.type !== 'directory') {
        handleOperationError(
          `Failed to move "${file?.name}" into "${parent?.name}": Cannot move a file into a file!`
        );
        return;
      }

      db.moveFile(file_id, parent_id).then((data) => {
        setFiles((prev) =>
          prev.map((file) => (file.id === data.id ? data : file))
        );
        // if the file was moved to a different directory, deselect it
        if (parent_id !== currentDirectory)
          setSelectedFiles((prev) => prev.filter((id) => id !== file_id));
      });
    });
  };

  useEffect(() => {
    db.fetchFiles().then((data) => setFiles(clearSelfParents(data)));
  }, []);

  useEffect(() => {
    clearSelfParents(files);
    openDirectory(currentDirectory);
  }, [files]);

  return (
    <FileManagementContext.Provider
      value={{
        files,
        selectedFiles,
        currentDirectory,
        currentDirectoryFiles,
        openDirectory,
        selectFile,
        massToggleSelectFiles,
        openFile,
        createFile,
        createFolder,
        deleteFile,
        deleteFiles,
        promptNewFile,
        promptNewFolder,
        promptRenameFile,
        moveFiles,
      }}
    >
      {children}
    </FileManagementContext.Provider>
  );
};
