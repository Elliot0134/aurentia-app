export interface ProjectCreationData {
  currentStep: number;

  // Step 0 - Informations de base
  projectName?: string;
  projectIdeaSentence?: string;

  // Step 1 - Produits & Services
  productsServices?: string;
  problemSolved?: string;

  // Step 2 - Clientèle
  clienteleCible?: string;

  // Step 3 - Besoins
  needs?: string;

  // Step 4 - Type & Localisation
  projectType?: 'Physique' | 'Digital' | 'Les deux' | '';
  geographicArea?: string;

  // Step 5 - Équipe
  teamSize?: string;

  // Step 6 - Informations supplémentaires
  additionalInfo?: string;
  whyEntrepreneur?: string;

  // Step 7 - Confirmation (recap uniquement)

  // Step 8 - Retranscription du concept (pré-rempli par webhook)
  descriptionSynthetique?: string;
  produitServiceRetranscription?: string;
  propositionValeur?: string;
  elementDistinctif?: string;
  clienteleCibleRetranscription?: string;
  problemResoudreRetranscription?: string;
  vision3Ans?: string;
  businessModel?: string;
  competences?: string;
  monPourquoiRetranscription?: string;
  equipeFondatrice?: string;

  // Meta
  projectID?: string;
  organizationId?: string | null;
}

// Types pour les options de select
export type ProjectTypeOption = 'Physique' | 'Digital' | 'Les deux';

export interface Organization {
  id: string;
  name: string;
}

// Type pour les champs de retranscription
export interface RetranscriptionField {
  key: keyof ProjectCreationData;
  label: string;
  placeholder: string;
  icon: string;
}
