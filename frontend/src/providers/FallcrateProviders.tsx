import React from 'react';
import { FirebaseProvider } from '@providers/FirebaseProvider';
import { FilesystemProvider } from '@providers/FilesystemProvider';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { ContextMenuProvider } from './FileContextMenuProvider';
import { MilestoneProvider } from 'milestone-components';
import { ImageModalProvider } from './ImageModalProvider';

type Props = {
  children: React.ReactNode;
};

export const FallcrateProviders: React.FC<Props> = ({ children }) => {
  return (
    <FirebaseProvider>
      <MilestoneProvider app='fallcrate'>
        <ImageModalProvider>
          <FilesystemProvider>
            <DndProvider backend={HTML5Backend}>
              <ContextMenuProvider>{children}</ContextMenuProvider>
            </DndProvider>
          </FilesystemProvider>
        </ImageModalProvider>
      </MilestoneProvider>
    </FirebaseProvider>
  );
};
