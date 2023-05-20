import React, { createContext, useContext } from 'react';
import { Item, ItemParams, Menu, useContextMenu } from 'react-contexify';
import { useFilesystem } from '@hooks/useFilesystem';
import { CustomFile } from '@src/types';
import { BiDuplicate, BiEdit } from 'react-icons/bi';
import { MdDeleteOutline } from 'react-icons/md';
import { useAchievements } from 'milestone-components';
import { useImageModal } from '@providers/ImageModalProvider';

type FileContextMenuItemProps = {
  icon: React.ReactNode;
  title: string;
};
const FileContextMenuItem = ({ icon, title }: FileContextMenuItemProps) => {
  return (
    <span className='flex items-center gap-[12px]'>
      {icon}
      {title}
    </span>
  );
};

interface FileContextMenuContextValue {
  showFileContextMenu: (
    event: React.MouseEvent,
    file: CustomFile,
    selectFile?: boolean
  ) => void;
}

const FileContextMenuContext = createContext<FileContextMenuContextValue>(
  {} as FileContextMenuContextValue
);

type Props = {
  children: React.ReactNode;
};

export const ContextMenuProvider = ({ children }: Props) => {
  const {

    selectFileExclusively,
    promptRenameFile,
    deleteFiles,
    duplicateFileOrFolder,
  } = useFilesystem();
  const { open } = useImageModal();
  const { unlockAchievementById } = useAchievements();

  const { show } = useContextMenu({
    id: 'file-context-menu',
  });

  const showFileContextMenu = (
    event: React.MouseEvent,
    file: CustomFile,
    selectFile = false // this isn't used anymore but let's keep it in case I wanna use it later
  ) => {
    if (selectFile) selectFileExclusively(file.id);
    unlockAchievementById('context_menu');
    show({
      event,
      props: {
        file,
      },
    });
  };

  function handleItemClick({
    id,
    props: { file } = {},
  }: ItemParams<{ file?: CustomFile }>) {
    if (!file) {
      return;
    }
    if (id === 'rename') promptRenameFile(file.id);
    if (id === 'duplicate') duplicateFileOrFolder(file.id);
    if (id === 'delete') deleteFiles([file.id]);
  }

  return (
    <FileContextMenuContext.Provider value={{ showFileContextMenu }}>
      {children}
      {!open && (
        <Menu id='file-context-menu'>
          <Item onClick={handleItemClick} id='rename'>
            <FileContextMenuItem icon={<BiEdit size={16} />} title='Rename' />
          </Item>
          <Item onClick={handleItemClick} id='duplicate'>
            <FileContextMenuItem
              icon={<BiDuplicate size={16} />}
              title='Duplicate'
            />
          </Item>
          <Item onClick={handleItemClick} id='delete'>
            <FileContextMenuItem
              icon={<MdDeleteOutline size={16} />}
              title='Delete'
            />
          </Item>
        </Menu>
      )}
    </FileContextMenuContext.Provider>
  );
};

export const useFileContextMenu = () => {
  const context = useContext(FileContextMenuContext);

  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }

  return context;
};
