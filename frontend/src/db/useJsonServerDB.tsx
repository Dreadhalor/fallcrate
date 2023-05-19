import { CustomFile, CustomFileFields } from '@src/types';
import { buildNewFile, buildNewFolder } from '@src/helpers';
import { Database } from './Database';

const useJsonServerDB = (uid: string): Database => {
  const fetchFiles = async (): Promise<CustomFile[]> => {
    // make a get request to localhost:3000/files
    return fetch('http://localhost:3000/files').then((res) => res.json());
  };

  const createFile = async (file: CustomFileFields): Promise<CustomFile> => {
    const newFile: CustomFile = { ...file, uploadedBy: uid };
    // make a post request to localhost:3000/files
    return fetch('http://localhost:3000/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildNewFile(newFile)),
    }).then((res) => res.json());
  };
  const renameFile = async (
    file_id: string,
    name: string
  ): Promise<CustomFile> => {
    // make a patch request to localhost:3000/files/:file_id
    return fetch(`http://localhost:3000/files/${file_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    }).then((res) => res.json());
  };
  const moveFile = async (
    file_id: string,
    parent_id: string | null
  ): Promise<CustomFile> => {
    if (!file_id) return Promise.reject('No file id provided');
    if (file_id === parent_id)
      return Promise.reject('Cannot move file into itself');
    // make a patch request to localhost:3000/files/:file_id
    return fetch(`http://localhost:3000/files/${file_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parent: parent_id }),
    }).then((res) => res.json());
  };
  const deleteFile = async (file_id: string): Promise<string> => {
    if (!file_id) return Promise.reject('No file id provided');
    // make a delete request to localhost:3000/files/:file_id
    return fetch(`http://localhost:3000/files/${file_id}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((json) => json.id);
  };
  const deleteFiles = async (file_ids: string[]): Promise<string[]> => {
    if (!file_ids) return Promise.reject('No file ids provided');
    // make a delete request to localhost:3000/files/:file_id
    return Promise.all(file_ids.map((id) => deleteFile(id)));
  };

  const createFolder = async (
    name: string,
    parent: string | null
  ): Promise<CustomFile> => {
    // make a post request to localhost:3000/files
    return fetch('http://localhost:3000/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildNewFolder({ name, parent, uid })),
    }).then((res) => res.json());
  };

  const subscribeToFiles =
    (callback: (files: CustomFile[]) => void) => () => {};

  return {
    fetchFiles,
    createFile,
    renameFile,
    moveFile,
    deleteFiles,
    createFolder,
    subscribeToFiles,
  };
};

export default useJsonServerDB;
