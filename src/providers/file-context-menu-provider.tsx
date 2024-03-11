import React, { createContext, useContext } from 'react';
import { Item, ItemParams, Menu, useContextMenu } from 'react-contexify';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { CustomFile } from '@fallcrate/types';
import { BiDuplicate, BiEdit } from 'react-icons/bi';
import { MdDeleteOutline } from 'react-icons/md';
import { useAchievements } from 'dread-ui';
import { useFileViewer } from '@fallcrate/providers/file-viewer-provider';
import { HiDownload } from 'react-icons/hi';
import { SuspenseIcon } from '@fallcrate/components/utilities/suspense-icon';

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
    selectFile?: boolean,
  ) => void;
}

const FileContextMenuContext = createContext<FileContextMenuContextValue>(
  {} as FileContextMenuContextValue,
);

type Props = {
  children: React.ReactNode;
};

export const ContextMenuProvider = ({ children }: Props) => {
  const {
    selectFilesExclusively,
    deleteFiles,
    duplicateFileOrFolder,
    duplicateSuspense,
    downloadFilesOrFolders,
    downloadSuspense,
    setRenamingFileId,
  } = useFilesystem();
  const { open } = useFileViewer();
  const { unlockAchievementById } = useAchievements();

  const { show } = useContextMenu({
    id: 'file-context-menu',
  });

  const showFileContextMenu = (
    event: React.MouseEvent,
    file: CustomFile,
    selectFile = false, // this isn't used anymore but let's keep it in case I wanna use it later
  ) => {
    if (selectFile) selectFilesExclusively([file.id]);
    unlockAchievementById('context_menu', 'fallcrate');
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
    if (id === 'download') downloadFilesOrFolders([file.id]);
    if (id === 'rename') setRenamingFileId(file.id);
    if (id === 'duplicate') duplicateFileOrFolder(file.id);
    if (id === 'delete') deleteFiles([file.id]);
  }

  return (
    <FileContextMenuContext.Provider value={{ showFileContextMenu }}>
      {children}
      {!open && (
        <Menu id='file-context-menu'>
          <Item
            onClick={handleItemClick}
            id='download'
            disabled={downloadSuspense}
          >
            <FileContextMenuItem
              icon={
                <SuspenseIcon
                  icon={<HiDownload size={16} />}
                  size={16}
                  suspense={downloadSuspense}
                />
              }
              title={downloadSuspense ? 'Preparing Download...' : 'Download'}
            />
          </Item>
          <Item onClick={handleItemClick} id='rename'>
            <FileContextMenuItem icon={<BiEdit size={16} />} title='Rename' />
          </Item>
          <Item
            onClick={handleItemClick}
            id='duplicate'
            disabled={duplicateSuspense}
          >
            <FileContextMenuItem
              icon={
                <SuspenseIcon
                  icon={<BiDuplicate size={16} />}
                  size={16}
                  suspense={duplicateSuspense}
                />
              }
              title={duplicateSuspense ? 'Duplicating...' : 'Duplicate'}
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
