import React, { useEffect, useState } from 'react';
import { File } from '../../helpers';
import SidebarBrowserItem from './SidebarBrowserItem';

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
            indentLevel={0}
            key={file.id}
            openDirectory={openDirectory}
            currentDirectory={currentDirectory}
            moveFiles={moveFiles}
          />
        ))}
      </div>{' '}
    </div>
  );
};

export default SidebarBrowser;
