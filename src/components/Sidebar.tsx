
import { useState, useEffect, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, BookOpen, Zap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import ProjectSelector from "./ProjectSelector";
import { supabase } from "@/integrations/supabase/client";
import MobileNavbar from "./MobileNavbar"; // Import the new MobileNavbar component

const Sidebar = memo(() => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

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

  const menuItems = [
    {
      name: "Tableau de bord",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      name: "Outils",
      path: "/outils",
      icon: <Settings size={20} />
    },
  ];

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
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white">
                  {user.email ? user.email[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-medium">Utilisateur Connecté</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
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

  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

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
