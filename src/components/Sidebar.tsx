import { useState, useEffect, memo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, BookOpen, LogOut, MessageSquare, Handshake, LandPlot, ChevronLeft, Library, Users } from "lucide-react"; // Import Library and Users
import { cn } from "@/lib/utils";
import ProjectSelector from "./ProjectSelector";
import { supabase } from "@/integrations/supabase/client";
import MobileNavbar from "./MobileNavbar"; // Import the new MobileNavbar component
import { useProject } from "@/contexts/ProjectContext";
import { Zap } from "lucide-react";
import AurentiaLogo from "./AurentiaLogo"; // Import the AurentiaLogo component

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar = memo(({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { projectId } = useParams(); // Get project ID from URL
  const { currentProjectId, userProjects, userCredits, creditsLoading } = useProject(); // Get project data and credits from context

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

  const menuItems = [
    {
      name: "Tableau de bord",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      name: "Livrables",
      path: activeProjectId ? `/project-business/${activeProjectId}` : "/warning", // Redirect to project creation if no project
      icon: <FileText size={20} />
    },
    {
      name: "Assistant IA",
      path: activeProjectId ? `/chatbot/${activeProjectId}` : "/warning", // Redirect to project creation if no project
      icon: <MessageSquare size={20} />
    },
    {
      isDivider: true, // Custom property to indicate a divider
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
      isDivider: true, // Custom property to indicate a divider
    },
    {
      name: "Collaborateurs",
      path: "/collaborateurs",
      icon: <Users size={20} />
    },
  ];

  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

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

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div className={cn("hidden md:block h-screen fixed top-0 left-0 z-10 transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
      <div className="bg-white h-full rounded-r-xl shadow-sm border-r border-gray-100 relative">
        <div className="flex items-center p-4 gap-2 relative">
          <AurentiaLogo />
          {!isCollapsed && <h1 className="text-lg font-semibold">Aurentia</h1>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-[-12px] top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-100 transition-all duration-300"
          >
            <ChevronLeft size={16} className={cn("transition-transform duration-300", isCollapsed ? "rotate-180" : "")} />
          </button>
        </div>
        <div className="border-b border-gray-200 mx-4 mb-4"></div> {/* Separator line */}

        <div className={cn("mb-6 px-3")}> {/* Removed isCollapsed && "hidden" */}
          <ProjectSelector isCollapsed={isCollapsed} />
        </div>

        <nav className="space-y-1 flex-1 px-3">
          {menuItems.map((item, index) => (
            item.isDivider ? (
              <div key={`divider-${index}`} className="my-4 border-t border-gray-200"></div>
            ) : (
              <Link
                key={`${item.path}-${item.name}-${index}`}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-colors",
                  (location.pathname === item.path && location.pathname !== "/warning") ||
                  (item.name === "Livrables" && location.pathname.startsWith("/project-business/")) ||
                  (item.name === "Assistant IA" && location.pathname.startsWith("/chatbot/")) ||
                  (item.name === "Automatisations" && location.pathname.startsWith("/automatisations")) ||
                  (item.name === "Partenaires" && location.pathname.startsWith("/partenaires")) ||
                  (item.name === "Plan d'action" && location.pathname.startsWith("/roadmap"))
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
          {user && userCredits && (
            <div className={cn("px-3 mb-2", isCollapsed && "flex justify-center")}> {/* Adjusted padding and added margin-bottom, added justify-center for collapsed state */}
              <div className={cn("flex items-center gap-2 py-2.5 px-4 rounded-md text-sm bg-gray-50", isCollapsed && "w-fit flex-col justify-center gap-0.5")}> {/* Added w-fit, flex-col, justify-center, gap-0.5 for collapsed state */}
                <Zap size={16} className="text-yellow-500" />
                {!isCollapsed && (
                  <span className="font-medium text-gray-700">
                    {creditsLoading ? '...' : `${userCredits.current} / ${userCredits.max}`}
                  </span>
                )}
                {isCollapsed && (
                  <span className="font-medium text-gray-700 text-center"> {/* Added text-center for collapsed state */}
                    {creditsLoading ? '...' : `${userCredits.current}/${userCredits.max}`}
                  </span>
                )}
              </div>
            </div>
          )}
          {user ? (
            <>
              <Link
                to="/profile"
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
      {isMobile ? <MobileNavbar /> : <DesktopSidebar />}
    </>
  );
});

export default Sidebar;
