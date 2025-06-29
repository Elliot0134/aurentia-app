import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UpdatePassword from "./pages/UpdatePassword";
import Beta from "./pages/Beta";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Automatisations from "./pages/Automatisations";
import Knowledge from "./pages/Knowledge";
import Project from "./pages/Project";
import NotFound from "./pages/NotFound";
import Form from "./pages/Form";
import FormBusinessIdea from "./pages/FormBusinessIdea";
import ProjectBusiness from "./pages/ProjectBusiness";
import WarningPage from "./pages/WarningPage";
import Outils from "./pages/Outils";
import ChatbotPage from "./pages/ChatbotPage";
import Sidebar from "./components/Sidebar";
import { ProjectProvider } from "./contexts/ProjectContext";
import { useState, useEffect, ErrorInfo, Component, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BETA_CODE_VALIDATED_KEY } from "@/lib/utils";

import "./index.css";

const queryClient = new QueryClient();

// Error Boundary Component
class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean; error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("Error boundary caught an error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">An error occurred while loading the application.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
            <pre className="mt-4 text-xs text-left bg-gray-100 p-4 rounded overflow-auto max-w-lg">
              {this.state.error?.toString()}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("ProtectedRoute: checkAuth initiated.");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("ProtectedRoute: Error getting session:", error);
          setIsAuthenticated(false);
        } else {
          console.log("ProtectedRoute: Session data:", session);
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error("ProtectedRoute: Exception during session check:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        console.log("ProtectedRoute: checkAuth completed. isAuthenticated:", !!isAuthenticated);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("ProtectedRoute: Auth state changed event:", _event, "session:", session);
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    console.log("ProtectedRoute: Loading authentication status...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute: Authenticated, rendering protected content.");
  return <Outlet />;
};


const App = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [betaValidated, setBetaValidated] = useState(() => {
    return localStorage.getItem(BETA_CODE_VALIDATED_KEY) === "true";
  });

  console.log("App component rendered");

  useEffect(() => {
    console.log("App useEffect triggered");
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      console.log("Mobile view:", isMobileView);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const handleBetaValidated = useCallback(() => {
    localStorage.setItem(BETA_CODE_VALIDATED_KEY, "true");
    setBetaValidated(true);
  }, []);

  console.log("App component rendering with isMobile:", isMobile, "betaValidated:", betaValidated);

  if (!betaValidated) {
    return <Beta onBetaValidated={handleBetaValidated} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ProjectProvider>
              <div className="flex min-h-screen bg-[#F9F6F2]">
                <Sidebar />
                <main className={`flex-grow ${!isMobile ? 'md:ml-64' : ''}`}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/automatisations" element={<Automatisations />} />
                      <Route path="/knowledge" element={<Knowledge />} />
                      <Route path="/project/:projectId" element={<Project />} />
                      <Route path="/project-business/:projectId" element={<ProjectBusiness />} />
                      <Route path="/project-business" element={<ProjectBusiness />} />
                      <Route path="/warning" element={<WarningPage />} />
                      <Route path="/form" element={<Form />} />
                      <Route path="/form-business-idea" element={<FormBusinessIdea />} />
                      <Route path="/outils" element={<Outils />} />
                      <Route path="/chatbot/:projectId" element={<ChatbotPage />} /> {/* New route for chatbot */}
                    </Route>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </ProjectProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
