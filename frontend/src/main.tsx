import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import { FirebaseProvider } from '@providers/FirebaseProvider';
import { FilesystemProvider } from '@providers/FilesystemProvider';
import { DragAndDropProvider } from '@providers/DragAndDropProvider';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FirebaseProvider>
      <FilesystemProvider>
        <DndProvider backend={HTML5Backend}>
          <DragAndDropProvider>
            <App />
          </DragAndDropProvider>
        </DndProvider>
      </FilesystemProvider>
    </FirebaseProvider>
  </React.StrictMode>
);
