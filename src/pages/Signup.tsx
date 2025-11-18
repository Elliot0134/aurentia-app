import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;

      // Envoyer l'email de confirmation via notre fonction Edge
      if (data?.user) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
            body: {
              email: email,
              userId: data.user.id,
              userAgent: navigator.userAgent
            }
          });

          if (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
          }
        } catch (emailErr) {
          console.error('Erreur lors de l\'appel à send-confirmation-email:', emailErr);
        }

        // Check if user validated beta access code
        const hasBetaAccess = localStorage.getItem('aurentia_has_beta_access') === 'true';
        if (hasBetaAccess) {
          try {
            // Update profile with beta access
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ has_beta_access: true })
              .eq('id', data.user.id);

            if (profileError) {
              console.error('Erreur lors de la mise à jour du profil avec beta access:', profileError);
            }
          } catch (profileErr) {
            console.error('Erreur lors de la mise à jour du beta access:', profileErr);
          }
        }
      }

      // Redirect to login immediately with confirmation parameter
      navigate("/login?confirmation=true&email=" + encodeURIComponent(email));
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur s'est produite lors de l'inscription",
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
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la connexion avec Google",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f8f8f6' }}>
      <div className="w-full max-w-[450px]">
        {/* Logo Aurentia */}
        <div className="flex items-center justify-center mb-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards]">
          <img
            src="/aurentia-logo-long.svg"
            alt="Aurentia"
            className="h-10"
          />
        </div>

        {/* Main Card */}
        <div className="rounded-2xl shadow-sm border border-gray-100 p-8 bg-white opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]" style={{ fontFamily: 'var(--font-base)' }}>
          <div className="text-center mb-8 opacity-0 animate-[fadeInBlur_0.8s_ease-out_0.4s_forwards]">
            <h1 className="text-2xl font-semibold font-biz-ud-mincho" style={{ color: 'var(--text-gris-profond)' }}>
              Créer votre compte
            </h1>
          </div>

          {/* OAuth Buttons */}
          <div className="flex gap-3 mb-6 opacity-0 animate-[fadeInBlur_0.8s_ease-out_0.6s_forwards]">
            <button
              type="button"
              className="flex-1 flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:scale-[0.98] transition-all duration-200 ease-in-out"
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex-1 flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:scale-[0.98] transition-all duration-200 ease-in-out"
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6 opacity-0 animate-[fadeInBlur_0.8s_ease-out_0.8s_forwards]">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-500 bg-white">Ou continuer avec</span>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4 opacity-0 animate-[fadeInBlur_0.8s_ease-out_1s_forwards]">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Nom complet
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('password') as HTMLInputElement;
                      if (input) {
                        input.style.filter = 'blur(4px)';
                        setTimeout(() => {
                          setShowPassword(!showPassword);
                          setTimeout(() => {
                            input.style.filter = 'blur(0px)';
                          }, 50);
                        }, 150);
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition z-10"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <Eye className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                    ) : (
                      <EyeOff className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-12"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('confirmPassword') as HTMLInputElement;
                      if (input) {
                        input.style.filter = 'blur(4px)';
                        setTimeout(() => {
                          setShowConfirmPassword(!showConfirmPassword);
                          setTimeout(() => {
                            input.style.filter = 'blur(0px)';
                          }, 50);
                        }, 150);
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition z-10"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <Eye className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                    ) : (
                      <EyeOff className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Le mot de passe doit contenir au moins 8 caractères.
            </p>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-aurentia-orange text-white py-3 rounded-lg hover:bg-aurentia-orange/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out text-base"
                disabled={loading}
              >
                {loading ? "Création..." : "Créer un compte"}
              </button>
            </div>
          </form>

          {/* Sign in link */}
          <div className="mt-8 text-center text-sm text-gray-600 opacity-0 animate-[fadeInBlur_0.8s_ease-out_1.2s_forwards]">
            Vous avez déjà un compte ?<br />
            <a href="/login" className="underline underline-offset-4 hover:text-[#FF592C] transition-colors duration-200" style={{ color: 'var(--text-gris-profond)' }}>
              Se connecter
            </a>
          </div>
        </div>

        {/* Terms and Privacy Policy */}
        <div className="mt-6 text-center text-xs text-gray-500 opacity-0 animate-[fadeInBlur_0.8s_ease-out_1.4s_forwards]" style={{ fontFamily: 'var(--font-base)' }}>
          En continuant, vous acceptez nos{" "}
          <a href="#" className="underline underline-offset-4 hover:text-gray-700 transition-colors duration-200">
            Conditions d'utilisation
          </a>
          {" "}et notre{" "}
          <a href="#" className="underline underline-offset-4 hover:text-gray-700 transition-colors duration-200">
            Politique de confidentialité
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default Signup;
