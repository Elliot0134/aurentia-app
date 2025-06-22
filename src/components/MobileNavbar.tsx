import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, BookOpen, Zap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const MobileNavbar = () => {
  const location = useLocation();
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

  const menuItems = [
    {
      name: "Tableau de bord",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />
    },

  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <nav className="flex justify-around py-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 text-xs transition-colors",
              location.pathname === item.path
                ? "text-primary font-medium"
                : "text-gray-700 hover:text-primary"
            )}
          >
            {item.icon}
          </Link>
        ))}
        {user ? (
           <Link
            to="/profile"
            className={cn(
              "flex flex-col items-center gap-1 text-xs transition-colors",
              location.pathname === "/profile"
                ? "text-primary font-medium"
                : "text-gray-700 hover:text-primary"
            )}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
          </Link>
        ) : (
          <Link
            to="/login"
            className={cn(
              "flex flex-col items-center gap-1 text-xs transition-colors",
              location.pathname === "/login"
                ? "text-primary font-medium"
                : "text-gray-700 hover:text-primary"
            )}
          >
            <LogOut size={20} />
          </Link>
        )}
      </nav>
    </div>
  );
};

export default MobileNavbar;
