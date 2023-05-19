import { useFilesystem } from '@providers/FilesystemProvider';
import { getDirectoryPath } from '@src/helpers';
import Breadcrumb from './Breadcrumb';
import MainFileBrowser from './MainFileBrowser/MainFileBrowser';
import MainContentToolbar from './MainContentToolbar';

const MainContent = () => {
  const { files, currentDirectory, selectedFiles } = useFilesystem();
  const n = selectedFiles.length;

  return (
    <div id='content' className='flex h-full min-w-0 flex-1 flex-col'>
      <div id='breadcrumbs' className='flex flex-row p-[20px] pb-[10px]'>
        {getDirectoryPath(currentDirectory, files).map((file) => (
          <Breadcrumb key={file?.id ?? 'root'} file={file} />
        ))}
        {n > 0 && (
          <div className='ml-auto font-bold'>{`${n} file${
            n > 1 ? 's' : ''
          } selected`}</div>
        )}
      </div>
      <MainContentToolbar />
      <MainFileBrowser />
    </div>
  );
};

export default MainContent;
