import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import { FirebaseProvider } from '@providers/FirebaseProvider';
import { FilesystemProvider } from '@providers/FilesystemProvider';
import { DragAndDropProvider } from '@providers/DragAndDropProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FirebaseProvider>
      <FilesystemProvider>
        <DragAndDropProvider>
          <App />
        </DragAndDropProvider>
      </FilesystemProvider>
    </FirebaseProvider>
  </React.StrictMode>
);
