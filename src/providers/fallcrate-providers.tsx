import React from 'react';
import { FilesystemProvider } from '@fallcrate/providers/filesystem-provider';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { ContextMenuProvider } from './file-context-menu-provider';
import { FileViewerProvider } from './file-viewer-provider';

type Props = {
  children: React.ReactNode;
};

export const FallcrateProviders: React.FC<Props> = ({ children }) => {
  return (
    <FileViewerProvider>
      <FilesystemProvider>
        <DndProvider backend={HTML5Backend}>
          <ContextMenuProvider>{children}</ContextMenuProvider>
        </DndProvider>
      </FilesystemProvider>
    </FileViewerProvider>
  );
};
