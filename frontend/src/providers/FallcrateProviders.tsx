import React from 'react';
import { FirebaseProvider } from '@providers/FirebaseProvider';
import { FilesystemProvider } from '@providers/FilesystemProvider';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

type Props = {
  children: React.ReactNode;
};

export const FallcrateProviders: React.FC<Props> = ({ children }) => {
  return (
    <FirebaseProvider>
      <FilesystemProvider>
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      </FilesystemProvider>
    </FirebaseProvider>
  );
};
