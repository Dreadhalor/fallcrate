import { v4 as uuidv4 } from 'uuid';
import { CustomFile, CustomFileFields, FileUploadData } from './types';
import { Timestamp } from 'firebase/firestore';
import { DragSourceMonitor } from 'react-dnd';

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
    mimeType: file.mimeType ?? '',
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
  files: CustomFile[],
): (CustomFile | null)[] => {
  if (!file_id) return [null];
  const file = files.find((file) => file?.id === file_id);
  if (!file) return [null];
  return [...getDirectoryPath(file?.parent, files), file];
};

const getFileDeleteTreeIDs = (
  file_id: string,
  files: CustomFile[],
): string[] => {
  const file = files.find((file) => file.id === file_id);
  if (!file) return [];
  return [file, ...getNestedFilesOnly(file.id, files)].map((file) => file.id);
};
export const getUnionFileDeleteTreeIDs = (
  file_ids: string[],
  files: CustomFile[],
): string[] => {
  const list = file_ids.flatMap((file_id) =>
    getFileDeleteTreeIDs(file_id, files),
  );
  return [...new Set(list)]; // shouldn't need to do this but just in case
};

function deduplicateByProperty(
  array: CustomFileFields[],
  property: keyof CustomFileFields,
) {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[property];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}
const getFileTree = (
  file_id: string,
  files: CustomFile[],
): CustomFileFields[] => {
  const file = files.find((file) => file.id === file_id);
  if (!file) return [];
  return [file, ...getNestedFilesOnly(file.id, files)];
};
export const getUnionFileTree = (
  file_ids: string[],
  files: CustomFile[],
): CustomFileFields[] => {
  const list = file_ids.flatMap((file_id) => getFileTree(file_id, files));
  const result = deduplicateByProperty(list, 'id');
  return result;
};

export const checkForCircularReference = (
  file_id: string,
  parent_id: string | null,
  files: CustomFile[],
): boolean => {
  if (file_id === parent_id) return true;
  if (parent_id === null) return false;
  const parent = files.find((file) => file.id === parent_id);
  if (parent) return checkForCircularReference(file_id, parent.parent, files);
  return false;
};
export const checkForCircularBranch = (
  file_id: string,
  files: CustomFile[],
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
  files: CustomFile[],
) => {
  const files_in_directory = files.filter((file) => file.parent === parent_id);
  return files_in_directory.some(
    (file) => file.name === name && file.id !== file_id,
  );
};
export const checkFilesForNameConflict = (
  name: string,
  files: CustomFileFields[],
) => {
  return files.some((file) => file.name === name);
};

export const getNestedFilesOnly = (
  parentId: string | null,
  files: CustomFileFields[],
): CustomFileFields[] => {
  const nestedFiles: CustomFileFields[] = [];
  const queue: CustomFileFields[] = files.filter(
    (file) => file.parent === parentId,
  );

  while (queue.length > 0) {
    const currentFile = queue.shift();
    if (currentFile) {
      nestedFiles.push(currentFile);
      if (currentFile.type === 'directory') {
        const childFiles = files.filter(
          (file) => file.parent === currentFile.id,
        );
        queue.push(...childFiles);
      }
    }
  }

  return nestedFiles;
};

// order the given files such that parent directories are before their children
export const orderFilesByDirectory = (files: CustomFileFields[]) => {
  const orderedFiles = [];
  const directories = files.filter((file) => file.type === 'directory');
  const filesWithoutDirectories = files.filter(
    (file) => file.type !== 'directory',
  );

  // Define a helper function to check whether a file is a top-level node (has no parent)
  const isTopLevelNode = (file: CustomFileFields) => file.parent === null;

  // First, push all top-level directories
  const topLevelDirectories = directories.filter(isTopLevelNode);
  for (const directory of topLevelDirectories) {
    orderedFiles.push(directory);
    const nestedFiles = getNestedFilesOnly(directory.id, files); // pass all files, not just filesWithoutDirectories
    orderedFiles.push(...nestedFiles);
  }

  // Then, push all top-level files
  const topLevelFiles = filesWithoutDirectories.filter(isTopLevelNode);
  orderedFiles.push(...topLevelFiles);

  return orderedFiles;
};

export function parseFileArray(files: File[]): Promise<FileUploadData[]> {
  return new Promise((resolve, reject) => {
    try {
      const parsed_files: FileUploadData[] = [];
      const fileMap: { [key: string]: FileUploadData } = {};

      for (const file of files) {
        const pathSegments = file.webkitRelativePath.split('/');
        let parentId: string | null = null;

        for (let i = 0; i < pathSegments.length; i++) {
          const segment = pathSegments[i];
          const isFile = i === pathSegments.length - 1;

          const key: string = `${parentId}-${segment}`;
          if (!fileMap[key]) {
            const id = uuidv4();

            const file_fields: FileUploadData = {
              id,
              parent: parentId,
              type: isFile ? 'file' : 'directory',
              name: segment!,
              createdAt: Timestamp.now(),
              ...(isFile ? { mimeType: file.type, size: file.size, file } : {}),
            };

            fileMap[key] = file_fields;
            parsed_files.push(file_fields);
          }

          if (!isFile) {
            parentId = fileMap[key]!.id;
          }
        }
      }

      resolve(orderFilesByDirectory(parsed_files));
    } catch (error) {
      reject(error);
    }
  });
}

export const calculateDragOffset = (monitor: DragSourceMonitor) => {
  const clientOffset = monitor.getInitialClientOffset() ?? {
    x: 0,
    y: 0,
  };
  const sourceOffset = monitor.getInitialSourceClientOffset() ?? {
    x: 0,
    y: 0,
  };
  return {
    x: clientOffset?.x - sourceOffset?.x,
    y: clientOffset?.y - sourceOffset?.y,
  };
};
