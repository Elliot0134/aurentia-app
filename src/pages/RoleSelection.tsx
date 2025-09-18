import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { UserRole } from "@/types/userTypes";

const RoleSelection = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelection = async (role: UserRole) => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Non authentifié");
      }

      // Mettre à jour le rôle utilisateur
      const { error } = await supabase
        .from('profiles' as any)
        .update({ user_role: role })
        .eq('id', user.id);

      if (error) {
        throw new Error("Erreur lors de la mise à jour du rôle");
      }

      toast({
        title: "Rôle sélectionné",
        description: `Vous avez été configuré en tant que ${role === 'individual' ? 'entrepreneur' : 'structure d\'accompagnement'}`,
      });

      // Rediriger vers le dashboard approprié
      const basePath = role === 'individual' ? '/individual' : '/admin';
      navigate(`${basePath}/dashboard`);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la sélection du rôle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl p-8 bg-white rounded-xl shadow-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
            Choisissez votre profil
          </h1>
          <p className="text-gray-600">
            Sélectionnez le type de compte qui correspond le mieux à votre situation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carte Entrepreneur */}
          <div 
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-aurentia-pink hover:bg-aurentia-pink/5 transition-all duration-300 cursor-pointer group"
            onClick={() => handleRoleSelection('individual')}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-aurentia-pink to-aurentia-orange rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-aurentia-pink transition">
                Entrepreneur
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Vous portez un projet entrepreneurial et souhaitez utiliser Aurentia pour développer votre idée business
              </p>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Accès complet aux outils de développement business
              </p>
            </div>
          </div>

          {/* Carte Structure d'accompagnement */}
          <div 
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-aurentia-orange hover:bg-aurentia-orange/5 transition-all duration-300 cursor-pointer group"
            onClick={() => handleRoleSelection('admin')}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-aurentia-orange to-yellow-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-aurentia-orange transition">
                Structure d'accompagnement
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Vous représentez un incubateur, accélérateur, école ou autre structure qui accompagne des entrepreneurs
              </p>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Gestion des entrepreneurs et tableaux de bord dédiés
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Vous pourrez modifier votre profil ultérieurement dans les paramètres
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;