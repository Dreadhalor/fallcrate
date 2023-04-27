import { useRef, useState } from 'react';
import BrowserHeader from './BrowserHeader';
import BrowserItem from './BrowserItem';
import { useFilesystem } from '@providers/FilesystemProvider';
import FileDropzone from '../FileDropzone';
import { useDragAndDrop } from '@providers/DragAndDropProvider';

const MainFileBrowser = () => {
  const [dragover, setDragover] = useState(false);
  const drop_ref = useRef<HTMLDivElement>(null);
  const { currentDirectoryFiles, currentDirectory, moveFiles } =
    useFilesystem();
  const { state, setState } = useDragAndDrop();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragover(true);
  };

  const handleDragLeave = () => {
    setDragover(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const child_file_id = state.draggedFileId;
    // check if the target is the dropzone
    const drop_in_current_dir = e.target === drop_ref.current;

    if (child_file_id && drop_in_current_dir) {
      moveFiles([child_file_id], currentDirectory);
    }
    setDragover(false);
    setState({ draggedFileId: null, source: null });
  };

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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FileDropzone />
        {currentDirectoryFiles.length > 0 && <BrowserHeader />}
        {currentDirectoryFiles.map((file) => (
          <BrowserItem file={file} key={file.id} />
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
