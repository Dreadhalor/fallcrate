import { useFilesystem } from '@hooks/useFilesystem';
import { FaFolderPlus } from 'react-icons/fa';
import { IoDuplicate } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { RiEditBoxFill } from 'react-icons/ri';
import UploadButton from './UploadButton';
import { HiDownload } from 'react-icons/hi';
import { SuspenseIcon } from '@components/utilities/SuspenseIcon';

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
      className={`flex items-center justify-center gap-[8px] whitespace-nowrap rounded-sm py-[5px] px-[15px] ${typeClasses} ${className}`}
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
    promptRenameFile,
    duplicateFileOrFolder,
    duplicateSuspense,
    downloadFilesOrFolders,
    downloadSuspense,
  } = useFilesystem();

  return (
    <div
      id='content-toolbar'
      className='flex min-h-[60px] flex-row gap-[10px] overflow-auto py-[10px] px-[20px]'
    >
      <UploadButton />
      <MainContentMenuButton
        title='Create Folder'
        icon={<FaFolderPlus />}
        onClick={promptNewFolder}
      />
      {selectedFiles.length > 0 && (
        <>
          <MainContentMenuButton
            title='Download'
            icon={<HiDownload size={18} />}
            suspense={downloadSuspense}
            onClick={() => downloadFilesOrFolders(selectedFiles)}
          />
          {selectedFiles.length === 1 && (
            <>
              <MainContentMenuButton
                title='Rename'
                icon={<RiEditBoxFill size={18} />}
                onClick={() => promptRenameFile(selectedFiles[0])}
              />
              <MainContentMenuButton
                title='Duplicate'
                icon={<IoDuplicate size={18} />}
                suspense={duplicateSuspense}
                onClick={() => duplicateFileOrFolder(selectedFiles[0])}
              />
            </>
          )}
          <MainContentMenuButton
            title='Delete'
            icon={<MdDelete size={20} />}
            onClick={() => deleteFiles(selectedFiles)}
            type='warning'
            className='ml-auto'
          />
        </>
      )}
    </div>
  );
};

export default MainContentToolbar;
