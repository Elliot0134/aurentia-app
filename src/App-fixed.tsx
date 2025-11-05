import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ConfirmEmail from "./pages/ConfirmEmail";
import VerifyEmail from "./pages/VerifyEmail";
import UpdateEmailConfirm from "./pages/UpdateEmailConfirm";
import UpdatePassword from "./pages/UpdatePassword";
import AcceptInvitation from "./pages/AcceptInvitation";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import OrganisationRedirect from "./pages/OrganisationRedirect";
import Automatisations from "./pages/Automatisations";
import Knowledge from "./pages/Knowledge";
import Project from "./pages/Project";
import NotFound from "./pages/NotFound";
import FormBusinessIdea from "./pages/FormBusinessIdea";
import ProjectBusiness from "./pages/ProjectBusiness";
import WarningPage from "./pages/WarningPage";
import Outils from "./pages/Outils";
import ToolDetailPage from "./pages/individual/ToolDetailPage";
import Partenaires from "./pages/Partenaires";
import Roadmap from "./pages/Roadmap";
import Ressources from "./pages/Ressources";
import Collaborateurs from "./pages/Collaborateurs";
import TemplatePage from "./pages/TemplatePage";
import ToolTemplatePage from "./pages/ToolTemplatePage";
import ComponentsTemplate from "./pages/individual/ComponentsTemplate";
import ChatbotPage from "./pages/ChatbotPage";
import PlanActionPage from "./pages/PlanActionPage";
import KnowledgeBase from "./pages/individual/KnowledgeBase";
import Integrations from "./pages/individual/Integrations";
import Onboarding from "./pages/Onboarding";
import RoleBasedLayout from "./components/RoleBasedLayout";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import MyOrganization from "./pages/MyOrganization";
import OrganisationRouteGuard from "./components/organisation/OrganisationRouteGuard";
import {
  OrganisationDashboard,
  OrganisationAnalytics,
  OrganisationChatbot,
  OrganisationEvenements,
  OrganisationMentors,
  OrganisationStaff,
  OrganisationProjets,
  OrganisationRessources,
  OrganisationRessourcesCreate,
  OrganisationRessourcesDetail,
  OrganisationAdherents,
  OrganisationInvitations,
  OrganisationForms,
  OrganisationSettings,
  OrganisationPartenaires,
  OrganisationProfile,
  OrganisationFormCreate,
  OrganisationIntegrations
} from "./pages/organisation";
import OrganisationMentorProfile from "./pages/organisation/OrganisationMentorProfile";
import OrganisationNewsletters from "./pages/organisation/OrganisationNewsletters";
import NewsletterEditor from "./pages/organisation/NewsletterEditor";
import NewsletterDetail from "./pages/organisation/NewsletterDetail";
import OrganisationKnowledgeBase from "./pages/organisation/OrganisationKnowledgeBase";
import SetupOrganization from "./pages/SetupOrganization";
import AuthCallback from "./pages/AuthCallback";
import Messages from "./pages/Messages";
import { ProjectProvider } from "./contexts/ProjectContext";
import { CreditsDialogProvider } from "./contexts/CreditsDialogContext";
import { UserProvider } from "./contexts/UserContext";
import { VoiceQuotaProvider } from "./contexts/VoiceQuotaContext";
import { DeliverablesLoadingProvider } from "./contexts/DeliverablesLoadingContext";
import BuyCreditsDialog from "./components/subscription/BuyCreditsDialog";
import PendingInvitationsProvider from "./components/collaboration/PendingInvitationsProvider";
import StyleguidePage from "./pages/StyleguidePage";
import StyleguideGuard from "./components/styleguide/StyleguideGuard";
import CreateProjectForm from "./pages/individual/CreateProjectForm";

import { useState, useEffect, useRef, useCallback, Component, ErrorInfo } from "react";
import { supabase } from "@/integrations/supabase/client";

import "./index.css";

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

