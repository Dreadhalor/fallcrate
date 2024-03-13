// Dashboard.tsx
import { Resizable } from 're-resizable';
import { MainContent } from '../main-content/main-content';
import { useRef, useState } from 'react';

import './dashboard.scss';
import { useAchievements } from 'dread-ui';
import { FaChevronLeft } from 'react-icons/fa';
import { MouseEvent } from 'react';
import { Sidebar } from './sidebar';

const Dashboard = () => {
  const { unlockAchievementById } = useAchievements();

  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const setHandleEmphasis = (type: 'hover' | 'drag', active: boolean) => {
    if (resizeHandleRef.current) {
      resizeHandleRef.current.classList.remove('hover-highlight');
      resizeHandleRef.current.classList.remove('drag-highlight');
      const className = type === 'hover' ? 'hover-highlight' : 'drag-highlight';
      if (active) resizeHandleRef.current.classList.add(className);
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

  const quick_collapse_size = 26;
  const collapsed_width = 20;
  const schwarzchild_width = 160;
  const default_width = 250;

  const collapseSidebar = () => {
    setWidth(collapsed_width);
    // setLastStaticWidth(collapsed_width);
    unlockAchievementById('collapse_sidebar', 'fallcrate');
  };

  const expandSidebar = () => {
    setWidth(default_width);
    // setLastStaticWidth(default_width);
  };

  const handleQuickCollapseClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (width > schwarzchild_width) {
      collapseSidebar();
    } else {
      expandSidebar();
    }
  };

  const [width, setWidth] = useState(default_width);
  // for tracking whether the sidebar is already collapsed
  // const [lastStaticWidth, setLastStaticWidth] = useState(default_width);

  const sidebarStyle: React.CSSProperties = {
    opacity: width > schwarzchild_width ? 1 : 0,
    pointerEvents: width > schwarzchild_width ? 'auto' : 'none',
  };

  return (
    <div id='dashboard' className='flex flex-1 flex-row overflow-hidden'>
      <Resizable
        className='bg-faded-bg border-faded_border bg-faded_bg z-20 h-full border-r'
        size={{
          width: width,
          height: '100%',
        }}
        style={{
          transition: resizing ? '' : 'width 0.2s ease-in-out',
        }}
        minWidth={collapsed_width}
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
              className='resize-right-handle group relative h-full'
              ref={resizeHandleRef}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              <button
                className={`collapse-button border-faded_border hover:bg-faded_bg absolute top-[9px] z-20 flex cursor-pointer items-center justify-center rounded-full border-2 bg-white opacity-0 group-hover:opacity-100 group-active:opacity-100 ${
                  width > schwarzchild_width ? '' : 'opacity-100'
                }`}
                style={{
                  left: `${5 - quick_collapse_size / 2}px`,
                  width: `${quick_collapse_size}px`,
                  height: `${quick_collapse_size}px`,
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => handleQuickCollapseClick(e)}
              >
                <FaChevronLeft
                  className='collapse-button__icon'
                  size={10}
                  style={{
                    transform:
                      width > schwarzchild_width ? '' : 'rotate(180deg)',
                  }}
                />
              </button>
            </div>
          ),
        }}
        onResizeStart={() => {
          setMouseDown(true);
          setHandleEmphasis('drag', true);
        }}
        onResize={(e, dir, ref) => {
          setResizing(true);
          setWidth(ref.offsetWidth);
        }}
        onResizeStop={() => {
          if (resizing) unlockAchievementById('resize_sidebar', 'fallcrate');
          setResizing(false);
          setMouseDown(false);
          setHandleEmphasis('drag', false);
          // this doesn't collapse the sidebar if you drag it exactly to the collapsed width
          // I could fix this but I'll make it an achievement instead
          if (width < schwarzchild_width) {
            collapseSidebar();
          } else {
            if (width === schwarzchild_width)
              unlockAchievementById('sidebar_pixel_perfect', 'fallcrate');
            // setLastStaticWidth(width);
          }
        }}
      >
        <Sidebar style={sidebarStyle} />
      </Resizable>
      <MainContent />
    </div>
  );
};

export { Dashboard };
