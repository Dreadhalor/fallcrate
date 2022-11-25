import React, { forwardRef, useRef, useState } from 'react';

type Props = {
  isOpen: boolean;
  children: React.ReactNode;
  maxHeight?: string;
  border?: string;
};

// this only animates to an explicit height, not to auto
const AnimatedDropdown = forwardRef(
  ({ maxHeight, isOpen, border, children }: Props, ref: any) => {
    const [dragover, setDragover] = useState(false);

    const default_max_height = '250px';
    const max_height = maxHeight ?? default_max_height;

    const size_ref = useRef<HTMLDivElement>(null);
    return (
      <div
        ref={ref}
        className='relative cursor-default overflow-hidden transition-all duration-300'
        style={{ maxHeight: isOpen ? max_height : '0' }}
      >
        <div
          className='pointer-events-none absolute inset-0 z-10 h-full w-full'
          style={{ border: dragover ? '2px solid red' : 'none' }}
        ></div>
        <div
          ref={size_ref}
          className={`relative overflow-auto ${border}`}
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
  }
);

export default AnimatedDropdown;
