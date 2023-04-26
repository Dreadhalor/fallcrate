import { useFilesystem } from '@providers/FilesystemProvider';
import { getDirectoryPath } from '@src/helpers';
import Breadcrumb from './Breadcrumb';
import MainFileBrowser from './MainFileBrowser/MainFileBrowser';
import MainContentToolbar from './MainContentToolbar';

const MainContent = () => {
  const { files, currentDirectory } = useFilesystem();

  return (
    <div id='content' className='flex h-full flex-1 flex-col'>
      <div id='breadcrumbs' className='flex flex-row p-[20px] pb-[10px]'>
        {getDirectoryPath(currentDirectory, files).map((file) => (
          <Breadcrumb key={file?.id ?? 'root'} file={file} />
        ))}
      </div>
      <MainContentToolbar />
      <MainFileBrowser />
    </div>
  );
};

export default MainContent;
