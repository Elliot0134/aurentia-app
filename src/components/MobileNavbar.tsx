import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { LayoutDashboard, Settings, Zap, BookOpen, LogOut, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/contexts/ProjectContext";

const MobileNavbar = () => {
  const location = useLocation();
  const { projectId } = useParams();
  const { currentProjectId, userProjects } = useProject();
  const [user, setUser] = useState<any>(null);

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

  // Use currentProjectId from context, fallback to projectId from URL, or first available project
  const activeProjectId = currentProjectId || projectId || (userProjects.length > 0 ? userProjects[0].project_id : null);

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
    {
      name: "Assistant",
      path: activeProjectId ? `/chatbot/${activeProjectId}` : "/warning",
      icon: <MessageSquare size={20} />
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <nav className="flex justify-around py-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 text-sm transition-colors p-2",
              location.pathname === item.path
                ? "text-primary font-medium"
                : "text-gray-700 hover:text-primary"
            )}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {React.cloneElement(item.icon, { size: 24 })}
            </div>
          </Link>
        ))}
        {user ? (
           <Link
            to="/profile"
            className={cn(
              "flex flex-col items-center gap-1 text-sm transition-colors p-2",
              location.pathname === "/profile"
                ? "text-primary font-medium"
                : "text-gray-700 hover:text-primary"
            )}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
          </Link>
        ) : (
          <Link
            to="/login"
            className={cn(
              "flex flex-col items-center gap-1 text-sm transition-colors p-2",
              location.pathname === "/login"
                ? "text-primary font-medium"
                : "text-gray-700 hover:text-primary"
            )}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <LogOut size={24} />
            </div>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default MobileNavbar;