// Error Boundary Component to catch rendering errors
class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean; error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("🚨 ErrorBoundary caught an error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="text-center p-8 max-w-2xl">
            <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ Application Error</h1>
            <p className="text-gray-700 mb-4">An error occurred while loading the application.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
            >
              Reload Page
            </button>
            <pre className="mt-4 text-xs text-left bg-gray-100 p-4 rounded overflow-auto">
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProtectedRoute = () => {
  console.log('[ProtectedRoute] ✅ Component rendering...');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const mountedRef = useRef(true);
  const authCheckInProgressRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkAuth = useCallback(async () => {
    if (authCheckInProgressRef.current) {
      console.log("[ProtectedRoute] Auth check already in progress, skipping");
      return;
    }

    authCheckInProgressRef.current = true;

    try {
      console.log("[ProtectedRoute] Starting auth check...");

      const timeoutPromise = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Auth check timeout'));
        }, 5000);
      });

      const sessionPromise = supabase.auth.getSession();

      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!mountedRef.current) return;

      if (sessionError) {
        console.error("[ProtectedRoute] Session error:", sessionError);
        setIsAuthenticated(false);
        return;
      }

      if (!session?.user) {
        console.log("[ProtectedRoute] No session found");
        setIsAuthenticated(false);
        return;
      }

      console.log("[ProtectedRoute] Session valid for user:", session.user.id);
      setIsAuthenticated(true);

      try {
        const profilePromise = supabase
          .from('profiles')
          .select('email_confirmation_required, email_confirmed_at')
          .eq('id', session.user.id)
          .single();

        const profileTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
        });

        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          profileTimeoutPromise
        ]) as any;

        if (!mountedRef.current) return;

        if (profileError) {
          console.warn("[ProtectedRoute] Profile fetch error (non-critical):", profileError);
          setNeedsEmailVerification(false);
        } else {
          const needsVerification =
            profileData?.email_confirmation_required !== false ||
            profileData?.email_confirmed_at === null;

          setNeedsEmailVerification(needsVerification);
        }
      } catch (profileErr) {
        console.warn("[ProtectedRoute] Profile check failed (non-critical):", profileErr);
        setNeedsEmailVerification(false);
      }

    } catch (error) {
      console.error("[ProtectedRoute] Auth check error:", error);
      if (mountedRef.current) {
        setIsAuthenticated(false);
      }
    } finally {
      authCheckInProgressRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    console.log("[ProtectedRoute] Mounting, performing initial auth check");

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[ProtectedRoute] Auth state changed:", event);

      if (!mountedRef.current) return;

      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setNeedsEmailVerification(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setTimeout(() => {
          if (mountedRef.current) {
            checkAuth();
          }
        }, 100);
      }
    });

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      authListener.subscription.unsubscribe();
    };
  }, [checkAuth]);

  if (isAuthenticated === null) {
    return <LoadingSpinner message="Chargement..." fullScreen />;
  }

  if (!isAuthenticated) {
    console.log("[ProtectedRoute] Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (needsEmailVerification && window.location.pathname !== '/verify-email') {
    console.log("[ProtectedRoute] Email verification required");
    return <Navigate to="/verify-email" replace />;
  }

  return (
    <>
      <RoleBasedRedirect />
      <Outlet />
    </>
  );
};

