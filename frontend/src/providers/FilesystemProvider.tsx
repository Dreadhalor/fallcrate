import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  checkDirectoryForNameConflict,
  checkFilesForNameConflict,
  checkForCircularBranch,
  checkForCircularReference,
  getNestedFiles,
  getUnionFileDeleteTreeIDs,
  orderFilesByDirectory,
  parseFileArray,
  sortFiles,
} from '@src/helpers';
import { useDB } from '@src/hooks/useDB';
import { useStorage } from '@src/hooks/useStorage';
import { CustomFile, CustomFileFields, CustomUploadFields } from '@src/types';
import { v4 as uuidv4 } from 'uuid';
import { useAchievements, useAuth } from 'milestone-components';
import { Timestamp } from 'firebase/firestore';
import { message } from 'antd';
import JSZip from 'jszip';

interface FilesystemContextValue {
  files: CustomFile[];
  selectedFiles: string[];
  currentDirectory: string | null;
  currentDirectoryFiles: CustomFile[];
  openDirectory: (directory_id: string | null) => void;
  selectFile: (file_id: string) => void;
  selectFileExclusively: (file_id: string, overrideDirectoryRestriction?: boolean) => void;
  massToggleSelectFiles: () => void;
  openFile: (file_id?: string) => void;
  createFolder: (name: string) => void;
  deleteFiles: (file_ids: string[]) => void;
  promptNewFolder: () => void;
  promptRenameFile: (file_id: string) => void;
  moveFiles: (file_ids_to_move: string[], parent_id: string | null) => void;
  uploadFile: (file: File) => void;
  promptUploadFiles: () => void;
  promptUploadFolder: () => void;
  imageModalParams: { open: boolean; file: CustomFile | null };
  setImageModalParams: React.Dispatch<
    React.SetStateAction<{ open: boolean; file: CustomFile | null }>
  >;
  openImageModal: (file: CustomFile) => void;
  getParent: (file: CustomFile) => CustomFile | null;
  getFile: (file_id: string) => CustomFile | null;
  nestedSelectedFiles: string[];
  duplicateFile: (file_id: string) => Promise<void>;
  getFileUrl: (file_id: string) => Promise<string>;
  downloadFilesOrFolders: (file_ids: string[]) => Promise<void>;
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
  const [nestedSelectedFiles, setNestedSelectedFiles] = useState<string[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
  const [currentDirectoryFiles, setCurrentDirectoryFiles] = useState<
    CustomFile[]
  >([]);
  const [imageModalParams, setImageModalParams] = useState<{
    open: boolean;
    file: CustomFile | null;
  }>({ open: false, file: null });

  const { uid } = useAuth();
  const db = useDB(uid);
  const storage = useStorage();

  const { unlockAchievementById, isUnlockable } = useAchievements();

  const openImageModal = (file: CustomFile) => {
    setImageModalParams({ open: true, file });
  };

  // Helper functions
  const handleOperationError = (text: string) => {
    message.error(text);
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
  const selectFileExclusively = (file_id: string, overrideDirectoryRestriction = false) => {
    // if the currentDirectoryFiles does not include the file_id, bail
    if (!overrideDirectoryRestriction && !currentDirectoryFiles.find((file) => file.id === file_id)) return;
    setSelectedFiles([file_id]);
  };
  const getNestedSelectedFiles = () => {
    const nestedFiles = new Set<string>();
    selectedFiles.map((file_id) =>
      getNestedFiles(file_id, files).forEach((file) => nestedFiles.add(file.id))
    );
    return Array.from(nestedFiles);
  };

  useLayoutEffect(() => {
    setNestedSelectedFiles(getNestedSelectedFiles());
  }, [selectedFiles]);

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
      // this shows nothing if the file isn't an image but whatever for now
      openImageModal(file);
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
    // optimistically remove the files from the selected files array to avoid an awkward delay
    setSelectedFiles((prev) => prev.filter((id) => !file_ids.includes(id)));
    const deleted_ids = await db.deleteFiles(delete_tree);
    // only delete the files from storage if they were successfully deleted from the database
    await storage
      .deleteFiles(deleted_ids.filter((id) => blob_ids.includes(id)))
      .catch((error) => {
        console.error(error);
      });

    if (deleted_ids.length > 0) {
      unlockAchievementById('delete_file');
      if (isUnlockable('nested_delete')) {
        const child_files = blob_ids.filter((id) => !file_ids.includes(id));
        if (child_files.length > 0) unlockAchievementById('nested_delete');
      }
    }
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

  const uploadCustomUploadFields = async (fields: CustomUploadFields) => {
    // Generate a unique id for the file
    const { id, file } = fields;

    // If not a folder, upload the file to storage
    if (fields.type === 'file' && file) { // redundant but Typescript doesn't know that
      const path = `uploads/${id}`;
      await storage.uploadFile(file, path);
    }

    await db.createFile(fields);
  }
  const uploadFile = async (file: File) => {
    // Generate a unique id for the file
    const id = uuidv4();

    // Upload the file to storage
    const path = `uploads/${id}`;
    await storage.uploadFile(file, path);

    // Create a file entry in the database
    const newFile: CustomFileFields = {
      id,
      name: file.name,
      type: 'file',
      size: file.size,
      parent: currentDirectory ?? null,
      createdAt: Timestamp.now(),
    };

    await db
      .createFile(newFile)
      .then((_) => unlockAchievementById('upload_file'));
  };
  const promptUploadFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = () => {
      if (!input.files) return;
      const files = Array.from(input.files);
      files.forEach((file) => uploadFile(file));
    };
    input.click();
  };

  const uploadFolder = async (files: CustomUploadFields[]) => {
    // we assume that the folder is the first file in the array
    const folder = files[0];
    folder.parent = currentDirectory ?? null;
    // sanitize the folder name
    folder.name = getValidDuplicatedName(folder.name, currentDirectoryFiles);
    files.forEach((file) => uploadCustomUploadFields(file));
    unlockAchievementById('upload_folder');
  };
  const promptUploadFolder = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.onchange = async () => {
      if (!input.files) return;
      const files = Array.from(input.files);
      const parsedFiles = parseFileArray(files);
      uploadFolder(parsedFiles);
    };
    input.click();
  };

