import AllFilesBreadcrumb from '@components/AllFilesMenu/AllFilesBreadcrumb';
import React, { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AllFilesMenuHeader = ({ isOpen, setIsOpen }: Props) => {
  const [isTopHovered, setIsTopHovered] = useState(false);
  const [isBreadcrumbHovered, setIsBreadcrumbHovered] = useState(false);

  const isHovered = isTopHovered && !isBreadcrumbHovered;

  return (
    <div
      className='flex flex-row items-center gap-[3px] py-[8px] pr-[20px] pl-[10px]'
      onClick={() => setIsOpen((prev) => !prev)}
      onMouseEnter={() => setIsTopHovered(true)}
      onMouseLeave={() => setIsTopHovered(false)}
    >
      <div
        className={`rounded-sm p-[5px] ${
          isHovered ? 'bg-gray-300' : ''
        } transition-colors duration-200`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        <FaChevronRight
          size={10}
          className='h-full transition-transform'
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        />
      </div>
      <AllFilesBreadcrumb
        onMouseEnter={() => setIsBreadcrumbHovered(true)}
        onMouseLeave={() => setIsBreadcrumbHovered(false)}
      />
    </div>
  );
};

export default AllFilesMenuHeader;
