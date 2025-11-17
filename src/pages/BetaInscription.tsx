import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const BETA_SUBSCRIPTION_KEY = "aurentia_beta_subscribed";

const BetaInscription = () => {
  const [hasCode, setHasCode] = useState<boolean | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur s'est déjà inscrit au chargement
  useEffect(() => {
    const subscribed = localStorage.getItem(BETA_SUBSCRIPTION_KEY);
    if (subscribed === "true") {
      setIsSubscribed(true);
      setHasCode(false); // Afficher l'état d'inscription
    }
  }, []);

  const VALID_PROMO_CODE = "36HCHRONO";
  const BETA_ACCESS_KEY = "aurentia_has_beta_access";

  const handleCodeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === VALID_PROMO_CODE) {
      // Code valide, sauvegarder dans localStorage
      localStorage.setItem(BETA_ACCESS_KEY, "true");

      toast({
        title: "Code validé !",
        description: "Vous pouvez maintenant créer votre compte.",
      });

      // Rediriger vers signup
      navigate("/signup");
    } else {
      // Code invalide
      setCodeError(true);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("beta")
        .insert([{ email }]);

      if (error) throw error;

      // Sauvegarder l'état dans localStorage
      localStorage.setItem(BETA_SUBSCRIPTION_KEY, "true");

      // Afficher le message de succès dans le pop-up
      setIsSubscribed(true);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'inscription.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const continueWithoutCode = () => {
    setHasCode(false);
    setPromoCode("");
    setCodeError(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f8f8f6' }}>
      <div className="w-full max-w-[450px]">
        {/* Logo Aurentia */}
        <div className="flex items-center justify-center mb-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards]">
          <img
            src="/Aurentia-logo-long.svg"
            alt="Aurentia"
            className="h-10"
          />
        </div>

        {/* Main Card */}
        <div className="rounded-2xl shadow-sm border border-gray-100 p-8 bg-white opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]" style={{ fontFamily: 'var(--font-base)' }}>
          {/* Initial State: Ask if user has code */}
          {hasCode === null && (
            <div className="opacity-0 animate-[fadeInBlur_0.8s_ease-out_0.4s_forwards]">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold mb-2 font-biz-ud-mincho" style={{ color: 'var(--text-gris-profond)' }}>
                  Bienvenue sur Aurentia
                </h1>
                <p className="text-gray-500 text-sm">
                  Aurentia est actuellement en développement
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-base" style={{ color: 'var(--text-gris-profond)' }}>
                  Avez-vous un code d'inscription ?
                </Label>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setHasCode(true)}
                    className="flex-1 bg-aurentia-orange text-white hover:bg-aurentia-orange/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Oui
                  </Button>
                  <Button
                    onClick={() => setHasCode(false)}
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98] transition-all duration-200"
                  >
                    Non
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* State: User has code */}
          {hasCode === true && (
            <div className="opacity-0 animate-[fadeInBlur_0.8s_ease-out_0s_forwards]">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold mb-2 font-biz-ud-mincho" style={{ color: 'var(--text-gris-profond)' }}>
                  Code d'inscription
                </h1>
                <p className="text-gray-500 text-sm">
                  Entrez votre code pour accéder à Aurentia
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promo-code">
                    Code d'inscription
                  </Label>
                  <Input
                    id="promo-code"
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setCodeError(false);
                    }}
                    placeholder="Entrez votre code"
                    required
                    className={codeError ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {codeError && (
                    <p className="text-red-500 text-sm">Code non valide</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-aurentia-orange text-white hover:bg-aurentia-orange/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Valider
                  </Button>

                  {codeError && (
                    <Button
                      type="button"
                      onClick={continueWithoutCode}
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98] transition-all duration-200"
                    >
                      Continuer sans code
                    </Button>
                  )}
                </div>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setHasCode(null)}
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline underline-offset-2 transition-all duration-200"
                >
                  Retour
                </button>
              </div>
            </div>
          )}

          {/* State: User doesn't have code - Email submission or Success */}
          {hasCode === false && (
            <div className="opacity-0 animate-[fadeInBlur_0.8s_ease-out_0s_forwards]">
              {!isSubscribed ? (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold mb-2 font-biz-ud-mincho" style={{ color: 'var(--text-gris-profond)' }}>
                      Restez informé
                    </h1>
                    <p className="text-gray-500 text-sm">
                      Aurentia est actuellement en développement. Laissez-nous votre adresse email et nous vous préviendrons dès le lancement pour que vous puissiez tester la plateforme gratuitement.
                    </p>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Adresse email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        required
                        disabled={loading}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-aurentia-orange text-white hover:bg-aurentia-orange/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      {loading ? "Envoi..." : "S'inscrire à la bêta"}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setHasCode(null)}
                      className="text-sm text-gray-600 hover:text-gray-800 hover:underline underline-offset-2 transition-all duration-200"
                      disabled={loading}
                    >
                      Retour
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <div className="rounded-full bg-green-100 p-3">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                      </div>
                    </div>
                    <h1 className="text-2xl font-semibold mb-2 font-biz-ud-mincho" style={{ color: 'var(--text-gris-profond)' }}>
                      Inscription réussie !
                    </h1>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Merci de votre intérêt pour Aurentia. Vous recevrez un email pour être tenu au courant du lancement officiel de la plateforme.
                    </p>
                  </div>

                  <div className="bg-aurentia-pink/10 border border-aurentia-pink/20 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-700">
                      Nous sommes impatients de vous accueillir sur Aurentia et de vous accompagner dans le développement de votre projet entrepreneurial.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
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

export default BetaInscription;
