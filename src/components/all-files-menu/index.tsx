import { useState } from 'react';
import { AllFilesMenuHeader } from './all-files-menu-header';
import { AllFilesMenuBody } from './all-files-menu-body';

const AllFilesMenu = () => {
  const [isOpen, setIsOpen] = useState(true);

  const max_height = 500;

  return (
    <div className='flex cursor-pointer flex-col'>
      <AllFilesMenuHeader isOpen={isOpen} setIsOpen={setIsOpen} />
      <AllFilesMenuBody isOpen={isOpen} maxHeight={max_height} />
    </div>
  );
};

export { AllFilesMenu };
