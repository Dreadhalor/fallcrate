// Dashboard.tsx
import { Resizable } from 're-resizable';
import AllFilesMenu from '../AllFilesMenu';
import MainContent from '../MainContent/MainContent';
import { useState } from 'react';

import './Dashboard.scss';

const Dashboard = () => {
  const setHandleEmphasis = (type: 'hover' | 'drag', active: boolean) => {
    const handle = document.querySelector('.resize-right-handle');
    if (handle) {
      handle.classList.remove('hover-highlight');
      handle.classList.remove('drag-highlight');
      const className = type === 'hover' ? 'hover-highlight' : 'drag-highlight';
      if (active) handle.classList.add(className);
    }
  };
  const [resizing, setResizing] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  const onMouseEnter = () => {
    if (!resizing) setHandleEmphasis('hover', true);
  };

  const onMouseLeave = () => {
    if (!resizing && !mouseDown) setHandleEmphasis('hover', false);
  };

  return (
    <div id='dashboard' className='flex flex-1 flex-row overflow-hidden'>
      <Resizable
        className='bg-faded-bg z-20 h-full border-r border-faded_border bg-faded_bg'
        defaultSize={{
          width: 250,
          height: '100%',
        }}
        minWidth={100}
        maxWidth={500}
        enable={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        handleComponent={{
          right: (
            <div
              className='resize-right-handle h-full'
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            />
          ),
        }}
        onResizeStart={() => {
          setResizing(true);
          setHandleEmphasis('drag', true);
        }}
        onResizeStop={() => {
          setResizing(false);
          setMouseDown(false);
          setHandleEmphasis('drag', false);
        }}
      >
        <div id='sidebar' className='h-full w-full'>
          <AllFilesMenu />
        </div>
      </Resizable>
      <MainContent />
    </div>
  );
};

export default Dashboard;
