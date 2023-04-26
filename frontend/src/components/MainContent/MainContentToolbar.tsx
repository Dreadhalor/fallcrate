import { useFileManagement } from '@providers/FileManagementProvider';
import { FaFile, FaFolder } from 'react-icons/fa';

const MainContentToolbar = () => {
  const {
    selectedFiles,
    deleteFiles,
    promptNewFile,
    promptNewFolder,
    promptRenameFile,
  } = useFileManagement();

  return (
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
  );
};

export default MainContentToolbar;