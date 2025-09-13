import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CreditsDialogProvider } from './contexts/CreditsDialogContext.tsx';
import './utils/apiInterceptor'; // Importez l'intercepteur pour qu'il s'exécute

createRoot(document.getElementById("root")!).render(
  <CreditsDialogProvider>
    <App />
  </CreditsDialogProvider>
);
