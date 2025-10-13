import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import RetranscriptionConceptModal from './RetranscriptionConceptModal';
import { useDeliverableWithComments } from '@/hooks/useDeliverableWithComments';

interface ConceptContent {
  projectName: string;
  syntheticDescription: string;
  detailedDescription: string;
  produitService: string;
  propositionValeur: string;
  elementsDistinctifs: string;
  problemes: string;
  publicCible: string;
  buyerProfiles: { title: string; description: string }[];
  marcheCible: string;
  marchesAnnexes: string;
  localisationProjet: string;
  budget: string;
  equipeFondatrice: string;
  otherInformation: string;
}

type ProjectSummary = {
  b2b_problems?: string;
  b2b_profile?: string;
  b2c_problems?: string;
  b2c_profile?: string;
  budget?: string;
  business_model?: string;
  competences?: string;
  created_at: string;
  description_synthetique?: string;
  elements_distinctifs?: string;
  mail_user?: string;
  Marche_cible?: string;
  marches_annexes?: string;
  nom_projet?: string;
  organismes_problems?: string;
  organismes_profile?: string;
  problemes?: string;
  produit_service?: string;
  project_id: string;
  project_location?: string;
  project_type?: string;
  proposition_valeur?: string;
  public_cible?: string;
  statut?: string;
  "statut buyer personna"?: string;
  updated_at: string;
  user_id?: string;
  validation_complexite?: string;
  validation_concurrence?: string;
  validation_originalite?: string;
  validation_pertinence?: string;
  validation_pestel?: string;
  validation_profile_acheteur?: string;
  vision_3_ans?: string;
  equipe_fondatrice?: string;
};


const RetranscriptionConceptLivrable: React.FC = () => {
  const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize deliverable for comments
  const { deliverableId, organizationId } = useDeliverableWithComments({
    projectId: projectId || '',
    deliverableType: 'other',
    deliverableTitle: 'Retranscription Concept',
  });

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setIsEditing(false); // Reset edit mode when closing modal
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async (editedContent: ConceptContent) => {
    try {
      if (!projectId) return;

      // Map editedContent back to project_summary columns
      const updateData = {
        nom_projet: editedContent.projectName,
        description_synthetique: editedContent.syntheticDescription,
        produit_service: editedContent.produitService,
        proposition_valeur: editedContent.propositionValeur,
        elements_distinctifs: editedContent.elementsDistinctifs,
        problemes: editedContent.problemes,
        public_cible: editedContent.publicCible,
        b2c_profile: editedContent.buyerProfiles[0]?.description,
        b2c_problems: editedContent.buyerProfiles[1]?.description,
        b2b_profile: editedContent.buyerProfiles[2]?.description,
        b2b_problems: editedContent.buyerProfiles[3]?.description,
        organismes_profile: editedContent.buyerProfiles[4]?.description,
        organismes_problems: editedContent.buyerProfiles[5]?.description,
        Marche_cible: editedContent.marcheCible,
        marches_annexes: editedContent.marchesAnnexes,
        project_location: editedContent.localisationProjet,
        budget: editedContent.budget,
        equipe_fondatrice: editedContent.equipeFondatrice,
      };

      const { error } = await supabase
        .from('project_summary')
        .update(updateData)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error updating project summary:', error);
        alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
        return;
      }

      // Update local state
      setProjectSummary(prev => prev ? { ...prev, ...updateData } : null);

      setIsEditing(false);
      console.log('Sauvegarde réussie!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  useEffect(() => {
    const fetchProjectSummary = async () => {
      if (projectId) {
        const { data, error } = await supabase
          .from('project_summary')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (error) {
          console.error('Error fetching project summary:', error);
        } else {
          setProjectSummary(data as unknown as ProjectSummary);
        }
      }
    };

    fetchProjectSummary();
  }, [projectId]);

  const title = projectSummary?.nom_projet || "Retranscription du concept";
  const description = projectSummary?.description_synthetique || "Synthèse complète de votre projet d'entreprise";

  const modalContent = {
    projectName: projectSummary?.nom_projet || 'N/A',
    syntheticDescription: projectSummary?.description_synthetique || 'N/A',
    detailedDescription: projectSummary?.produit_service || 'N/A',
    produitService: projectSummary?.produit_service || 'N/A',
    propositionValeur: projectSummary?.proposition_valeur || 'N/A',
    elementsDistinctifs: projectSummary?.elements_distinctifs || 'N/A',
    problemes: projectSummary?.problemes || 'N/A',
    publicCible: projectSummary?.public_cible || 'N/A',
    buyerProfiles: [
      { title: 'Particuliers (Profil)', description: projectSummary?.b2c_profile || 'N/A' },
      { title: 'Particuliers (Problèmes)', description: projectSummary?.b2c_problems || 'N/A' },
      { title: 'Entreprises (Profil)', description: projectSummary?.b2b_profile || 'N/A' },
      { title: 'Entreprises (Problèmes)', description: projectSummary?.b2b_problems || 'N/A' },
      { title: 'Organismes (Profil)', description: projectSummary?.organismes_profile || 'N/A' },
      { title: 'Organismes (Problèmes)', description: projectSummary?.organismes_problems || 'N/A' },
    ],
    marcheCible: projectSummary?.Marche_cible || 'N/A',
    marchesAnnexes: projectSummary?.marches_annexes || 'N/A',
    localisationProjet: projectSummary?.project_location || 'N/A',
    budget: projectSummary?.budget || 'N/A',
    equipeFondatrice: projectSummary?.equipe_fondatrice || 'N/A',
    otherInformation: '', // Champ vide pour satisfaire le type
  };

  return (
    <>
      <HarmonizedDeliverableCard
        title={title}
        description={description}
        iconSrc="/icones-livrables/retranscription-icon.png"
        onClick={handleTemplateClick}
      />

      <RetranscriptionConceptModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        title={title}
        iconComponent={<img src="/icones-livrables/retranscription-icon.png" alt="Retranscription Icon" className="w-full h-full object-contain" />}
        onEdit={handleEdit}
        isEditing={isEditing}
        onCancel={handleCancelEdit}
        onSave={handleSaveEdit}
        content={modalContent}
      />
      {/* TODO: Add comments tab to RetranscriptionConceptModal - deliverableId: {deliverableId}, organizationId: {organizationId} */}
    </>
  );
};

export default RetranscriptionConceptLivrable;
