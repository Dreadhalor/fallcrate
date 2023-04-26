import { useFileManagement } from '@providers/FileManagementProvider';
import { getDirectoryPath } from '@src/helpers';
import Breadcrumb from './Breadcrumb';
import MainFileBrowser from './MainFileBrowser/MainFileBrowser';
import MainContentToolbar from './MainContentToolbar';

const MainContent = () => {
  const { files, currentDirectory, openDirectory, moveFiles } =
    useFileManagement();

  return (
    <div id='content' className='flex h-full flex-1 flex-col'>
      <div id='breadcrumbs' className='flex flex-row p-[20px] pb-[10px]'>
        {getDirectoryPath(currentDirectory, files).map((file) => (
          <Breadcrumb
            key={file?.id ?? 'root'}
            file={file}
            currentDirectory={currentDirectory}
            openDirectory={openDirectory}
            moveFiles={moveFiles}
          />
        ))}
      </div>
      <MainContentToolbar />
      <MainFileBrowser />
    </div>
  );
};

export default MainContent;
