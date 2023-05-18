import { v4 as uuid } from 'uuid';
import { CustomFile } from './types';
import { Timestamp } from 'firebase/firestore';

export const buildNewFolder = ({
  name,
  parent,
  uid,
}: {
  name: string;
  parent?: string | null;
  uid: string;
}) => {
  return {
    id: uuid(),
    name,
    type: 'directory',
    parent: parent ?? null,
    uploadedBy: uid,
    createdAt: Timestamp.now(),
  } as CustomFile;
};

export const buildNewFile = (file: CustomFile) => {
  const { id, name, size, parent, url, uploadedBy, createdAt } = file;
  return {
    id: id ?? uuid(),
    name: name ?? '',
    type: 'file',
    size: size ?? 0,
    url: url ?? '',
    parent: parent ?? null,
    uploadedBy: uploadedBy ?? '',
    createdAt: createdAt ?? Timestamp.now(),
  } as CustomFile;
};

export const sortFiles = (file_a: CustomFile, file_b: CustomFile) => {
  if (file_a.type === 'directory' && file_b.type === 'file') {
    return 1;
  } else if (file_a.type === 'file' && file_b.type === 'directory') {
    return -1;
  } else {
    return file_a.name.localeCompare(file_b.name);
  }
};

export const getDirectoryPath = (
  file_id: string | null,
  files: CustomFile[]
): (CustomFile | null)[] => {
  if (!file_id) return [null];
  const file = files.find((file) => file?.id === file_id);
  if (!file) return [null];
  return [...getDirectoryPath(file?.parent, files), file];
};

const getFileDeleteTreeIDs = (
  file_id: string,
  files: CustomFile[]
): string[] => {
  const file = files.find((file) => file.id === file_id);
  if (!file) return [];
  return [file, ...getNestedFiles(file.id, files)].map((file) => file.id);
};
export const getUnionFileDeleteTreeIDs = (
  file_ids: string[],
  files: CustomFile[]
): string[] => {
  const list = file_ids.flatMap((file_id) =>
    getFileDeleteTreeIDs(file_id, files)
  );
  return [...new Set(list)]; // shouldn't need to do this but just in case
};

const getNestedFiles = (
  file_id: string | null,
  files: CustomFile[]
): CustomFile[] => {
  const nestedFiles = files.filter((file) => file.parent === file_id);
  return nestedFiles.flatMap((file) => [
    file,
    ...getNestedFiles(file.id, files),
  ]);
};

export const createDragImage = (name: string) => {
  const dragImage = document.createElement('div');
  dragImage.style.position = 'absolute';
  dragImage.style.top = '-9999px';
  dragImage.style.left = '-9999px';
  dragImage.style.padding = '8px';
  dragImage.style.borderRadius = '4px';
  dragImage.style.backgroundColor = 'rgba(0, 97, 254, 0.16)';
  dragImage.style.color = 'black';
  dragImage.style.fontFamily = 'Arial, sans-serif';
  dragImage.style.fontSize = '12px';
  dragImage.style.fontWeight = 'bold';
  dragImage.style.whiteSpace = 'nowrap';
  dragImage.classList.add('drag-image');
  dragImage.innerText = name;

  document.body.appendChild(dragImage);

  return dragImage;
};

export const checkForCircularReference = (
  file_id: string,
  parent_id: string | null,
  files: CustomFile[]
): boolean => {
  if (file_id === parent_id) return true;
  if (parent_id === null) return false;
  const parent = files.find((file) => file.id === parent_id);
  if (parent) return checkForCircularReference(file_id, parent.parent, files);
  return false;
};
export const checkForCircularBranch = (
  file_id: string,
  files: CustomFile[]
): string[] => {
  const anchor = files.find((file) => file.id === file_id);
  if (!anchor) return [];
  const branch = [anchor.id];
  let parent = files.find((file) => file.id === file.parent);
  while (parent) {
    parent = files.find((file) => file.id === parent?.parent);
    if (parent && parent.id !== anchor.id) {
      branch.push(parent.id);
    } else {
      return branch;
    }
  }
  return [];
};

export const checkDirectoryForNameConflict = (
  name: string,
  file_id: string,
  parent_id: string | null,
  files: CustomFile[]
) => {
  const files_in_directory = files.filter((file) => file.parent === parent_id);
  return files_in_directory.some(
    (file) => file.name === name && file.id !== file_id
  );
};
