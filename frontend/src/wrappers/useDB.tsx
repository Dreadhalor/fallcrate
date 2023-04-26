import { buildNewFile, buildNewFolder } from '../helpers';

const useDB = () => {
  const fetchFiles = async () => {
    // make a get request to localhost:3000/files
    return fetch('http://localhost:3000/files').then((res) => res.json());
  };

  const createFile = async (name: string, parent: string | null) => {
    // make a post request to localhost:3000/files
    return fetch('http://localhost:3000/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildNewFile({ name, parent })),
    }).then((res) => res.json());
  };
  const renameFile = async (file_id: string, name: string) => {
    // make a patch request to localhost:3000/files/:file_id
    return fetch(`http://localhost:3000/files/${file_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    }).then((res) => res.json());
  };
  const moveFile = async (file_id: string, parent_id: string | null) => {
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
  const deleteFile = async (file_id: string) => {
    if (!file_id) return Promise.reject('No file id provided');
    // make a delete request to localhost:3000/files/:file_id
    return fetch(`http://localhost:3000/files/${file_id}`, {
      method: 'DELETE',
    }).then((res) => res.json());
  };

  const createFolder = async (name: string, parent: string | null) => {
    // make a post request to localhost:3000/files
    return fetch('http://localhost:3000/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildNewFolder({ name, parent })),
    }).then((res) => res.json());
  };

  return {
    fetchFiles,
    createFile,
    renameFile,
    moveFile,
    deleteFile,
    createFolder,
  };
};

export default useDB;
