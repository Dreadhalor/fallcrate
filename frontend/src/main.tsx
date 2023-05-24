import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FallcrateProviders } from '@providers/FallcrateProviders';
import './index.scss';
import 'react-tooltip/dist/react-tooltip.css';
import 'react-contexify/ReactContexify.css';
import 'milestone-components/styles.scss';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FallcrateProviders>
      <App />
    </FallcrateProviders>
  </React.StrictMode>
);
