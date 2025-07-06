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
import FormBusinessIdea from "./pages/FormBusinessIdea";
import ProjectBusiness from "./pages/ProjectBusiness";
import WarningPage from "./pages/WarningPage";
import Outils from "./pages/Outils";
import Partenaires from "./pages/Partenaires";
import Roadmap from "./pages/Roadmap";
import Ressources from "./pages/Ressources"; // Import the new Ressources component
import Collaborateurs from "./pages/Collaborateurs"; // Import the new Collaborateurs component
import ChatbotPage from "./pages/ChatbotPage";
import ProtectedLayout from "./components/ProtectedLayout";
import { ProjectProvider } from "./contexts/ProjectContext";

import { useState, useEffect, ErrorInfo, Component } from "react";
import { supabase } from "@/integrations/supabase/client";
import useMounted from "./hooks/useMounted"; // Import the new hook

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
  const mounted = useMounted(); // Use the new hook

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session:", session);
        if (mounted.current) { // Only update state if component is still mounted
          setIsAuthenticated(!!session);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        if (mounted.current) { // Only update state if component is still mounted
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      if (mounted.current) { // Only update state if component is still mounted
        setIsAuthenticated(!!session);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [mounted]); // Add mounted to dependency array

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("Authenticated, rendering protected content");
  return <Outlet />;
};


const App = () => {
  console.log("App component rendered");

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ProjectProvider>
                <Routes>
                {/* Public routes without sidebar */}
                <Route path="/beta" element={<Beta />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                
                {/* Protected routes with sidebar */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<ProtectedLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/automatisations" element={<Automatisations />} />
                    <Route path="/knowledge" element={<Knowledge />} />
                    <Route path="/project/:projectId" element={<Project />} />
                    <Route path="/project-business/:projectId" element={<ProjectBusiness />} />
                    <Route path="/project-business" element={<ProjectBusiness />} />
                    <Route path="/warning" element={<WarningPage />} />
                    <Route path="/form-business-idea" element={<FormBusinessIdea />} />
                    <Route path="/outils" element={<Outils />} />
                    <Route path="/partenaires" element={<Partenaires />} />
                    <Route path="/ressources" element={<Ressources />} /> {/* New route for Ressources */}
                    <Route path="/collaborateurs" element={<Collaborateurs />} /> {/* New route for Collaborateurs */}
                    <Route path="/roadmap/:id" element={<Roadmap />} />
                    <Route path="/chatbot/:projectId" element={<ChatbotPage />} />
                  </Route>
                </Route>
                
                <Route path="/" element={<Navigate to="/beta" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ProjectProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
