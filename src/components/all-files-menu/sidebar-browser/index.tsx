import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { SidebarBrowserItem } from './sidebar-browser-item';
import { sortFiles } from '@fallcrate/helpers';

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

export { SidebarBrowser };
