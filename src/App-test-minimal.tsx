import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendered - Test minimal");

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
      }}>
        <h1 style={{ color: '#333', fontSize: '2rem' }}>
          Test Minimal - QueryClient OK
        </h1>
      </div>
    </QueryClientProvider>
  );
};

export default App;
