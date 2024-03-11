import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import { FallcrateProviders } from '@fallcrate/providers/fallcrate-providers';
import './index.scss';
import 'react-tooltip/dist/react-tooltip.css';
import 'react-contexify/ReactContexify.css';
import 'dread-ui/style.scss';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { DreadUiProvider } from 'dread-ui';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DreadUiProvider>
      <FallcrateProviders>
        <App />
      </FallcrateProviders>
    </DreadUiProvider>
  </React.StrictMode>,
);
