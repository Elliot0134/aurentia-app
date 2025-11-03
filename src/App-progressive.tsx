import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import { UserProvider } from "./contexts/UserContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import { VoiceQuotaProvider } from "./contexts/VoiceQuotaContext";
import { CreditsDialogProvider } from "./contexts/CreditsDialogContext";
import { DeliverablesLoadingProvider } from "./contexts/DeliverablesLoadingContext";
import PendingInvitationsProvider from "./components/collaboration/PendingInvitationsProvider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const DebugPanel = () => (
  <div style={{
    position: 'fixed',
    top: 10,
    right: 10,
    background: 'lightgreen',
    padding: '10px',
    borderRadius: '4px',
    zIndex: 10000,
    fontSize: '12px'
  }}>
    ✅ Tous les providers chargés
  </div>
);

const App = () => {
  console.log("App-progressive rendered");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UserProvider>
            <ProjectProvider>
              <VoiceQuotaProvider>
                <CreditsDialogProvider>
                  <PendingInvitationsProvider>
                    <DeliverablesLoadingProvider>
                      <DebugPanel />
                      <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={
                          <div style={{ padding: '40px', textAlign: 'center' }}>
                            <h1>Test Progressive</h1>
                            <p>Tous les providers sont chargés ✅</p>
                            <p style={{ marginTop: '20px', color: '#666' }}>
                              Routes: /login, /dashboard
                            </p>
                          </div>
                        } />
                      </Routes>
                    </DeliverablesLoadingProvider>
                  </PendingInvitationsProvider>
                </CreditsDialogProvider>
              </VoiceQuotaProvider>
            </ProjectProvider>
          </UserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
