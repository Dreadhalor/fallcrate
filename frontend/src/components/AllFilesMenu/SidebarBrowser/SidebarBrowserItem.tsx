import React, { useEffect, useState } from 'react';
import { FaChevronRight, FaFolder } from 'react-icons/fa';
import { BsDot } from 'react-icons/bs';
import { Collapse } from 'react-collapse';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useFilesystem } from '@providers/FilesystemProvider';
import TruncatedText from '@components/utilities/TruncatedText';
import { createDragImage } from '@src/helpers';
import { CustomFile } from '@src/types';

type Props = {
  file: CustomFile;
  indentLevel?: number;
};

const SidebarBrowserItem = ({ file, indentLevel = 0 }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [childFolders, setChildFolders] = useState<CustomFile[]>([]);
  const [dragover, setDragover] = useState(false);
  const display_id = `file-${file.id}`;

  const { files, currentDirectory, openDirectory, moveFiles } = useFilesystem();

  useEffect(() => {
    setChildFolders(
      files.filter((f) => f.parent === file.id && f.type === 'directory')
    );
  }, [files, file.id]);

  const isCurrentDirectory = currentDirectory === file.id;

  const background_1 = isCurrentDirectory
    ? 'bg-[rgba(0,97,254,0.16)]'
    : 'hover:bg-gray-100';
  const background_2 = dragover
    ? 'bg-[rgba(0,97,254,0.16)]'
    : 'hover:bg-gray-100';
  const background = dragover ? background_2 : background_1;

  const left_margin = 20;
  const indent_margin = 10;

  const [isTruncated, setIsTruncated] = useState(false);

  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragover(true);
  };

  const drag = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('file_id', file.id);
    const dragImage = createDragImage(file.name);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const dragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    const dragImage = document.querySelector('.drag-image');
    if (dragImage) {
      document.body.removeChild(dragImage);
    }
  };

  const drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file_id = e.dataTransfer.getData('file_id');
    if (file_id) moveFiles([file_id], file.id);
    setDragover(false);
  };

  return (
    <div className='flex cursor-pointer flex-col text-xs'>
      <div
        className={`flex flex-row items-center gap-[5px] px-[4px] ${background} group`}
        style={{
          paddingLeft: `${indentLevel * indent_margin + left_margin}px`,
        }}
        onClick={() => {
          if (isCurrentDirectory) setIsOpen((prev) => !prev);
          else openDirectory(file.id);
        }}
        draggable
        onDragStart={drag}
        onDragOver={allowDrop}
        onDragLeave={() => setDragover(false)}
        onDragEnd={dragEnd}
        onDrop={drop}
      >
        {childFolders.length > 0 ? (
          <div
            className={`rounded-sm p-[5px] transition-colors duration-200 hover:bg-gray-300 ${
              isCurrentDirectory ? 'group-hover:bg-[#c0c6ce]' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
          >
            <FaChevronRight
              size={8}
              className='transition-transform duration-100'
              style={{
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
          </div>
        ) : (
          <div className='p-[5px]'>
            <BsDot size={8} />
          </div>
        )}
        <FaFolder className='flex-shrink-0' />
        {/* add a tooltip of the file name when hovering over the file name */}
        <div className='min-w-0 py-[4px]' id={display_id}>
          <TruncatedText text={file.name} truncationChange={setIsTruncated} />
        </div>
        {isTruncated && (
          <Tooltip
            anchorSelect={`#${display_id}`}
            content={file.name}
            positionStrategy='fixed'
          />
        )}
      </div>
      <Collapse isOpened={isOpen}>
        {childFolders.map((child) => (
          <SidebarBrowserItem
            file={child}
            indentLevel={indentLevel + 1}
            key={child.id}
          />
        ))}
      </Collapse>
    </div>
  );
};

export default SidebarBrowserItem;
