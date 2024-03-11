import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { FaFolderPlus } from 'react-icons/fa';
import { IoDuplicate } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { RiEditBoxFill } from 'react-icons/ri';
import { UploadButton } from './upload-button';
import { HiDownload } from 'react-icons/hi';
import { SuspenseIcon } from '@fallcrate/components/utilities/suspense-icon';

type ButtonProps = {
  title: React.ReactNode;
  icon: React.ReactNode;
  suspense?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'primary' | 'secondary' | 'warning' | 'disabled';
  className?: string;
  size?: number;
};
export const MainContentMenuButton = ({
  title,
  icon,
  suspense,
  onClick = () => {},
  type = 'secondary',
  className = '',
  size = 18,
}: ButtonProps) => {
  const typeClassMap = {
    secondary: 'border border-gray-300 bg-white hover:bg-gray-100',
    warning: 'border border-gray-300 bg-white hover:bg-red-100',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    disabled: 'border bg-white-300 border-gray-100 text-gray-400',
  };

  const possiblyDisabledType = suspense ? 'disabled' : type;
  const typeClasses = typeClassMap[possiblyDisabledType];

  return (
    <button
      className={`flex items-center justify-center gap-[8px] whitespace-nowrap rounded-sm px-[15px] py-[5px] ${typeClasses} ${className}`}
      onClick={onClick}
      disabled={suspense}
    >
      <SuspenseIcon icon={icon} size={size} suspense={suspense} />
      {title}
    </button>
  );
};

const MainContentToolbar = () => {
  const {
    selectedFiles,
    deleteFiles,
    promptNewFolder,
    duplicateFileOrFolder,
    duplicateSuspense,
    downloadFilesOrFolders,
    downloadSuspense,
    setRenamingFileId,
  } = useFilesystem();

  const showDownload = selectedFiles.length > 0 || downloadSuspense;
  const showRename = selectedFiles.length === 1;
  const showDuplicate = selectedFiles.length === 1 || duplicateSuspense;
  const showDelete = selectedFiles.length > 0;

  return (
    <div
      id='content-toolbar'
      className='flex min-h-[60px] flex-row gap-[10px] overflow-auto px-[20px] py-[10px]'
    >
      <UploadButton />
      <MainContentMenuButton
        title='Create Folder'
        icon={<FaFolderPlus />}
        onClick={promptNewFolder}
      />
      {showDownload && (
        <MainContentMenuButton
          title={downloadSuspense ? 'Preparing Download...' : 'Download'}
          icon={<HiDownload size={18} />}
          suspense={downloadSuspense}
          onClick={() => downloadFilesOrFolders(selectedFiles)}
        />
      )}
      {showRename && (
        <MainContentMenuButton
          title='Rename'
          icon={<RiEditBoxFill size={18} />}
          onClick={() => setRenamingFileId(selectedFiles[0]!)}
        />
      )}
      {showDuplicate && (
        <MainContentMenuButton
          title={duplicateSuspense ? 'Duplicating...' : 'Duplicate'}
          icon={<IoDuplicate size={18} />}
          suspense={duplicateSuspense}
          onClick={() => duplicateFileOrFolder(selectedFiles[0]!)}
        />
      )}
      {showDelete && (
        <MainContentMenuButton
          title='Delete'
          icon={<MdDelete size={20} />}
          onClick={() => deleteFiles(selectedFiles)}
          type='warning'
          className='ml-auto'
        />
      )}
    </div>
  );
};

export { MainContentToolbar };
