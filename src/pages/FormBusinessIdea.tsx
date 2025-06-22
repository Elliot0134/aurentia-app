import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react'; // Assuming lucide-react is used for icons
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
import { useIsMobile } from "@/hooks/use-mobile";

const Form = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [currentField, setCurrentField] = useState('');
  const [popupTitle, setPopupTitle] = useState('');

  const handleFieldClick = (field, content, title) => {
    if (isMobile) {
      setCurrentField(field);
      setPopupContent(content);
      setPopupTitle(title);
      setIsPopupOpen(true);
    }
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

  // State for webhook response and loading
  const [isLoading, setIsLoading] = useState(false);
  const [projectID, setProjectID] = useState(''); // To store Project ID from webhook

  const handleNext = async () => {
    console.log('handleNext called');
    setIsLoading(true); // Start loading and show dialog
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
      };
      console.log('Form Data (Step 1):', formData);

      console.log('Sending POST request to idea webhook...');
      const response = await fetch('https://n8n.eec-technologies.fr/webhook/form-business-idea', {
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
        // Handle response if needed, e.g., show a success message
        const webhookData = result[0]; // Assuming the response is an array with the first element containing the data
        if (webhookData) {
          // Extract and set state for all Step 2 fields from the webhook response
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
          // Store the ProjectID from the webhook response
          setProjectID(webhookData.ProjectID || '');
        } else {
          console.error('Webhook response array is empty or does not contain an object.');
          alert('Erreur lors du traitement de la réponse du formulaire.');
        }
        setCurrentStep(currentStep + 1); // Move to step 2
      } else {
        console.error('Idea webhook response not OK:', response.status, response.statusText);
        alert('Erreur lors de la soumission des informations du projet.');
      }
    } catch (error) {
      console.error('Error submitting idea form:', error);
      alert('Erreur lors de la soumission des informations du projet.');
    } finally {
      setIsLoading(false); // End loading and hide dialog
    }
  };


  const handleSubmit = async () => {
    console.log('handleSubmit called');
    setIsLoading(true); // Start loading and show dialog
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
        descriptionSynthetique: descriptionSynthetique,
        produitServiceRetranscription: produitServiceRetranscription,
        propositionValeur: propositionValeur,
        elementDistinctif: elementDistinctif,
        clienteleCibleRetranscription: clienteleCibleRetranscription,
        problemResoudreRetranscription: problemResoudreRetranscription,
        vision3Ans: vision3Ans,
        businessModel: businessModel,
        projectID: projectID, // Include projectID here
        competences: competences,
        monPourquoiRetranscription: monPourquoiRetranscription,
      };
      console.log('Form Data (Step 2):', formData);

      console.log('Sending POST request to retranscription webhook...');
      const response = await fetch('https://n8n.eec-technologies.fr/webhook/retranscription', {
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

        const webhookData = result[0]; // Assuming the response is an array with the first element containing the data
        const userId = webhookData?.user_id;
        const projectId = webhookData?.project_id;

        if (userId && projectId) {
          // Navigate to the new project idea page
          navigate(`/project-business/${projectId}`);
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
      setIsLoading(false); // End loading on success or error
    }
  };

  const totalSteps = 2; // Total number of steps

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-2">Questionnaire de projet</h1>
      <p className="text-gray-600 text-lg mb-8">Répondez aux questions suivantes pour générer votre livrable personnalisé</p>

      {/* Loading Dialog */}
      <Dialog open={isLoading} onOpenChange={setIsLoading}>
        <DialogContent className="w-[95vw] max-w-[425px] rounded-lg sm:w-full" onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} hideCloseButton={true}>
          <DialogHeader>
            <DialogTitle>
              {currentStep === 1 ? 'Soumission des informations' : 'Génération de vos livrables'}
            </DialogTitle>
            <DialogDescription>
              {currentStep === 1 ? 'Veuillez patienter pendant la soumission de vos informations.' : 'Veuillez patienter pendant la génération de vos livrables.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-4">
            {/* New Loader HTML */}
            <div className="loader">
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="square"></div>
            </div>
          </div>
          {/* Removed DialogPrimitive.Close component */}
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
            className="w-full h-40"
          />
          <DialogFooter>
            <Button onClick={handlePopupSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Tracker */}
      <div className="flex justify-center items-center mb-8 mx-auto w-full md:w-4/5">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {currentStep > 1 ? <CheckCircle size={24} /> : 1}
          </div>
          <p className="text-xs mt-1 w-20 text-center">Informations sur le projet</p>
        </div>
        <div className={`flex-auto border-t-2 mx-4 ${currentStep > 1 ? 'border-orange-500' : 'border-gray-300'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {currentStep > 2 ? <CheckCircle size={24} /> : 2}
          </div>
          <p className="text-xs mt-1 w-20 text-center">Retranscription du concept</p>
        </div>
      </div>

      {currentStep === 2 && (
        <div className="text-center text-2xl font-semibold mb-4 p-4 rounded-md bg-gradient-to-r from-red-500 to-orange-500 text-white mx-auto w-full md:w-4/5">
          Modifiez les réponses un maximum.
          <p className="text-sm font-normal mt-2">Plus vous donnez d'informations sur votre concept, plus la génération des livrables sera développé en conséquence.</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mx-auto w-full md:w-4/5 text-left space-y-4">
        {currentStep === 1 && (
          <>
            {/* Question 1: Nom du projet */}
            <div className="bg-[#F9F6F2] rounded-md p-4">
              <p className="font-medium mb-2">1. Nom du projet</p>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={projectName}
                onClick={() => handleFieldClick('projectName', projectName, 'Nom du projet')}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            {/* Question 2: Décrivez votre projet en une phrase */}
            <div className="bg-[#F9F9F2] rounded-md p-4">
              <p className="font-medium mb-2">2. Décrivez votre projet en une phrase</p>
              <input
                type="text"
                placeholder="Formulez votre concept initial de manière claire et concise."
                className="w-full p-2 border border-gray-300 rounded-md"
                value={projectIdeaSentence}
                onClick={() => handleFieldClick('projectIdeaSentence', projectIdeaSentence, 'Décrivez votre projet en une phrase')}
                onChange={(e) => setProjectIdeaSentence(e.target.value)}
              />
            </div>

            {/* Question 3: Quels produits / services souhaitez vous proposer ? */}
            <div className="bg-[#F9F9F2] rounded-md p-4">
              <p className="font-medium mb-2">3. Quels produits / services souhaitez vous proposer ?</p>
              <textarea
                placeholder="Notez sous forme de liste les produits ou services que vous allez proposer."
                className="w-full p-2 border border-gray-300 rounded-md h-32"
                value={productsServices}
                onClick={() => handleFieldClick('productsServices', productsServices, 'Produits / Services')}
                onChange={(e) => setProductsServices(e.target.value)}
              ></textarea>
            </div>

            {/* Question 4: À quel besoin ou problème répond votre projet ? */}
            <div className="bg-[#F9F9F2] rounded-md p-4">
              <p className="font-medium mb-2">4. À quel besoin ou problème répond votre projet ?</p>
              <textarea
                placeholder="Identifiez le besoin auquel votre solution répond concrètement."
                className="w-full p-2 border border-gray-300 rounded-md h-32"
                value={problemSolved}
                onClick={() => handleFieldClick('problemSolved', problemSolved, 'Besoin ou problème résolu')}
                onChange={(e) => setProblemSolved(e.target.value)}
              ></textarea>
            </div>

            {/* Question 5: Qui seraient vos clients ? */}
            <div className="bg-[#F9F9F2] rounded-md p-4">
              <p className="font-medium mb-2">5. Qui seraient vos clients ?</p>
              <textarea
                placeholder="Décrivez votre public idéal."
                className="w-full p-2 border border-gray-300 rounded-md h-32"
                value={clienteleCible}
                onClick={() => handleFieldClick('clienteleCible', clienteleCible, 'Clientèle cible')}
                onChange={(e) => setClienteleCible(e.target.value)}
              ></textarea>
            </div>

            {/* Question 6: De quoi avez-vous besoin au minimum pour lancer votre projet ? */}
            <div className="bg-[#F9F9F2] rounded-md p-4">
              <p className="font-medium mb-2">6. De quoi avez-vous besoin au minimum pour lancer votre projet ?</p>
              <textarea
                placeholder="Quel besoin en matériel, en compétences etc. ?"
                className="w-full p-2 border border-gray-300 rounded-md h-32"
                value={needs}
                onClick={() => handleFieldClick('needs', needs, 'Besoins pour lancer le projet')}
                onChange={(e) => setNeeds(e.target.value)}
              ></textarea>
            </div>

            {/* Question 7: Quel est le type de votre projet ? */}
            <div className="bg-[#F9F9F2] rounded-md p-4">
              <p className="font-medium mb-2">7. Quel est le type de votre projet ?</p>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
              >
                <option value="">Sélectionner...</option>
                <option value="Physique">Physique (Boutique, restaurant etc.)</option>
                <option value="Digital">Digital (E-commerce, logiciel, formation etc.)</option>
                <option value="Les deux">Les deux (Agence web avec local)</option>
              </select>
            </div>

            {/* Conditional Question: Quelle est la zone géographique ciblée pour votre projet ? */}
            {(projectType === 'Physique' || projectType === 'Les deux') && (
              <div className="bg-[#F9F9F2] rounded-md p-4">
                <p className="font-medium mb-2">8. Quelle est la zone géographique ciblée pour votre projet ?</p>
                <input
                  type="text"
                  placeholder="Ville, région, etc."
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={geographicArea}
                  onClick={() => handleFieldClick('geographicArea', geographicArea, 'Zone géographique ciblée')}
                  onChange={(e) => setGeographicArea(e.target.value)}
                />
              </div>
            )}

            {/* Question 9: Ajouter d'autres informations */}
            <div className="bg-[#F9F9F2] rounded-md p-4">
              <p className="font-medium mb-2">9. Ajouter d'autres informations</p>
              <textarea
                placeholder="Ajoutez ici toute information supplémentaire pertinente pour votre projet."
                className="w-full p-2 border border-gray-300 rounded-md h-32"
                value={additionalInfo}
                onClick={() => handleFieldClick('additionalInfo', additionalInfo, 'Autres informations')}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              ></textarea>
            </div>

            {/* New Question: Pourquoi souhaitez vous entreprendre ? */}
            <div className="bg-[#F9F9F2] rounded-md p-4">
              <p className="font-medium mb-2">10. Pourquoi souhaitez vous entreprendre ?</p>
              <textarea
                placeholder="Décrivez vos motivations et objectifs."
                className="w-full p-2 border border-gray-300 rounded-md h-32"
                value={whyEntrepreneur}
                onClick={() => handleFieldClick('whyEntrepreneur', whyEntrepreneur, 'Pourquoi souhaitez vous entreprendre ?')}
                onChange={(e) => setWhyEntrepreneur(e.target.value)}
              ></textarea>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontSize: '26px' }}>Retranscription du concept</h2>
            {isLoading ? (
              <div className="text-center text-pink-500 text-lg">Chargement de la retranscription du concept...</div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#F9F6F2] rounded-md p-4">
                  <p className="font-medium mb-2">Description synthétique</p>
                  <textarea
                    placeholder="Décrivez votre concept de manière concise."
                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                    value={descriptionSynthetique}
                    onClick={() => handleFieldClick('descriptionSynthetique', descriptionSynthetique, 'Description synthétique')}
                    onChange={(e) => setDescriptionSynthetique(e.target.value)} // Allow editing after initial load
                  ></textarea>
                </div>
                <div className="bg-[#F9F9F2] rounded-md p-4">
                  <p className="font-medium mb-2">Produit / Service</p>
                  <textarea
                    placeholder="Détaillez les produits ou services que vous proposez."
                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                    value={produitServiceRetranscription}
                    onClick={() => handleFieldClick('produitServiceRetranscription', produitServiceRetranscription, 'Produit / Service')}
                    onChange={(e) => setProduitServiceRetranscription(e.target.value)}
                  ></textarea>
                </div>
                <div className="bg-[#F9F9F2] rounded-md p-4">
                  <p className="font-medium mb-2">Proposition de valeur</p>
                  <textarea
                    placeholder="Quelle valeur unique apportez-vous à vos clients ?"
                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                    value={propositionValeur}
                    onClick={() => handleFieldClick('propositionValeur', propositionValeur, 'Proposition de valeur')}
                    onChange={(e) => setPropositionValeur(e.target.value)}
                  ></textarea>
                </div>
                <div className="bg-[#F9F9F2] rounded-md p-4">
                  <p className="font-medium mb-2">Élément distinctif</p>
                  <textarea
                    placeholder="Qu'est-ce qui vous différencie de la concurrence ?"
                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                    value={elementDistinctif}
                    onClick={() => handleFieldClick('elementDistinctif', elementDistinctif, 'Élément distinctif')}
                    onChange={(e) => setElementDistinctif(e.target.value)}
                  ></textarea>
                </div>
                <div className="bg-[#F9F9F2] rounded-md p-4">
                  <p className="font-medium mb-2">Clientèle cible</p>
                  <textarea
                    placeholder="Décrivez votre public idéal."
                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                    value={clienteleCibleRetranscription}
                    onClick={() => handleFieldClick('clienteleCibleRetranscription', clienteleCibleRetranscription, 'Clientèle cible')}
                    onChange={(e) => setClienteleCibleRetranscription(e.target.value)}
                  ></textarea>
                </div>
                <div className="bg-[#F9F9F2] rounded-md p-4">
                  <p className="font-medium mb-2">Problème à résoudre</p>
                  <textarea
                    placeholder="Quel problème majeur votre solution résout-elle ?"
                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                    value={problemResoudreRetranscription}
                    onClick={() => handleFieldClick('problemResoudreRetranscription', problemResoudreRetranscription, 'Problème à résoudre')}
                    onChange={(e) => setProblemResoudreRetranscription(e.target.value)}
                  ></textarea>
                </div>
                <div className="bg-[#F9F9F2] rounded-md p-4">
                  <p className="font-medium mb-2">Mon Pourquoi</p>
                  <textarea
                    placeholder="Décrivez vos motivations profondes pour ce projet."
                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                    value={monPourquoiRetranscription}
                    onClick={() => handleFieldClick('monPourquoiRetranscription', monPourquoiRetranscription, 'Mon Pourquoi')}
                    onChange={(e) => setMonPourquoiRetranscription(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-center mt-6">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="btn-secondary"
            >
              Précédent
            </button>
          )}
          {currentStep < totalSteps && (
            <button
              onClick={handleNext}
              className="btn-primary ml-4"
            >
              Suivant
            </button>
          )}
          {currentStep === totalSteps && (
            <button
              onClick={handleSubmit}
              className="btn-primary ml-4"
            >
              Générer mes livrables
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;
