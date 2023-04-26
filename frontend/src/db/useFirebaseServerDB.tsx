import {
  useFirestore,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'reactfire';
import { buildNewFile, buildNewFolder } from '../helpers';
import { Database } from './Database';

const useFirestoreDB = (): Database => {
  const firestore = useFirestore();
  const filesCollection = collection(firestore, 'files');

  const fetchFiles = async () => {
    const snapshot = await getDocs(filesCollection);
    return snapshot.docs.map((doc) => doc.data());
  };

  const createFile = async (name: string, parent: string | null) => {
    const newFile = buildNewFile({ name, parent });
    await addDoc(filesCollection, newFile);
    return newFile;
  };

  const renameFile = async (file_id: string, name: string) => {
    const fileRef = doc(firestore, 'files', file_id);
    await updateDoc(fileRef, { name });
    return { ...file_id, name };
  };

  const moveFile = async (file_id: string, parent_id: string | null) => {
    if (!file_id) throw new Error('No file id provided');
    if (file_id === parent_id) throw new Error('Cannot move file into itself');

    const fileRef = doc(firestore, 'files', file_id);
    await updateDoc(fileRef, { parent: parent_id });
    return { ...file_id, parent: parent_id };
  };

  const deleteFile = async (file_id: string) => {
    if (!file_id) throw new Error('No file id provided');
    const fileRef = doc(firestore, 'files', file_id);
    await deleteDoc(fileRef);
    return { ...file_id };
  };

  const createFolder = async (name: string, parent: string | null) => {
    const newFolder = buildNewFolder({ name, parent });
    await addDoc(filesCollection, newFolder);
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
