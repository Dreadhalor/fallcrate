import React from 'react';
import { FirebaseProvider } from '@providers/FirebaseProvider';
import { FilesystemProvider } from '@providers/FilesystemProvider';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { ContextMenuProvider } from './FileContextMenuProvider';
import { MilestoneProvider } from 'milestone-components';

type Props = {
  children: React.ReactNode;
};

export const FallcrateProviders: React.FC<Props> = ({ children }) => {
  return (
    <FirebaseProvider>
      <MilestoneProvider app='fallcrate'>
        <FilesystemProvider>
          <DndProvider backend={HTML5Backend}>
            <ContextMenuProvider>
              <>{children}</>
            </ContextMenuProvider>
          </DndProvider>
        </FilesystemProvider>
      </MilestoneProvider>
    </FirebaseProvider>
  );
};
