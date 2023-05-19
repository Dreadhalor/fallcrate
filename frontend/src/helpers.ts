import { v4 as uuidv4 } from 'uuid';
import { CustomFile, CustomFileFields, CustomUploadFields } from './types';
import { Timestamp } from 'firebase/firestore';

export const buildNewFolder = ({
  name,
  parent,
  uid,
}: {
  name: string;
  parent?: string | null;
  id?: string;
  uid: string;
}) => {
  return {
    id: uuidv4(),
    name,
    type: 'directory',
    parent: parent ?? null,
    uploadedBy: uid,
    createdAt: Timestamp.now(),
  } as CustomFile;
};

export const buildNewFile = (file: CustomFile) => {
  const { id, name, size, parent, uploadedBy, createdAt, type } = file;
  return {
    id: id ?? uuidv4(),
    name: name ?? '',
    type: type ?? 'file',
    size: size ?? 0,
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

export const getNestedFiles = (
  file_id: string | null,
  files: CustomFileFields[]
): CustomFileFields[] => {
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
export const checkFilesForNameConflict = (
  name: string,
  files: CustomFile[]
) => {
  return files.some((file) => file.name === name);
};

// order the given files such that parent directories are before their children
export const orderFilesByDirectory = (files: CustomFileFields[]) => {
  const orderedFiles = [];
  const directories = files.filter((file) => file.type === 'directory');
  const filesWithoutDirectories = files.filter(
    (file) => file.type !== 'directory'
  );
  for (const directory of directories) {
    orderedFiles.push(directory);
    const nestedFiles = getNestedFiles(directory.id, filesWithoutDirectories);
    orderedFiles.push(...nestedFiles);
  }
  return orderedFiles;
};



export function parseFileArray(files: File[]): CustomUploadFields[] {
  const parsed_files: CustomUploadFields[] = [];
  const fileMap: { [key: string]: CustomUploadFields } = {};

  for (const file of files) {
    // Split the path into segments
    const pathSegments = file.webkitRelativePath.split('/');
    let parentId: string | null = null;

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const isFile = i === pathSegments.length - 1;

      // Generate a key from the parent id and the segment name
      const key: string = `${parentId}-${segment}`;
      if (!fileMap[key]) {
        // Generate a UUID for the item
        const id = uuidv4();

        const file_fields: CustomUploadFields = {
          id,
          parent: parentId,
          type: isFile ? 'file' : 'directory',
          name: segment,
          createdAt: Timestamp.now(),
          ...(isFile ? { size: file.size } : {}),
          ...(isFile ? { file } : {})
        };

        fileMap[key] = file_fields;
        parsed_files.push(file_fields);
      }

      // If the current segment is a directory, update the parentId for the next iteration
      if (!isFile) {
        parentId = fileMap[key].id;
      }
    }
  }

  return orderFilesByDirectory(parsed_files);
}
