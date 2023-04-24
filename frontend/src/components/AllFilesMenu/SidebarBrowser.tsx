import { useEffect, useState } from 'react';
import { File } from '../../helpers';
import SidebarBrowserItem from './SidebarBrowserItem';

export type FileAndCollapsed = [File, boolean];

type Props = {
  files: File[];
  currentDirectory: string | null;
  openDirectory: (file_id: string | null) => void;
  moveFiles: (file_ids: string[], destination_id: string | null) => void;
};
const SidebarBrowser = ({
  files,
  currentDirectory,
  openDirectory,
  moveFiles,
}: Props) => {
  const [folders, setFolders] = useState<FileAndCollapsed[]>([]);

  useEffect(() => {
    setFolders(
      files
        .filter((file) => file.type === 'directory')
        .map((file) => [file, false])
    );
  }, [files]);

  const top_level_folders = files.filter(
    (file) => file.parent === null && file.type === 'directory'
  );

  return (
    <div className='h-full bg-white'>
      <div className='flex h-full flex-col overflow-auto'>
        {top_level_folders.map((file) => (
          <SidebarBrowserItem
            file={file}
            files={files}
            folders={folders}
            indentLevel={0}
            key={file.id}
            openDirectory={openDirectory}
            currentDirectory={currentDirectory}
            moveFiles={moveFiles}
          />
        ))}
      </div>
    </div>
  );
};

export default SidebarBrowser;
