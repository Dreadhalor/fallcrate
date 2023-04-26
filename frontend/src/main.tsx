import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import FirebaseProvider from './providers/FirebaseProvider';
import { FileManagementProvider } from './providers/FileManagementProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FirebaseProvider>
      <FileManagementProvider>
        <App />
      </FileManagementProvider>
    </FirebaseProvider>
  </React.StrictMode>
);
