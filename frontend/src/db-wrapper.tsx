import { buildNewFile, buildNewFolder } from './helpers';

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

export default {
  fetchFiles,
  createFile,
  renameFile,
  deleteFile,
  createFolder,
};
