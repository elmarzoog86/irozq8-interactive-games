import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { TwitchAuthProvider } from './contexts/TwitchAuthContext';
import App from './App.tsx';
import { AdminOverlay } from './components/AdminOverlay';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TwitchAuthProvider>
        <AdminOverlay />
        <App />
      </TwitchAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
