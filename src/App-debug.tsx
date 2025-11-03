import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

const DebugInfo = ({ step }: { step: string }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: 20,
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 10000,
      maxWidth: '400px'
    }}>
      <h3 style={{ color: 'green', marginBottom: '10px' }}>✅ App Debug</h3>
      <p><strong>Current Step:</strong> {step}</p>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        Si vous voyez ce message, React fonctionne.
      </p>
    </div>
  );
};

const App = () => {
  const [step, setStep] = useState('Initialisation...');

  useEffect(() => {
    console.log("=== APP DEBUG MODE ===");
    setStep('App mounted');

    setTimeout(() => setStep('QueryClient initialized'), 100);
    setTimeout(() => setStep('BrowserRouter ready'), 200);
    setTimeout(() => setStep('All providers loaded'), 300);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DebugInfo step={step} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h1 style={{ color: '#333', fontSize: '2rem' }}>
            Mode Debug
          </h1>
          <p style={{ color: '#666' }}>
            L'application se charge correctement jusqu'ici.
          </p>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <p><strong>Étape actuelle:</strong> {step}</p>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
