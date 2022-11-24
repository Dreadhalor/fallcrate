import { useEffect, useState } from 'react';
import { FaFile, FaFolder } from 'react-icons/fa';
import Breadcrumb from './components/Breadcrumb';
import BrowserItem from './components/BrowserItem/BrowserItem';
import AllFilesMenuItem from './components/AllFilesMenu/AllFilesMenuItem';
import db from './db-wrapper';
import { File, getDirectoryPath, sortFiles } from './helpers';
import BrowserHeader from './components/BrowserItem/BrowserHeader';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
  const [currentDirectoryFiles, setCurrentDirectoryFiles] = useState<File[]>(
    []
  );

  const openDirectory = (directory_id: string | null) => {
    // clear selected files, unless the directory is simply being refreshed
    if (directory_id !== currentDirectory) setSelectedFiles([]);
    setCurrentDirectory(directory_id);
    setCurrentDirectoryFiles(
      files.filter((file) => file.parent === directory_id).sort(sortFiles)
    );
  };
  const selectFile = (file_id: string) => {
    setSelectedFiles((prev) => {
      if (prev.includes(file_id))
        return prev.filter((candidate_id) => candidate_id !== file_id);
      else return [...prev, file_id];
    });
  };
  const massToggleSelectFiles = () => {
    if (selectedFiles.length > 0) setSelectedFiles([]);
    else setSelectedFiles(currentDirectoryFiles.map((file) => file.id));
  };

  const openFile = (file_id: string) => {
    if (files.find((file) => file.id === file_id)?.type === 'directory')
      openDirectory(file_id);
  };

  // CRUD operations
  const createFile = (name: string) => {
    db.createFile(name, currentDirectory).then((data) => {
      setFiles((prev) => [...prev, data]);
    });
  };
  const createFolder = (name: string) => {
    db.createFolder(name, currentDirectory).then((data) => {
      setFiles((prev) => [...prev, data]);
    });
  };
  const deleteFile = (file_id: string) =>
    db
      .deleteFile(file_id)
      .then((_) => {
        setFiles((prev) => prev.filter((file) => file.id !== file_id));
        setSelectedFiles((prev) => prev.filter((id) => id !== file_id));
      })
      .catch((err) => console.log(err));
  const deleteFiles = (file_ids: string[]) =>
    file_ids.forEach((file_id) => deleteFile(file_id));

  // a function that opens a prompt to create a new file name
  const promptNewFile = () => {
    const name = prompt('Enter a file name');
    if (name) {
      createFile(name);
    }
  };
  const promptNewFolder = () => {
    const name = prompt('Enter a folder name');
    if (name) {
      createFolder(name);
    }
  };
  // prompt to rename a file
  const promptRenameFile = (file_id: string) => {
    const name = prompt('Enter a new file name');
    if (name) {
      db.renameFile(file_id, name).then((data) => {
        setFiles((prev) =>
          prev.map((file) => (file.id === file_id ? data : file))
        );
      });
    }
  };

  useEffect(() => {
    db.fetchFiles().then((data) => setFiles(data));
  }, []);
  useEffect(() => {
    openDirectory(currentDirectory);
  }, [files]);

  return (
    <div className='flex h-full w-full flex-col border-0 border-blue-800 bg-white'>
      <div id='navbar' className='flex w-full border-b border-gray-300 p-[8px]'>
        <div
          className='flex w-fit cursor-pointer flex-row items-center gap-[6px] p-[4px]'
          onClick={() => openDirectory(null)}
        >
          <img className='h-[30px]' src='/src/assets/Logo.svg' />
          <img className='h-[20px]' src='/src/assets/Fallcrate.svg' />
        </div>
      </div>
      <div
        id='dashboard'
        className='flex flex-1 flex-row overflow-hidden border-0 border-black'
      >
        <div
          id='sidebar'
          className='h-full w-[250px] border-r border-gray-300 bg-gray-100'
        >
          <AllFilesMenuItem
            title={'All Files'}
            files={files.sort(sortFiles)}
            currentDirectory={currentDirectory}
            openDirectory={openDirectory}
          />
        </div>
        <div
          id='content'
          className='flex h-full flex-1 flex-col border-0 border-green-800'
        >
          <div id='breadcrumbs' className='flex flex-row p-[20px] pb-[10px]'>
            {getDirectoryPath(currentDirectory, files).map((file) => (
              <Breadcrumb
                key={file?.id ?? 'root'}
                file={file}
                currentDirectory={currentDirectory}
                openDirectory={openDirectory}
              />
            ))}
          </div>
          <div
            id='content-toolbar'
            className='flex min-h-[60px] flex-row gap-[10px] border-gray-300 py-[10px] px-[20px]'
          >
            <button
              className='flex min-w-[120px] items-center gap-[5px] bg-blue-600 py-[5px] px-[15px] text-white hover:bg-blue-700'
              onClick={promptNewFile}
            >
              <FaFile />
              Create File
            </button>
            <button
              className='flex min-w-[120px] items-center gap-[5px] bg-blue-600 py-[5px] px-[15px] text-white hover:bg-blue-700'
              onClick={promptNewFolder}
            >
              <FaFolder />
              Create Folder
            </button>
            {selectedFiles.length > 0 && (
              <>
                {selectedFiles.length === 1 && (
                  <button
                    className='min-w-[120px] border py-[5px] px-[15px] hover:bg-gray-200'
                    onClick={() => promptRenameFile(selectedFiles[0])}
                  >
                    Rename
                  </button>
                )}
                <button
                  className='ml-auto min-w-[120px] border py-[5px] px-[15px] hover:bg-red-100'
                  onClick={() => deleteFiles(selectedFiles)}
                >
                  Delete Files ({selectedFiles.length})
                </button>
              </>
            )}
          </div>
          <div
            id='content-browser'
            className='flex flex-1 flex-col overflow-auto border-0 border-red-700'
          >
            {currentDirectoryFiles.length > 0 && (
              <>
                <div className='flex flex-row justify-center p-[10px] pt-[20px] text-gray-400'>
                  Here is a random spacer to demonstrate that the column header
                  is sticky
                </div>
                <BrowserHeader
                  selectedFiles={selectedFiles}
                  currentDirectoryFiles={currentDirectoryFiles}
                  massToggleSelectFiles={massToggleSelectFiles}
                />
              </>
            )}
            {currentDirectoryFiles.map((file) => (
              <BrowserItem
                file={file}
                key={file.id}
                selectedFiles={selectedFiles}
                selectFile={selectFile}
                openFile={openFile}
              />
            ))}
            {currentDirectoryFiles.length === 0 && (
              <div className='m-auto flex items-center justify-center pb-[100px]'>
                <p className='m-auto text-gray-400'>No files in this folder!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
