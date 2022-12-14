import { useRef, useState } from 'react';
import { File } from '../../helpers';
import BrowserHeader from './BrowserHeader';
import BrowserItem from './BrowserItem';

type Props = {
  currentDirectory: string | null;
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
  currentDirectory,
  currentDirectoryFiles,
  selectedFiles,
  selectFile,
  openFile,
  massToggleSelectFiles,
  moveFiles,
}: Props) => {
  const [dragover, setDragover] = useState(false);
  const drop_ref = useRef<HTMLDivElement>(null);

  return (
    <div className='relative flex flex-1 overflow-hidden'>
      <div
        className='pointer-events-none absolute inset-[1px] z-20'
        style={{ border: dragover ? '2px dashed blue' : 'none' }}
      ></div>
      <div
        id='content-browser'
        className='relative flex flex-1 flex-col overflow-auto'
        ref={drop_ref}
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragover(true);
        }}
        onDragLeave={() => setDragover(false)}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragover(false);
          // drop file into current directory
          const file_id = e.dataTransfer.getData('file_id');
          if (file_id && e.target === drop_ref.current)
            moveFiles([file_id], currentDirectory);
        }}
      >
        {currentDirectoryFiles.length > 0 && (
          <>
            <div className='pointer-events-none flex flex-row justify-center p-[10px] pt-[20px] text-gray-400'>
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
