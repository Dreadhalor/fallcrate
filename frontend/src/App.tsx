import { useEffect, useState } from 'react';
import BrowserItem from './components/BrowserItem';
import SidebarMenu from './components/SidebarMenu';

export interface File {
  id: string;
  name: string;
}

function App() {
  const [files, setFiles] = useState([] as File[]);
  const [selectedFiles, setSelectedFiles] = useState([] as string[]);

  const selectFile = (file_id: string) => {
    let selected = false;
    setSelectedFiles((prev) => {
      if (prev.includes(file_id)) {
        return prev.filter((candidate_id) => candidate_id !== file_id);
      } else {
        selected = true;
        return [...prev, file_id];
      }
    });
    return selected;
  };

  const fetchFiles = () => {
    // make a get request to localhost:3000/files
    fetch('http://localhost:3000/files')
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setFiles(data);
      });
  };

  const createFile = (name: string) => {
    // make a post request to localhost:3000/files
    fetch('http://localhost:3000/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setFiles((prev) => [...prev, data]);
      });
  };

  const deleteFile = (file_id: string) => {
    if (!file_id) return;
    // make a delete request to localhost:3000/files/:file_id
    fetch(`http://localhost:3000/files/${file_id}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setFiles((prev) => prev.filter((file) => file.id !== file_id));
        setSelectedFiles((prev) => prev.filter((id) => id !== file_id));
      });
  };
  const deleteFiles = (file_ids: string[]) => {
    if (file_ids.length === 0) return;
    file_ids.forEach((file_id) => deleteFile(file_id));
  };

  // a function that opens a prompt to create a new file name
  const promptNewFile = () => {
    const name = prompt('Enter a file name');
    if (name) {
      createFile(name);
    }
  };
  const promptNewFileButCooler = () => {
    const name = prompt('Enter a file name');
    if (name) {
      createFile(`${name}, but cooler`);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className='flex h-full w-full flex-col border-4 border-blue-800 bg-white'>
      <div id='navbar' className='flex w-full border-b border-gray-300 p-[8px]'>
        <div className='flex w-fit flex-row items-center gap-[8px] p-[4px]'>
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
          <SidebarMenu title={'All Files'} />
        </div>
        <div
          id='content'
          className='flex h-full flex-1 flex-col border-0 border-green-800'
        >
          <div
            id='content-toolbar'
            className='flex min-h-[60px] flex-row gap-[10px] border-b border-gray-300 p-[10px]'
          >
            <button
              className='min-w-[120px] bg-blue-600 py-[5px] px-[20px] text-white hover:bg-blue-700'
              onClick={promptNewFile}
            >
              Create File
            </button>
            <button
              className='min-w-[120px] bg-blue-600 py-[5px] px-[20px] text-white hover:bg-blue-700'
              onClick={promptNewFileButCooler}
            >
              Create File, but cooler
            </button>
            {selectedFiles.length > 0 && (
              <button
                className='ml-auto min-w-[120px] border py-[5px] px-[20px] hover:bg-red-200'
                onClick={() => deleteFiles(selectedFiles)}
              >
                Delete Files ({selectedFiles.length})
              </button>
            )}
          </div>
          <div
            id='content-browser'
            className='flex flex-1 flex-col overflow-auto border-0 border-red-700'
          >
            <div
              id='content-browser-area'
              className='flex flex-col border-0 border-green-800'
            >
              {files.map((file) => (
                <BrowserItem
                  file={file}
                  key={file.id}
                  isSelected={selectedFiles.includes(file.id)}
                  selectFile={selectFile}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* <div className='flex w-full flex-1 bg-green-400 lg:hidden'></div>
      <div className='hidden w-full flex-1 bg-red-400 lg:flex'></div> */}
    </div>
  );
}

export default App;
