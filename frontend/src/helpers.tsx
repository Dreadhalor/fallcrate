import { v4 as uuid } from 'uuid';
export interface File {
  id: string;
  name: string;
  type: string;
  parent: string;
}

export const buildNewFolder = ({
  name,
  parent,
}: {
  name: string;
  parent?: string | null;
}) => {
  return {
    id: uuid(),
    name,
    type: 'directory',
    parent: parent ?? null,
  };
};

export const buildNewFile = ({
  name,
  parent,
}: {
  name: string;
  parent?: string | null;
}) => {
  return {
    id: uuid(),
    name,
    type: 'file',
    parent: parent ?? null,
  };
};

export const sortFiles = (file_a: File, file_b: File) => {
  if (file_a.type === 'directory' && file_b.type === 'file') {
    return -1;
  } else if (file_a.type === 'file' && file_b.type === 'directory') {
    return 1;
  } else {
    return file_a.name.localeCompare(file_b.name);
  }
};

export const getDirectoryPath = (
  file_id: string | null,
  files: File[]
): (File | null)[] => {
  if (file_id === null) return [null];
  const file = files.find((file) => file?.id === file_id);
  if (!file) return [null];
  return [...getDirectoryPath(file?.parent, files), file];
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
