import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ConfirmEmail from "./pages/ConfirmEmail";
import UpdateEmailConfirm from "./pages/UpdateEmailConfirm";
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
import TemplatePage from "./pages/TemplatePage"; // Import the new TemplatePage component
import ToolTemplatePage from "./pages/ToolTemplatePage"; // Import the new ToolTemplatePage component
import ChatbotPage from "./pages/ChatbotPage";
import PlanActionPage from "./pages/PlanActionPage"; // Import the new PlanActionPage component
import ProtectedLayout from "./components/ProtectedLayout";
import RoleBasedLayout from "./components/RoleBasedLayout";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import IncubatorSpace from "./pages/member/IncubatorSpace";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Entrepreneurs from "./pages/admin/Entrepreneurs"; // Import the new Entrepreneurs component
import Projects from "./pages/admin/Projects"; // Import the new Projects component
import Invitations from "./pages/admin/Invitations"; // Import the new Invitations component
import Analytics from "./pages/admin/Analytics"; // Import the new Analytics component
import Forms from "./pages/admin/Forms"; // Import the new Forms component
import Settings from "./pages/admin/Settings"; // Import the new Settings component
import Evenements from "./pages/admin/Evenements"; // Import the new Evenements component
import Mentors from "./pages/admin/Mentors"; // Import the new Mentors component
import AdminPartenaires from "./pages/admin/Partenaires"; // Import the new Partenaires component
import Livrables from "./pages/admin/Livrables"; // Import the new Livrables component
import Chatbot from "./pages/admin/Chatbot"; // Import the new Chatbot component
import AdminProfile from "./pages/admin/Profile"; // Import the new Profile component for admin
import EmailConfirmationsAdmin from "./pages/admin/EmailConfirmations"; // Import the new EmailConfirmations component
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import RoleSelection from "./pages/RoleSelection";
import AuthCallback from "./pages/AuthCallback"; // Import the new AuthCallback component
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
  return (
    <>
      <RoleBasedRedirect />
      <Outlet />
    </>
  );
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
                <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
                <Route path="/update-email-confirm" element={<UpdateEmailConfirm />} />
                {/* <Route path="/role-selection" element={<RoleSelection />} /> */} {/* Supprimé car le rôle est attribué par défaut */}
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} /> {/* Nouvelle route pour le callback SSO */}
                
                {/* Protected routes with role-based redirection and layout */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<RoleBasedLayout />}>
                    
                    {/* Individual (interface actuelle) */}
                    <Route path="/individual/dashboard" element={<Dashboard />} />
                    <Route path="/individual/profile" element={<Profile />} />
                    <Route path="/individual/project-business/:projectId" element={<ProjectBusiness />} />
                    <Route path="/individual/project-business" element={<ProjectBusiness />} />
                    <Route path="/individual/chatbot" element={<ChatbotPage />} />
                    <Route path="/individual/chatbot/:projectId" element={<ChatbotPage />} />
                    <Route path="/individual/outils" element={<Outils />} />
                    <Route path="/individual/ressources" element={<Ressources />} />
                    <Route path="/individual/collaborateurs" element={<Collaborateurs />} />
                    <Route path="/individual/template" element={<TemplatePage />} />
                    <Route path="/individual/template/tool-template" element={<ToolTemplatePage />} />
                    <Route path="/individual/plan-action" element={<PlanActionPage />} />
                    <Route path="/individual/roadmap/:id" element={<Roadmap />} />
                    <Route path="/individual/project/:projectId" element={<Project />} />
                    <Route path="/individual/form-business-idea" element={<FormBusinessIdea />} />
                    <Route path="/individual/warning" element={<WarningPage />} />
                    <Route path="/individual/automatisations" element={<Automatisations />} />
                    <Route path="/individual/knowledge" element={<Knowledge />} />
                    <Route path="/individual/partenaires" element={<Partenaires />} />
                    
                    {/* Member (même interface + espace incubateur) */}
                    <Route path="/member/dashboard" element={<Dashboard />} />
                    <Route path="/member/profile" element={<Profile />} />
                    <Route path="/member/project-business/:projectId" element={<ProjectBusiness />} />
                    <Route path="/member/project-business" element={<ProjectBusiness />} />
                    <Route path="/member/chatbot/:projectId" element={<ChatbotPage />} />
                    <Route path="/member/outils" element={<Outils />} />
                    <Route path="/member/ressources" element={<Ressources />} />
                    <Route path="/member/collaborateurs" element={<Collaborateurs />} />
                    <Route path="/member/template" element={<TemplatePage />} />
                    <Route path="/member/template/tool-template" element={<ToolTemplatePage />} />
                    <Route path="/member/plan-action" element={<PlanActionPage />} />
                    <Route path="/member/roadmap/:id" element={<Roadmap />} />
                    <Route path="/member/project/:projectId" element={<Project />} />
                    <Route path="/member/form-business-idea" element={<FormBusinessIdea />} />
                    <Route path="/member/warning" element={<WarningPage />} />
                    <Route path="/member/automatisations" element={<Automatisations />} />
                    <Route path="/member/knowledge" element={<Knowledge />} />
                    <Route path="/member/partenaires" element={<Partenaires />} />
                    {/* Route spécifique member */}
                    <Route path="/member/incubator" element={<IncubatorSpace />} />
                    
                    {/* Admin incubateur */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/entrepreneurs" element={<Entrepreneurs />} />
                    <Route path="/admin/projects" element={<Projects />} />
                    <Route path="/admin/invitations" element={<Invitations />} />
                    <Route path="/admin/analytics" element={<Analytics />} />
                    <Route path="/admin/forms" element={<Forms />} />
                    <Route path="/admin/settings" element={<Settings />} />
                    <Route path="/admin/evenements" element={<Evenements />} />
                    <Route path="/admin/mentors" element={<Mentors />} />
                    <Route path="/admin/partenaires" element={<AdminPartenaires />} />
                    <Route path="/admin/livrables" element={<Livrables />} />
                    <Route path="/admin/chatbot" element={<Chatbot />} />
                    <Route path="/admin/email-confirmations" element={<EmailConfirmationsAdmin />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                    
                    {/* Super admin */}
                    <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
                    <Route path="/super-admin/organizations" element={<div>Organisations - À créer</div>} />
                    <Route path="/super-admin/users" element={<div>Utilisateurs - À créer</div>} />
                    <Route path="/super-admin/analytics" element={<div>Analytics Global - À créer</div>} />
                    <Route path="/super-admin/invitations" element={<div>Codes d'invitation - À créer</div>} />
                    <Route path="/super-admin/settings" element={<div>Paramètres Super Admin - À créer</div>} />
                    
                  </Route>
                </Route>
                
                {/* Legacy routes - redirect to role-based paths */}
                <Route path="/dashboard" element={<Navigate to="/individual/dashboard" replace />} />
                <Route path="/profile" element={<Navigate to="/individual/profile" replace />} />
                <Route path="/project-business" element={<Navigate to="/individual/project-business" replace />} />
                <Route path="/outils" element={<Navigate to="/individual/outils" replace />} />
                <Route path="/ressources" element={<Navigate to="/individual/ressources" replace />} />
                <Route path="/collaborateurs" element={<Navigate to="/individual/collaborateurs" replace />} />
                
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
