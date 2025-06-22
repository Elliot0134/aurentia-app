import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';

interface AnalyseDeMarcheLivrableProps {
  projectId: string;
}

const AnalyseDeMarcheLivrable: React.FC<AnalyseDeMarcheLivrableProps> = ({ projectId }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDefinitionPlaceholder, setShowDefinitionPlaceholder] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState(1);

  const title = "Analyse de Marché";
  const description = "Analyse complète du marché cible et de ses opportunités"; // Keep for fallback if marketData is null
  const definition = "L'analyse de marché est une étude approfondie qui permet d'évaluer les opportunités et menaces d'un marché spécifique, incluant sa taille, sa segmentation, ses tendances d'évolution et les facteurs d'influence qui le caractérisent.";
  const importance = "Cette analysis is essential for validating the commercial viability of a business project, identifying the most promising segments, and defining a market entry strategy adapted to economic, sociodemographic, and technological realities.";
  const color = "#f24e83";


  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
          .from('marche')
          .select('*')
          .eq('project_id', projectId)
          .single();
      try {
        const { data, error } = await supabase
          .from('marche')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (error) {
          throw error;
        }
        setMarketData(data);
        console.log("Market Data received from Supabase:", data);
        console.log("Value of pay_economique_opportunite_1_source:", data.pay_economique_opportunite_1_source);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchMarketData();
    }
  }, [projectId]);

  const RecommendationCard: React.FC<{
    title: string;
    recommendation: string;
    associatedItem: string;
    priority: string;
    type: 'opportunity' | 'threat';
  }> = ({ title, recommendation, associatedItem, priority, type }) => (
    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <p className="text-[#4B5563]">
        <strong>Recommandation :</strong> {recommendation}<br/>
        <strong>{type === 'opportunity' ? 'Opportunité associée' : 'Menace associée'} :</strong> {associatedItem}<br/>
        <strong>Priorité :</strong> {priority}
      </p>
    </div>
  );

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setShowDefinitionPlaceholder(false);
  };

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border rounded-lg p-4 mb-4 bg-[#f24e83] text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between"
        onClick={handleTemplateClick}
      >
        <div className="flex-grow mr-4 flex flex-col">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          {marketData?.justification_avis && <p className="text-white mb-4">{marketData.justification_avis}</p>}
          {!marketData?.justification_avis && description && <p className="text-white mb-4">{description}</p>}
          <div className="flex-grow"></div> {/* Spacer to push button to bottom */}
          <div className="flex-shrink-0 mt-auto">
            <button className="text-xs bg-white text-[#f24e83] px-2 py-1 rounded-full cursor-default pointer-events-none font-bold">
              {marketData?.avis || 'Commentaire'}
            </button>
          </div>
        </div>
        <div className="flex-shrink-0">
          <img src="/icones-livrables/market-icon.png" alt="Market Analysis Icon" className="w-8 h-8 object-cover self-start" />
        </div>
      </div>

      {/* Livrable Popup Part */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handlePopupClose}>
          <div
            className="bg-white text-black rounded-lg p-6 w-full mx-2.5 md:w-3/4 relative transform transition-all duration-300 ease-out scale-95 opacity-0 max-h-[calc(100vh-100px)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
          >
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <div className="flex gap-2 mb-4">
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  showDefinitionPlaceholder
                    ? `bg-[${color}] text-white`
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setShowDefinitionPlaceholder(!showDefinitionPlaceholder);
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
                  <p className="text-[#4B5563]"><strong>Définition :</strong> {definition}</p>
                </div>
                <div className="bg-gray-100 rounded-md p-4">
                  <p className="text-[#4B5563]"><strong>Importance :</strong> {importance}</p>
                </div>
              </div>
            </div>

            {loading && <p>Chargement des données...</p>}
            {error && <p className="text-red-500">Erreur: {error}</p>}
            {marketData && (
              <Accordion type="single" collapsible className="w-full">
                {/* Présentation générale du marché */}
                <AccordionItem value="presentation-generale-marche">
                  <AccordionTrigger className="text-left text-lg flex-1 pr-4">Présentation générale du marché</AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Nom du marché</h4>
                      <p className="text-[#4B5563]">{marketData.free_marche}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Marchés connexes</h4>
                      <p className="text-[#4B5563]">{marketData.free_marches_annexe}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Description détaillée du marché</h4>
                      <p className="text-[#4B5563]">{marketData.free_description_du_marche}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Trois enjeux principaux</h4>
                      <p className="text-[#4B5563]">{marketData.free_3_enjeux_principaux}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Évolution du marché</h4>
                      <p className="text-[#4B5563]">{marketData.free_evolution_du_marche}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Prédictions sur le marché</h4>
                      <p className="text-[#4B5563]">{marketData.free_predictions}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Analyse de la viabilité */}
                <AccordionItem value="analyse-viabilite">
                  <AccordionTrigger className="text-left text-lg flex-1 pr-4">Analyse de la viabilité</AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Difficultés d'entrée sur le marché</h4>
                      <p className="text-[#4B5563]">{marketData.free_difficulte_a_l_entree}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Détails des difficultés d'entrée</h4>
                      <p className="text-[#4B5563]">{marketData.free_details_difficulte_a_l_entree}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Classification du marché</h4>
                      <p className="text-[#4B5563]">{marketData.free_classification}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Justification de la classification</h4>
                      <p className="text-[#4B5563]">{marketData.free_justification_concise}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Viabilité du marché</h4>
                      <p className="text-[#4B5563]">{marketData.free_marche_viable}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Headers */}
                  <div><h4 className="text-2xl font-semibold mb-2">Opportunités</h4></div>
                  <div><h4 className="text-2xl font-semibold mb-2">Menaces</h4></div>

                  {/* Économique Row */}
                  <div className="bg-[#e8f7df] rounded-md p-4 mb-4">
                    <h5 className="text-lg font-semibold mb-2">Économique</h5>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_economique_opportunite_1_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_economique_opportunite_1_impact_potentiel}<br/>
                        <a href={marketData.pay_economique_opportunite_1_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_economique_opportunite_1_source}</a>
                      </p>
                    </div>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_economique_opportunite_2_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_economique_opportunite_2_impact_potentiel}<br/>
                        <a href={marketData.pay_economique_opportunite_2_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_economique_opportunite_2_source}</a>
                      </p>
                    </div>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_economique_opportunite_3_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_economique_opportunite_3_impact_potentiel}<br/>
                        <a href={marketData.pay_economique_opportunite_3_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_economique_opportunite_3_source}</a>
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#ffdfdf] rounded-md p-4 mb-4">
                    <h5 className="text-lg font-semibold mb-2">Économique</h5>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_economique_menace_1_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_economique_menace_1_impact_potentiel}<br/>
                        <a href={marketData.pay_economique_menace_1_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_economique_menace_1_source}</a>
                      </p>
                    </div>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_economique_menace_2_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_economique_menace_2_impact_potentiel}<br/>
                        <a href={marketData.pay_economique_menace_2_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_economique_menace_2_source}</a>
                      </p>
                    </div>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_economique_menace_3_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_economique_menace_3_impact_potentiel}<br/>
                        <a href={marketData.pay_economique_menace_3_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_economique_menace_3_source}</a>
                      </p>
                    </div>
                  </div>

                  {/* Socio-démographique Row */}
                  <div className="bg-[#e8f7df] rounded-md p-4 mb-4">
                    <h5 className="text-lg font-semibold mb-2">Socio-démographique</h5>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_sociodemographique_opportunite_1_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_sociodemographique_opportunite_1_impact_potentiel}<br/>
                        <a href={marketData.pay_sociodemographique_opportunite_1_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_sociodemographique_opportunite_1_source}</a>
                      </p>
                    </div>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_sociodemographique_opportunite_2_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_sociodemographique_opportunite_2_impact_potentiel}<br/>
                        <a href={marketData.pay_sociodemographique_opportunite_2_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_sociodemographique_opportunite_2_source}</a>
                      </p>
                    </div>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_sociodemographique_opportunite_3_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_sociodemographique_opportunite_3_impact_potentiel}<br/>
                        <a href={marketData.pay_sociodemographique_opportunite_3_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_sociodemographique_opportunite_3_source}</a>
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#ffdfdf] rounded-md p-4 mb-4">
                    <h5 className="text-lg font-semibold mb-2">Socio-démographique</h5>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_sociodemographique_menace_1_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_sociodemographique_menace_1_impact_potentiel}<br/>
                        <a href={marketData.pay_sociodemographique_menace_1_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_sociodemographique_menace_1_source}</a>
                      </p>
                    </div>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_sociodemographique_menace_2_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_sociodemographique_menace_2_impact_potentiel}<br/>
                        <a href={marketData.pay_sociodemographique_menace_2_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_sociodemographique_menace_2_source}</a>
                      </p>
                    </div>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_sociodemographique_menace_3_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_sociodemographique_menace_3_impact_potentiel}<br/>
                        <a href={marketData.pay_sociodemographique_menace_3_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_sociodemographique_menace_3_source}</a>
                      </p>
                    </div>
                  </div>

                  {/* Technologique Row */}
                  <div className="bg-[#e8f7df] rounded-md p-4 mb-4">
                    <h5 className="text-lg font-semibold mb-2">Technologique</h5>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_technologique_opportunite_1_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_technologique_opportunite_1_impact_potentiel}<br/>
                        <a href={marketData.pay_technologique_opportunite_1_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_technologique_opportunite_1_source}</a>
                      </p>
                    </div>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_technologique_opportunite_2_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_technologique_opportunite_2_impact_potentiel}<br/>
                        <a href={marketData.pay_technologique_opportunite_2_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_technologique_opportunite_2_source}</a>
                      </p>
                    </div>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_technologique_opportunite_3_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_technologique_opportunite_3_impact_potentiel}<br/>
                        <a href={marketData.pay_technologique_opportunite_3_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_technologique_opportunite_3_source}</a>
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#ffdfdf] rounded-md p-4 mb-4">
                    <h5 className="text-lg font-semibold mb-2">Technologique</h5>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_technologique_menace_1_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_technologique_menace_1_impact_potentiel}<br/>
                        <a href={marketData.pay_technologique_menace_1_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_technologique_menace_1_source}</a>
                      </p>
                    </div>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_technologique_menace_2_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_technologique_menace_2_impact_potentiel}<br/>
                        <a href={marketData.pay_technologique_menace_2_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_technologique_menace_2_source}</a>
                      </p>
                    </div>
                    <div className="bg-white rounded-md p-2 mb-2">
                      <p className="text-[#4B5563]">
                        <strong>Description:</strong> {marketData.pay_technologique_menace_3_description}<br/>
                        <strong>Impact:</strong> {marketData.pay_technologique_menace_3_impact_potentiel}<br/>
                        <a href={marketData.pay_technologique_menace_3_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-full text-sm text-white font-bold" style={{ backgroundColor: '#f24e83' }}>{marketData.pay_technologique_menace_3_source}</a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stratégies d'exploitation des opportunités */}
                <AccordionItem value="strategies-exploitation-opportunites">
                  <AccordionTrigger className="text-left text-lg flex-1 pr-4">Stratégies d'exploitation des opportunités</AccordionTrigger>
                  <AccordionContent>
                    <RecommendationCard
                      title="Opportunité 1"
                      recommendation={marketData.pay_exploitation_opportunite_1_recommandation}
                      associatedItem={marketData.pay_exploitation_opportunite_1_opportunite_associee}
                      priority={marketData.pay_exploitation_opportunite_1_priorite}
                      type="opportunity"
                    />
                    <RecommendationCard
                      title="Opportunité 2"
                      recommendation={marketData.pay_exploitation_opportunite_2_recommandation}
                      associatedItem={marketData.pay_exploitation_opportunite_2_opportunite_associee}
                      priority={marketData.pay_exploitation_opportunite_2_priorite}
                      type="opportunity"
                    />
                    <RecommendationCard
                      title="Opportunité 3"
                      recommendation={marketData.pay_exploitation_opportunite_3_recommandation}
                      associatedItem={marketData.pay_exploitation_opportunite_3_opportunite_associee}
                      priority={marketData.pay_exploitation_opportunite_3_priorite}
                      type="opportunity"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Stratégies d'atténuation des menaces */}
                <AccordionItem value="strategies-attenuation-menaces">
                  <AccordionTrigger className="text-left text-lg flex-1 pr-4">Stratégies d'atténuation des menaces</AccordionTrigger>
                  <AccordionContent>
                    <RecommendationCard
                      title="Menace 1"
                      recommendation={marketData.pay_attenuation_menace_1_recommandation}
                      associatedItem={marketData.pay_attenuation_menace_1_menace_associee}
                      priority={marketData.pay_attenuation_menace_1_priorite}
                      type="threat"
                    />
                    <RecommendationCard
                      title="Menace 2"
                      recommendation={marketData.pay_attenuation_menace_2_recommandation}
                      associatedItem={marketData.pay_attenuation_menace_2_menace_associee}
                      priority={marketData.pay_attenuation_menace_2_priorite}
                      type="threat"
                    />
                    <RecommendationCard
                      title="Menace 3"
                      recommendation={marketData.pay_attenuation_menace_3_recommandation}
                      associatedItem={marketData.pay_attenuation_menace_3_menace_associee}
                      priority={marketData.pay_attenuation_menace_3_priorite}
                      type="threat"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Segmentation du marché */}
                <AccordionItem value="segmentation-marche">
                  <AccordionTrigger className="text-left text-lg flex-1 pr-4">Segmentation du marché</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex space-x-2 mb-4">
                      <button
                        className={`px-4 py-2 rounded-md ${selectedSegment === 1 ? 'bg-[#f24e83] text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setSelectedSegment(1)}
                      >
                        Segment 1
                      </button>
                      <button
                        className={`px-4 py-2 rounded-md ${selectedSegment === 2 ? 'bg-[#f24e83] text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setSelectedSegment(2)}
                      >
                        Segment 2
                      </button>
                      <button
                        className={`px-4 py-2 rounded-md ${selectedSegment === 3 ? 'bg-[#f24e83] text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setSelectedSegment(3)}
                      >
                        Segment 3
                      </button>
                    </div>

                    {selectedSegment === 1 && (
                      <div className="border rounded-md">
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-semibold">Nom du segment de marché</TableCell>
                              <TableCell>{marketData.pay_segment_1_nom}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Chiffre d'affaires potentiel</TableCell>
                              <TableCell>{marketData.pay_segment_1_ca_potentiel}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Taille et volume</TableCell>
                              <TableCell>{marketData.pay_segment_1_taille_volume}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Caractéristiques</TableCell>
                              <TableCell>{marketData.pay_segment_1_caracteristiques}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Fréquence d'achat</TableCell>
                              <TableCell>{marketData.pay_segment_1_frequence_achat}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Panier moyen</TableCell>
                              <TableCell>{marketData.pay_segment_1_panier_moyen}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {selectedSegment === 2 && (
                      <div className="border rounded-md">
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-semibold">Nom du segment de marché</TableCell>
                              <TableCell>{marketData.pay_segment_2_nom}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Chiffre d'affaires potentiel</TableCell>
                              <TableCell>{marketData.pay_segment_2_ca_potentiel}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Taille et volume</TableCell>
                              <TableCell>{marketData.pay_segment_2_taille_volume}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Caractéristiques</TableCell>
                              <TableCell>{marketData.pay_segment_2_caracteristiques}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Fréquence d'achat</TableCell>
                              <TableCell>{marketData.pay_segment_2_frequence_achat}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Panier moyen</TableCell>
                              <TableCell>{marketData.pay_segment_2_panier_moyen}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {selectedSegment === 3 && (
                      <div className="border rounded-md">
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-semibold">Nom du segment de marché</TableCell>
                              <TableCell>{marketData.pay_segment_3_nom}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Chiffre d'affaires potentiel</TableCell>
                              <TableCell>{marketData.pay_segment_3_ca_potentiel}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Taille et volume</TableCell>
                              <TableCell>{marketData.pay_segment_3_taille_volume}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Caractéristiques</TableCell>
                              <TableCell>{marketData.pay_segment_3_caracteristiques}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Fréquence d'achat</TableCell>
                              <TableCell>{marketData.pay_segment_3_frequence_achat}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-semibold">Panier moyen</TableCell>
                              <TableCell>{marketData.pay_segment_3_panier_moyen}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Synthèse et vue d'ensemble */}
                <AccordionItem value="synthese-vue-ensemble">
                  <AccordionTrigger className="text-left text-lg flex-1 pr-4">Synthèse et vue d'ensemble</AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Vue d'ensemble du marché</h4>
                      <p className="text-[#4B5563]">{marketData.pay_vue_d_ensemble}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Synthèse de la demande</h4>
                      <p className="text-[#4B5563]">{marketData.pay_synthese_demande}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h4 className="text-sm font-semibold mb-2">Facteurs d'influence sur le marché</h4>
                      <p className="text-[#4B5563]">{marketData.pay_facteurs_influence}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                </Accordion>
            )}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={handlePopupClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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

export default AnalyseDeMarcheLivrable;
