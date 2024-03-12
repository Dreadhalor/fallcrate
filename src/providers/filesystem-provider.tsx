import React from 'react';
import {
  checkDirectoryForNameConflict,
  checkForCircularReference,
  getUnionFileDeleteTreeIDs,
} from '@fallcrate/helpers';
import { useDB } from '@fallcrate/hooks/use-db';
import { useStorage } from '@fallcrate/hooks/use-storage';
import { useFiles } from '@fallcrate/hooks/fileserver/use-files';
import { CustomFile, CustomFileFields } from '@fallcrate/types';
import { useAchievements, useAuth } from 'dread-ui';
import { message } from 'antd';
import { useDownloadFilesOrFolders } from '@fallcrate/hooks/fileserver/use-download-files-or-folders';
import { FilesystemContext } from '@fallcrate/contexts/file-system-context';
import { useCurrentDirectory } from '@fallcrate/hooks/fileserver/use-current-directory';
import { useDuplicateFileOrFolder } from '@fallcrate/hooks/fileserver/use-duplicate-file-or-folder';
import { useSelectFiles } from '@fallcrate/hooks/fileserver/use-select-files';
import { useFileViewer } from './file-viewer-provider';
import { useFileUploader } from '@fallcrate/hooks/fileserver/upload/use-file-uploader';
import { useMergeAccounts } from '@fallcrate/hooks/fileserver/use-merge-accounts';
import { useRenamingFile } from '@fallcrate/hooks/fileserver/use-renaming-file';

type Props = {
  children: React.ReactNode;
};

export const FilesystemProvider = ({ children }: Props) => {
  const { uid } = useAuth();
  const db = useDB(uid!);
  const storage = useStorage();
  const { files } = useFiles();
  const { currentDirectory, currentDirectoryFiles, openDirectory } =
    useCurrentDirectory();
  const { downloadFilesOrFolders, suspense: downloadSuspense } =
    useDownloadFilesOrFolders(currentDirectory);
  const { unlockAchievementById, isUnlockable } = useAchievements();
  // why did I need to make a context for fileViewer shenanigans again??
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
  const {
    duplicateFileOrFolder: _duplicateFileOrFolder,
    suspense: duplicateSuspense,
  } = useDuplicateFileOrFolder();
  const {
    selectedFiles,
    nestedSelectedFiles,
    selectFile,
    selectFilesExclusively,
    massToggleSelectFiles,
  } = useSelectFiles(currentDirectory, currentDirectoryFiles);
  const { openFileViewer, closeFileViewer, pdfViewer, videoViewer } =
    useFileViewer();
  const { renamingFileId, setRenamingFileId, requestRename } =
    useRenamingFile();

  const [messageApi, contextHolder] = message.useMessage();

  useMergeAccounts();

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
    // check for pdf, then check for video
    if (file.type === 'file') {
      const file_type = file.mimeType ?? '';
      if (file_type === 'application/pdf') {
        openFileViewer(file);
        unlockAchievementById('preview_pdf', 'fallcrate');
      } else if (file_type.includes('video')) {
        openFileViewer(file);
        unlockAchievementById('preview_video', 'fallcrate');
      } else if (file_type.includes('image')) {
        // we're using antd for image viewing, no need for another modal
        // openFileViewer(file);
      } else
        handleOperationError(
          file_type
            ? `Cannot preview ${file_type} files!`
            : 'Cannot preview this type of file!',
        );
    }
  };

  // CRUD operations
  const createFolder = (name: string) => {
    if (checkDirectoryForNameConflict(name, '', currentDirectory, files)) {
      handleOperationError(
        `A folder with the name "${name}" already exists in this directory!`,
      );
      return;
    }
    db.createFolder(name, currentDirectory);
    unlockAchievementById('create_folder', 'fallcrate');
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
    await storage.deleteFiles(blob_ids).catch((error) => {
      console.error(error);
    });
    const deleted_ids = await db.deleteFiles(delete_tree);

    if (deleted_ids.length > 0) {
      unlockAchievementById('delete_file', 'fallcrate');
      if (isUnlockable('nested_delete', 'fallcrate')) {
        const child_files = blob_ids.filter((id) => !file_ids.includes(id));
        if (child_files.length > 0)
          unlockAchievementById('nested_delete', 'fallcrate');
      }
    }
    if (file_ids.length >= 5) unlockAchievementById('mass_delete', 'fallcrate');
  };

  const promptNewFolder = () => {
    const name = prompt('Enter a folder name');
    if (name) createFolder(name);
  };

  const moveFiles = (
    file_ids_to_move: string[],
    parent_id: string | null,
    achievementsEnabled = true,
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
          files,
        )
      ) {
        handleOperationError(
          `A file with the name "${file?.name}" already exists in the destination folder!`,
        );
        return;
      }

      if (checkForCircularReference(file_id, parent_id, files)) {
        handleOperationError(
          `Failed to move "${file?.name}" into "${parent?.name}": Cannot move a folder into its own subfolder!`,
        );
        if (achievementsEnabled)
          unlockAchievementById('parent_into_child', 'fallcrate');
        return;
      }

      if (parent && parent.type !== 'directory') {
        handleOperationError(
          `Failed to move "${file?.name}" into "${parent?.name}": Cannot move a file into a file!`,
        );
        if (achievementsEnabled) unlockAchievementById('file_into_file');
        return;
      }

      db.moveFile(file_id, parent_id).then((file) => {
        if (achievementsEnabled && parent_id)
          unlockAchievementById('move_into_folder', 'fallcrate');
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

  const duplicateFileOrFolder = async (file_id: string) => {
    _duplicateFileOrFolder(file_id).catch((error) => {
      handleOperationError(error.message);
    });
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
        openFileViewer,
        closeFileViewer,
        renamingFileId,
        setRenamingFileId,
        requestRename,
      }}
    >
      {contextHolder}
      {children}
      {pdfViewer}
      {videoViewer}
    </FilesystemContext.Provider>
  );
};
