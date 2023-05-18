import React from 'react';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { CustomFile } from '@src/types';
import { BiEdit } from 'react-icons/bi';
import { MdDeleteOutline } from 'react-icons/md';
import FileContextMenuItem from './FileContextMenuItem';
import { useFilesystem } from '@providers/FilesystemProvider';
import { useAchievements } from 'milestone-components';

type Props = {
  file: CustomFile;
  children: React.ReactNode;
  selectable?: boolean;
};

const FileContextMenu = ({ file, children, selectable = false }: Props) => {
  const { promptRenameFile, deleteFiles, selectFileExclusively } =
    useFilesystem();
  const { unlockAchievementById } = useAchievements();

  const items: MenuProps['items'] = [
    {
      label: <FileContextMenuItem icon={<BiEdit size={16} />} title='Rename' />,
      key: 'rename',
    },
    {
      label: (
        <FileContextMenuItem
          icon={<MdDeleteOutline size={16} />}
          title='Delete'
        />
      ),
      key: 'delete',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'rename') promptRenameFile(file?.id);
    if (e.key === 'delete') deleteFiles([file?.id]);
  };

  const handleOpenChange = (flag: boolean) => {
    if (flag) {
      if (selectable) selectFileExclusively(file?.id);
      unlockAchievementById('context_menu');
    }
  };

  return (
    <Dropdown
      menu={{ items, onClick: handleMenuClick }}
      trigger={['contextMenu']}
      onOpenChange={handleOpenChange}
    >
      {children}
    </Dropdown>
  );
};

export default FileContextMenu;
