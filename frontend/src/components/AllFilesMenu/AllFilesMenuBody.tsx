import { Collapse } from 'react-collapse';
import SidebarBrowser from './SidebarBrowser';
import { useDrop } from 'react-dnd';

type Props = {
  isOpen: boolean;
  maxHeight: number;
};

const AllFilesMenuBody = ({ isOpen, maxHeight }: Props) => {
  // use drop to show a dashed border when dragging a file over the menu
  // purely for visual purposes
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'file',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <Collapse isOpened={isOpen}>
      <div
        ref={drop}
        className={`relative max-h-[${maxHeight}px] overflow-auto border-y border-gray-300`}
      >
        {isOver && (
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
