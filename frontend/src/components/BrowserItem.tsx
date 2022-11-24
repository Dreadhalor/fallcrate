import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { File } from '../App';

type Props = {
  file: File;
  isSelected: boolean;
  selectFile: (file_id: string) => void;
};

const BrowserItem = ({ file, isSelected, selectFile }: Props) => {
  return (
    <div className='group flex w-full flex-row items-center border bg-white'>
      <div className='p-[5px]'>
        <div
          className='flex h-[25px] w-[25px] items-center justify-center border-gray-500 bg-white hover:bg-gray-200 group-hover:border'
          onClick={() => selectFile(file.id)}
        >
          {isSelected && <FaCheck />}
        </div>
      </div>
      <div className='h-full flex-1 cursor-pointer px-[10px] py-[4px] align-baseline group-hover:bg-gray-100'>
        {file.name}
      </div>
    </div>
  );
};

export default BrowserItem;
