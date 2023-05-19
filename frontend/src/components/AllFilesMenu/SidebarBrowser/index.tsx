import { useFilesystem } from '@hooks/useFilesystem';
import SidebarBrowserItem from './SidebarBrowserItem';
import { sortFiles } from '@src/helpers';

const SidebarBrowser = () => {
  const { files } = useFilesystem();

  const top_level_folders = files
    .filter((file) => file.parent === null && file.type === 'directory')
    .sort(sortFiles);

  return (
    <div className='h-full bg-white'>
      <div className='flex h-full flex-col overflow-auto'>
        {top_level_folders.map((file) => (
          <SidebarBrowserItem file={file} indentLevel={0} key={file.id} />
        ))}
      </div>
    </div>
  );
};

export default SidebarBrowser;
