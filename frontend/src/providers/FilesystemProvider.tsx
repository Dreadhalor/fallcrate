import React from 'react';
import {
  checkDirectoryForNameConflict,
  checkForCircularReference,
  getUnionFileDeleteTreeIDs,
} from '@src/helpers';
import { useDB } from '@hooks/useDB';
import { useStorage } from '@hooks/useStorage';
import { useFiles } from '@hooks/fileserver/useFiles';
import { CustomFile, CustomFileFields } from '@src/types';
import { useAchievements, useAuth } from 'milestone-components';
import { message } from 'antd';
import { useDownloadFilesOrFolders } from '@hooks/fileserver/useDownloadFilesOrFolders';
import { FilesystemContext } from '@src/contexts/FilesystemContext';
import { useCurrentDirectory } from '@hooks/fileserver/useCurrentDirectory';
import { useDuplicateFileOrFolder } from '@hooks/fileserver/useDuplicateFileOrFolder';
import { useSelectFiles } from '@hooks/fileserver/useSelectFiles';
import { useImageModal } from './ImageModalProvider';
import { useFileUploader } from '@hooks/fileserver/upload/useFileUploader';

type Props = {
  children: React.ReactNode;
};

export const FilesystemProvider = ({ children }: Props) => {
  const { uid } = useAuth();
  const db = useDB(uid);
  const storage = useStorage();
  const { files } = useFiles();
  const { currentDirectory, currentDirectoryFiles, openDirectory } =
    useCurrentDirectory();
  const { downloadFilesOrFolders, suspense: downloadSuspense } =
    useDownloadFilesOrFolders(currentDirectory);
  const { unlockAchievementById, isUnlockable } = useAchievements();
  // why did I need to make a context for imageModal shenanigans again??
  const {
    promptUploadFiles: _promptUploadFiles,
    promptUploadFolder: _promptUploadFolder,
    processDragNDrop: _processDragNDrop,
    uploadQueue,
    dequeueCompletedUpload,
    showUploadModal,
    setShowUploadModal,
    removeUploadModal,
    toggleUploadModal,
    progressRefs,
    getUploadStatus,
  } = useFileUploader(currentDirectory, currentDirectoryFiles);
  const { duplicateFileOrFolder, suspense: duplicateSuspense } =
    useDuplicateFileOrFolder();
  const {
    selectedFiles,
    nestedSelectedFiles,
    selectFile,
    selectFilesExclusively,
    massToggleSelectFiles,
  } = useSelectFiles(currentDirectory, currentDirectoryFiles);
  const { openImageModal, closeImageModal, modal } = useImageModal();

  const [messageApi, contextHolder] = message.useMessage();

  // Helper functions
  const handleOperationError = (text: string) => {
    messageApi.error(text);
  };

  const getParent = (file: CustomFileFields) => {
    if (file.parent === null) return null;
    return files.find((candidate) => candidate.id === file.parent) ?? null;
  };
  const getFile = (file_id: string) =>
    files.find((file) => file.id === file_id) ?? null;

  const openFile = (file_id?: string) => {
    if (!file_id) return;
    const file = files.find((file) => file.id === file_id);
    if (!file) return;
    if (file.type === 'directory') return openDirectory(file_id);
    if (file.type === 'file') {
      if (file.mimeType === 'application/pdf') {
        openImageModal(file);
        unlockAchievementById('preview_image');
      } else handleOperationError(`Cannot preview ${file.mimeType} files!`);
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
    // setSelectedFiles((prev) => prev.filter((id) => !file_ids.includes(id)));
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
    if (file_ids.length >= 5) unlockAchievementById('mass_delete');
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

      db.moveFile(file_id, parent_id).then((file) => {
        if (achievementsEnabled && parent_id && file.type === 'directory')
          unlockAchievementById('folder_into_folder');
      });
    });
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

  const promptUploadFiles = async () => {
    _promptUploadFiles().catch((error) => {
      handleOperationError(error.message);
    });
  };
  const promptUploadFolder = async () => {
    _promptUploadFolder().catch((error) => {
      handleOperationError(error.message);
    });
  };
  const processDragNDrop = async (files: DataTransferItemList) => {
    _processDragNDrop(files).catch((error) => {
      handleOperationError(error.message);
    });
  };

  return (
    <FilesystemContext.Provider
      value={{
        files,
        selectedFiles,
        currentDirectory,
        currentDirectoryFiles,
        openDirectory,
        selectFile,
        selectFilesExclusively,
        massToggleSelectFiles,
        openFile,
        createFolder,
        deleteFiles,
        promptNewFolder,
        promptRenameFile,
        moveFiles,
        promptUploadFiles,
        promptUploadFolder,
        uploadQueue,
        dequeueCompletedUpload,
        getParent,
        getFile,
        nestedSelectedFiles,
        duplicateFileOrFolder,
        duplicateSuspense,
        getFileUrl,
        downloadFilesOrFolders,
        downloadSuspense,
        showUploadModal,
        setShowUploadModal,
        removeUploadModal,
        toggleUploadModal,
        processDragNDrop,
        progressRefs,
        getUploadStatus,
        openImageModal,
        closeImageModal,
      }}
    >
      {contextHolder}
      {children}
      {modal}
    </FilesystemContext.Provider>
  );
};
