import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

type Props = {
  title: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AllFilesMenuHeader = ({ title, isOpen, setIsOpen }: Props) => {
  return (
    <div
      className='group flex flex-row items-center gap-[5px] py-[10px] pr-[20px] pl-[10px]'
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <div
        className='rounded-sm p-[5px] transition-colors duration-200 group-hover:bg-gray-300'
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

      {title}
    </div>
  );
};

export default AllFilesMenuHeader;
