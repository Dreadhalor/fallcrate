import React, { useState } from 'react';

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
  const [dragover, setDragover] = useState(false);

  return (
    <div
      className='relative cursor-default'
      style={{ maxHeight: isOpen ? maxHeight : '0px' }}
    >
      {dragOutline && (
        <div
          className='pointer-events-none absolute inset-[1px] z-10'
          style={{ border: dragover ? '2px dashed blue' : 'none' }}
        ></div>
      )}
      <div
        className={`overflow-auto ${border}`}
        style={{ maxHeight }}
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
        {children}
      </div>
    </div>
  );
};
export default Collapse;
