import React, { useEffect, useState } from 'react';
import { FaChevronRight, FaFolder } from 'react-icons/fa';
import { BsDot } from 'react-icons/bs';
import { File } from '../../helpers';

type Props = {
  file: File;
  files: File[];
  currentDirectory: string | null;
  openDirectory: (file_id: string | null) => void;
};

const SidebarBrowserItem = ({
  file,
  files,
  currentDirectory,
  openDirectory,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [childFolders, setChildFolders] = useState<File[]>([]);

  useEffect(() => {
    setChildFolders(
      files.filter((f) => f.parent === file.id && f.type === 'directory')
    );
  }, [files, file.id]);

  const background =
    currentDirectory === file.id
      ? 'bg-[rgba(0,97,254,0.16)]'
      : 'hover:bg-gray-100';

  return (
    <div className='flex flex-col pl-[10px] text-xs'>
      <div
        className={`flex cursor-pointer flex-row items-center gap-[5px] p-[4px] ${background}`}
        onClick={() => {
          if (currentDirectory === file.id) setIsOpen((prev) => !prev);
          else openDirectory(file.id);
        }}
      >
        {childFolders.length > 0 ? (
          <div
            className='cursor-pointer p-[5px] hover:bg-gray-300'
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
          >
            <FaChevronRight
              size={8}
              className='duration-50 transition-transform'
              style={{
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
          </div>
        ) : (
          <div className='p-[5px]'>
            <BsDot size={8} />
          </div>
        )}
        <FaFolder />
        {file.name}
      </div>
      <div style={{ display: isOpen ? 'block' : 'none' }}>
        {childFolders.map((child) => (
          <SidebarBrowserItem
            file={child}
            files={files}
            key={child.id}
            currentDirectory={currentDirectory}
            openDirectory={openDirectory}
          />
        ))}
      </div>
    </div>
  );
};

export default SidebarBrowserItem;