const App = () => {
  console.log("🔥 App-fixed component rendered");

  return (
    <ErrorBoundary>
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
                        {console.log('[App] ✅ All providers rendered, rendering BuyCreditsDialog and Routes...')}
                        <BuyCreditsDialog />
                        {console.log('[App] ✅ BuyCreditsDialog rendered, rendering Routes...')}
                        <Routes>
                        {console.log('[App] 🔵 Routes component is rendering...')}
                        {/* Public routes */}
                        <Route path="/login" element={
                          <>
                            {console.log('[App] 🟢 Login route matched!')}
                            <Login />
                          </>
                        } />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
                        <Route path="/accept-invitation" element={<AcceptInvitation />} />
                        <Route path="/update-email-confirm" element={<UpdateEmailConfirm />} />
                        <Route path="/update-password" element={<UpdatePassword />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* Protected routes */}
                        <Route element={<ProtectedRoute />}>
                          <Route path="/onboarding" element={<Onboarding />} />
                          <Route path="/setup-organization" element={<SetupOrganization />} />
                          <Route path="/organisation" element={<OrganisationRedirect />} />

                          <Route element={<RoleBasedLayout />}>
                            <Route path="/individual/dashboard" element={<Dashboard />} />
                            <Route path="/individual/profile" element={<Profile />} />
                            <Route path="/individual/project-business/:projectId" element={<ProjectBusiness />} />
                            <Route path="/individual/project-business" element={<ProjectBusiness />} />
                            <Route path="/individual/chatbot" element={<ChatbotPage />} />
                            <Route path="/individual/chatbot/:projectId" element={<ChatbotPage />} />
                            <Route path="/individual/chatbot/:projectId/:conversationId" element={<ChatbotPage />} />
                            <Route path="/individual/outils" element={<Outils />} />
                            <Route path="/individual/outils/:slug/:id" element={<ToolDetailPage />} />
                            <Route path="/individual/integrations" element={<Integrations />} />
                            <Route path="/individual/ressources" element={<Ressources />} />
                            <Route path="/individual/collaborateurs" element={<Collaborateurs />} />
                            <Route path="/individual/template" element={<TemplatePage />} />
                            <Route path="/individual/template/tool-template" element={<ToolTemplatePage />} />
                            <Route path="/individual/components-template" element={<ComponentsTemplate />} />
                            <Route path="/individual/plan-action" element={<PlanActionPage />} />
                            <Route path="/individual/roadmap/:id" element={<Roadmap />} />
                            <Route path="/individual/project/:projectId" element={<Project />} />
                            <Route path="/individual/form-business-idea" element={<FormBusinessIdea />} />
                            <Route path="/individual/create-project-form" element={<CreateProjectForm />} />
                            <Route path="/individual/warning" element={<WarningPage />} />
                            <Route path="/individual/automatisations" element={<Automatisations />} />
                            <Route path="/individual/knowledge" element={<Knowledge />} />
                            <Route path="/individual/partenaires" element={<Partenaires />} />
                            <Route path="/individual/my-organization" element={<MyOrganization />} />
                            <Route path="/individual/knowledge-base" element={<KnowledgeBase />} />
                            <Route path="/individual/knowledge-base/:projectId" element={<KnowledgeBase />} />
                            <Route path="/messages" element={<Messages />} />

                            {/* Styleguide */}
                            <Route path="/individual/styleguide" element={
                              <StyleguideGuard>
                                <StyleguidePage />
                              </StyleguideGuard>
                            } />

                            {/* Organisation routes */}
                            <Route path="/organisation/:id/dashboard" element={
                              <OrganisationRouteGuard>
                                <OrganisationDashboard />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/adherents" element={
                              <OrganisationRouteGuard>
                                <OrganisationAdherents />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/projets" element={
                              <OrganisationRouteGuard>
                                <OrganisationProjets />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/invitations" element={
                              <OrganisationRouteGuard>
                                <OrganisationInvitations />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/analytics" element={
                              <OrganisationRouteGuard>
                                <OrganisationAnalytics />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/forms" element={
                              <OrganisationRouteGuard>
                                <OrganisationForms />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/integrations" element={
                              <OrganisationRouteGuard>
                                <OrganisationIntegrations />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/settings" element={
                              <OrganisationRouteGuard>
                                <OrganisationSettings />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/evenements" element={
                              <OrganisationRouteGuard>
                                <OrganisationEvenements />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/mentors" element={
                              <OrganisationRouteGuard>
                                <OrganisationMentors />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/staff" element={
                              <OrganisationRouteGuard>
                                <OrganisationStaff />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/my-profile" element={
                              <OrganisationRouteGuard>
                                <OrganisationMentorProfile />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/partenaires" element={
                              <OrganisationRouteGuard>
                                <OrganisationPartenaires />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/ressources" element={
                              <OrganisationRouteGuard>
                                <OrganisationRessources />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/ressources/create" element={
                              <OrganisationRouteGuard>
                                <OrganisationRessourcesCreate />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/ressources/:resourceId" element={
                              <OrganisationRouteGuard>
                                <OrganisationRessourcesDetail />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/knowledge-base" element={
                              <OrganisationRouteGuard>
                                <OrganisationKnowledgeBase />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/chatbot" element={
                              <OrganisationRouteGuard>
                                <OrganisationChatbot />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/chatbot/:conversationId" element={
                              <OrganisationRouteGuard>
                                <OrganisationChatbot />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/newsletters" element={
                              <OrganisationRouteGuard>
                                <OrganisationNewsletters />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/newsletters/create" element={
                              <OrganisationRouteGuard>
                                <NewsletterEditor />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/newsletters/:newsletterId" element={
                              <OrganisationRouteGuard>
                                <NewsletterDetail />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/newsletters/:newsletterId/edit" element={
                              <OrganisationRouteGuard>
                                <NewsletterEditor />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/informations" element={
                              <OrganisationRouteGuard>
                                <OrganisationProfile />
                              </OrganisationRouteGuard>
                            } />
                            <Route path="/organisation/:id/settings" element={
                              <OrganisationRouteGuard requireOwner={true}>
                                <OrganisationSettings />
                              </OrganisationRouteGuard>
                            } />

                            {/* Super admin */}
                            <Route path="/super-admin/organizations" element={<div>Organisations - À créer</div>} />
                            <Route path="/super-admin/users" element={<div>Utilisateurs - À créer</div>} />
                            <Route path="/super-admin/analytics" element={<div>Analytics Global - À créer</div>} />
                            <Route path="/super-admin/invitations" element={<div>Codes d'invitation - À créer</div>} />
                            <Route path="/super-admin/settings" element={<div>Paramètres Super Admin - À créer</div>} />
                          </Route>
                        </Route>

                        {/* Legacy redirects */}
                        <Route path="/dashboard" element={<Navigate to="/individual/dashboard" replace />} />
                        <Route path="/profile" element={<Navigate to="/individual/profile" replace />} />
                        <Route path="/project-business" element={<Navigate to="/individual/project-business" replace />} />
                        <Route path="/outils" element={<Navigate to="/individual/outils" replace />} />
                        <Route path="/ressources" element={<Navigate to="/individual/ressources" replace />} />
                        <Route path="/collaborateurs" element={<Navigate to="/individual/collaborateurs" replace />} />
                        <Route path="/member/*" element={<Navigate to="/individual/dashboard" replace />} />
                        <Route path="/member/incubator" element={<Navigate to="/individual/my-organization" replace />} />
                        <Route path="/" element={
                          <>
                            {console.log('[App] 🔴 Root route matched! Redirecting to /login...')}
                            <Navigate to="/login" replace />
                          </>
                        } />
                        <Route path="*" element={<NotFound />} />
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
    </ErrorBoundary>
  );
};

export default App;
