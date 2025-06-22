
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setIsLoggedIn(true);
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
      }
    });

    return () => {
      // Cleanup listener
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Déconnexion réussie",
        description: "Vous êtes maintenant déconnecté",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  // Logo placeholder - in a real app, you'd use an actual logo file
  const Logo = () => (
    <Link to="/dashboard" className="flex items-center">
      <div className="font-semibold text-xl bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
        Aurentia
      </div>
    </Link>
  );

  return (
    <header className="w-full border-b border-gray-100 bg-white py-4">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Logo />
        
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors px-4 py-2">
              <FileText size={18} />
              <span className="hidden md:inline">Mes projets</span>
            </Link>
          )}
          
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="btn-primary">
                Se connecter
              </Link>
              <Link to="/login" className="btn-outline hidden md:inline-block">
                Commencer mon projet
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="btn-outline hidden md:inline-block">
                Commencer mon projet
              </Link>
              <button onClick={handleLogout} className="btn-primary">
                Se déconnecter
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
