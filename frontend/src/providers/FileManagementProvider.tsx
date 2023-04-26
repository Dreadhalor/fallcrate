import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CustomFile,
  checkForCircularReference,
  getFileDeleteTreeIDs,
  sortFiles,
} from '../helpers';
import useDB from '@src/hooks/useDB';

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

  const clearSelfParents = (files: CustomFile[]) => {
    files.forEach((file) => {
      if (file.parent === file.id) {
        moveFiles([file.id], null);
      }
    });
    return files;
  };

  const db = useDB();

  const openDirectory = (directory_id: string | null) => {
    // clear selected files, unless the directory is simply being refreshed
    if (directory_id !== currentDirectory) setSelectedFiles([]);
    setCurrentDirectory(directory_id);
    const newCurrentDirectoryFiles = files
      .filter((file) => file.parent === directory_id)
      .sort(sortFiles);
    setCurrentDirectoryFiles(newCurrentDirectoryFiles);
    // console.log('currentDirectoryFiles:', newCurrentDirectoryFiles);
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
    db.createFolder(name, currentDirectory).then((data) => {
      setFiles((prev) => [...prev, data]);
    });
  };
  const deleteFile = (file_id: string) => {
    const delete_tree = getFileDeleteTreeIDs(file_id, files);
    delete_tree.forEach((file_id) => {
      db.deleteFile(file_id).then(() => {
        setFiles((prev) => prev.filter((file) => file.id !== file_id));
      });
    });
  };

  const deleteFiles = (file_ids: string[]) =>
    file_ids.forEach((file_id) => deleteFile(file_id));

  // a function that opens a prompt to create a new file name
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

  // prompt to rename a file
  const promptRenameFile = (file_id: string) => {
    const file = files.find((file) => file.id === file_id);
    const name = prompt('Enter a new file name', file?.name);
    if (name && name !== file?.name) {
      db.renameFile(file_id, name).then((data) => {
        setFiles((prev) =>
          prev.map((file) => (file.id === file_id ? data : file))
        );
      });
    }
  };

  const moveFiles = (file_ids_to_move: string[], parent_id: string | null) => {
    file_ids_to_move.forEach((file_id) => {
      if (file_id == parent_id) return;
      const file = files.find((file) => file.id === file_id);
      const parent = files.find((file) => file.id === parent_id);
      const valid_parent = parent?.type === 'directory' || parent_id === null;
      const circular_parent = checkForCircularReference(
        file_id,
        parent_id,
        files
      );
      if (valid_parent) {
        if (!circular_parent) {
          db.moveFile(file_id, parent_id).then((data) => {
            setFiles((prev) =>
              prev.map((file) => (file.id === data.id ? data : file))
            );
            // if the file was moved to a different directory, deselect it
            if (parent_id !== currentDirectory)
              setSelectedFiles((prev) => prev.filter((id) => id !== file_id));
          });
        } else {
          alert(
            `Failed to move "${file?.name}" into "${parent?.name}": Cannot move a folder into its own subfolder!`
          );
        }
      } else {
        alert(
          `Failed to move "${file?.name}" into "${parent?.name}": Cannot move a file into a file!`
        );
      }
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
