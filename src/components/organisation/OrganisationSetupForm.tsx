import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { createOrganisation } from "@/services/organisationService";

interface OrganisationSetupFormProps {
  userId: string;
  userEmail: string;
  userName: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

const OrganisationSetupForm = ({ 
  userId, 
  userEmail, 
  userName, 
  onSuccess,
  onBack 
}: OrganisationSetupFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "" as const,
    description: "",
    website: "",
    email: userEmail,
    phone: "",
    address: "",
    welcome_message: "",
    primary_color: "",
    secondary_color: "",
    newsletter_enabled: false
  });

  const navigate = useNavigate();

  const organisationTypes = [
    { value: "incubator", label: "Incubateur" },
    { value: "accelerator", label: "Accélérateur" },
    { value: "business_school", label: "École de commerce" },
    { value: "university", label: "Université" },
    { value: "chamber_commerce", label: "Chambre de commerce" },
    { value: "consulting", label: "Cabinet de conseil" },
    { value: "coworking", label: "Espace de coworking" },
    { value: "other", label: "Autre" }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Créer l'organisation
      const organizationData = {
        ...formData,
        created_by: userId,
      };

      const newOrganization = await createOrganisation(organizationData);
      
      // Mettre à jour le profil utilisateur avec l'organisation et le rôle
      const { error: updateError } = await supabase
        .from('profiles' as any)
        .update({
          user_role: 'organisation',
          organization_id: newOrganization.id
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour du profil:', updateError);
        throw updateError;
      }

      toast({
        title: "Organisation créée avec succès !",
        description: `Bienvenue dans ${formData.name}. Redirection vers votre tableau de bord...`,
      });

      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirection par défaut
        setTimeout(() => {
          navigate(`/organisation/${newOrganization.id}/dashboard`);
        }, 1500);
      }

    } catch (error: any) {
      console.error('Erreur lors de la création de l\'organisation:', error);
      toast({
        title: "Erreur de création",
        description: error.message || "Une erreur s'est produite lors de la création de votre organisation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-8 bg-white rounded-xl shadow-sm animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
          Créer votre organisation
        </h1>
        <p className="text-gray-600">
          Configurez le profil de votre structure d'accompagnement
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom de l'organisation */}
        <div className="space-y-2">
          <label htmlFor="org-name" className="block text-sm font-medium text-gray-700">
            Nom de l'organisation *
          </label>
          <input
            id="org-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
            placeholder="Nom de votre organisation"
            required
            disabled={loading}
          />
        </div>

        {/* Type d'organisation */}
        <div className="space-y-2">
          <label htmlFor="org-type" className="block text-sm font-medium text-gray-700">
            Type d'organisation *
          </label>
          <select
            id="org-type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
            required
            disabled={loading}
          >
            <option value="">Sélectionnez un type d'organisation</option>
            {organisationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="org-description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="org-description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
            placeholder="Décrivez votre organisation et ses activités..."
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Informations de contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="org-website" className="block text-sm font-medium text-gray-700">
              Site web
            </label>
            <input
              id="org-website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
              placeholder="https://votre-site.com"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="org-phone" className="block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <input
              id="org-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
              placeholder="01 23 45 67 89"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="org-email" className="block text-sm font-medium text-gray-700">
            Email de contact
          </label>
          <input
            id="org-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
            placeholder="contact@votre-organisation.com"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="org-address" className="block text-sm font-medium text-gray-700">
            Adresse
          </label>
          <input
            id="org-address"
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
            placeholder="Adresse complète de votre organisation"
            disabled={loading}
          />
        </div>

        {/* Message de bienvenue */}
        <div className="space-y-2">
          <label htmlFor="welcome-message" className="block text-sm font-medium text-gray-700">
            Message de bienvenue
          </label>
          <textarea
            id="welcome-message"
            value={formData.welcome_message}
            onChange={(e) => handleInputChange('welcome_message', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
            placeholder="Message qui sera affiché aux entrepreneurs qui rejoignent votre organisation..."
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Couleurs de branding */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700">
              Couleur principale
            </label>
            <div className="flex items-center gap-2">
              <input
                id="primary-color"
                type="color"
                value={formData.primary_color}
                onChange={(e) => handleInputChange('primary_color', e.target.value)}
                className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
                disabled={loading}
              />
              <input
                type="text"
                value={formData.primary_color}
                onChange={(e) => handleInputChange('primary_color', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
                placeholder="#000000"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="secondary-color" className="block text-sm font-medium text-gray-700">
              Couleur secondaire
            </label>
            <div className="flex items-center gap-2">
              <input
                id="secondary-color"
                type="color"
                value={formData.secondary_color}
                onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
                disabled={loading}
              />
              <input
                type="text"
                value={formData.secondary_color}
                onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
                placeholder="#000000"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="flex items-center gap-3">
          <input
            id="newsletter-enabled"
            type="checkbox"
            checked={formData.newsletter_enabled}
            onChange={(e) => handleInputChange('newsletter_enabled', e.target.checked)}
            className="w-4 h-4 text-aurentia-pink border-gray-300 rounded focus:ring-aurentia-pink focus:ring-2"
            disabled={loading}
          />
          <label htmlFor="newsletter-enabled" className="text-sm text-gray-700">
            Activer le système de newsletter pour les entrepreneurs
          </label>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-between pt-6">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-500 hover:text-aurentia-pink transition"
              disabled={loading}
            >
              ← Retour
            </button>
          )}
          
          <button
            type="submit"
            className="px-8 py-3 bg-aurentia-pink text-white rounded-lg hover:bg-aurentia-pink/90 transition disabled:opacity-50 flex items-center gap-2 ml-auto"
            disabled={loading || !formData.name.trim() || !formData.type}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Création...
              </>
            ) : (
              <>
                Créer mon organisation
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganisationSetupForm;