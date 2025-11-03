import { useState, useEffect, memo, useRef, useMemo } from "react";
import { UserProfile } from '@/types/userTypes';
import { LayoutDashboard, FileText, MessageSquare, Users, Settings, Building, BarChart3, UserCheck, Code, Briefcase, Handshake, LandPlot, ChevronLeft, Library, Coins, LogOut, Zap, Menu, X, FormInput, Calendar, GraduationCap, Bot, Plus, Info, Mail, Send, Database, Plug } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AurentiaLogo from './AurentiaLogo';
import ProjectSelector from "./ProjectSelector";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/contexts/ProjectContext";
import { useCreditsSimple } from "@/hooks/useCreditsSimple";
import { useOrganisationNavigation } from '@/hooks/useOrganisationNavigation';
import { useUserOrganization } from '@/hooks/useUserOrganization';
import { useUserOrganizations } from '@/hooks/useOrganisationData';
import { useUserRole } from '@/hooks/useUserRole';
import clsx from 'clsx';
import { useInvitationCode } from "@/services/invitationService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import PublicOrganizationsModal from "./PublicOrganizationsModal";
import OrganizationSetupGuideModal from "./OrganizationSetupGuideModal";
import { useUnreadCount } from "@/hooks/messages/useUnreadCount";
import { Badge } from "@/components/ui/badge";
import { getSidebarContext, setSidebarContext, detectSidebarContextFromPath } from "@/hooks/useSidebarContext";

interface MenuItem {
  name?: string;
  path?: string;
  icon?: React.ReactNode;
  isDivider?: boolean;
  isCustomAction?: boolean;
  isCreateOrg?: boolean;
}

interface MenuCategory {
  name: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

interface SidebarConfig {
  standaloneItems?: MenuItem[]; // Items shown at top, not in categories
  categories?: MenuCategory[]; // Categorized menu items
  bottomItems?: MenuItem[]; // Items shown at bottom
  menuItems?: MenuItem[]; // Legacy support for non-categorized configs
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

// SidebarSection Component - ElevenLabs-style sections without dropdowns
interface SidebarSectionProps {
  category: MenuCategory;
  isCollapsed: boolean;
  location: ReturnType<typeof useLocation>;
}

const SidebarSection = ({ category, isCollapsed, location }: SidebarSectionProps) => {
  const navigate = useNavigate();
  const { loading: organizationLoading } = useUserOrganization();

  // Helper function to check if an item is active
  const isItemActive = (item: MenuItem) => {
    if (!item.path) return false;
    return (
      (location.pathname === item.path && location.pathname !== "/warning") ||
      (item.name === "Livrables" && location.pathname.includes("/project-business/")) ||
      (item.name === "Assistant IA" && location.pathname.includes("/chatbot/")) ||
      (item.name === "Automatisations" && location.pathname.startsWith("/automatisations")) ||
      (item.name === "Partenaires" && location.pathname.startsWith("/partenaires")) ||
      (item.name === "Plan d'action" && location.pathname.includes("/plan-action")) ||
      (item.name === "Messages" && (location.pathname.includes("/messages") || location.pathname === "/messages"))
    );
  };

  // Render an item in collapsed mode (icon only with tooltip)
  const renderCollapsedItem = (item: MenuItem, index: number) => {
    if (item.isDivider) {
      return <div key={`divider-${index}`} className="my-1 border-t border-gray-200"></div>;
    }

    const isActive = isItemActive(item);
    const baseClasses = "relative group flex items-center justify-center py-2 px-2 rounded-md transition-all duration-200";

    if (item.isCustomAction && item.isCreateOrg) {
      return (
        <div key={`${item.path}-${item.name}-${index}`} className="relative group">
          <button
            onClick={() => navigate('/join-organization')}
            disabled={organizationLoading}
            className={cn(
              baseClasses,
              organizationLoading ? "opacity-50 cursor-not-allowed" : "text-aurentia-pink hover:bg-aurentia-pink/10"
            )}
          >
            {item.icon}
          </button>
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {organizationLoading ? "Chargement..." : item.name}
          </div>
        </div>
      );
    }

    return (
      <div key={`${item.path}-${item.name}-${index}`} className="relative group">
        <Link
          to={item.path || '#'}
          className={cn(
            baseClasses,
            getActiveMenuClass(isActive)
          )}
        >
          {item.icon}
        </Link>
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {item.name}
        </div>
      </div>
    );
  };

  // Render an item in normal mode (icon + text)
  const renderNormalItem = (item: MenuItem, index: number) => {
    if (item.isDivider) {
      return <div key={`divider-${index}`} className="my-1 border-t border-gray-200"></div>;
    }

    if (item.isCustomAction && item.isCreateOrg) {
      return (
        <button
          key={`${item.path}-${item.name}-${index}`}
          onClick={() => navigate('/join-organization')}
          disabled={organizationLoading}
          className={cn(
            "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-all duration-200 w-full text-left",
            organizationLoading ? "opacity-50 cursor-not-allowed" : "text-aurentia-pink hover:bg-aurentia-pink/10 font-medium"
          )}
        >
          {item.icon}
          <span>{organizationLoading ? "Chargement..." : item.name}</span>
        </button>
      );
    }

    if (item.isCustomAction) {
      return (
        <Link
          key={`${item.path}-${item.name}-${index}`}
          to={item.path || '#'}
          className={cn(
            "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-all duration-200",
            getActiveMenuClass(location.pathname === item.path)
          )}
        >
          {item.icon}
          <span>{item.name}</span>
        </Link>
      );
    }

    return (
      <Link
        key={`${item.path}-${item.name}-${index}`}
        to={item.path || '#'}
        className={cn(
          "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-all duration-200",
          getActiveMenuClass(isItemActive(item))
        )}
      >
        {item.icon}
        <span>{item.name}</span>
      </Link>
    );
  };

  if (isCollapsed) {
    // Collapsed mode: keep invisible spacer with same height as label for perfect alignment
    return (
      <div className="space-y-0.5">
        {/* Invisible spacer to match expanded mode label height */}
        <div className="px-3 pt-3 pb-1">
          <span className="text-sm font-normal opacity-0 pointer-events-none select-none">
            {category.name}
          </span>
        </div>
        {category.items.map((item, index) => renderCollapsedItem(item, index))}
      </div>
    );
  }

  // Normal mode: ElevenLabs-style section with label
  return (
    <div className="space-y-0.5">
      {/* Section label - slightly larger, lowercase, muted, not bold */}
      <div className="px-3 pt-3 pb-1">
        <span className="text-sm font-normal text-gray-400">
          {category.name}
        </span>
      </div>
      {/* Section items */}
      {category.items.map((item, index) => renderNormalItem(item, index))}
    </div>
  );
};

// Module-level helper functions
const getActiveMenuClass = (isActive: boolean) => {
  if (!isActive) return "text-gray-500 hover:bg-gray-100 hover:text-gray-700";
  return "bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white font-medium";
};

const getUserDisplayName = (user: any) => {
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

const getUserInitial = (user: any) => {
  if (!user) return 'U';

  const displayName = getUserDisplayName(user);
  return displayName.charAt(0).toUpperCase();
};

const isStaffWithMultipleOrgs = (userProfile: UserProfile | null, userOrganizations: any[]) => {
  return userProfile?.user_role === 'staff' && userOrganizations.length > 1;
};

const getCurrentOrgName = (userProfile: UserProfile | null, userOrganizations: any[]) => {
  if (userProfile?.user_role === 'staff' && userOrganizations.length > 0) {
    const currentOrg = userOrganizations.find(org => org.is_primary) || userOrganizations[0];
    return currentOrg?.organization?.name || 'Organisation';
  }
  return userProfile?.organization?.name || 'Organisation';
};

const RoleBasedSidebar = memo(({ userProfile, isCollapsed, setIsCollapsed }: RoleBasedSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { currentProjectId, userProjects } = useProject();
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const credits = useCreditsSimple();
  const { navigateToOrganisation, loading: orgNavigationLoading } = useOrganisationNavigation();
  const { hasOrganization, loading: organizationLoading } = useUserOrganization();
  const { userOrganizations, loading: userOrganizationsLoading, switchToOrganization } = useUserOrganizations();
  const { organizationId } = useUserRole(); // Get organizationId from useUserRole hook
  const isUserProfileLoading = !userProfile;
  const { data: unreadCount } = useUnreadCount();

  // Ref for preserving sidebar scroll position
  const navScrollRef = useRef<HTMLDivElement>(null);

  // Modal state for joining organization
  const [joinOrgModalOpen, setJoinOrgModalOpen] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [joinOrgLoading, setJoinOrgLoading] = useState(false);
  const [joinOrgError, setJoinOrgError] = useState('');

  // Modal state for switching organization (staff with multiple orgs)
  const [switchOrgModalOpen, setSwitchOrgModalOpen] = useState(false);
  const [switchOrgLoading, setSwitchOrgLoading] = useState(false);

  // Modal state for public organizations discovery
  const [publicOrgsModalOpen, setPublicOrgsModalOpen] = useState(false);

  // Modal state for organization setup guide (one-time per session)
  const [showOrgSetupGuide, setShowOrgSetupGuide] = useState(false);
  
  // Check if user should see the organization setup guide
  useEffect(() => {
    const checkOrgSetupGuide = async () => {
      if (!userProfile || !user) return;
      
      // Only show for organization role without an organization in user_organizations
      if (userProfile.user_role === 'organisation') {
        // Check if user has an organization via user_organizations
        const { data: userOrg } = await (supabase as any)
          .from('user_organizations')
          .select('organization_id')
          .eq('user_id', userProfile.id)
          .eq('status', 'active')
          .single();
        
        if (!userOrg?.organization_id) {
          // Check sessionStorage for "one time per session" behavior
          const shownThisSession = sessionStorage.getItem(`org_setup_guide_shown_${user.id}`);
          
          // Check if user permanently dismissed the modal
          const permanentlyDismissed = userProfile.organization_setup_dismissed === true;
          
          if (!shownThisSession && !permanentlyDismissed) {
            // Mark as shown in this session
            sessionStorage.setItem(`org_setup_guide_shown_${user.id}`, 'true');
            
            // Show the guide modal after a short delay
            setTimeout(() => {
              setShowOrgSetupGuide(true);
            }, 1000);
          }
        }
      }
    };

    checkOrgSetupGuide();
  }, [userProfile, user]);  // Check if mobile on mount and when window resizes
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

  // Save sidebar scroll position on scroll
  useEffect(() => {
    const navElement = navScrollRef.current;
    if (!navElement) return;

    const handleScroll = () => {
      sessionStorage.setItem('sidebar-scroll-position', String(navElement.scrollTop));
    };

    navElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => navElement.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore sidebar scroll position after navigation
  useEffect(() => {
    const navElement = navScrollRef.current;
    if (!navElement) return;

    const savedPosition = sessionStorage.getItem('sidebar-scroll-position');
    if (savedPosition) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        navElement.scrollTop = parseInt(savedPosition, 10);
      });
    }
  }, [location.pathname]);

  // Use currentProjectId from context, fallback to projectId from URL, or first available project
  const activeProjectId = currentProjectId || projectId || (userProjects.length > 0 ? userProjects[0].project_id : null);
  
  // Handle joining organization with invitation code
  const handleJoinOrganization = async () => {
    if (!invitationCode.trim()) {
      setJoinOrgError('Veuillez entrer un code d\'invitation');
      return;
    }

    if (!user?.id) {
      setJoinOrgError('Utilisateur non connecté');
      return;
    }

    setJoinOrgLoading(true);
    setJoinOrgError('');

    try {
      // Extraire le code de l'URL si nécessaire
      const extractCodeFromUrl = (input: string): string => {
        // Si c'est déjà un code simple (pas d'URL), retourner tel quel
        if (!input.includes('?') && !input.includes('/join/')) {
          return input;
        }
        
        try {
          // Essayer d'extraire depuis les paramètres de requête
          const url = new URL(input);
          const codeFromQuery = url.searchParams.get('code');
          if (codeFromQuery) {
            return codeFromQuery;
          }
          
          // Essayer d'extraire depuis le chemin /join/{code}
          const pathMatch = url.pathname.match(/\/join\/([^\/]+)/);
          if (pathMatch) {
            return pathMatch[1];
          }
        } catch (error) {
          // Si ce n'est pas une URL valide, retourner l'input tel quel
          return input;
        }
        
        return input;
      };
      
      const codeToUse = extractCodeFromUrl(invitationCode.trim());
      await useInvitationCode(codeToUse, user.id);
      
      toast({
        title: "Succès",
        description: "Vous avez rejoint l'organisation avec succès !",
      });
      
      // Close modal and refresh the page
      setJoinOrgModalOpen(false);
      setInvitationCode('');
      window.location.reload();
      
    } catch (error: any) {
      console.error('Erreur lors de la jonction de l\'organisation:', error);
      setJoinOrgError(error.message || 'Code d\'invitation invalide');
    } finally {
      setJoinOrgLoading(false);
    }
  };

  // Handle switching organization for staff users
  const handleSwitchOrganization = async (organizationId: string) => {
    setSwitchOrgLoading(true);
    try {
      const success = await switchToOrganization(organizationId);
      if (success) {
        toast({
          title: "Organisation changée",
          description: "Vous avez changé d'organisation avec succès.",
        });
        setSwitchOrgModalOpen(false);
        // Refresh the page to update all contexts
        window.location.reload();
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de changer d'organisation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors du changement d\'organisation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du changement d'organisation.",
        variant: "destructive",
      });
    } finally {
      setSwitchOrgLoading(false);
    }
  };

  // Handle organization setup guide modal
  const handleStartOrgSetup = () => {
    setShowOrgSetupGuide(false);
    // Navigate to setup organization page
    navigate('/setup-organization');
  };

  const handleCloseOrgSetupGuide = async () => {
    // Just close for this session - modal will appear again on next login/session
    setShowOrgSetupGuide(false);
  };

  const handleDismissPermanently = async () => {
    if (user?.id) {
      // Update the database to permanently dismiss
      try {
        const { error } = await (supabase as any)
          .from('profiles')
          .update({ organization_setup_dismissed: true })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error updating organization_setup_dismissed:', error);
        } else {
          console.log('Organization setup guide permanently dismissed');
        }
      } catch (err) {
        console.error('Failed to update dismissal preference:', err);
      }
    }
    setShowOrgSetupGuide(false);
  };

  const getSidebarConfig = (): SidebarConfig => {
    if (!userProfile) return getIndividualConfig();

    // Si l'utilisateur est sur /messages, utiliser le contexte stocké pour déterminer quelle sidebar afficher
    if (location.pathname === '/messages') {
      const storedContext = getSidebarContext();

      // Si le contexte est 'organisation' et que l'utilisateur a le rôle approprié
      if (storedContext === 'organisation' && (userProfile.user_role === 'organisation' || userProfile.user_role === 'staff')) {
        const orgId = organizationId;
        if (orgId) {
          // Retourner la config organisation (même logique que ci-dessous)
          return {
            standaloneItems: [
              { name: "Tableau de bord", path: `/organisation/${orgId}/dashboard`, icon: <LayoutDashboard size={20} /> },
              { name: "Messages", path: `/messages`, icon: <Mail size={20} /> },
              { name: "Mon Profil Mentor", path: `/organisation/${orgId}/my-profile`, icon: <UserCheck size={20} /> },
            ],
            categories: [
              {
                name: "Gestion",
                icon: <Users size={20} />,
                items: [
                  { name: "Adhérents", path: `/organisation/${orgId}/adherents`, icon: <Users size={20} /> },
                  { name: "Projets", path: `/organisation/${orgId}/projets`, icon: <FileText size={20} /> },
                  { name: "Mentors", path: `/organisation/${orgId}/mentors`, icon: <GraduationCap size={20} /> },
                  { name: "Staff", path: `/organisation/${orgId}/staff`, icon: <Briefcase size={20} /> },
                  { name: "Partenaires", path: `/organisation/${orgId}/partenaires`, icon: <Handshake size={20} /> },
                ]
              },
              {
                name: "Administration",
                icon: <Settings size={20} />,
                items: [
                  { name: "Codes d'invitation", path: `/organisation/${orgId}/invitations`, icon: <Code size={20} /> },
                  { name: "Formulaires", path: `/organisation/${orgId}/forms`, icon: <FormInput size={20} /> },
                  { name: "Intégrations", path: `/organisation/${orgId}/integrations`, icon: <Plug size={20} /> },
                  { name: "Informations", path: `/organisation/${orgId}/informations`, icon: <Info size={20} /> },
                  { name: "Paramètres", path: `/organisation/${orgId}/settings`, icon: <Settings size={20} /> },
                ]
              },
              {
                name: "Événements & Analytics",
                icon: <Calendar size={20} />,
                items: [
                  { name: "Événements", path: `/organisation/${orgId}/evenements`, icon: <Calendar size={20} /> },
                  { name: "Analytics", path: `/organisation/${orgId}/analytics`, icon: <BarChart3 size={20} /> },
                ]
              },
              {
                name: "Communication",
                icon: <MessageSquare size={20} />,
                items: [
                  { name: "Newsletters", path: `/organisation/${orgId}/newsletters`, icon: <Send size={20} /> },
                ]
              },
              {
                name: "Ressources",
                icon: <Library size={20} />,
                items: [
                  { name: "Ressources", path: `/organisation/${orgId}/ressources`, icon: <Library size={20} /> },
                  { name: "Base de connaissance", path: `/organisation/${orgId}/knowledge-base`, icon: <Database size={20} /> },
                  { name: "Chatbot", path: `/organisation/${orgId}/chatbot`, icon: <Bot size={20} /> },
                ]
              },
            ],
            bottomItems: [
              { name: "Retour à l'espace Adhérent", path: "/individual/dashboard", icon: <LayoutDashboard size={20} />, isCustomAction: true },
            ],
            branding: {
              name: userProfile.organization?.name || "Mon Incubateur",
              logo: userProfile.organization?.logo_url,
              primaryColor: userProfile.organization?.primary_color || "#F04F6A"
            },
            showProjectSelector: false,
            showCredits: false
          };
        }
      }

      // Par défaut (ou si context est 'individual'), utiliser la config individual/member
      return getIndividualConfig();
    }

    // Si l'utilisateur est sur une route /individual/*, afficher la sidebar individual même s'il a un rôle organisation
    if (location.pathname.startsWith('/individual/')) {
      return getIndividualConfig();
    }

    switch (userProfile.user_role) {

      case 'organisation':
      case 'staff':
        // Use organizationId from useUserRole hook
        const orgId = organizationId;
        if (!orgId) {
          // If no organization ID, redirect to individual space
          return getIndividualConfig();
        }
        return {
          standaloneItems: [
            { name: "Tableau de bord", path: `/organisation/${orgId}/dashboard`, icon: <LayoutDashboard size={20} /> },
            { name: "Messages", path: `/messages`, icon: <Mail size={20} /> },
            { name: "Mon Profil Mentor", path: `/organisation/${orgId}/my-profile`, icon: <UserCheck size={20} /> },
          ],
          categories: [
            {
              name: "Gestion",
              icon: <Users size={20} />,
              items: [
                { name: "Adhérents", path: `/organisation/${orgId}/adherents`, icon: <Users size={20} /> },
                { name: "Projets", path: `/organisation/${orgId}/projets`, icon: <FileText size={20} /> },
                { name: "Mentors", path: `/organisation/${orgId}/mentors`, icon: <GraduationCap size={20} /> },
                { name: "Staff", path: `/organisation/${orgId}/staff`, icon: <Briefcase size={20} /> },
                { name: "Partenaires", path: `/organisation/${orgId}/partenaires`, icon: <Handshake size={20} /> },
              ]
            },
            {
              name: "Administration",
              icon: <Settings size={20} />,
              items: [
                { name: "Codes d'invitation", path: `/organisation/${orgId}/invitations`, icon: <Code size={20} /> },
                { name: "Formulaires", path: `/organisation/${orgId}/forms`, icon: <FormInput size={20} /> },
                { name: "Intégrations", path: `/organisation/${orgId}/integrations`, icon: <Plug size={20} /> },
                { name: "Informations", path: `/organisation/${orgId}/informations`, icon: <Info size={20} /> },
                { name: "Paramètres", path: `/organisation/${orgId}/settings`, icon: <Settings size={20} /> },
              ]
            },
            {
              name: "Événements & Analytics",
              icon: <Calendar size={20} />,
              items: [
                { name: "Événements", path: `/organisation/${orgId}/evenements`, icon: <Calendar size={20} /> },
                { name: "Analytics", path: `/organisation/${orgId}/analytics`, icon: <BarChart3 size={20} /> },
              ]
            },
            {
              name: "Communication",
              icon: <MessageSquare size={20} />,
              items: [
                { name: "Newsletters", path: `/organisation/${orgId}/newsletters`, icon: <Send size={20} /> },
              ]
            },
            {
              name: "Ressources",
              icon: <Library size={20} />,
              items: [
                { name: "Ressources", path: `/organisation/${orgId}/ressources`, icon: <Library size={20} /> },
                { name: "Base de connaissance", path: `/organisation/${orgId}/knowledge-base`, icon: <Database size={20} /> },
                { name: "Chatbot", path: `/organisation/${orgId}/chatbot`, icon: <Bot size={20} /> },
              ]
            },
          ],
          bottomItems: [
            { name: "Retour à l'espace Adhérent", path: "/individual/dashboard", icon: <LayoutDashboard size={20} />, isCustomAction: true },
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
          standaloneItems: [
            { name: "Tableau de bord", path: "/individual/dashboard", icon: <LayoutDashboard size={20} /> },
            { name: "Messages", path: "/messages", icon: <Mail size={20} /> },
          ],
          categories: [
            {
              name: "Mon Projet",
              icon: <Briefcase size={20} />,
              items: [
                { name: "Livrables", path: activeProjectId ? `/individual/project-business/${activeProjectId}` : "/individual/project-business", icon: <FileText size={20} /> },
                { name: "Assistant IA", path: activeProjectId ? `/individual/chatbot/${activeProjectId}` : "/individual/chatbot", icon: <MessageSquare size={20} /> },
                { name: "Plan d'action", path: "/individual/plan-action", icon: <LandPlot size={20} /> },
              ]
            },
            {
              name: "Outils",
              icon: <Zap size={20} />,
              items: [
                { name: "Outils", path: "/individual/outils", icon: <Settings size={20} /> },
                { name: "Automatisations", path: "/individual/automatisations", icon: <Zap size={20} /> },
                { name: "Intégrations", path: "/individual/integrations", icon: <Plug size={20} /> },
              ]
            },
            {
              name: "Collaboration",
              icon: <Users size={20} />,
              items: [
                { name: "Mon Organisation", path: "/individual/my-organization", icon: <Building size={20} /> },
                { name: "Collaborateurs", path: "/individual/collaborateurs", icon: <Users size={20} /> },
              ]
            },
            {
              name: "Ressources",
              icon: <Library size={20} />,
              items: [
                { name: "Partenaires", path: "/individual/partenaires", icon: <Handshake size={20} /> },
                { name: "Ressources", path: "/individual/ressources", icon: <Library size={20} /> },
                { name: "Base de connaissance", path: activeProjectId ? `/individual/knowledge-base/${activeProjectId}` : "/individual/knowledge-base", icon: <Database size={20} /> },
              ]
            },
          ],
          branding: {
            name: userProfile.organization?.name || "Mon Organisation",
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

  const getIndividualConfig = (): SidebarConfig => {
    // Determine what organization-related item to show
    let orgItem;
    if (organizationLoading) {
      // Show loading state - use a direct link to avoid OrganisationRedirect
      orgItem = { name: "Organisation", path: organizationId ? `/organisation/${organizationId}/dashboard` : "/setup-organization", icon: <Building size={20} />, isCustomAction: true };
    } else if (userProfile && userProfile.user_role === 'member') {
      // Members go directly to my-organization page (no redirect through /organisation)
      const orgName = userProfile?.organization?.name;
      orgItem = { name: orgName || "Mon Organisation", path: "/individual/my-organization", icon: <Building size={20} /> };
    } else if (hasOrganization || (userProfile && (userProfile.user_role === 'organisation' || userProfile.user_role === 'staff'))) {
      // CRITICAL FIX: User has an organization OR has organization role - use direct dashboard link
      const orgName = userProfile?.organization?.name;
      const directPath = organizationId ? `/organisation/${organizationId}/dashboard` : "/setup-organization";
      orgItem = { name: orgName || "Organisation", path: directPath, icon: <Building size={20} />, isCustomAction: true };
    } else {
      // User doesn't have an organization - show "Rejoindre une organisation" button
      orgItem = { name: "Rejoindre une organisation", path: "/join-organization", icon: <Plus size={20} />, isCustomAction: true, isCreateOrg: true };
    }

    return {
      standaloneItems: [
        { name: "Tableau de bord", path: "/individual/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "Messages", path: "/messages", icon: <Mail size={20} /> },
      ],
      categories: [
        {
          name: "Mon Projet",
          icon: <Briefcase size={20} />,
          items: [
            { name: "Livrables", path: activeProjectId ? `/individual/project-business/${activeProjectId}` : "/individual/project-business", icon: <FileText size={20} /> },
            { name: "Assistant IA", path: activeProjectId ? `/individual/chatbot/${activeProjectId}` : "/individual/chatbot", icon: <MessageSquare size={20} /> },
            { name: "Plan d'action", path: "/individual/plan-action", icon: <LandPlot size={20} /> },
            { name: "Template", path: "/individual/template", icon: <FileText size={20} /> },
          ]
        },
        {
          name: "Outils",
          icon: <Zap size={20} />,
          items: [
            { name: "Outils", path: "/individual/outils", icon: <Settings size={20} /> },
            { name: "Automatisations", path: "/individual/automatisations", icon: <Zap size={20} /> },
            { name: "Intégrations", path: "/individual/integrations", icon: <Plug size={20} /> },
          ]
        },
        {
          name: "Collaboration",
          icon: <Users size={20} />,
          items: [
            orgItem,
            { name: "Collaborateurs", path: "/individual/collaborateurs", icon: <Users size={20} /> },
          ]
        },
        {
          name: "Ressources",
          icon: <Library size={20} />,
          items: [
            { name: "Partenaires", path: "/individual/partenaires", icon: <Handshake size={20} /> },
            { name: "Ressources", path: "/individual/ressources", icon: <Library size={20} /> },
            { name: "Base de connaissance", path: activeProjectId ? `/individual/knowledge-base/${activeProjectId}` : "/individual/knowledge-base", icon: <Database size={20} /> },
          ]
        },
      ],
      branding: { name: "Aurentia", primaryColor: "#F04F6A" },
      showProjectSelector: true,
      showCredits: true
    };
  };

  const config = getSidebarConfig();

  // Check if white label mode is enabled
  const whiteLabelEnabled = userProfile?.organization?.settings?.branding?.whiteLabel || false;
  const orgLogo = userProfile?.organization?.logo_url;
  const orgName = userProfile?.organization?.name;

  // Determine if we should show organization branding:
  // 1. Must be in organization pages (/organisation/*)
  // 2. White label must be enabled
  // 3. Organization must have logo and name
  const isInOrgPages = location.pathname.startsWith('/organisation/');
  const showOrgBranding = isInOrgPages && whiteLabelEnabled && orgLogo && orgName;

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // navigate("/login"); // Removed as per new requirement
  };

  // Desktop sidebar (memoized to prevent remounting on navigation)
  const desktopSidebarJSX = useMemo(() => (
    <div className={cn("hidden md:block h-screen fixed top-0 left-0 z-10 transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
      <div className="bg-white/80 backdrop-blur-sm h-full rounded-r-xl shadow-sm border-r border-gray-100 flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0">
          <div className="flex items-center p-4 gap-2 relative">
            {showOrgBranding ? (
              // Show organization branding
              isCollapsed ? (
                <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                  <img src={orgLogo} alt={orgName} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                    <img src={orgLogo} alt={orgName} className="h-full w-full object-cover" />
                  </div>
                  <span className="font-bold truncate text-gray-900">
                    {orgName}
                  </span>
                </div>
              )
            ) : (
              // Default: Show Aurentia branding
              isCollapsed ? (
                <div className="h-8 w-8">
                  <img src="/picto-aurentia.svg" alt="Aurentia Picto" className="h-full w-full" />
                </div>
              ) : (
                <div className="h-8 w-auto">
                  <img src="/Aurentia-logo-long.svg" alt="Aurentia Logo" className="h-full w-auto" />
                </div>
              )
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
            <div className={cn("mb-4 px-3")}>
              <ProjectSelector
                isCollapsed={isCollapsed}
                userRole={userProfile?.user_role || 'individual'}
                onExpandRequest={() => setIsCollapsed(false)}
              />
            </div>
          )}
        </div>

        {/* Scrollable Navigation Content */}
        <nav ref={navScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {/* Render standalone items (always visible) */}
          {config.standaloneItems?.map((item, index) => (
            item.isDivider ? (
              <div key={`divider-${index}`} className="my-2 border-t border-gray-200"></div>
            ) : item.isCustomAction && item.path === "/organisation" ? (
              <button
                key={`${item.path}-${item.name}-${index}`}
                onClick={isStaffWithMultipleOrgs(userProfile, userOrganizations) ? () => setSwitchOrgModalOpen(true) : navigateToOrganisation}
                disabled={orgNavigationLoading || isUserProfileLoading || userOrganizationsLoading}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-all duration-200 w-full text-left",
                  (orgNavigationLoading || isUserProfileLoading || userOrganizationsLoading) ? "opacity-50 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
              >
                {item.icon}
                {!isCollapsed && (
                  <span>
                    {orgNavigationLoading || isUserProfileLoading || userOrganizationsLoading
                      ? "Chargement..."
                      : isStaffWithMultipleOrgs(userProfile, userOrganizations)
                        ? `${getCurrentOrgName(userProfile, userOrganizations)} ▼`
                        : (item.name || "Organisation")
                    }
                  </span>
                )}
              </button>
            ) : item.isCustomAction && item.isCreateOrg ? (
              <button
                key={`${item.path}-${item.name}-${index}`}
                onClick={() => {
                  setPublicOrgsModalOpen(true);
                }}
                disabled={organizationLoading}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-all duration-200 w-full text-left",
                  organizationLoading ? "opacity-50 cursor-not-allowed" : "text-aurentia-pink hover:bg-aurentia-pink/10 font-medium"
                )}
              >
                {item.icon}
                {!isCollapsed && <span>{organizationLoading ? "Chargement..." : item.name}</span>}
              </button>
            ) : (
              <Link
                key={`${item.path}-${item.name}-${index}`}
                to={item.path || '#'}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-all duration-200 relative",
                  getActiveMenuClass(
                    (location.pathname === item.path && location.pathname !== "/warning") ||
                    (item.name === "Livrables" && location.pathname.includes("/project-business/")) ||
                    (item.name === "Assistant IA" && location.pathname.includes("/chatbot/")) ||
                    (item.name === "Automatisations" && location.pathname.startsWith("/automatisations")) ||
                    (item.name === "Partenaires" && location.pathname.startsWith("/partenaires")) ||
                    (item.name === "Plan d'action" && location.pathname.includes("/plan-action")) ||
                    (item.name === "Messages" && (location.pathname.includes("/messages") || location.pathname === "/messages"))
                  )
                )}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
                {item.name === "Messages" && unreadCount && unreadCount.total > 0 && (
                  <Badge className="ml-auto h-5 min-w-[20px] rounded-full flex items-center justify-center px-1.5 text-xs">
                    {unreadCount.total > 99 ? "99+" : unreadCount.total}
                  </Badge>
                )}
              </Link>
            )
          ))}

          {/* Render categories */}
          {config.categories?.map((category, index) => (
            <SidebarSection
              key={`category-${category.name}-${index}`}
              category={category}
              isCollapsed={isCollapsed}
              location={location}
            />
          ))}

          {/* Render bottom items */}
          {config.bottomItems?.map((item, index) => (
            item.isDivider ? (
              <div key={`bottom-divider-${index}`} className="my-2 border-t border-gray-200"></div>
            ) : item.isCustomAction && item.name === "Retour à l'espace Adhérent" ? (
              <button
                key={`${item.path}-${item.name}-${index}`}
                onClick={() => navigate('/individual/dashboard')}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-all duration-200 w-full text-left text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
              </button>
            ) : (
              <Link
                key={`${item.path}-${item.name}-${index}`}
                to={item.path || '#'}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-all duration-200",
                  getActiveMenuClass(location.pathname === item.path)
                )}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          ))}

          {/* Legacy support for menuItems array */}
          {config.menuItems?.map((item, index) => (
            item.isDivider ? (
              <div key={`divider-${index}`} className="my-2 border-t border-gray-200"></div>
            ) : item.isCustomAction && item.path === "/organisation" ? (
              <button
                key={`${item.path}-${item.name}-${index}`}
                onClick={isStaffWithMultipleOrgs(userProfile, userOrganizations) ? () => setSwitchOrgModalOpen(true) : navigateToOrganisation}
                disabled={orgNavigationLoading || isUserProfileLoading || userOrganizationsLoading}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-all duration-200 w-full text-left",
                  (orgNavigationLoading || isUserProfileLoading || userOrganizationsLoading) ? "opacity-50 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
              >
                {item.icon}
                {!isCollapsed && (
                  <span>
                    {orgNavigationLoading || isUserProfileLoading || userOrganizationsLoading
                      ? "Chargement..."
                      : isStaffWithMultipleOrgs(userProfile, userOrganizations)
                        ? `${getCurrentOrgName(userProfile, userOrganizations)} ▼`
                        : (item.name || "Organisation")
                    }
                  </span>
                )}
              </button>
            ) : item.isCustomAction && item.isCreateOrg ? (
              <button
                key={`${item.path}-${item.name}-${index}`}
                onClick={() => {
                  setPublicOrgsModalOpen(true);
                }}
                disabled={organizationLoading}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-all duration-200 w-full text-left",
                  organizationLoading ? "opacity-50 cursor-not-allowed" : "text-aurentia-pink hover:bg-aurentia-pink/10 font-medium"
                )}
              >
                {item.icon}
                {!isCollapsed && <span>{organizationLoading ? "Chargement..." : item.name}</span>}
              </button>
            ) : item.isCustomAction && item.name === "Retour à l'espace Entrepreneur" ? (
              <button
                key={`${item.path}-${item.name}-${index}`}
                onClick={() => navigate('/individual/dashboard')}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-all duration-200 w-full text-left text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
              </button>
            ) : (
              <Link
                key={`${item.path}-${item.name}-${index}`}
                to={item.path || '#'}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-all duration-200 relative",
                  getActiveMenuClass(
                    (location.pathname === item.path && location.pathname !== "/warning") ||
                    (item.name === "Livrables" && location.pathname.includes("/project-business/")) ||
                    (item.name === "Assistant IA" && location.pathname.includes("/chatbot/")) ||
                    (item.name === "Automatisations" && location.pathname.startsWith("/automatisations")) ||
                    (item.name === "Partenaires" && location.pathname.startsWith("/partenaires")) ||
                    (item.name === "Plan d'action" && location.pathname.includes("/plan-action")) ||
                    (item.name === "Messages" && (location.pathname.includes("/messages") || location.pathname === "/messages"))
                  )
                )}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
                {item.name === "Messages" && unreadCount && unreadCount.total > 0 && (
                  <Badge className="ml-auto h-5 min-w-[20px] rounded-full flex items-center justify-center px-1.5 text-xs">
                    {unreadCount.total > 99 ? "99+" : unreadCount.total}
                  </Badge>
                )}
              </Link>
            )
          ))}
        </nav>

        {/* Profile section - Fixed at bottom */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3 bg-white/80 backdrop-blur-sm">
          {user && config.showCredits && (
            <div className={cn("px-3 mb-3", isCollapsed && "flex flex-col items-center")}>
              <CreditInfo isCollapsed={isCollapsed} {...credits} />
            </div>
          )}
          {user ? (
            <>
              <Link
                to="/individual/profile"
                className={cn("flex items-center gap-3 py-2 px-3 rounded-md text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700")}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                  {getUserInitial(user)}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{getUserDisplayName(user)}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                )}
              </Link>
              <button onClick={handleLogout} className={cn("flex items-center gap-3 py-2 px-3 rounded-md text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 w-full mt-2")}>
                <LogOut size={18} />
                {!isCollapsed && <span>Déconnexion</span>}
              </button>
            </>
          ) : (
            <Link to="/login" className={cn("flex items-center gap-3 py-2 px-3 rounded-md text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 w-full")}>
              <LogOut size={18} />
              {!isCollapsed && <span>Connexion</span>}
            </Link>
          )}
        </div>
      </div>
    </div>
  ), [
    isCollapsed,
    setIsCollapsed,
    showOrgBranding,
    orgLogo,
    orgName,
    config,
    userProfile,
    location,
    unreadCount,
    setSwitchOrgModalOpen,
    navigateToOrganisation,
    orgNavigationLoading,
    isUserProfileLoading,
    userOrganizationsLoading,
    setPublicOrgsModalOpen,
    organizationLoading,
    navigate,
    user,
    credits,
    handleLogout,
    userOrganizations
  ]);

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

  useEffect(() => {
    if (userProfile?.organization?.settings?.branding?.whiteLabel !== undefined) {
      const handleWhiteLabelChange = () => {
        window.location.reload();
      };

      const observer = new MutationObserver(handleWhiteLabelChange);
      const targetNode = document.querySelector('#white-label-toggle'); // Replace with actual toggle element ID

      if (targetNode) {
        observer.observe(targetNode, { attributes: true });
      }

      return () => {
        observer.disconnect();
      };
    }
  }, [userProfile?.organization?.settings?.branding?.whiteLabel]);

  // Track sidebar context based on current route
  useEffect(() => {
    // Ne pas mettre à jour le contexte si on est sur /messages (pour préserver le contexte actuel)
    if (location.pathname === '/messages') {
      return;
    }

    // Détecter le contexte basé sur le pathname
    const detectedContext = detectSidebarContextFromPath(location.pathname);

    if (detectedContext) {
      setSidebarContext(detectedContext);
    }
  }, [location.pathname]);

  return (
    <>
      {isMobile ? <RoleBasedMobileNavbar
        userProfile={userProfile}
        organizationId={organizationId}
        joinOrgModalOpen={joinOrgModalOpen}
        setJoinOrgModalOpen={setJoinOrgModalOpen}
        invitationCode={invitationCode}
        setInvitationCode={setInvitationCode}
        joinOrgLoading={joinOrgLoading}
        joinOrgError={joinOrgError}
        setJoinOrgError={setJoinOrgError}
        handleJoinOrganization={handleJoinOrganization}
        publicOrgsModalOpen={publicOrgsModalOpen}
        setPublicOrgsModalOpen={setPublicOrgsModalOpen}
      /> : desktopSidebarJSX}
      
      {/* Join Organization Modal */}
      <Dialog open={joinOrgModalOpen} onOpenChange={setJoinOrgModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rejoindre une organisation</DialogTitle>
            <DialogDescription>
              Entrez le code d'invitation ou le lien d'invitation que vous avez reçu pour rejoindre une organisation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invitation-code" className="text-right">
                Code d'invitation
              </Label>
              <Input
                id="invitation-code"
                value={invitationCode}
                onChange={(e) => {
                  setInvitationCode(e.target.value);
                  if (joinOrgError) setJoinOrgError(''); // Clear error when user types
                }}
                className="col-span-3"
                placeholder="INV-ABC123 ou https://..."
              />
            </div>
            {joinOrgError && (
              <div className="text-red-600 text-sm text-center">
                {joinOrgError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setJoinOrgModalOpen(false);
                setInvitationCode('');
                setJoinOrgError('');
              }}
            >
              Annuler
            </Button>
            <Button 
              type="button" 
              onClick={handleJoinOrganization}
              disabled={joinOrgLoading}
              className="bg-aurentia-pink hover:bg-aurentia-pink/90"
            >
              {joinOrgLoading ? 'Rejoindre...' : 'Rejoindre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Switch Organization Modal for Staff */}
      <Dialog open={switchOrgModalOpen} onOpenChange={setSwitchOrgModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Changer d'organisation</DialogTitle>
            <DialogDescription>
              Sélectionnez l'organisation dans laquelle vous souhaitez travailler.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {userOrganizationsLoading ? (
              <div className="text-center text-gray-500">Chargement des organisations...</div>
            ) : userOrganizations.length === 0 ? (
              <div className="text-center text-gray-500">Aucune organisation trouvée</div>
            ) : (
              <div className="space-y-2">
                {userOrganizations.map((userOrg) => (
                  <button
                    key={userOrg.id}
                    onClick={() => handleSwitchOrganization(userOrg.organization_id)}
                    disabled={switchOrgLoading}
                    className={cn(
                      "w-full p-3 rounded-md border text-left transition-colors",
                      userOrg.is_primary
                        ? "border-aurentia-pink bg-aurentia-pink/10 text-aurentia-pink"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {userOrg.organization?.logo && (
                        <img 
                          src={userOrg.organization.logo} 
                          alt={userOrg.organization.name} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{userOrg.organization?.name || 'Organisation inconnue'}</p>
                        <p className="text-sm text-gray-500 capitalize">{userOrg.user_role}</p>
                      </div>
                      {userOrg.is_primary && (
                        <span className="text-xs bg-aurentia-pink text-white px-2 py-1 rounded-full">
                          Actuelle
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setSwitchOrgModalOpen(false)}
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Public Organizations Discovery Modal */}
      <PublicOrganizationsModal
        isOpen={publicOrgsModalOpen}
        onClose={() => setPublicOrgsModalOpen(false)}
        userAddress={userProfile?.address}
      />

      {/* Organization Setup Guide Modal (one-time per session) */}
      <OrganizationSetupGuideModal
        isOpen={showOrgSetupGuide}
        onClose={handleCloseOrgSetupGuide}
        onStartSetup={handleStartOrgSetup}
        onDismissPermanently={handleDismissPermanently}
      />
    </>
  );
});

// Role-based Mobile Navbar
const RoleBasedMobileNavbar = ({ 
  userProfile,
  organizationId,
  joinOrgModalOpen,
  setJoinOrgModalOpen,
  invitationCode,
  setInvitationCode,
  joinOrgLoading,
  joinOrgError,
  setJoinOrgError,
  handleJoinOrganization,
  publicOrgsModalOpen,
  setPublicOrgsModalOpen
}: { 
  userProfile: UserProfile | null;
  organizationId: string | null;
  joinOrgModalOpen: boolean;
  setJoinOrgModalOpen: (open: boolean) => void;
  invitationCode: string;
  setInvitationCode: (code: string) => void;
  joinOrgLoading: boolean;
  joinOrgError: string;
  setJoinOrgError: (error: string) => void;
  handleJoinOrganization: () => Promise<void>;
  publicOrgsModalOpen: boolean;
  setPublicOrgsModalOpen: (open: boolean) => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { currentProjectId, userProjects, userCredits, creditsLoading } = useProject();
  const [user, setUser] = useState<any>(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { navigateToOrganisation, loading: orgNavigationLoading } = useOrganisationNavigation();
  const { hasOrganization, loading: organizationLoading } = useUserOrganization();

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

    // Si l'utilisateur est sur une route /individual/*, afficher les items individual même s'il a un rôle organisation
    if (location.pathname.startsWith('/individual/')) {
      return getIndividualMobileItems();
    }

    switch (userProfile.user_role) {
      case 'organisation':
      case 'staff':
        // Use organizationId from parent scope
        if (!organizationId) {
          // If no organization ID, fallback to individual items
          return getIndividualMobileItems();
        }
        return [
          { name: "Tableau de bord", path: `/organisation/${organizationId}/dashboard`, icon: <LayoutDashboard size={20} /> },
          { name: "Messages", path: `/messages`, icon: <Mail size={20} /> },
          { name: "Adhérents", path: `/organisation/${organizationId}/adherents`, icon: <Users size={20} /> },
          { name: "Projets", path: `/organisation/${organizationId}/projets`, icon: <FileText size={20} /> },
          { name: "Codes d'invitation", path: `/organisation/${organizationId}/invitations`, icon: <Code size={20} /> },
          { name: "Analytics", path: `/organisation/${organizationId}/analytics`, icon: <BarChart3 size={20} /> },
          { name: "Paramètres", path: `/organisation/${organizationId}/settings`, icon: <Settings size={20} /> }
        ];
        
      case 'member':
        return [
          { name: "Tableau de bord", path: "/individual/dashboard", icon: <LayoutDashboard size={20} /> },
          { name: "Messages", path: "/messages", icon: <Mail size={20} /> },
          { name: "Livrables", path: activeProjectId ? `/individual/project-business/${activeProjectId}` : "/individual/project-business", icon: <FileText size={20} /> },
          { name: "Assistant IA", path: activeProjectId ? `/individual/chatbot/${activeProjectId}` : "/individual/chatbot", icon: <MessageSquare size={20} /> },
          { name: "Plan d'action", path: "/individual/plan-action", icon: <LandPlot size={20} /> },
          { name: "Outils", path: "/individual/outils", icon: <Settings size={20} /> },
          { name: "Automatisations", path: "/individual/automatisations", icon: <Zap size={20} /> },
          { name: "Partenaires", path: "/individual/partenaires", icon: <Handshake size={20} /> },
          { name: "Ressources", path: "/individual/ressources", icon: <Library size={20} /> },
          { name: "Mon Organisation", path: "/individual/my-organization", icon: <Building size={20} /> },
          { name: "Collaborateurs", path: "/individual/collaborateurs", icon: <Users size={20} /> }
        ];
        
      case 'individual':
      default:
        return getIndividualMobileItems();
    }
  };

  const getIndividualMobileItems = () => {
    // Determine what organization-related item to show (same logic as desktop)
    let orgItem;
    if (organizationLoading) {
      // Show loading state - use direct link to avoid OrganisationRedirect  
      orgItem = { name: "Organisation", path: organizationId ? `/organisation/${organizationId}/dashboard` : "/setup-organization", icon: <Building size={20} />, isCustomAction: true };
    } else if (userProfile && userProfile.user_role === 'member') {
      // Members go directly to my-organization page (no redirect through /organisation)
      const orgName = userProfile?.organization?.name;
      orgItem = { name: orgName || "Mon Organisation", path: "/individual/my-organization", icon: <Building size={20} /> };
    } else if (hasOrganization || (userProfile && (userProfile.user_role === 'organisation' || userProfile.user_role === 'staff'))) {
      // CRITICAL FIX: User has an organization OR has organization role - use direct dashboard link
      const orgName = userProfile?.organization?.name;
      const directPath = organizationId ? `/organisation/${organizationId}/dashboard` : "/setup-organization";
      orgItem = { name: orgName || "Organisation", path: directPath, icon: <Building size={20} />, isCustomAction: true };
    } else {
      // User doesn't have an organization - show "Rejoindre une organisation" button
      orgItem = { name: "Rejoindre une organisation", path: "/join-organization", icon: <Plus size={20} />, isCustomAction: true, isCreateOrg: true };
    }

    return [
      { name: "Tableau de bord", path: "/individual/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "Messages", path: "/messages", icon: <Mail size={20} /> },
      { name: "Livrables", path: activeProjectId ? `/individual/project-business/${activeProjectId}` : "/individual/project-business", icon: <FileText size={20} /> },
      { name: "Assistant IA", path: activeProjectId ? `/individual/chatbot/${activeProjectId}` : "/individual/chatbot", icon: <MessageSquare size={20} /> },
      { name: "Plan d'action", path: "/individual/plan-action", icon: <LandPlot size={20} /> },
      { name: "Outils", path: "/individual/outils", icon: <Settings size={20} /> },
      { name: "Automatisations", path: "/individual/automatisations", icon: <Zap size={20} /> },
      { name: "Partenaires", path: "/individual/partenaires", icon: <Handshake size={20} /> },
      { name: "Ressources", path: "/individual/ressources", icon: <Library size={20} /> },
      orgItem,
      { name: "Collaborateurs", path: "/individual/collaborateurs", icon: <Users size={20} /> }
    ];
  };

  const menuItems = getMobileMenuItems();
    // Ajout du bouton retour pour organisation/staff seulement quand on est dans l'espace organisation
    if (userProfile && (userProfile.user_role === 'organisation' || userProfile.user_role === 'staff') && location.pathname.startsWith('/organisation/')) {
      menuItems.push({ name: "Retour à l'espace Adhérent", path: "/individual/dashboard", icon: <LayoutDashboard size={20} />, isCustomAction: true });
    }

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
                <img src="/credit-3D.png" alt="Crédits" className="h-4 w-4" />
                <span className="font-medium text-gray-700">
                  {creditsLoading ? '...' : `${((userCredits.monthly_credits_remaining || 0) + (userCredits.purchased_credits_remaining || 0))} / ${userCredits.monthly_credits_limit}`}
                </span>
              </div>
            </div>
          )}
          
          {/* Scrollable navigation items */}
          <div className="px-3 py-3 overflow-x-auto scrollbar-hide">
            <div className="flex items-center space-x-3 min-w-max">
              {menuItems.map((item) => (
                item.isCustomAction && item.path === "/organisation" ? (
                  <button
                    key={item.name}
                    onClick={navigateToOrganisation}
                    disabled={orgNavigationLoading}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0',
                      orgNavigationLoading ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                    )}
                  >
                    {item.icon}
                  </button>
                ) : item.isCustomAction && item.isCreateOrg ? (
                  <button
                    key={item.name}
                    onClick={() => {
                      setPublicOrgsModalOpen(true);
                    }}
                    disabled={organizationLoading}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0',
                      organizationLoading ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-aurentia-pink/10 text-aurentia-pink hover:bg-aurentia-pink/20 hover:scale-105'
                    )}
                  >
                    {item.icon}
                  </button>
                  ) : item.isCustomAction && item.name === "Retour à l'espace Adhérent" ? (
                    <button
                      key={item.name}
                      onClick={() => navigate('/individual/dashboard')}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                      )}
                    >
                      {item.icon}
                    </button>
                ) : (
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
                )
              ))}
              {user ? (
                <Link
                  to="/individual/profile"
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
  const { userProjectsLoading } = useProject();

  if (isLoading || userProjectsLoading) {
    return <p className="text-xs text-gray-500">{isCollapsed ? "..." : "Chargement crédits..."}</p>;
  }

  if (error) {
    return <p className="text-xs text-red-500">{isCollapsed ? "!" : "Erreur crédits"}</p>;
  }

  // Handle null/undefined values gracefully
  const displayMonthlyRemaining = monthlyRemaining ?? 0;
  const displayMonthlyLimit = monthlyLimit ?? 0;
  const displayPurchasedRemaining = purchasedRemaining ?? 0;
  const totalCredits = displayMonthlyRemaining + displayPurchasedRemaining;

  // Affichage fusionné
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center w-full">
        <img src="/credit-3D.png" alt="Crédit" className="w-8 h-8 mb-1" />
        <span className="text-sm text-gray-700">{totalCredits}</span>
        <hr className="w-8 my-1 border-gray-300" />
        <span className="text-xs text-gray-500">{displayMonthlyLimit}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 w-full items-start">
      <div className="flex items-center gap-2">
        <img src="/credit-3D.png" alt="Crédit" className="w-6 h-6" />
        <span className="text-sm text-gray-700">{totalCredits} / {displayMonthlyLimit}</span>
      </div>
    </div>
  );
};export default RoleBasedSidebar;
