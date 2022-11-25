import { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { HiChevronDoubleDown } from 'react-icons/hi';
import { File } from '../../helpers';
import AnimatedDropdown from '../utilities/AnimatedDropdown';
import SidebarBrowser from './SidebarBrowser';

type Props = {
  title: string;
  files: File[];
  currentDirectory: string | null;
  openDirectory: (file_id: string | null) => void;
  moveFiles: (file_ids: string[], destination_id: string | null) => void;
};

const AllFilesMenuItem = ({
  title,
  files,
  currentDirectory,
  openDirectory,
  moveFiles,
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
        <HiChevronDoubleDown size={14} className='ml-auto' />
      </div>
      <AnimatedDropdown
        isOpen={isOpen}
        maxHeight='250px'
        border='border-y border-gray-300'
        dragOutline={true}
      >
        <SidebarBrowser
          files={files}
          openDirectory={openDirectory}
          currentDirectory={currentDirectory}
          moveFiles={moveFiles}
        />
      </AnimatedDropdown>
    </div>
  );
};

export default AllFilesMenuItem;
