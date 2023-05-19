import { useFilesystem } from '@providers/FilesystemProvider';
import { FaFolderPlus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { RiEditBoxFill } from 'react-icons/ri';

type ButtonProps = {
  title: string;
  icon: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'primary' | 'secondary' | 'warning';
  className?: string;
};
const MainContentMenuButton = ({
  title,
  icon,
  onClick,
  type = 'secondary',
  className,
}: ButtonProps) => {
  const typeClassMap = {
    secondary: 'border border-gray-300 bg-white hover:bg-gray-100',
    warning: 'border border-gray-300 bg-white hover:bg-red-100',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  };

  const typeClasses = typeClassMap[type];

  return (
    <button
      className={`flex items-center justify-center gap-[8px] rounded-sm  py-[5px] px-[15px] ${typeClasses} ${className}`}
      onClick={onClick}
    >
      {icon}
      {title}
    </button>
  );
};

const MainContentToolbar = () => {
  const { selectedFiles, deleteFiles, promptNewFolder, promptRenameFile } =
    useFilesystem();

  return (
    <div
      id='content-toolbar'
      className='flex min-h-[60px] flex-row gap-[10px] py-[10px] px-[20px]'
    >
      <MainContentMenuButton
        title='Create Folder'
        icon={<FaFolderPlus />}
        onClick={promptNewFolder}
        type='primary'
      />
      {selectedFiles.length > 0 && (
        <>
          {selectedFiles.length === 1 && (
            <MainContentMenuButton
              title='Rename'
              icon={<RiEditBoxFill size={18} />}
              onClick={() => promptRenameFile(selectedFiles[0])}
            />
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
