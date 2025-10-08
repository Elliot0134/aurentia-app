import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFreeDeliverableProgress } from "@/hooks/useFreeDeliverableProgress";
import FreeDeliverableProgressContainer from "@/components/deliverables/FreeDeliverableProgressContainer";
import { useUserRole } from "@/hooks/useUserRole";

// Mapping des noms de livrables aux chemins d'icônes
const deliverableIcons: { [key: string]: string } = {
  "Analyse de marché": "/icones-livrables/market-icon.png",
  "Analyse de la concurrence": "/icones-livrables/concurrence-icon.png",
  "Persona Express": "/icones-livrables/persona-icon.png",
  "Proposition de valeur": "/icones-livrables/proposition-valeur-icon.png",
  "Business Model Canvas": "/icones-livrables/business-model-icon.png",
  "Vision, Mission, Valeurs": "/icones-livrables/vision-icon.png",
  "Analyse des ressources": "/icones-livrables/ressources-icon.png",
  "Success Story": "/icones-livrables/story-icon.png", // Correction du nom pour correspondre à useFreeDeliverableProgress
  "Pitch": "/icones-livrables/pitch-icon.png",
  "Retranscription du concept": "/icones-livrables/retranscription-icon.png",
  "Mini SWOT": "/icones-livrables/market-icon.png",
  "Vision, Mission & Valeurs": "/icones-livrables/vision-icon.png", // Correction du nom pour correspondre à useFreeDeliverableProgress
  "Cadre juridique": "/icones-livrables/juridique-icon.png", // Ajout du livrable Cadre juridique
  "Note globale": "/icones-livrables/score-icon.png", // Ajout du livrable Note globale avec la bonne icône
  // Ajoutez d'autres livrables ici si nécessaire
};

