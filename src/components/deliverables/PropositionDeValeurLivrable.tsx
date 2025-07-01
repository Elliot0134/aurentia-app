import React, { useState, useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"; // Import ToggleGroup
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

interface LivrableProps {
  // Props for the template part
  title: string;
  description?: string;
  children?: React.ReactNode;
  textColor?: string; // Add textColor prop for the template button

  // Props for the popup part (if needed, or manage internally)
  // For now, let's manage popup state internally
  buttonColor?: string; // Add buttonColor prop for the popup buttons
}

const PropositionDeValeurLivrable: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDefinitionPlaceholder, setShowDefinitionPlaceholder] = useState(false);
  const [showRecommendationPlaceholder, setShowRecommendationPlaceholder] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string>('B2C'); // Add state for selected segment
  const [error, setError] = useState<string | null>(null);

  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('proposition_valeur')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setData(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [projectId, supabase]);

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    // Reset placeholder states when closing popup
    setShowDefinitionPlaceholder(false);
    setShowRecommendationPlaceholder(false);
  };

  const renderSectionContent = (key: string, placeholder: string) => {
    if (loading) return <p>Chargement...</p>;
    if (error) return <p>Erreur: {error}</p>;
    if (!data) return <p>{placeholder}</p>;

    // Split by newline, add bullet point, and join with <br />
    const lines = (data[key] || placeholder).split('\n');
    const formattedContent = lines.map(line => `• ${line}`).join('<br />');

    return <p className="text-[#4B5563]" dangerouslySetInnerHTML={{ __html: formattedContent }}></p>;
  };

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border rounded-lg p-4 mb-4 bg-black text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between h-30"
        onClick={handleTemplateClick}
        style={{ backgroundColor: '#605dc8' }} // Apply the specified color
      >
        <div className="flex-grow mr-4"> {/* Container for text content */}
          <h2 className="text-xl font-bold mb-2">Proposition de Valeur</h2>
          <p className="text-white mb-4">Analyse complète de la proposition de valeur par segments clients</p>
          <div>
            {/* Children for the template content */}
            {/* The actual deliverable content might go here or be passed via children */}
          </div>
        </div>
        <div className="flex-shrink-0"> {/* Container for image */}
          {/* Placeholder for image */}
          <img src="/icones-livrables/proposition-valeur-icon.png" alt="Proposition de Valeur Icon" className="w-8 h-8 object-cover self-start" />
        </div>
      </div>

      {/* Livrable Popup Part */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handlePopupClose}>
          <div
            className="bg-white text-black rounded-lg w-full mx-2.5 md:w-[90%] relative transform transition-all duration-300 ease-out scale-95 opacity-0 max-h-[calc(100vh-100px)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
            style={{ animation: 'scaleIn 0.3s ease-out forwards' }} // Apply animation
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 pb-4 flex justify-between items-start">
              <h2 className="text-xl font-bold">Proposition de Valeur</h2>
              <button
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={handlePopupClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
            <div className="flex gap-2 mb-4">
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  showDefinitionPlaceholder
                    ? `bg-[#605dc8] text-white`
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setShowDefinitionPlaceholder(!showDefinitionPlaceholder);
                  setShowRecommendationPlaceholder(false); // Optional: hide other placeholders
                }}
              >
                Définition
              </button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showDefinitionPlaceholder ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <div className="mt-2">
                <div className="bg-gray-100 rounded-md p-4 mb-2">
                  <p className="text-[#4B5563]"><strong>Définition :</strong> La proposition de valeur définit la manière dont votre entreprise crée, délivre et capture de la valeur pour différents segments de clients. Elle identifie les besoins, problèmes et aspirations de chaque segment, puis propose des solutions adaptées.</p>
                </div>
                <div className="bg-gray-100 rounded-md p-4">
                  <p className="text-[#4B5563]"><strong>Importance :</strong> Essentiel pour aligner votre offre sur les attentes réelles du marché et différencier votre entreprise de la concurrence. Une proposition de valeur claire permet d'optimiser vos efforts marketing et commerciaux.</p>
                </div>
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showRecommendationPlaceholder ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <div className="mt-2">
                <div className="bg-gray-100 rounded-md p-4">
                  <p className="text-[#4B5563]">[Placeholder pour la recommandation]</p>
                </div>
              </div>
            </div>

            {/* Segment Selection Buttons */}
            <ToggleGroup type="single" value={selectedSegment} onValueChange={setSelectedSegment} className="flex-col md:flex-row mb-4 mt-4">
              <ToggleGroupItem
                value="B2C"
                aria-label="Toggle B2C"
                className={`w-full ${selectedSegment === 'B2C' ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${selectedSegment === 'B2C' ? 'text-white' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-2-2a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span className={selectedSegment === 'B2C' ? 'text-white' : ''}>B2C (Particuliers)</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="B2B"
                aria-label="Toggle B2B"
                className={`w-full ${selectedSegment === 'B2B' ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${selectedSegment === 'B2B' ? 'text-white' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><path d="M10 12h4"/><path d="M12 17v-5"/><path d="M5 22v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"/><path d="M15 22v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"/><path d="M2 10l10-7 10 7"/></svg>
                <span className={selectedSegment === 'B2B' ? 'text-white' : ''}>B2B (Professionnels)</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="Organismes"
                aria-label="Toggle Organismes"
                className={`w-full ${selectedSegment === 'Organismes' ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${selectedSegment === 'Organismes' ? 'text-white' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
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
                </div> {/* Added closing div */}
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
                </div> {/* Added closing div */}
              </div>
            </div>
            </div>
          </div>
          {/* Define keyframes for the animation */}
          <style>
            {`
              @keyframes scaleIn {
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}
          </style>
        </div>
      )}
    </>
  );
};

export default PropositionDeValeurLivrable;