import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { LayoutDashboard, Settings, Zap, BookOpen, LogOut, MessageSquare, Handshake, LandPlot, Library, Users, FileText, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/contexts/ProjectContext";
import { useCredits } from "@/hooks/useCreditsSimple";
import { useIsMobile } from "@/hooks/use-mobile";
import clsx from 'clsx';

const MobileNavbar = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { projectId } = useParams();
  const { currentProjectId, userProjects } = useProject();
  const { monthlyRemaining, monthlyLimit, purchasedRemaining, isLoading, error } = useCredits();
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

  const menuItems = [
    {
      name: "Tableau de bord",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      name: "Livrables",
      path: activeProjectId ? `/project-business/${activeProjectId}` : "/warning",
      icon: <FileText size={20} />
    },
    {
      name: "Assistant IA",
      path: activeProjectId ? `/chatbot/${activeProjectId}` : "/warning",
      icon: <MessageSquare size={20} />
    },
    {
      name: "Plan d'action",
      path: `/roadmap/${activeProjectId}`,
      icon: <LandPlot size={20} />
    },
    {
      name: "Outils",
      path: "/outils",
      icon: <Settings size={20} />
    },
    {
      name: "Automatisations",
      path: "/automatisations",
      icon: <Zap size={20} />
    },
    {
      name: "Partenaires",
      path: "/partenaires",
      icon: <Handshake size={20} />
    },
    {
      name: "Ressources",
      path: "/ressources",
      icon: <Library size={20} />
    },
    {
      name: "Collaborateurs",
      path: "/collaborateurs",
      icon: <Users size={20} />
    },
  ];

  if (!isMobile) return null;

  // Determine if we're on a form page with navigation arrows (right side)
  const isFormPageWithArrows =
    location.pathname === '/onboarding' ||
    location.pathname === '/individual/create-project-form' ||
    location.pathname === '/individual/form-business-idea' ||
    location.pathname === '/individual/plan-action';

  // Position burger on left for form pages with arrows, right for others
  const burgerPosition = isFormPageWithArrows ? 'left-6' : 'right-6';

  return (
    <>
      {/* Menu toggle button - only show when navbar is closed */}
      {/* Menu toggle button - only show when navbar is closed */}
      {!isNavbarOpen && (
        <button
          onClick={() => setIsNavbarOpen(true)}
          className={cn("fixed bottom-6 z-50 w-10 h-10 bg-gradient-primary text-white rounded-md shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 md:hidden", burgerPosition)}
        >
          <Menu size={18} />
        </button>
      )}

      {/* Navbar container with fade animation */}
      <div
        className={clsx(
          "fixed bottom-4 left-4 right-4 z-50 md:hidden transition-all duration-300 ease-in-out",
          isNavbarOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        )}
      >
        {/* Main navigation with scrollable content */}
        <nav className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Credits display for mobile - integrated into navbar */}
          {user && (
            <div className="bg-white px-4 py-2 border-b border-gray-200">
              <div className="flex items-center justify-center gap-2 text-sm">
                <img src="/credit-3D.png" alt="Crédit" className="w-5 h-5" />
                <span className="text-gray-700">
                  {isLoading ? '...' : `${(monthlyRemaining ?? 0) + (purchasedRemaining ?? 0)} / ${monthlyLimit ?? 0}`}
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
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0',
                    (location.pathname === item.path && location.pathname !== "/warning") ||
                    (item.name === "Livrables" && location.pathname.startsWith("/project-business/")) ||
                    (item.name === "Assistant IA" && location.pathname.startsWith("/chatbot/")) ||
                    (item.name === "Automatisations" && location.pathname.startsWith("/automatisations")) ||
                    (item.name === "Partenaires" && location.pathname.startsWith("/partenaires")) ||
                    (item.name === "Plan d'action" && location.pathname.startsWith("/roadmap")) ||
                    (item.name === "Ressources" && location.pathname.startsWith("/ressources")) ||
                    (item.name === "Collaborateurs" && location.pathname.startsWith("/collaborateurs"))
                      ? 'bg-gradient-primary text-white shadow-md scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                  )}
                >
                  {React.cloneElement(item.icon, { size: 20 })}
                </Link>
              ))}
              {user ? (
                <Link
                  to="/profile"
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0',
                    location.pathname === "/profile"
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
                  className={clsx(
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
                <X size={20} />
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default MobileNavbar;