const Form = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { userProfile, loading: userLoading } = useUserRole();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [currentField, setCurrentField] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [slideDirection, setSlideDirection] = useState('next');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // States pour la sélection d'organisation
  const [availableOrganizations, setAvailableOrganizations] = useState<Array<{id: string, name: string}>>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [previousStep, setPreviousStep] = useState(currentStep);

  const handleFieldClick = (field, content, title) => {
    // Supprimer l'option de popup en version mobile
    // Laisser le champ éditable directement
  };

  const handlePopupSave = () => {
    switch (currentField) {
      case 'projectName':
        setProjectName(popupContent);
        break;
      case 'projectIdeaSentence':
        setProjectIdeaSentence(popupContent);
        break;
      case 'productsServices':
        setProductsServices(popupContent);
        break;
      case 'problemSolved':
        setProblemSolved(popupContent);
        break;
      case 'clienteleCible':
        setClienteleCible(popupContent);
        break;
      case 'needs':
        setNeeds(popupContent);
        break;
      case 'projectType':
        setProjectType(popupContent);
        break;
      case 'geographicArea':
        setGeographicArea(popupContent);
        break;
      case 'additionalInfo':
        setAdditionalInfo(popupContent);
        break;
      case 'whyEntrepreneur':
        setWhyEntrepreneur(popupContent);
        break;
      case 'teamSize':
        setTeamSize(popupContent);
        break;
      case 'descriptionSynthetique':
        setDescriptionSynthetique(popupContent);
        break;
      case 'produitServiceRetranscription':
        setProduitServiceRetranscription(popupContent);
        break;
      case 'propositionValeur':
        setPropositionValeur(popupContent);
        break;
      case 'elementDistinctif':
        setElementDistinctif(popupContent);
        break;
      case 'clienteleCibleRetranscription':
        setClienteleCibleRetranscription(popupContent);
        break;
      case 'problemResoudreRetranscription':
        setProblemResoudreRetranscription(popupContent);
        break;
      case 'vision3Ans':
        setVision3Ans(popupContent);
        break;
      case 'businessModel':
        setBusinessModel(popupContent);
        break;
      case 'competences':
        setCompetences(popupContent);
        break;
      case 'monPourquoiRetranscription':
        setMonPourquoiRetranscription(popupContent);
        break;
      case 'equipeFondatrice':
        setEquipeFondatrice(popupContent);
        break;
      default:
        break;
    }
    setIsPopupOpen(false);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  // State for step 1 fields
  const [projectName, setProjectName] = useState('');
  const [projectIdeaSentence, setProjectIdeaSentence] = useState('');
  const [productsServices, setProductsServices] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [clienteleCible, setClienteleCible] = useState('');
  const [needs, setNeeds] = useState('');
  const [projectType, setProjectType] = useState('');
  const [geographicArea, setGeographicArea] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [whyEntrepreneur, setWhyEntrepreneur] = useState('');
  const [teamSize, setTeamSize] = useState('');

  // State for step 2 fields (Retranscription du concept)
  const [descriptionSynthetique, setDescriptionSynthetique] = useState('');
  const [produitServiceRetranscription, setProduitServiceRetranscription] = useState('');
  const [propositionValeur, setPropositionValeur] = useState('');
  const [elementDistinctif, setElementDistinctif] = useState('');
  const [clienteleCibleRetranscription, setClienteleCibleRetranscription] = useState('');
  const [problemResoudreRetranscription, setProblemResoudreRetranscription] = useState('');
  const [vision3Ans, setVision3Ans] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  const [competences, setCompetences] = useState('');
  const [monPourquoiRetranscription, setMonPourquoiRetranscription] = useState('');
  const [equipeFondatrice, setEquipeFondatrice] = useState('');

  // State for webhook response and loading
  const [isLoading, setIsLoading] = useState(false);
  const [projectID, setProjectID] = useState('');
  
  // Hook pour le suivi des livrables gratuits - actif à l'étape 9 avec projectID
  const { deliverables } = useFreeDeliverableProgress(projectID, projectID && currentStep === 9);

  // Charger les organisations disponibles
  useEffect(() => {
    const fetchAvailableOrganizations = async () => {
      if (userLoading) return;
      
      try {
        // Si l'utilisateur est un membre, récupérer son organisation via user_organizations
        if (userProfile?.user_role === 'member' && userProfile?.id) {
          const { data: userOrg } = await (supabase as any)
            .from('user_organizations')
            .select('organization_id, organizations(id, name)')
            .eq('user_id', userProfile.id)
            .eq('status', 'active')
            .single();
            
          if (userOrg?.organizations) {
            setAvailableOrganizations([userOrg.organizations]);
            setSelectedOrganization(userOrg.organizations.id);
          }
        } else {
          // Pour les autres utilisateurs, charger toutes les organisations publiques
          const { data: orgs, error } = await (supabase as any)
            .from('organizations')
            .select('id, name')
            .eq('is_public', true)
            .order('name');
            
          if (!error && orgs) {
            setAvailableOrganizations(orgs);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des organisations:', error);
      }
    };

    fetchAvailableOrganizations();
  }, [userProfile, userLoading]);

  // Note: Textarea components from shadcn handle auto-resize automatically

  const handleNext = async () => {
    if (currentStep === 8) {
      // Process step 1 data when moving from step 8 (confirmation) to step 9 (retranscription)
      console.log('handleNext called');
      setIsLoading(true);
      try {
        const { data: { session } = {} } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        console.log('User ID:', userId);

        const formData = {
          userId: userId,
          projectName: projectName,
          projectIdeaSentence: projectIdeaSentence,
          productsServices: productsServices,
          problemSolved: problemSolved,
          clienteleCible: clienteleCible,
          needs: needs,
          projectType: projectType,
          geographicArea: projectType === 'Physique' || projectType === 'Les deux' ? geographicArea : '',
          additionalInfo: additionalInfo,
          whyEntrepreneur: whyEntrepreneur,
          teamSize: teamSize,
          organizationId: selectedOrganization === 'none' ? null : selectedOrganization || null, // Ajouter l'ID de l'organisation
        };
        console.log('Form Data (Step 1):', formData);

        console.log('Sending POST request to idea webhook...');
        const response = await fetch('https://n8n.srv906204.hstgr.cloud/webhook/form-business-idea', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        console.log('Idea webhook response:', response);

        if (response.ok) {
          const result = await response.json();
          console.log('Idea webhook response JSON:', result);
          const webhookData = result[0];
          if (webhookData) {
            setDescriptionSynthetique(webhookData.DescriptionSynthetique || '');
            setProduitServiceRetranscription(webhookData["Produit/Service"] || '');
            setPropositionValeur(webhookData.PropositionValeur || '');
            setElementDistinctif(webhookData.ElementDistinctif || '');
            setClienteleCibleRetranscription(webhookData.ClienteleCible || '');
            setProblemResoudreRetranscription(webhookData.ProblemResoudre || '');
            setVision3Ans(webhookData.Vision3Ans || '');
            setBusinessModel(webhookData.BusinessModel || '');
            setCompetences(webhookData.Compétences || '');
            setMonPourquoiRetranscription(webhookData.MotivationEntrepreneur || '');
            setEquipeFondatrice(webhookData.EquipeFondatrice || '');
            const newProjectID = webhookData.ProjectID || '';
            console.log('🆔 ProjectID défini:', newProjectID);
            setProjectID(newProjectID);
          } else {
            console.error('Webhook response array is empty or does not contain an object.');
            alert('Erreur lors du traitement de la réponse du formulaire.');
          }
          
          // Start transition
          setSlideDirection('next');
          setIsTransitioning(true);
          setPreviousStep(currentStep);
          
          setTimeout(() => {
            setCurrentStep(currentStep + 1);
          }, 50);
          
          setTimeout(() => {
            setIsTransitioning(false);
          }, 350);
        } else {
          console.error('Idea webhook response not OK:', response.status, response.statusText);
          alert('Erreur lors de la soumission des informations du projet.');
        }
      } catch (error) {
        console.error('Error submitting idea form:', error);
        alert('Erreur lors de la soumission des informations du projet.');
      } finally {
        setIsLoading(false);
      }
    } else {
             // Start transition
       setSlideDirection('next');
       setIsTransitioning(true);
       setPreviousStep(currentStep);
       
       setTimeout(() => {
         setCurrentStep(currentStep + 1);
       }, 50);
       
       setTimeout(() => {
         setIsTransitioning(false);
       }, 350);
    }
  };

  const handlePrevious = () => {
    // Start transition
    setSlideDirection('prev');
    setIsTransitioning(true);
    setPreviousStep(currentStep);
    
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
    }, 50);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 350);
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    setIsLoading(true);
    try {
      const { data: { session } = {} } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      console.log('User ID:', userId);

      const formData = {
        userId: userId,
        projectName: projectName,
        projectIdeaSentence: projectIdeaSentence,
        productsServices: productsServices,
        problemSolved: problemSolved,
        clienteleCible: clienteleCible,
        needs: needs,
        projectType: projectType,
        geographicArea: projectType === 'Physique' || projectType === 'Les deux' ? geographicArea : '',
        additionalInfo: additionalInfo,
        whyEntrepreneur: whyEntrepreneur,
        teamSize: teamSize,
        descriptionSynthetique: descriptionSynthetique,
        produitServiceRetranscription: produitServiceRetranscription,
        propositionValeur: propositionValeur,
        elementDistinctif: elementDistinctif,
        clienteleCibleRetranscription: clienteleCibleRetranscription,
        problemResoudreRetranscription: problemResoudreRetranscription,
        vision3Ans: vision3Ans,
        businessModel: businessModel,
        projectID: projectID,
        competences: competences,
        monPourquoiRetranscription: monPourquoiRetranscription,
        equipeFondatrice: equipeFondatrice,
      };
      console.log('Form Data (Step 2):', formData);

      console.log('Sending POST request to retranscription webhook...');
      const response = await fetch('https://n8n.srv906204.hstgr.cloud/webhook/retranscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      console.log('Retranscription webhook response:', response);

      if (response.ok) {
        console.log('Livrables webhook responded successfully.');
        const result = await response.json();
        console.log('Livrables webhook response JSON:', result);

        const webhookData = result[0];
        const userId = webhookData?.user_id;
        const projectId = webhookData?.project_id;

        if (userId && projectId) {
          navigate(`/individual/project-business/${projectId}`);
        } else {
          console.error('user_id or project_id not found in webhook response.');
          alert('Erreur lors du traitement de la réponse du formulaire.');
        }
      } else {
        console.error('Webhook response not OK:', response.status, response.statusText);
        alert('Erreur lors de la soumission du formulaire.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erreur lors de la soumission du formulaire.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalSteps = 9;

  const stepTitles = [
    "Informations de base",
    "Produits & Services", 
    "Votre clientèle",
    "Vos besoins",
    "Type & Localisation",
    "Informations supplémentaires",
    "Confirmation",
    "Retranscription du concept"
  ];

  const getStepContent = (step = currentStep) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Commençons par les bases</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-2">
                  ✨ Quel est le nom de votre projet ?
                </label>
                <Input
                  type="text"
                  className="w-full p-3 text-base md:text-lg border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="Tapez le nom de votre projet..."
                  value={projectName}
                  onClick={() => handleFieldClick('projectName', projectName, 'Nom du projet')}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-2">
                  💡 Décrivez votre projet en une phrase
                </label>
                <Input
                  type="text"
                  className="w-full p-3 text-base md:text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Formulez votre concept initial de manière claire et concise..."
                  value={projectIdeaSentence}
                  onClick={() => handleFieldClick('projectIdeaSentence', projectIdeaSentence, 'Décrivez votre projet en une phrase')}
                  onChange={(e) => setProjectIdeaSentence(e.target.value)}
                />
              </div>

                // ...existing code...
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Vos produits et services</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-2">
                  🛍️ Quels produits/services souhaitez-vous proposer ?
                </label>
                <Textarea
                  className="w-full p-3 text-base md:text-lg border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors h-24 resize-none"
                  placeholder="Notez sous forme de liste les produits ou services que vous allez proposer..."
                  value={productsServices}
                  onClick={() => handleFieldClick('productsServices', productsServices, 'Produits / Services')}
                  onChange={(e) => setProductsServices(e.target.value)}
                />
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-2">
                  🎯 À quel problème répond votre projet ?
                </label>
                <Textarea
                  className="w-full p-3 text-base md:text-lg border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors h-24 resize-none"
                  placeholder="Identifiez le besoin auquel votre solution répond concrètement..."
                  value={problemSolved}
                  onClick={() => handleFieldClick('problemSolved', problemSolved, 'Besoin ou problème résolu')}
                  onChange={(e) => setProblemSolved(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Votre clientèle</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-2">
                  👥 Qui seraient vos clients ?
                </label>
                <Textarea
                  className="w-full p-3 text-base md:text-lg border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors h-24 resize-none"
                  placeholder="Décrivez votre public idéal..."
                  value={clienteleCible}
                  onClick={() => handleFieldClick('clienteleCible', clienteleCible, 'Clientèle cible')}
                  onChange={(e) => setClienteleCible(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Vos besoins</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-2">
                  🚀 De quoi avez-vous besoin pour vous lancer ?
                </label>
                <Textarea
                  className="w-full p-3 text-base md:text-lg border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors h-24 resize-none"
                  placeholder="Quel besoin en matériel, en compétences etc. ?"
                  value={needs}
                  onClick={() => handleFieldClick('needs', needs, 'Besoins pour lancer le projet')}
                  onChange={(e) => setNeeds(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Type et localisation</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-2">
                  🏢 Quel est le type de votre projet ?
                </label>
                <select
                  className="w-full p-3 text-base md:text-lg border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  <option value="Physique">Physique (Boutique, restaurant etc.)</option>
                  <option value="Digital">Digital (E-commerce, logiciel, formation etc.)</option>
                  <option value="Les deux">Les deux (Agence web avec local)</option>
                </select>
              </div>

              {(projectType === 'Physique' || projectType === 'Les deux') && (
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 border border-rose-200">
                  <label className="block text-base md:text-lg font-semibold text-gray-800 mb-2">
                    📍 Quelle zone géographique ciblez-vous ?
                  </label>
                  <Input
                    type="text"
                    className="w-full p-3 text-base md:text-lg border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none transition-colors"
                    placeholder="Ville, région, etc."
                    value={geographicArea}
                    onClick={() => handleFieldClick('geographicArea', geographicArea, 'Zone géographique ciblée')}
                    onChange={(e) => setGeographicArea(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Votre équipe</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-2">
                  👥 Combien êtes-vous sur le projet ?
                </label>
                <Textarea
                  className="w-full p-3 text-base md:text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors h-24 resize-none"
                  placeholder="Décrivez la taille de votre équipe actuelle ou envisagée pour ce projet. Par exemple : 'Je suis seul', 'Nous sommes 2 cofondateurs', 'Une équipe de 5 personnes incluant des freelances'."
                  value={teamSize}
                  onClick={() => handleFieldClick('teamSize', teamSize, 'Nombre de personnes sur le projet')}
                  onChange={(e) => setTeamSize(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Pour finir...</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-2">
                  📝 Informations supplémentaires
                </label>
                <Textarea
                  className="w-full p-3 text-base md:text-lg border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none transition-colors h-24 resize-none"
                  placeholder="Ajoutez ici toute information supplémentaire pertinente pour votre projet..."
                  value={additionalInfo}
                  onClick={() => handleFieldClick('additionalInfo', additionalInfo, 'Autres informations')}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                />
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-2">
                  🔥 Pourquoi souhaitez-vous entreprendre ?
                </label>
                <Textarea
                  className="w-full p-3 text-base md:text-lg border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors h-24 resize-none"
                  placeholder="Décrivez vos motivations et objectifs..."
                  value={whyEntrepreneur}
                  onClick={() => handleFieldClick('whyEntrepreneur', whyEntrepreneur, 'Pourquoi souhaitez vous entreprendre ?')}
                  onChange={(e) => setWhyEntrepreneur(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">⚠️ Confirmation</h2>
            </div>
            
            <div className="space-y-6">

              {/* Summary section */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-4 text-center">📋 Récapitulatif de vos informations</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-700 text-sm">Nom du projet</p>
                      <p className="text-gray-600 text-sm">{projectName || "Non renseigné"}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-700 text-sm">Description en une phrase</p>
                      <p className="text-gray-600 text-sm">{projectIdeaSentence || "Non renseigné"}</p>
                    </div>
                    
                    {selectedOrganization && selectedOrganization !== 'none' && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <p className="font-semibold text-gray-700 text-sm">Organisation liée</p>
                        <p className="text-gray-600 text-sm">
                          {availableOrganizations.find(org => org.id === selectedOrganization)?.name || "Organisation sélectionnée"}
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-700 text-sm">Produits/Services</p>
                      <p className="text-gray-600 text-sm">{productsServices || "Non renseigné"}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-700 text-sm">Problème résolu</p>
                      <p className="text-gray-600 text-sm">{problemSolved || "Non renseigné"}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-700 text-sm">Clientèle cible</p>
                      <p className="text-gray-600 text-sm">{clienteleCible || "Non renseigné"}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-700 text-sm">Besoins pour lancer</p>
                      <p className="text-gray-600 text-sm">{needs || "Non renseigné"}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-700 text-sm">Type de projet</p>
                      <p className="text-gray-600 text-sm">{projectType || "Non renseigné"}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-700 text-sm">Zone géographique</p>
                      <p className="text-gray-600 text-sm">{geographicArea || "Non renseigné"}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-700 text-sm">Informations supplémentaires</p>
                      <p className="text-gray-600 text-sm">{additionalInfo || "Non renseigné"}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-700 text-sm">Motivation entrepreneuriale</p>
                      <p className="text-gray-600 text-sm">{whyEntrepreneur || "Non renseigné"}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-700 text-sm">Équipe</p>
                      <p className="text-gray-600 text-sm">{teamSize || "Non renseigné"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation section */}
              <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                  Êtes-vous sûr de vouloir continuer ? ✅
                </h4>
                <p className="text-sm text-gray-600">
                  Vos informations seront traitées pour générer votre retranscription de concept.
                  Vous pourrez toujours modifier les résultats à l'étape suivante.
                </p>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <div className="text-center text-xl md:text-2xl font-semibold mb-3 p-3 rounded-md bg-gradient-to-r from-red-500 to-orange-500 text-white">
              Modifiez les réponses un maximum.
              <p className="text-base font-normal mt-1">Plus vous donnez d'informations sur votre concept, plus la génération des livrables sera développé en conséquence.</p>
            </div>

            <h2 className="text-lg md:text-xl font-semibold mb-3">Retranscription du concept</h2>
            {isLoading ? (
              <div className="text-center text-pink-500 text-base md:text-lg">Chargement de la retranscription du concept...</div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white rounded-md p-3">
                  <p className="font-medium mb-1 text-base">Description synthétique</p>
                  <Textarea
                    placeholder="Décrivez votre concept de manière concise."
                    className="w-full p-2 border border-gray-300 rounded-md text-base"
                    value={descriptionSynthetique}
                    onClick={() => handleFieldClick('descriptionSynthetique', descriptionSynthetique, 'Description synthétique')}
                    onChange={(e) => setDescriptionSynthetique(e.target.value)}
                  />
                </div>
                <div className="bg-white rounded-md p-3">
                  <p className="font-medium mb-1 text-base">Produit / Service</p>
                  <Textarea
                    placeholder="Détaillez les produits ou services que vous proposez."
                    className="w-full p-2 border border-gray-300 rounded-md text-base"
                    value={produitServiceRetranscription}
                    onClick={() => handleFieldClick('produitServiceRetranscription', produitServiceRetranscription, 'Produit / Service')}
                    onChange={(e) => setProduitServiceRetranscription(e.target.value)}
                  />
                </div>
                <div className="bg-white rounded-md p-3">
                  <p className="font-medium mb-1 text-base">Proposition de valeur</p>
                  <Textarea
                    placeholder="Quelle valeur unique apportez-vous à vos clients ?"
                    className="w-full p-2 border border-gray-300 rounded-md text-base"
                    value={propositionValeur}
                    onClick={() => handleFieldClick('propositionValeur', propositionValeur, 'Proposition de valeur')}
                    onChange={(e) => setPropositionValeur(e.target.value)}
                  />
                </div>
                <div className="bg-white rounded-md p-3">
                  <p className="font-medium mb-1 text-base">Élément distinctif</p>
                  <Textarea
                    placeholder="Qu'est-ce qui vous différencie de la concurrence ?"
                    className="w-full p-2 border border-gray-300 rounded-md text-base"
                    value={elementDistinctif}
                    onClick={() => handleFieldClick('elementDistinctif', elementDistinctif, 'Élément distinctif')}
                    onChange={(e) => setElementDistinctif(e.target.value)}
                  />
                </div>
                <div className="bg-white rounded-md p-3">
                  <p className="font-medium mb-1 text-base">Clientèle cible</p>
                  <Textarea
                    placeholder="Décrivez votre public idéal."
                    className="w-full p-2 border border-gray-300 rounded-md text-base"
                    value={clienteleCibleRetranscription}
                    onClick={() => handleFieldClick('clienteleCibleRetranscription', clienteleCibleRetranscription, 'Clientèle cible')}
                    onChange={(e) => setClienteleCibleRetranscription(e.target.value)}
                  />
                </div>
                <div className="bg-white rounded-md p-3">
                  <p className="font-medium mb-1 text-base">Problème à résoudre</p>
                  <Textarea
                    placeholder="Quel problème majeur votre solution résout-elle ?"
                    className="w-full p-2 border border-gray-300 rounded-md text-base"
                    value={problemResoudreRetranscription}
                    onClick={() => handleFieldClick('problemResoudreRetranscription', problemResoudreRetranscription, 'Problème à résoudre')}
                    onChange={(e) => setProblemResoudreRetranscription(e.target.value)}
                  />
                </div>
                <div className="bg-white rounded-md p-3">
                  <p className="font-medium mb-1 text-base">Mon Pourquoi</p>
                  <Textarea
                    placeholder="Décrivez vos motivations profondes pour ce projet."
                    className="w-full p-2 border border-gray-300 rounded-md text-base"
                    value={monPourquoiRetranscription}
                    onClick={() => handleFieldClick('monPourquoiRetranscription', monPourquoiRetranscription, 'Mon Pourquoi')}
                    onChange={(e) => setMonPourquoiRetranscription(e.target.value)}
                  />
                </div>
                <div className="bg-white rounded-md p-3">
                  <p className="font-medium mb-1 text-base">L'équipe fondatrice</p>
                  <Textarea
                    placeholder="Décrivez l'équipe fondatrice et ses compétences clés."
                    className="w-full p-2 border border-gray-300 rounded-md text-base"
                    value={equipeFondatrice}
                    onClick={() => handleFieldClick('equipeFondatrice', equipeFondatrice, 'L\'équipe fondatrice')}
                    onChange={(e) => setEquipeFondatrice(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

     return (
     <div className="min-h-screen bg-[#F8F6F1] flex flex-col md:justify-center py-10 container mx-auto px-4">
             {/* Header */}
       <div className="text-center">
         <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
           Questionnaire de projet
         </h1>
         <p className="text-gray-600 text-base mb-6">Répondez aux questions suivantes pour générer votre livrable personnalisé</p>

         {/* Progress Bar */}
         <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Étape {currentStep} sur {totalSteps}</span>
            <span className="text-sm font-medium text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

                 {/* Loading Dialog */}
         <Dialog open={isLoading} onOpenChange={setIsLoading}>
           <DialogContent className="w-[95vw] max-w-[500px] rounded-lg sm:w-full" onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} hideCloseButton={true}>
             <DialogHeader>
               <DialogTitle className="text-2xl">
                 {currentStep === 8 ? 'Soumission des informations' : '🚀 Génération de vos livrables'}
               </DialogTitle>
               <DialogDescription>
                 {currentStep === 8
                   ? 'Veuillez patienter pendant la soumission de vos informations.'
                   : 'La génération de vos premiers livrables peut prendre quelques minutes. Nous créons du contenu personnalisé basé sur vos réponses !'}
               </DialogDescription>
             </DialogHeader>
             
             {/* Deliverable Progress Section - Only show during deliverables generation (step 9) */}
             {currentStep === 9 && (
               <div className="mt-6 space-y-3">
                 <h4 className="text-sm font-medium text-gray-700 mb-3">Génération en cours :</h4>
                 {deliverables.map((deliverable) => (
                   <FreeDeliverableProgressContainer
                     key={deliverable.key}
                     deliverable={{
                       ...deliverable,
                       icon: deliverableIcons[deliverable.name] || "/placeholder.svg", // Utilise l'icône mappée ou une icône par défaut
                     }}
                   />
                 ))}
               </div>
             )}
             
            <div className="flex justify-center items-center py-4">
              <div className="loader">
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="square"></div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Input Pop-up Dialog */}
        <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
          <DialogContent className="w-[95vw] max-w-[425px] rounded-lg sm:w-full">
            <DialogHeader>
              <DialogTitle>{popupTitle}</DialogTitle>
              <DialogDescription>
                Modifiez le contenu du champ ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={popupContent}
              onChange={(e) => setPopupContent(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            <DialogFooter>
              <Button onClick={handlePopupSave}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

                 {/* Form Content with Slide Animation */}
         <div className="max-w-4xl mx-auto">
           <div className="relative overflow-hidden min-h-[500px]">
             {isTransitioning ? (
               <>
                 {/* Previous content sliding out */}
                 <div 
                   className={`absolute inset-0 ${
                     slideDirection === 'next' ? 'animate-slide-out-left' : 'animate-slide-out-right'
                   }`}
                   style={{ willChange: 'transform' }}
                 >
                   <div className="p-4 md:p-6 text-left">
                     {getStepContent(previousStep)}
                   </div>
                 </div>
                 
                 {/* New content sliding in */}
                 <div 
                   className={`absolute inset-0 ${
                     slideDirection === 'next' ? 'animate-slide-in-right' : 'animate-slide-in-left'
                   }`}
                   style={{ willChange: 'transform' }}
                 >
                   <div className="p-4 md:p-6 text-left">
                     {getStepContent()}
                   </div>
                 </div>
               </>
             ) : (
               <div className="p-4 md:p-6 text-left">
                 {getStepContent()}
               </div>
             )}
           </div>

                     {/* Navigation Buttons */}
           <div className="flex justify-between items-center mt-6 px-4 pb-[80px]">
             <button
               onClick={handlePrevious}
               disabled={currentStep === 1}
               className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                 currentStep === 1
                   ? 'text-gray-400 cursor-not-allowed'
                   : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
               }`}
             >
               <ChevronLeft size={18} />
               <span>Précédent</span>
             </button>

             {currentStep < totalSteps ? (
               <button
                 onClick={handleNext}
                 className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
               >
                 <span>Suivant</span>
                 <ChevronRight size={18} />
               </button>
             ) : (
               <button
                 onClick={handleSubmit}
                 className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
               >
                 <span>Générer mes livrables</span>
                 <CheckCircle size={18} />
               </button>
             )}
           </div>
        </div>
      </div>

             {/* CSS for custom loader and slide animations */}
       <style>{`
         .loader {
           position: relative;
           width: 50px;
           height: 50px;
         }
         
         .circle {
           position: absolute;
           width: 10px;
           height: 10px;
           border-radius: 50%;
           background: linear-gradient(45deg, #f97316, #ef4444);
           animation: circle-animation 2s infinite ease-in-out;
         }
         
         .circle:nth-child(1) {
           top: 0;
           left: 0;
           animation-delay: 0s;
         }
         
         .circle:nth-child(2) {
           top: 0;
           right: 0;
           animation-delay: 0.5s;
         }
         
         .circle:nth-child(3) {
           bottom: 0;
           left: 0;
           animation-delay: 1s;
         }
         
         .square {
           position: absolute;
           bottom: 0;
           right: 0;
           width: 10px;
           height: 10px;
           background: linear-gradient(45deg, #f97316, #ef4444);
           animation: square-animation 2s infinite ease-in-out;
           animation-delay: 1.5s;
         }
         
         .animate-slide-out-left {
           animation: slide-out-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
           animation-fill-mode: forwards;
         }
         
         .animate-slide-out-right {
           animation: slide-out-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
           animation-fill-mode: forwards;
         }
         
         .animate-slide-in-left {
           animation: slide-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
           animation-fill-mode: forwards;
         }
         
         .animate-slide-in-right {
           animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
           animation-fill-mode: forwards;
         }
         
         @keyframes slide-out-left {
           0% {
             transform: translate3d(0, 0, 0);
             opacity: 1;
           }
           100% {
             transform: translate3d(-100%, 0, 0);
             opacity: 0;
           }
         }
         
         @keyframes slide-out-right {
           0% {
             transform: translate3d(0, 0, 0);
             opacity: 1;
           }
           100% {
             transform: translate3d(100%, 0, 0);
             opacity: 0;
           }
         }
         
         @keyframes slide-in-left {
           0% {
             transform: translate3d(-100%, 0, 0);
             opacity: 0;
           }
           100% {
             transform: translate3d(0, 0, 0);
             opacity: 1;
           }
         }
         
         @keyframes slide-in-right {
           0% {
             transform: translate3d(100%, 0, 0);
             opacity: 0;
           }
           100% {
             transform: translate3d(0, 0, 0);
             opacity: 1;
           }
         }

         
         @keyframes circle-animation {
           0%, 100% {
             transform: scale(1);
             opacity: 1;
           }
           50% {
             transform: scale(1.5);
             opacity: 0.7;
           }
         }
         
         @keyframes square-animation {
           0%, 100% {
             transform: rotate(0deg) scale(1);
             opacity: 1;
           }
           50% {
             transform: rotate(180deg) scale(1.2);
             opacity: 0.8;
           }
         }
       `}</style>
    </div>
  );
};

export default Form;
