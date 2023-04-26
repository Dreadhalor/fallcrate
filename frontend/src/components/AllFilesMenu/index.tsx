import { useState } from 'react';
import AllFilesMenuHeader from './AllFilesMenuHeader';
import AllFilesMenuBody from './AllFilesMenuBody';

const AllFilesMenu = () => {
  const [isOpen, setIsOpen] = useState(true);

  const max_height = 500;

  return (
    <div className='flex cursor-pointer flex-col'>
      <AllFilesMenuHeader
        title='All Files'
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <AllFilesMenuBody isOpen={isOpen} maxHeight={max_height} />
    </div>
  );
};

export default AllFilesMenu;
