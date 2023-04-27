import React from 'react';
import { useDrop } from 'react-dnd';

type Props = {
  isOpen: boolean;
  children: React.ReactNode;
  maxHeight?: string;
  border?: string;
  dragOutline?: boolean;
};

const Collapse = ({
  maxHeight,
  isOpen,
  border,
  children,
  dragOutline = false,
}: Props) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'file',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      className='relative cursor-default'
      style={{ maxHeight: isOpen ? maxHeight : '0px' }}
    >
      {dragOutline && (
        <div
          className='pointer-events-none absolute inset-[1px] z-10'
          style={{ border: isOver ? '2px dashed blue' : 'none' }}
        ></div>
      )}
      <div
        ref={drop}
        className={`overflow-auto ${border}`}
        style={{ maxHeight }}
      >
        {children}
      </div>
    </div>
  );
};
export default Collapse;
