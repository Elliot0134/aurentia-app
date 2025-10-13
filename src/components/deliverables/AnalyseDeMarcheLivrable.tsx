import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';
import { useHarmonizedModal } from './shared/useHarmonizedModal';
import { useDeliverableWithComments } from '@/hooks/useDeliverableWithComments';

interface AnalyseDeMarcheLivrableProps {
  projectId: string;
}

const AnalyseDeMarcheLivrable: React.FC<AnalyseDeMarcheLivrableProps> = ({ projectId }) => {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState(1);

  const title = "Analyse de Marché";
  const description = "Analyse complète du marché cible et de ses opportunités";
  const definition = "L'analyse de marché est une étude approfondie qui permet d'évaluer les opportunités et menaces d'un marché spécifique, incluant sa taille, sa segmentation, ses tendances d'évolution et les facteurs d'influence qui le caractérisent.";
  const importance = "Cette analyse est essentielle pour valider la viabilité commerciale d'un projet d'entreprise, identifier les segments les plus prometteurs, et définir une stratégie d'entrée sur le marché adaptée aux réalités économiques, sociodémographiques et technologiques.";
  const color = "#f24e83";

  // Utilisation du hook harmonisé pour la modal
  const { isPopupOpen, handleTemplateClick, handlePopupClose } = useHarmonizedModal({
    hasContent: true,
    hasDefinition: true
  });

  // Initialize deliverable for comments
  const { deliverableId, organizationId } = useDeliverableWithComments({
    projectId: projectId || '',
    deliverableType: 'market-analysis',
    deliverableTitle: 'Analyse de Marché',
  });

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      setError(null);
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

  // Contenu spécifique de l'analyse de marché
  const analyseMarche = (
    <>
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

          {/* Opportunités et Menaces en grille */}
          <AccordionItem value="opportunites-menaces">
            <AccordionTrigger className="text-left text-lg flex-1 pr-4">Opportunités et Menaces</AccordionTrigger>
            <AccordionContent>
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
            </AccordionContent>
          </AccordionItem>

          {/* Stratégies d'exploitation des opportunités */}
          <AccordionItem value="strategies-exploitation-opportunites">
            <AccordionTrigger className="text-left text-lg flex-1 pr-4">Stratégies d'exploitation des opportunités</AccordionTrigger>
            <AccordionContent>
              {/* Version Desktop et Tablette */}
              <div className="hidden md:block">
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#e8f7df]">
                        <TableHead className="font-semibold text-black">Opportunité</TableHead>
                        <TableHead className="font-semibold text-black hidden lg:table-cell">Recommandation</TableHead>
                        <TableHead className="font-semibold text-black">Opportunité associée</TableHead>
                        <TableHead className="font-semibold text-black">Priorité</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Opportunité 1</TableCell>
                        <TableCell className="hidden lg:table-cell">{marketData.pay_exploitation_opportunite_1_recommandation}</TableCell>
                        <TableCell>{marketData.pay_exploitation_opportunite_1_opportunite_associee}</TableCell>
                        <TableCell>
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {marketData.pay_exploitation_opportunite_1_priorite}
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Opportunité 2</TableCell>
                        <TableCell className="hidden lg:table-cell">{marketData.pay_exploitation_opportunite_2_recommandation}</TableCell>
                        <TableCell>{marketData.pay_exploitation_opportunite_2_opportunite_associee}</TableCell>
                        <TableCell>
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {marketData.pay_exploitation_opportunite_2_priorite}
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Opportunité 3</TableCell>
                        <TableCell className="hidden lg:table-cell">{marketData.pay_exploitation_opportunite_3_recommandation}</TableCell>
                        <TableCell>{marketData.pay_exploitation_opportunite_3_opportunite_associee}</TableCell>
                        <TableCell>
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {marketData.pay_exploitation_opportunite_3_priorite}
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Version Mobile */}
              <div className="block md:hidden space-y-4">
                <div className="bg-[#e8f7df] rounded-md p-4">
                  <h4 className="font-semibold text-lg mb-2">Opportunité 1</h4>
                  <div className="space-y-2">
                    <p><strong>Recommandation:</strong> {marketData.pay_exploitation_opportunite_1_recommandation}</p>
                    <p><strong>Opportunité associée:</strong> {marketData.pay_exploitation_opportunite_1_opportunite_associee}</p>
                    <p><strong>Priorité:</strong>
                      <span className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        {marketData.pay_exploitation_opportunite_1_priorite}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-[#e8f7df] rounded-md p-4">
                  <h4 className="font-semibold text-lg mb-2">Opportunité 2</h4>
                  <div className="space-y-2">
                    <p><strong>Recommandation:</strong> {marketData.pay_exploitation_opportunite_2_recommandation}</p>
                    <p><strong>Opportunité associée:</strong> {marketData.pay_exploitation_opportunite_2_opportunite_associee}</p>
                    <p><strong>Priorité:</strong>
                      <span className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        {marketData.pay_exploitation_opportunite_2_priorite}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-[#e8f7df] rounded-md p-4">
                  <h4 className="font-semibold text-lg mb-2">Opportunité 3</h4>
                  <div className="space-y-2">
                    <p><strong>Recommandation:</strong> {marketData.pay_exploitation_opportunite_3_recommandation}</p>
                    <p><strong>Opportunité associée:</strong> {marketData.pay_exploitation_opportunite_3_opportunite_associee}</p>
                    <p><strong>Priorité:</strong>
                      <span className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        {marketData.pay_exploitation_opportunite_3_priorite}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Stratégies d'atténuation des menaces */}
          <AccordionItem value="strategies-attenuation-menaces">
            <AccordionTrigger className="text-left text-lg flex-1 pr-4">Stratégies d'atténuation des menaces</AccordionTrigger>
            <AccordionContent>
              {/* Version Desktop et Tablette */}
              <div className="hidden md:block">
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#ffdfdf]">
                        <TableHead className="font-semibold text-black">Menace</TableHead>
                        <TableHead className="font-semibold text-black hidden lg:table-cell">Recommandation</TableHead>
                        <TableHead className="font-semibold text-black">Menace associée</TableHead>
                        <TableHead className="font-semibold text-black">Priorité</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Menace 1</TableCell>
                        <TableCell className="hidden lg:table-cell">{marketData.pay_attenuation_menace_1_recommandation}</TableCell>
                        <TableCell>{marketData.pay_attenuation_menace_1_menace_associee}</TableCell>
                        <TableCell>
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                            {marketData.pay_attenuation_menace_1_priorite}
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Menace 2</TableCell>
                        <TableCell className="hidden lg:table-cell">{marketData.pay_attenuation_menace_2_recommandation}</TableCell>
                        <TableCell>{marketData.pay_attenuation_menace_2_menace_associee}</TableCell>
                        <TableCell>
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                            {marketData.pay_attenuation_menace_2_priorite}
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Menace 3</TableCell>
                        <TableCell className="hidden lg:table-cell">{marketData.pay_attenuation_menace_3_recommandation}</TableCell>
                        <TableCell>{marketData.pay_attenuation_menace_3_menace_associee}</TableCell>
                        <TableCell>
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                            {marketData.pay_attenuation_menace_3_priorite}
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Version Mobile */}
              <div className="block md:hidden space-y-4">
                <div className="bg-[#ffdfdf] rounded-md p-4">
                  <h4 className="font-semibold text-lg mb-2">Menace 1</h4>
                  <div className="space-y-2">
                    <p><strong>Recommandation:</strong> {marketData.pay_attenuation_menace_1_recommandation}</p>
                    <p><strong>Menace associée:</strong> {marketData.pay_attenuation_menace_1_menace_associee}</p>
                    <p><strong>Priorité:</strong>
                      <span className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                        {marketData.pay_attenuation_menace_1_priorite}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-[#ffdfdf] rounded-md p-4">
                  <h4 className="font-semibold text-lg mb-2">Menace 2</h4>
                  <div className="space-y-2">
                    <p><strong>Recommandation:</strong> {marketData.pay_attenuation_menace_2_recommandation}</p>
                    <p><strong>Menace associée:</strong> {marketData.pay_attenuation_menace_2_menace_associee}</p>
                    <p><strong>Priorité:</strong>
                      <span className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                        {marketData.pay_attenuation_menace_2_priorite}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-[#ffdfdf] rounded-md p-4">
                  <h4 className="font-semibold text-lg mb-2">Menace 3</h4>
                  <div className="space-y-2">
                    <p><strong>Recommandation:</strong> {marketData.pay_attenuation_menace_3_recommandation}</p>
                    <p><strong>Menace associée:</strong> {marketData.pay_attenuation_menace_3_menace_associee}</p>
                    <p><strong>Priorité:</strong>
                      <span className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                        {marketData.pay_attenuation_menace_3_priorite}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
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
    </>
  );

  return (
    <>
      {/* Utilisation de la carte harmonisée */}
      <HarmonizedDeliverableCard
        title={title}
        description={marketData?.justification_avis || description}
        avis={marketData?.avis || 'Commentaire'}
        iconSrc="/icones-livrables/market-icon.png"
        onClick={handleTemplateClick}
      />

      {/* Utilisation de la modal harmonisée */}
      <HarmonizedDeliverableModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        title={title}
        iconComponent={<img src="/icones-livrables/market-icon.png" alt="Market Icon" className="w-full h-full object-contain" />}
        contentComponent={analyseMarche}
        definition={definition}
        importance={importance}
        showContentTab={true}
        showCommentsTab={true}
        deliverableId={deliverableId || undefined}
        organizationId={organizationId || undefined}
      />
    </>
  );
};

export default AnalyseDeMarcheLivrable;
