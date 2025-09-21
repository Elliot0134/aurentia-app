import { useState, useEffect, memo } from "react";
import { UserProfile } from '@/types/userTypes';
import { LayoutDashboard, FileText, MessageSquare, Users, Settings, Building, BarChart3, UserCheck, Code, Briefcase, Handshake, LandPlot, ChevronLeft, Library, Coins, LogOut, Zap, Menu, X, FormInput, Calendar, GraduationCap, Bot } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AurentiaLogo from './AurentiaLogo';
import ProjectSelector from "./ProjectSelector";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/contexts/ProjectContext";
import { useCreditsSimple } from "@/hooks/useCreditsSimple";
import clsx from 'clsx';

interface SidebarConfig {
  menuItems: Array<{
    name?: string;
    path?: string;
    icon?: React.ReactNode;
    isDivider?: boolean;
  }>;
  branding: {
    name: string;
    logo?: string;
    primaryColor?: string;
  };
  showProjectSelector?: boolean;
  showCredits?: boolean;
}

interface RoleBasedSidebarProps {
  userProfile: UserProfile | null;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const RoleBasedSidebar = memo(({ userProfile, isCollapsed, setIsCollapsed }: RoleBasedSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { currentProjectId, userProjects } = useProject();
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const credits = useCreditsSimple();

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Use currentProjectId from context, fallback to projectId from URL, or first available project
  const activeProjectId = currentProjectId || projectId || (userProjects.length > 0 ? userProjects[0].project_id : null);
  
  const getSidebarConfig = (): SidebarConfig => {
    if (!userProfile) return getIndividualConfig();

    switch (userProfile.user_role) {
      case 'super_admin':
        return {
          menuItems: [
            { name: "Vue d'ensemble", path: "/super-admin/dashboard", icon: <LayoutDashboard size={20} /> },
            { name: "Organisations", path: "/super-admin/organizations", icon: <Building size={20} /> },
            { name: "Utilisateurs", path: "/super-admin/users", icon: <Users size={20} /> },
            { name: "Analytics Global", path: "/super-admin/analytics", icon: <BarChart3 size={20} /> },
            { name: "Codes d'invitation", path: "/super-admin/invitations", icon: <Code size={20} /> },
            { name: "Paramètres", path: "/super-admin/settings", icon: <Settings size={20} /> }
          ],
          branding: { name: "Aurentia Admin", primaryColor: "#F04F6A" },
          showProjectSelector: false,
          showCredits: false
        };
        
      case 'organisation':
      case 'staff':
        const orgId = userProfile?.organization_id || '00000000-0000-0000-0000-000000000001';
        return {
          menuItems: [
            { name: "Vue d'ensemble", path: `/organisation/${orgId}/dashboard`, icon: <LayoutDashboard size={20} /> },
            { name: "Entrepreneurs", path: `/organisation/${orgId}/entrepreneurs`, icon: <Users size={20} /> },
            { name: "Projets", path: `/organisation/${orgId}/projets`, icon: <FileText size={20} /> },
            { name: "Codes d'invitation", path: `/organisation/${orgId}/invitations`, icon: <Code size={20} /> },
            { name: "Analytics", path: `/organisation/${orgId}/analytics`, icon: <BarChart3 size={20} /> },
            { name: "Formulaires", path: `/organisation/${orgId}/forms`, icon: <FormInput size={20} /> },
            { name: "Événements", path: `/organisation/${orgId}/evenements`, icon: <Calendar size={20} /> },
            { name: "Mentors", path: `/organisation/${orgId}/mentors`, icon: <GraduationCap size={20} /> },
            { name: "Partenaires", path: `/organisation/${orgId}/partenaires`, icon: <Handshake size={20} /> },
            { name: "Livrables", path: `/organisation/${orgId}/livrables`, icon: <FileText size={20} /> },
            { name: "Chatbot", path: `/organisation/${orgId}/chatbot`, icon: <Bot size={20} /> },
            { name: "Paramètres", path: `/organisation/${orgId}/settings`, icon: <Settings size={20} /> },
            { name: "Profil", path: `/organisation/${orgId}/profile`, icon: <UserCheck size={20} /> }
          ],
          branding: {
            name: userProfile.organization?.name || "Mon Incubateur",
            logo: userProfile.organization?.logo_url,
            primaryColor: userProfile.organization?.primary_color || "#F04F6A"
          },
          showProjectSelector: false,
          showCredits: false
        };
        
      case 'member':
        return {
          menuItems: [
            { name: "Tableau de bord", path: "/member/dashboard", icon: <LayoutDashboard size={20} /> },
            { name: "Livrables", path: activeProjectId ? `/member/project-business/${activeProjectId}` : "/member/project-business", icon: <FileText size={20} /> },
            { name: "Assistant IA", path: activeProjectId ? `/member/chatbot/${activeProjectId}` : "/member/chatbot", icon: <MessageSquare size={20} /> },
            { isDivider: true },
            { name: "Plan d'action", path: "/member/plan-action", icon: <LandPlot size={20} /> },
            { name: "Outils", path: "/member/outils", icon: <Settings size={20} /> },
            { name: "Automatisations", path: "/member/automatisations", icon: <Zap size={20} /> },
            { name: "Partenaires", path: "/member/partenaires", icon: <Handshake size={20} /> },
            { name: "Ressources", path: "/member/ressources", icon: <Library size={20} /> },
            { name: "Mon incubateur", path: "/member/incubator", icon: <Building size={20} /> },
            { isDivider: true },
            { name: "Collaborateurs", path: "/member/collaborateurs", icon: <Users size={20} /> }
          ],
          branding: {
            name: userProfile.organization?.name || "Mon Incubateur",
            logo: userProfile.organization?.logo_url,
            primaryColor: userProfile.organization?.primary_color || "#F04F6A"
          },
          showProjectSelector: true,
          showCredits: true
        };
        
      case 'individual':
      default:
        return getIndividualConfig();
    }
  };

  const getIndividualConfig = (): SidebarConfig => ({
    menuItems: [
      { name: "Tableau de bord", path: "/individual/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "Livrables", path: activeProjectId ? `/individual/project-business/${activeProjectId}` : "/individual/project-business", icon: <FileText size={20} /> },
      { name: "Assistant IA", path: activeProjectId ? `/individual/chatbot/${activeProjectId}` : "/individual/chatbot", icon: <MessageSquare size={20} /> },
      { isDivider: true },
      { name: "Plan d'action", path: "/individual/plan-action", icon: <LandPlot size={20} /> },
      { name: "Outils", path: "/individual/outils", icon: <Settings size={20} /> },
      { name: "Automatisations", path: "/individual/automatisations", icon: <Zap size={20} /> },
      { name: "Partenaires", path: "/individual/partenaires", icon: <Handshake size={20} /> },
      { name: "Ressources", path: "/individual/ressources", icon: <Library size={20} /> },
      { name: "Template", path: "/individual/template", icon: <FileText size={20} /> },
      { isDivider: true },
      { name: "Collaborateurs", path: "/individual/collaborateurs", icon: <Users size={20} /> }
    ],
    branding: { name: "Aurentia", primaryColor: "#F04F6A" },
    showProjectSelector: true,
    showCredits: true
  });

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (!user) return "";
    
    // Use first name from metadata (from signup or profile update)
    const firstName = user.user_metadata?.first_name;
    if (firstName && firstName.trim()) {
      return firstName.trim();
    }
    
    // Fallback to username from email (part before @)
    const email = user.email;
    if (email) {
      const username = email.split('@')[0];
      return username;
    }
    
    return "Utilisateur";
  };

  // Helper function to get user initial for avatar
  const getUserInitial = () => {
    if (!user) return 'U';
    
    const displayName = getUserDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  const config = getSidebarConfig();

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div className={cn("hidden md:block h-screen fixed top-0 left-0 z-10 transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
      <div className="bg-white/80 backdrop-blur-sm h-full rounded-r-xl shadow-sm border-r border-gray-100 relative">
        <div className="flex items-center p-4 gap-2 relative">
          {isCollapsed ? (
            <div className="h-8 w-8">
              <img src="/picto-aurentia.svg" alt="Aurentia Picto" className="h-full w-full" />
            </div>
          ) : (
            <div className="h-8 w-auto"> {/* Adjust width for the long logo */}
              <img src="/Aurentia-logo-long.svg" alt="Aurentia Logo" className="h-full w-auto" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-[-12px] top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-100 transition-all duration-300"
          >
            <ChevronLeft size={16} className={cn("transition-transform duration-300", isCollapsed ? "rotate-180" : "")} />
          </button>
        </div>
        <div className="border-b border-gray-200 mx-4 mb-4"></div>

        {/* Project Selector */}
        {config.showProjectSelector && (
          <div className={cn("mb-6 px-3")}>
            <ProjectSelector isCollapsed={isCollapsed} userRole={userProfile?.user_role || 'individual'} />
          </div>
        )}

        <nav className="space-y-1 flex-1 px-3">
          {config.menuItems.map((item, index) => (
            item.isDivider ? (
              <div key={`divider-${index}`} className="my-4 border-t border-gray-200"></div>
            ) : (
              <Link
                key={`${item.path}-${item.name}-${index}`}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-colors",
                  (location.pathname === item.path && location.pathname !== "/warning") ||
                  (item.name === "Livrables" && location.pathname.includes("/project-business/")) ||
                  (item.name === "Assistant IA" && location.pathname.includes("/chatbot/")) ||
                  (item.name === "Automatisations" && location.pathname.startsWith("/automatisations")) ||
                  (item.name === "Partenaires" && location.pathname.startsWith("/partenaires")) ||
                  (item.name === "Plan d'action" && location.pathname.includes("/plan-action"))
                    ? "bg-gradient-primary text-white font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          ))}
        </nav>

        {/* Profile section for desktop */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-3">
          {user && config.showCredits && (
            <div className={cn("px-3 mb-3", isCollapsed && "flex flex-col items-center")}>
              <CreditInfo isCollapsed={isCollapsed} {...credits} />
            </div>
          )}
          {user ? (
            <>
              <Link
                to={`/${userProfile?.user_role || 'individual'}/profile`}
                className={cn("flex items-center gap-3 py-2 px-3 rounded-md text-sm text-gray-700 hover:bg-gray-100")}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                  {getUserInitial()}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                )}
              </Link>
              <button onClick={handleLogout} className={cn("flex items-center gap-3 py-2 px-3 rounded-md text-sm text-gray-700 hover:bg-gray-100 w-full mt-2")}>
                <LogOut size={18} />
                {!isCollapsed && <span>Déconnexion</span>}
              </button>
            </>
          ) : (
            <Link to="/login" className={cn("flex items-center gap-3 py-2 px-3 rounded-md text-sm text-gray-700 hover:bg-gray-100 w-full")}>
              <LogOut size={18} />
              {!isCollapsed && <span>Connexion</span>}
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <>
      {isMobile ? <RoleBasedMobileNavbar userProfile={userProfile} /> : <DesktopSidebar />}
    </>
  );
});

// Role-based Mobile Navbar
const RoleBasedMobileNavbar = ({ userProfile }: { userProfile: UserProfile | null }) => {
  const location = useLocation();
  const { projectId } = useParams();
  const { currentProjectId, userProjects, userCredits, creditsLoading } = useProject();
  const [user, setUser] = useState<any>(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Close navbar when location changes (navigation)
  useEffect(() => {
    setIsNavbarOpen(false);
  }, [location.pathname]);

  // Use currentProjectId from context, fallback to projectId from URL, or first available project
  const activeProjectId = currentProjectId || projectId || (userProjects.length > 0 ? userProjects[0].project_id : null);

  const getMobileMenuItems = () => {
    if (!userProfile) return getIndividualMobileItems();

    switch (userProfile.user_role) {
      case 'super_admin':
        return [
          { name: "Vue d'ensemble", path: "/super-admin/dashboard", icon: <LayoutDashboard size={20} /> },
          { name: "Organisations", path: "/super-admin/organizations", icon: <Building size={20} /> },
          { name: "Utilisateurs", path: "/super-admin/users", icon: <Users size={20} /> },
          { name: "Analytics Global", path: "/super-admin/analytics", icon: <BarChart3 size={20} /> },
          { name: "Codes d'invitation", path: "/super-admin/invitations", icon: <Code size={20} /> },
          { name: "Paramètres", path: "/super-admin/settings", icon: <Settings size={20} /> }
        ];
        
      case 'organisation':
      case 'staff':
        const orgId = userProfile?.organization_id || '00000000-0000-0000-0000-000000000001';
        return [
          { name: "Vue d'ensemble", path: `/organisation/${orgId}/dashboard`, icon: <LayoutDashboard size={20} /> },
          { name: "Entrepreneurs", path: `/organisation/${orgId}/entrepreneurs`, icon: <Users size={20} /> },
          { name: "Projets", path: `/organisation/${orgId}/projets`, icon: <FileText size={20} /> },
          { name: "Codes d'invitation", path: `/organisation/${orgId}/invitations`, icon: <Code size={20} /> },
          { name: "Analytics", path: `/organisation/${orgId}/analytics`, icon: <BarChart3 size={20} /> },
          { name: "Paramètres", path: `/organisation/${orgId}/settings`, icon: <Settings size={20} /> }
        ];
        
      case 'member':
        return [
          { name: "Tableau de bord", path: "/member/dashboard", icon: <LayoutDashboard size={20} /> },
          { name: "Livrables", path: activeProjectId ? `/member/project-business/${activeProjectId}` : "/member/project-business", icon: <FileText size={20} /> },
          { name: "Assistant IA", path: activeProjectId ? `/member/chatbot/${activeProjectId}` : "/member/chatbot", icon: <MessageSquare size={20} /> },
          { name: "Plan d'action", path: "/member/plan-action", icon: <LandPlot size={20} /> },
          { name: "Outils", path: "/member/outils", icon: <Settings size={20} /> },
          { name: "Automatisations", path: "/member/automatisations", icon: <Zap size={20} /> },
          { name: "Partenaires", path: "/member/partenaires", icon: <Handshake size={20} /> },
          { name: "Ressources", path: "/member/ressources", icon: <Library size={20} /> },
          { name: "Mon incubateur", path: "/member/incubator", icon: <Building size={20} /> },
          { name: "Collaborateurs", path: "/member/collaborateurs", icon: <Users size={20} /> }
        ];
        
      case 'individual':
      default:
        return getIndividualMobileItems();
    }
  };

  const getIndividualMobileItems = () => [
    { name: "Tableau de bord", path: "/individual/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Livrables", path: activeProjectId ? `/individual/project-business/${activeProjectId}` : "/individual/project-business", icon: <FileText size={20} /> },
    { name: "Assistant IA", path: activeProjectId ? `/individual/chatbot/${activeProjectId}` : "/individual/chatbot", icon: <MessageSquare size={20} /> },
    { name: "Plan d'action", path: "/individual/plan-action", icon: <LandPlot size={20} /> },
    { name: "Outils", path: "/individual/outils", icon: <Settings size={20} /> },
    { name: "Automatisations", path: "/individual/automatisations", icon: <Zap size={20} /> },
    { name: "Partenaires", path: "/individual/partenaires", icon: <Handshake size={20} /> },
    { name: "Ressources", path: "/individual/ressources", icon: <Library size={20} /> },
    { name: "Collaborateurs", path: "/individual/collaborateurs", icon: <Users size={20} /> }
  ];

  const menuItems = getMobileMenuItems();

  return (
    <>
      {/* Menu toggle button - only show when navbar is closed */}
      {!isNavbarOpen && (
        <button
          onClick={() => setIsNavbarOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-primary text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 md:hidden"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Navbar container with fade animation */}
      <div
        className={cn(
          "fixed bottom-4 left-4 right-4 z-50 md:hidden transition-all duration-300 ease-in-out",
          isNavbarOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        )}
      >
        {/* Main navigation with scrollable content */}
        <nav className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Credits display for mobile - integrated into navbar */}
          {user && userCredits && (userProfile?.user_role === 'individual' || userProfile?.user_role === 'member') && (
            <div className="bg-white px-4 py-2 border-b border-gray-200">
              <div className="flex items-center justify-center gap-2 text-sm">
                <img src="/credit-image.svg" alt="Crédits" className="h-4 w-4" />
                <span className="font-medium text-gray-700">
                  {creditsLoading ? '...' : `${((userCredits.monthly_remaining || 0) + (userCredits.purchased_remaining || 0))} / ${userCredits.monthly_limit}`}
                </span>
              </div>
            </div>
          )}
          
          {/* Scrollable navigation items */}
          <div className="px-3 py-3 overflow-x-auto scrollbar-hide">
            <div className="flex items-center space-x-3 min-w-max">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0',
                    (location.pathname === item.path && location.pathname !== "/warning") ||
                    (item.name === "Livrables" && location.pathname.includes("/project-business/")) ||
                    (item.name === "Assistant IA" && location.pathname.includes("/chatbot/")) ||
                    (item.name === "Automatisations" && location.pathname.includes("/automatisations")) ||
                    (item.name === "Partenaires" && location.pathname.includes("/partenaires")) ||
                    (item.name === "Plan d'action" && location.pathname.includes("/plan-action")) ||
                    (item.name === "Ressources" && location.pathname.includes("/ressources")) ||
                    (item.name === "Collaborateurs" && location.pathname.includes("/collaborateurs"))
                      ? 'bg-gradient-primary text-white shadow-md scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                  )}
                >
                  {item.icon}
                </Link>
              ))}
              {user ? (
                <Link
                  to={`/${userProfile?.user_role || 'individual'}/profile`}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0',
                    location.pathname.includes("/profile")
                      ? 'bg-gradient-primary text-white shadow-md scale-110'
                      : 'bg-gradient-primary text-white hover:scale-105'
                  )}
                >
                  <span className="text-sm font-medium">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0',
                    location.pathname === "/login"
                      ? 'bg-gradient-primary text-white shadow-md scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                  )}
                >
                  <LogOut size={20} />
                </Link>
              )}
              
              {/* Close button */}
              <button
                onClick={() => setIsNavbarOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 ml-2"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

interface CreditInfoProps {
  isCollapsed: boolean;
  monthlyRemaining: number | null;
  monthlyLimit: number | null;
  purchasedRemaining: number | null;
  isLoading: boolean;
  error: string | null;
}

const CreditInfo = ({ 
  isCollapsed, 
  monthlyRemaining, 
  monthlyLimit, 
  purchasedRemaining, 
  isLoading, 
  error 
}: CreditInfoProps) => {
  if (isLoading) {
    return <p className="text-xs text-gray-500">Chargement crédits...</p>;
  }

  if (error) {
    return <p className="text-xs text-red-500">Erreur crédits</p>;
  }

  const totalCredits = (monthlyRemaining || 0) + (purchasedRemaining || 0);

  return (
    <div className={cn("flex flex-col gap-2 w-full", isCollapsed ? "items-center" : "items-start")}>
      <div className={cn(
        "bg-gray-100/80 backdrop-blur-sm p-2 rounded-md transition-all duration-300",
        isCollapsed ? "w-14 h-auto flex flex-col items-center justify-center" : "w-full text-left"
      )}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-0.5 py-2">
            <img src="/credit-image.svg" alt="Crédits" className="h-4 w-4" />
            <span className="font-medium text-gray-700 text-sm">
              {totalCredits}
            </span>
            <div className="w-4 h-px bg-gray-300 my-0.5"></div>
            <span className="font-medium text-gray-700 text-sm">
              {monthlyLimit}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <img src="/credit-image.svg" alt="Crédits" className="h-4 w-4" />
            <span className="text-sm font-medium text-gray-700">
              {totalCredits} / {monthlyLimit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleBasedSidebar;
