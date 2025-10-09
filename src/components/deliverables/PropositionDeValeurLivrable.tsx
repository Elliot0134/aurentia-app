import React, { useState, useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';
import { useHarmonizedModal } from './shared/useHarmonizedModal';

const PropositionDeValeurLivrable: React.FC = () => {
  const [data, setData] = useState<any>(null); // Removed '& { avis: string | null }'
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string>('B2C');
  const [error, setError] = useState<string | null>(null);

  const { projectId } = useParams<{ projectId: string }>();

  const title = "Proposition de Valeur";
  const description = "Analyse complète de la proposition de valeur par segments clients";
  const definition = "La proposition de valeur définit la manière dont votre entreprise crée, délivre et capture de la valeur pour différents segments de clients. Elle identifie les besoins, problèmes et aspirations de chaque segment, puis propose des solutions adaptées.";
  const importance = "Essentiel pour aligner votre offre sur les attentes réelles du marché et différencier votre entreprise de la concurrence. Une proposition de valeur claire permet d'optimiser vos efforts marketing et commerciaux.";

  // Utilisation du hook harmonisé pour la modal
  const { isPopupOpen, handleTemplateClick, handlePopupClose } = useHarmonizedModal({
    hasContent: true,
    hasDefinition: true
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

        const { data, error } = await supabase
          .from('proposition_valeur')
          .select('*') // Removed 'avis'
          .eq('project_id', projectId)
          .single();

      if (error) {
        console.error("Error fetching proposition_valeur data:", error);
        setError(error.message);
        setData(null); // Ensure data is null on error
      } else {
        console.log("Fetched proposition_valeur data:", data);
        setData(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [projectId]);

  const renderSectionContent = (key: string, placeholder: string) => {
    if (loading) return <LoadingSpinner size="sm" message="Chargement..." />;
    if (error) return <p>Erreur: {error}</p>;
    if (!data) return <p>{placeholder}</p>;

    // Split by newline, add bullet point, and join with <br />
    const lines = (data[key] || placeholder).split('\n');
    const formattedContent = lines.map(line => `• ${line}`).join('<br />');

    return <p className="text-[#4B5563]" dangerouslySetInnerHTML={{ __html: formattedContent }}></p>;
  };

  // Contenu spécifique avec le sélecteur de segments
  const propositionValeurContent = (
    <>
      {/* Segment Selection Buttons */}
      <ToggleGroup type="single" value={selectedSegment} onValueChange={setSelectedSegment} className="flex-row mb-4 mt-4 justify-start">
        <ToggleGroupItem
          value="B2C"
          aria-label="Toggle B2C"
          className={`px-3 py-1 text-sm mr-2 ${selectedSegment === 'B2C' ? 'bg-aurentia-orange-aurentia text-white' : 'bg-gray-200'}`}
        >
          <span className={selectedSegment === 'B2C' ? 'text-white' : ''}>Particuliers</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="B2B"
          aria-label="Toggle B2B"
          className={`px-3 py-1 text-sm mr-2 ${selectedSegment === 'B2B' ? 'bg-aurentia-orange-aurentia text-white' : 'bg-gray-200'}`}
        >
          <span className={selectedSegment === 'B2B' ? 'text-white' : ''}>Entreprises</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="Organismes"
          aria-label="Toggle Organismes"
          className={`px-3 py-1 text-sm mr-2 ${selectedSegment === 'Organismes' ? 'bg-aurentia-orange-aurentia text-white' : 'bg-gray-200'}`}
        >
          <span className={selectedSegment === 'Organismes' ? 'text-white' : ''}>Organismes</span>
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Proposition de Valeur Column */}
        <div>
          <h3 className="text-lg font-bold mb-2">Proposition de Valeur</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
          {selectedSegment === 'B2C' && (
            <>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                <h4 className="text-sm font-semibold mb-2">Produits / Services</h4>
                {renderSectionContent('b2c_carte_valeur_produits_services', 'Produits et services de la carte de valeur B2C')}
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                <h4 className="text-sm font-semibold mb-2">Bénéfices</h4>
                {renderSectionContent('b2c_carte_valeur_createurs_benefices', 'Créateurs de bénéfices de la carte de valeur B2C')}
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <h4 className="text-sm font-semibold mb-2">Solutions</h4>
                {renderSectionContent('b2c_carte_valeur_solutions', 'Solutions de la carte de valeur B2C')}
              </div>
            </>
          )}
          {selectedSegment === 'B2B' && (
            <>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                <h4 className="text-sm font-semibold mb-2">Produits / Services</h4>
                {renderSectionContent('b2b_carte_valeur_produits_services', 'Produits et services de la carte de valeur B2B')}
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                <h4 className="text-sm font-semibold mb-2">Bénéfices</h4>
                {renderSectionContent('b2b_carte_valeur_createurs_benefices', 'Créateurs de bénéfices de la carte de valeur B2B')}
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <h4 className="text-sm font-semibold mb-2">Solutions</h4>
                {renderSectionContent('b2b_carte_valeur_solutions', 'Solutions de la carte de valeur B2B')}
              </div>
            </>
          )}
          {selectedSegment === 'Organismes' && (
            <>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                <h4 className="text-sm font-semibold mb-2">Produits / Services</h4>
                {renderSectionContent('organismes_carte_valeur_produits_services', 'Produits et services de la carte de valeur Organismes')}
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                <h4 className="text-sm font-semibold mb-2">Créateurs de bénéfices</h4>
                {renderSectionContent('organismes_carte_valeur_createurs_benefices', 'Créateurs de bénéfices de la carte de valeur Organismes')}
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <h4 className="text-sm font-semibold mb-2">Solutions</h4>
                {renderSectionContent('organismes_carte_valeur_solutions', 'Solutions de la carte de valeur Organismes')}
              </div>
            </>
          )}
          </div>
        </div>

        {/* Profil Acheteur Column */}
        <div>
          <h3 className="text-lg font-bold mb-2">Profil Acheteur</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
          {selectedSegment === 'B2C' && (
            <>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 w-full">
                <h4 className="text-sm font-semibold mb-2">Désirs</h4>
                {renderSectionContent('b2c_profil_aspirations', 'Aspirations du profil B2C')}
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 w-full">
                <h4 className="text-sm font-semibold mb-2">Besoins</h4>
                {renderSectionContent('b2c_profil_besoins', 'Besoins du profil B2C')}
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 w-full">
                <h4 className="text-sm font-semibold mb-2">Difficultés</h4>
                {renderSectionContent('b2c_profil_problemes', 'Problèmes du profil B2C')}
              </div>
            </>
          )}
          {selectedSegment === 'B2B' && (
            <>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 w-full">
                <h4 className="text-sm font-semibold mb-2">Désirs</h4>
                {renderSectionContent('b2b_profil_aspirations', 'Aspirations du profil B2B')}
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 w-full">
                <h4 className="text-sm font-semibold mb-2">Besoins</h4>
                {renderSectionContent('b2b_profil_besoins', 'Besoins du profil B2B')}
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 w-full">
                <h4 className="text-sm font-semibold mb-2">Difficultés</h4>
                {renderSectionContent('b2b_profil_problemes', 'Problèmes du profil B2B')}
              </div>
            </>
          )}
          {selectedSegment === 'Organismes' && (
            <>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 w-full">
                <h4 className="text-sm font-semibold mb-2">Désirs</h4>
                {renderSectionContent('organismes_profil_aspirations', 'Aspirations du profil Organismes')}
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 w-full">
                <h4 className="text-sm font-semibold mb-2">Besoins</h4>
                {renderSectionContent('organismes_profil_besoins', 'Besoins du profil Organismes')}
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 w-full">
                <h4 className="text-sm font-semibold mb-2">Difficultés</h4>
                {renderSectionContent('organismes_profil_problemes', 'Problèmes du profil Organismes')}
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Utilisation de la carte harmonisée */}
      <HarmonizedDeliverableCard
        title={title}
        description={description}
        avis={'Commentaire'} // Removed data?.avis
        iconSrc="/icones-livrables/proposition-valeur-icon.png"
        onClick={handleTemplateClick}
      />

      {/* Utilisation de la modal harmonisée */}
      <HarmonizedDeliverableModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        title={title}
        iconComponent={<img src="/icones-livrables/proposition-valeur-icon.png" alt="Proposition de Valeur Icon" />}
        contentComponent={propositionValeurContent}
        definition={definition}
        importance={importance}
        showContentTab={true}
      />
    </>
  );
};

export default PropositionDeValeurLivrable;
