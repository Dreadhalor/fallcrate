import { useStorage } from "@hooks/useStorage";
import { CustomFile } from "@src/types";
import JSZip from "jszip";
import { useFiles } from "./useFiles";
import { useAchievements } from "milestone-components";

export const useDownloadFilesOrFolders = (currentDirectory: string | null) => {
  const storage = useStorage();
  const { files } = useFiles();
  const { unlockAchievementById } = useAchievements();

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
  const downloadFilesOrFolders = async (file_ids: string[]) => {
    if (file_ids.length === 1) {
      const fileBlob = await downloadFileOrFolder(file_ids[0]);
      const fileOrFolder = files.find((file) => file.id === file_ids[0]);

      if (fileBlob && fileOrFolder) {
        const blobUrl = URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${fileOrFolder.name}${fileOrFolder.type === 'file' ? '' : '.zip'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
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

      const blobUrl = URL.createObjectURL(zipBlob);

      const a = document.createElement('a');
      a.href = blobUrl;
      const currentDirectoryName = files.find((file) => file.id === currentDirectory)?.name ?? 'Fallcrate';
      a.download = `${currentDirectoryName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }
  };

  const downloadFileOrFolder = async (file_id: string) => {
    const file = files.find((file) => file.id === file_id);
    if (file?.type !== 'file') return downloadDirectory(file_id, true);

    const url = await storage.getDownloadURL(`uploads/${file_id}`);

    const response = await fetch(url);
    const blob = await response.blob();

    unlockAchievementById('download_file');

    return blob;
  };
  const downloadDirectory = async (directory_id: string, returnZipBlob = false) => {
    const directory = files.find((file) => file.id === directory_id);
    if (directory?.type !== 'directory') return;

    const zip = new JSZip();

    await addDirectoryToZip(directory, zip);

    const is_all_folders = Object.values(zip.files).every((file) => file.dir);

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    if (returnZipBlob) {
      return zipBlob;
    } else {
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
    }
  };

  return { downloadFilesOrFolders };
}