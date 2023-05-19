import { useFilesystem } from '@hooks/useFilesystem';
import { getDirectoryPath } from '@src/helpers';
import Breadcrumb from './Breadcrumb';
import MainFileBrowser from './MainFileBrowser/MainFileBrowser';
import MainContentToolbar from './MainContentToolbar';

const MainContent = () => {
  const { files, currentDirectory, selectedFiles, nestedSelectedFiles } =
    useFilesystem();
  const n = selectedFiles.length;
  const nested = nestedSelectedFiles.length;

  return (
    <div id='content' className='flex h-full min-w-0 flex-1 flex-col'>
      <div id='breadcrumbs' className='flex flex-row p-[20px] pb-[10px]'>
        {getDirectoryPath(currentDirectory, files).map((file) => (
          <Breadcrumb key={file?.id ?? 'root'} file={file} />
        ))}
        {n > 0 && (
          <div className='ml-auto font-bold'>{`${n} selected${nested > 0 ? ` (+${nested} nested)` : ''}`}</div>
        )}
      </div>
      <MainContentToolbar />
      <MainFileBrowser />
    </div>
  );
};

export default MainContent;