  const downloadFilesOrFolders = async (file_ids: string[]) => {
    file_ids.forEach((file_id) => downloadFileOrFolder(file_id));
  };
  const downloadFileOrFolder = async (file_id: string) => {
    const file = files.find((file) => file.id === file_id);
    if (file?.type !== 'file') return downloadDirectory(file_id);
    const url = await storage.getDownloadURL(`uploads/${file_id}`);

    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    unlockAchievementById('download_file');
  };
  const downloadDirectory = async (directory_id: string) => {
    const directory = files.find((file) => file.id === directory_id);
    if (directory?.type !== 'directory') return;

    const zip = new JSZip();

    const addFileToZip = async (file: CustomFile, parentZip: JSZip) => {
      const url = await storage.getDownloadURL(`uploads/${file.id}`);
      const response = await fetch(url);
      const blob = await response.blob();
      parentZip.file(file.name, blob);
    };

    const addDirectoryToZip = async (directory: CustomFile, parentZip: JSZip) => {
      const subZip = parentZip.folder(directory.name) as JSZip; // it won't be null because we're creating it
      const subFiles = files.filter((file) => file.parent === directory.id);
      for (const file of subFiles) {
        if (file.type === 'file') {
          await addFileToZip(file, subZip);
        } else if (file.type === 'directory') {
          await addDirectoryToZip(file, subZip);
        }
      }
    };

    await addDirectoryToZip(directory, zip);

    const is_all_folders = Object.values(zip.files).every((file) => file.dir);

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    const blobUrl = URL.createObjectURL(zipBlob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${directory.name}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    if (is_all_folders) unlockAchievementById('all_folders');
    unlockAchievementById('download_folder');
  };




  const getValidDuplicatedName = (name: string, files: CustomFile[]) => {
    let new_name = name;
    let i = 1;
    while (checkFilesForNameConflict(new_name, files) && i < 100) {
      // check if the name already has a number in parentheses
      if (new_name.match(/\(\d+\)/)) {
        // if it does, increment the number
        new_name = new_name.replace(/\(\d+\)/, `(${i})`);
      } else new_name = `${name} (${i})`;
      i++;
    }
    return new_name;
  };
  const duplicateBlob = async (
    old_file_id: string,
    duplicated_file: CustomFile
  ) => {
    if (duplicated_file.type !== 'file') return;
    const blob = await storage
      .getDownloadURL(`uploads/${old_file_id}`)
      .then((url) => fetch(url).then((r) => r.blob()));
    const path = `uploads/${duplicated_file.id}`;
    await storage.uploadBlob(blob, path);
  };
  const duplicateFile = async (file_id: string) => {
    const file = files.find((file) => file.id === file_id);
    if (!file) return;
    const parent = file.parent;
    const directoryFiles = files.filter((file) => file.parent === parent);
    const new_name = getValidDuplicatedName(file.name, directoryFiles);
    if (file.type === 'directory') {
      duplicateFolderWithName(file, new_name);
      unlockAchievementById('duplicate_folder');
    } else {
      duplicateSingleFileWithName(file, new_name);
      unlockAchievementById('duplicate_file');
    }
  };

  const saveDuplicatedFile = async (
    old_id: string,
    new_file: CustomFileFields
  ) => {
    if (!new_file || new_file.type !== 'file') return;
    await db
      .createFile(new_file)
      .then((created_file) => duplicateBlob(old_id, created_file));
  };

  const duplicateSingleFileWithName = async (
    file: CustomFile,
    new_name: string
  ) => {
    if (!file || file.type !== 'file') return;
    const new_file = { ...file, name: new_name, id: uuidv4() };
    saveDuplicatedFile(file.id, new_file);
  };

  const duplicateFolderWithName = async (
    folder: CustomFile,
    new_name: string
  ) => {
    if (!folder || folder.type !== 'directory') return;

    const duplication_map = new Map<string, CustomFileFields>();
    const reverse_duplication_map = new Map<string, CustomFileFields>();

    const nestedFiles = getNestedFiles(folder.id, files);

    // Added the new folder as an entry in the duplication map
    const initial_folder = { ...folder, id: uuidv4(), name: new_name };
    duplication_map.set(folder.id, initial_folder);
    reverse_duplication_map.set(initial_folder.id, folder);

    nestedFiles.forEach((file) => {
      const new_file = { ...file, id: uuidv4() };
      duplication_map.set(file.id, new_file);
      reverse_duplication_map.set(new_file.id, file);
    });

    duplication_map.forEach((file) => {
      file.parent = duplication_map.get(file.parent || '')?.id || null;
    });

    const orderedFiles = orderFilesByDirectory(
      Array.from(duplication_map.values())
    );

    await Promise.all(
      orderedFiles.map((file) => {
        if (file.type === 'directory') return db.createFile(file);
        else {
          const old_id = reverse_duplication_map.get(file.id)?.id;
          return saveDuplicatedFile(old_id || '', file);
        }
      })
    );
  };

  const getFileUrl = async (file_id: string) => {
    const file = files.find((file) => file.id === file_id);
    if (!file) return 'https://via.placeholder.com/256';
    if (file.type === 'file') {
      return await storage.getDownloadURL(`uploads/${file.id}`);
    } else {
      return 'https://via.placeholder.com/256';
    }
  };

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
        promptUploadFiles,
        promptUploadFolder,
        imageModalParams,
        setImageModalParams,
        openImageModal,
        getParent,
        getFile,
        nestedSelectedFiles,
        duplicateFile,
        getFileUrl,
        downloadFilesOrFolders,
      }}
    >
      {children}
    </FilesystemContext.Provider>
  );
};
