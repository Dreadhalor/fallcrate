import BrowserHeader from './BrowserHeader';
import BrowserItem from './BrowserItem/BrowserItem';
import { useFilesystem } from '@hooks/useFilesystem';
import FileDropzone from '../FileDropzone';
import { useDrop } from 'react-dnd';
import { DraggedItems } from '@src/types';

const MainFileBrowser = () => {
  const { currentDirectoryFiles, currentDirectory, moveFiles } =
    useFilesystem();

  // Drop related logic
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'file',
      drop: (items: DraggedItems, monitor) => {
        if (monitor.isOver({ shallow: true }) && items.ids.length > 0)
          moveFiles(items.ids, currentDirectory);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    // currentDirectory ends up always being null without this
    [currentDirectory, moveFiles]
  );

  return (
    <div className='relative flex flex-1 overflow-hidden'>
      {isOver && (
        <div
          className='pointer-events-none absolute inset-[1px] z-20'
          style={{ border: '2px dashed blue' }}
        ></div>
      )}
      <div
        id='content-browser'
        className='relative flex flex-1 flex-col overflow-auto'
        ref={drop}
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
