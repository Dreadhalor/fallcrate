import { useState } from 'react';
import { File } from '../helpers';
import BrowserHeader from './BrowserItem/BrowserHeader';
import BrowserItem from './BrowserItem/BrowserItem';

type Props = {
  currentDirectoryFiles: File[];
  selectedFiles: string[];
  selectFile: (file_id: string) => void;
  openFile: (file_id: string) => void;
  massToggleSelectFiles: () => void;
  moveFiles: (
    file_ids_to_move: string[],
    destination_id: string | null
  ) => void;
};

const MainFileBrowser = ({
  currentDirectoryFiles,
  selectedFiles,
  selectFile,
  openFile,
  massToggleSelectFiles,
  moveFiles,
}: Props) => {
  const [dragover, setDragover] = useState(false);
  return (
    <div className='relative flex flex-1 overflow-hidden'>
      <div
        className='pointer-events-none absolute inset-[1px] z-20 overflow-hidden'
        style={{ border: dragover ? '2px dashed blue' : 'none' }}
      ></div>
      <div
        id='content-browser'
        className='relative flex flex-1 flex-col overflow-auto'
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragover(true);
        }}
        onDragLeave={() => setDragover(false)}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragover(false);
        }}
      >
        {currentDirectoryFiles.length > 0 && (
          <>
            <div className='flex flex-row justify-center p-[10px] pt-[20px] text-gray-400'>
              Here is a random spacer to demonstrate that the column header is
              sticky
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
            moveFiles={moveFiles}
          />
        ))}
        {currentDirectoryFiles.length === 0 && (
          <div className='m-auto flex items-center justify-center pb-[100px]'>
            <p className='m-auto text-gray-400'>No files in this folder!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainFileBrowser;
