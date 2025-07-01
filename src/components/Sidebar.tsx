import { useState, useEffect, memo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, BookOpen, Zap, LogOut, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import ProjectSelector from "./ProjectSelector";
import { supabase } from "@/integrations/supabase/client";
import MobileNavbar from "./MobileNavbar"; // Import the new MobileNavbar component
import { useProject } from "@/contexts/ProjectContext";

const Sidebar = memo(() => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { projectId } = useParams(); // Get project ID from URL
  const { currentProjectId, userProjects } = useProject(); // Get project data from context

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
    // { À re afficher quand les ressources seront faites
    //   name: "Ressources",
    //   path: "/knowledge",
    //   icon: <BookOpen size={20} />
    // },
    {
      name: "Outils",
      path: "/outils",
      icon: <Settings size={20} />
    },
    {
      name: "Assistant",
      path: activeProjectId ? `/chatbot/${activeProjectId}` : "/warning", // Redirect to project creation if no project
      icon: <MessageSquare size={20} />
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
    <div className="hidden md:block h-screen fixed top-0 left-0 z-10 w-64">
      <div className="bg-white h-full rounded-r-xl shadow-sm border-r border-gray-100 relative">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Aurentia</h1>
        </div>

        <div className="mb-6 px-3">
          <ProjectSelector />
        </div>

        <nav className="space-y-1 flex-1 px-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-colors",
                location.pathname === item.path
                  ? "bg-gradient-primary text-white font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Profile section for desktop */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-3">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-3 py-2 px-3 rounded-md text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                  {getUserInitial()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 py-2 px-3 rounded-md text-sm text-gray-700 hover:bg-gray-100 w-full mt-2">
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-3 py-2 px-3 rounded-md text-sm text-gray-700 hover:bg-gray-100 w-full">
              <LogOut size={18} />
              <span>Connexion</span>
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
