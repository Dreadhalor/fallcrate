import React, { useRef, useState } from 'react';

type Props = {
  isOpen: boolean;
  children: React.ReactNode;
  maxHeight?: string;
  border?: string;
  dragOutline?: boolean;
};

// this only animates to an explicit height, not to auto
const AnimatedDropdown = ({
  maxHeight,
  isOpen,
  border,
  children,
  dragOutline = false,
}: Props) => {
  const [dragover, setDragover] = useState(false);

  const default_max_height = '500px';
  const max_height = maxHeight ?? default_max_height;

  const size_ref = useRef<HTMLDivElement>(null);
  return (
    <div
      className='relative cursor-default overflow-hidden transition-all duration-200'
      style={{ maxHeight: isOpen ? max_height : '0' }}
    >
      {dragOutline && (
        <div
          className='pointer-events-none absolute inset-[1px] z-10'
          style={{ border: dragover ? '2px dashed blue' : 'none' }}
        ></div>
      )}
      <div
        ref={size_ref}
        className={`overflow-auto ${border}`}
        style={{
          maxHeight: max_height,
        }}
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
export default AnimatedDropdown;
