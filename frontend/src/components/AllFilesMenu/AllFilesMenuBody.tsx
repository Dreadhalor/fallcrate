import { useState } from 'react';
import { Collapse } from 'react-collapse';
import SidebarBrowser from './SidebarBrowser';

type Props = {
  isOpen: boolean;
  maxHeight: number;
};

const AllFilesMenuBody = ({ isOpen, maxHeight }: Props) => {
  const [dragover, setDragover] = useState(false);

  return (
    <Collapse isOpened={isOpen}>
      <div
        className={`relative max-h-[${maxHeight}px] overflow-auto border-y border-gray-300`}
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
        <SidebarBrowser />
      </div>
    </Collapse>
  );
};

export default AllFilesMenuBody;
