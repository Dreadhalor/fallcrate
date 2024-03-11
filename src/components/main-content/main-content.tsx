import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { getDirectoryPath } from '@fallcrate/helpers';
import { Breadcrumb } from './breadcrumb';
import { MainFileBrowser } from './main-file-browser/main-file-browser';
import { MainContentToolbar } from './main-content-toolbar';

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
          <div className='ml-auto font-bold'>{`${n} selected${
            nested > 0 ? ` (+${nested} nested)` : ''
          }`}</div>
        )}
      </div>
      <MainContentToolbar />
      <MainFileBrowser />
    </div>
  );
};

export { MainContent };
