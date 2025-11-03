import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => {
  console.log("App ultra-minimal rendered");

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#e0f7fa',
        }}>
          <h1 style={{ color: '#00796b', fontSize: '2rem' }}>
            Ultra Minimal - QueryClient + BrowserRouter OK
          </h1>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
