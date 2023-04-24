import { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { File } from '../../helpers';
import { Collapse } from 'react-collapse';
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
  const [dragover, setDragover] = useState(false);

  const max_height = 500;

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
      <Collapse isOpened={isOpen} initialStyle={{ height: max_height }}>
        <div
          className={`relative max-h-[${max_height}px] overflow-auto border-y border-gray-300`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragover(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragover(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragover(false);
          }}
        >
          {dragover && (
            <div
              className='pointer-events-none absolute inset-[1px] z-10'
              style={{ border: '2px dashed blue' }}
            ></div>
          )}
          <SidebarBrowser
            files={files}
            openDirectory={openDirectory}
            currentDirectory={currentDirectory}
            moveFiles={moveFiles}
          />
        </div>
      </Collapse>
    </div>
  );
};

export default AllFilesMenuItem;
