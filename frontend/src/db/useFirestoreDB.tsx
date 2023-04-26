import { useFirestore } from 'reactfire';
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import { buildNewFile, buildNewFolder } from '../helpers';
import { Database } from './Database';
import { CustomFile } from '@src/types';

const useFirestoreDB = (): Database => {
  const firestore = useFirestore();
  const filesCollection = collection(firestore, 'files');

  const fetchFiles = async (): Promise<CustomFile[]> => {
    const snapshot = await getDocs(filesCollection);
    return snapshot.docs.map((doc) => doc.data() as CustomFile);
  };

  const createFile = async (file: any): Promise<CustomFile> => {
    const newFile = buildNewFile(file);
    const docRef = doc(filesCollection, newFile.id);
    await setDoc(docRef, newFile);
    return newFile;
  };

  const renameFile = async (
    file_id: string,
    name: string
  ): Promise<CustomFile> => {
    const fileRef = doc(firestore, 'files', file_id);
    const docSnapshot = await getDoc(fileRef);

    if (!docSnapshot.exists()) {
      throw new Error(`File with id ${file_id} does not exist`);
    }

    await updateDoc(fileRef, { name });
    return { ...docSnapshot.data(), name } as CustomFile;
  };

  const moveFile = async (
    file_id: string,
    parent_id: string | null
  ): Promise<CustomFile> => {
    if (!file_id) throw new Error('No file id provided');
    if (file_id === parent_id) throw new Error('Cannot move file into itself');

    const fileRef = doc(firestore, 'files', file_id);
    await updateDoc(fileRef, { parent: parent_id });
    const docSnapshot = await getDoc(fileRef);

    if (!docSnapshot.exists()) {
      throw new Error(`File with id ${file_id} does not exist`);
    }

    return docSnapshot.data() as CustomFile;
  };

  const deleteFile = async (file_id: string): Promise<string> => {
    if (!file_id) throw new Error('No file id provided');
    const fileRef = doc(firestore, 'files', file_id);
    await deleteDoc(fileRef);

    const docSnapshot = await getDoc(fileRef);
    if (docSnapshot.exists()) {
      throw new Error(`File with id ${file_id} was not deleted`);
    }

    return file_id;
  };

  const createFolder = async (
    name: string,
    parent: string | null
  ): Promise<CustomFile> => {
    const newFolder = buildNewFolder({ name, parent });
    const docRef = doc(filesCollection, newFolder.id);
    await setDoc(docRef, newFolder);
    return newFolder;
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

export default useFirestoreDB;
