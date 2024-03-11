import { checkFilesForNameConflict } from '@fallcrate/helpers';
import { CustomFile, CustomFileFields } from '@fallcrate/types';

export const clearSelfParents = (files: CustomFile[]) => {
  const filesCopy = [...files];
  filesCopy.forEach((file) => {
    if (file.parent === file.id) file.parent = null;
  });
  return filesCopy;
};

export const resetOrphanBranches = (files: CustomFile[]) => {
  const filesCopy = [...files];
  filesCopy.forEach((file) => {
    if (file.parent === null) return;
    if (!files.find((candidate) => candidate.id === file.parent)) {
      console.log('relocating orphaned file:', file);
      file.parent = null;
    }
  });
  return filesCopy;
};
export const resetCircularBranches = (files: CustomFile[]) => {
  const filesCopy = [...files];
  filesCopy.forEach((file) => {
    const branch = checkForCircularBranch(file.id, files);
    if (branch.length > 0) {
      console.log('relocating circular branch:', branch);
      branch.forEach((id) => {
        const file = filesCopy.find((file) => file.id === id);
        if (file) file.parent = null;
      });
    }
  });
  return files;
};

const checkForCircularBranch = (
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

export const getValidDuplicatedName = (
  name: string,
  files: CustomFileFields[],
) => {
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

export const deduplicateFilenames = (
  srcFiles: CustomFileFields[],
  destFiles: CustomFileFields[],
) => {
  const srcFilesCopy = [...srcFiles];
  const destFilesCopy = [...destFiles];
  for (const srcFile of srcFilesCopy) {
    const validName = getValidDuplicatedName(srcFile.name, destFilesCopy);
    if (validName !== srcFile.name) srcFile.name = validName;
    destFilesCopy.push(srcFile);
  }
  return srcFilesCopy;
};
