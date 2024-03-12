import { useStorage } from '@fallcrate/hooks/use-storage';
import { CustomFile } from '@fallcrate/types';
import JSZip from 'jszip';
import { useFiles } from './use-files';
import { useAchievements } from 'dread-ui';
import { getUnionFileTree } from '@fallcrate/helpers';
import { useState } from 'react';

export const useDownloadFilesOrFolders = (currentDirectory: string | null) => {
  const storage = useStorage();
  const { files } = useFiles();
  const { unlockAchievementById, isUnlockable } = useAchievements();
  const [suspense, setSuspense] = useState(false);

  const startDownload = async (fileBlob: Blob, filename: string) => {
    const blobUrl = URL.createObjectURL(fileBlob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };
  const unlockAchievements = (file_ids: string[]) => {
    const tree = getUnionFileTree(file_ids, files);
    if (isUnlockable('download_file', 'fallcrate'))
      // using the same achievement for both files and folders
      unlockAchievementById('download_file', 'fallcrate');
    if (
      isUnlockable('download_multiple_items', 'fallcrate') &&
      file_ids.length > 1
    )
      unlockAchievementById('download_multiple_items', 'fallcrate');
    if (
      isUnlockable('all_folders', 'fallcrate') &&
      tree.length > 1 &&
      tree.every((file) => file.type === 'directory')
    )
      unlockAchievementById('all_folders', 'fallcrate');
  };

  const addFileToZip = async (file: CustomFile, parentZip: JSZip) => {
    const url = await storage.getDownloadURL(`uploads/${file.id}`);
    const response = await fetch(url);
    const blob = await response.blob();
    parentZip.file(file.name, blob);
  };

  const addDirectoryToZip = async (directory: CustomFile, parentZip: JSZip) => {
    const subZip = parentZip.folder(directory.name) as JSZip;
    const subFiles = files.filter((file) => file.parent === directory.id);

    for (const file of subFiles) {
      if (file.type === 'file') {
        await addFileToZip(file, subZip);
      } else if (file.type === 'directory') {
        await addDirectoryToZip(file, subZip);
      }
    }
  };
  const downloadFilesOrFolders = async (file_ids: string[]) => {
    if (suspense) return;
    setSuspense(true); // start suspense

    try {
      unlockAchievements(file_ids);
      if (file_ids.length === 1) {
        const fileBlob = await downloadFileOrFolder(file_ids[0]!);
        const fileOrFolder = files.find((file) => file.id === file_ids[0]);

        if (fileBlob && fileOrFolder) {
          const filename = `${fileOrFolder.name}${
            fileOrFolder.type === 'file' ? '' : '.zip'
          }`;
          startDownload(fileBlob, filename);
        }
      } else {
        const zip = new JSZip();

        for (const file_id of file_ids) {
          const fileOrFolder = files.find((file) => file.id === file_id);
          if (fileOrFolder?.type === 'file') {
            const fileBlob = await downloadFileOrFolder(file_id);
            if (fileBlob) {
              zip.file(fileOrFolder.name, fileBlob);
            }
          } else if (fileOrFolder?.type === 'directory') {
            await addDirectoryToZip(fileOrFolder, zip);
          }
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const currentDirectoryName =
          files.find((file) => file.id === currentDirectory)?.name ??
          'Fallcrate';
        const filename = `${currentDirectoryName}.zip`;
        startDownload(zipBlob, filename);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSuspense(false); // end suspense
    }
  };

  const downloadFileOrFolder = async (file_id: string) => {
    const file = files.find((file) => file.id === file_id);
    if (file?.type !== 'file') return downloadDirectory(file_id, true);

    const url = await storage.getDownloadURL(`uploads/${file_id}`);

    const response = await fetch(url);
    const blob = await response.blob();

    return blob;
  };
  const downloadDirectory = async (
    directory_id: string,
    returnZipBlob = false,
  ) => {
    const directory = files.find((file) => file.id === directory_id);
    if (directory?.type !== 'directory') return;

    const zip = new JSZip();

    await addDirectoryToZip(directory, zip);

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    if (returnZipBlob) {
      return zipBlob;
    } else {
      const filename = `${directory.name}.zip`;
      startDownload(zipBlob, filename);
    }
  };

  return { downloadFilesOrFolders, suspense };
};
