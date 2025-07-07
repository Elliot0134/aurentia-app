
import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
    });

    // Check if user is already signed in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    
    checkUser();

    return () => {
      // Cleanup listener
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Auth state listener will handle navigation
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur s'est produite lors de la connexion",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://app.aurentia.fr/dashboard"
        }
      });
      
      if (error) throw error;
      
      // Redirect is handled by Supabase
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur s'est produite lors de la connexion avec Google",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
            Bienvenue sur Aurentia
          </h1>
          <p className="text-gray-600">
            Transformez vos idées en projets viables
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
              placeholder="votre@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <button type="button" className="text-sm text-aurentia-pink hover:text-aurentia-orange transition" onClick={() => setShowForgotPassword(true)}>
                Mot de passe oublié
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full btn-primary py-3"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">ou</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.1716 8.36791H17.5001V8.33333H10.0001V11.6667H14.7097C14.0221 13.6071 12.1801 15 10.0001 15C7.23866 15 5.00008 12.7614 5.00008 10C5.00008 7.23858 7.23866 5 10.0001 5C11.2959 5 12.4784 5.48098 13.3618 6.26625L15.8001 3.82791C14.2918 2.46425 12.2584 1.66667 10.0001 1.66667C5.39758 1.66667 1.66675 5.3975 1.66675 10C1.66675 14.6025 5.39758 18.3333 10.0001 18.3333C14.6026 18.3333 18.3334 14.6025 18.3334 10C18.3334 9.44125 18.2726 8.89625 18.1716 8.36791Z" fill="#FFC107"/>
              <path d="M2.62744 6.12425L5.36494 8.1485C6.10119 6.30508 7.90036 5 10.0001 5C11.2959 5 12.4784 5.48098 13.3618 6.26625L15.8001 3.82791C14.2918 2.46425 12.2584 1.66667 10.0001 1.66667C6.87911 1.66667 4.21619 3.47633 2.62744 6.12425Z" fill="#FF3D00"/>
              <path d="M10.0001 18.3333C12.2126 18.3333 14.2084 17.5646 15.7068 16.2481L13.0326 13.9888C12.1352 14.6441 11.0468 15 10.0001 15C7.83019 15 5.99769 13.6221 5.30185 11.6975L2.48352 13.8695C4.05185 16.5783 6.74269 18.3333 10.0001 18.3333Z" fill="#4CAF50"/>
              <path d="M18.1716 8.36791H17.5001V8.33333H10.0001V11.6667H14.7097C14.3809 12.6051 13.7889 13.4221 13.0309 13.9896L13.0326 13.9879L15.7068 16.2471C15.5068 16.4279 18.3334 14.1667 18.3334 10C18.3334 9.44125 18.2726 8.89625 18.1716 8.36791Z" fill="#1976D2"/>
            </svg>
            <span>Continuer avec Google</span>
          </button>

        </form>

        {showForgotPassword && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold text-center">Réinitialiser le mot de passe</h2>
            <div className="space-y-2">
              <label htmlFor="forgot-password-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="forgot-password-email"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </div>
            <button
              type="button"
              className="w-full btn-primary py-3"
              onClick={async () => {
                setLoading(true);
                try {
                  const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
                    redirectTo: window.location.origin + '/update-password', // You'll need to create this page
                  });
                  if (error) throw error;
                  toast({
                    title: "Email envoyé",
                    description: "Veuillez vérifier votre email pour le lien de réinitialisation.",
                  });
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                } catch (error: any) {
                  toast({
                    title: "Erreur",
                    description: error.message || "Une erreur s'est produite.",
                    variant: "destructive",
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
            </button>
            <button
              type="button"
              className="w-full text-sm text-gray-600 hover:text-gray-800 transition"
              onClick={() => setShowForgotPassword(false)}
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          Pas encore de compte ?{" "}
          <a href="/signup" className="text-aurentia-pink hover:text-aurentia-orange transition">
            Inscrivez-vous
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
