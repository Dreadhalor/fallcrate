import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import FirebaseProvider from './providers/FirebaseProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </React.StrictMode>
);
