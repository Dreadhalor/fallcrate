import { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { File } from '../../helpers';
import SidebarBrowser from './SidebarBrowser';

type Props = {
  title: string;
  files: File[];
  currentDirectory: string | null;
  openDirectory: (file_id: string | null) => void;
};

const AllFilesMenuItem = ({
  title,
  files,
  currentDirectory,
  openDirectory,
}: Props) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className='flex cursor-pointer flex-col'>
      <div
        className='flex flex-row items-center gap-[5px] px-[20px] py-[10px]'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <FaChevronRight
          size={10}
          className='transition-transform'
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        />
        {title}
      </div>
      <div
        className='cursor-default overflow-hidden transition-all duration-300'
        style={{ maxHeight: isOpen ? '250px' : '0' }}
      >
        <div
          className='overflow-auto border-y border-gray-300'
          style={{ maxHeight: '250px' }}
        >
          <SidebarBrowser
            files={files}
            openDirectory={openDirectory}
            currentDirectory={currentDirectory}
          />
        </div>
      </div>
    </div>
  );
};

export default AllFilesMenuItem;
