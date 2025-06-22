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
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox component
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
      case 'preciseLocation':
        setPreciseLocation(popupContent);
        break;
      case 'preciseBudget':
        setPreciseBudget(popupContent);
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
      case 'ideaDifference':
        setIdeaDifference(popupContent);
        break;
      case 'descriptionSynthetique':
        setDescriptionSynthetique(popupContent);
        break;
      case 'produitService':
        setProduitService(popupContent);
        break;
      case 'propositionValeur':
        setPropositionValeur(popupContent);
        break;
      case 'elementDistinctif':
        setElementDistinctif(popupContent);
        break;
      case 'clienteleCible':
        setClienteleCible(popupContent);
        break;
      case 'problemResoudre':
        setProblemResoudre(popupContent);
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
      default:
        break;
    }
    setIsPopupOpen(false);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedSubSectors, setSelectedSubSectors] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');

  // State for Step 1 fields
  const [projectName, setProjectName] = useState('');
  const [projectNature, setProjectNature] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [preciseLocation, setPreciseLocation] = useState('');
  const [hesitateLocations, setHesitateLocations] = useState(['', '', '', '']);
  const [preciseBudget, setPreciseBudget] = useState('');

  // State for Step 2 fields
  const [projectIdeaSentence, setProjectIdeaSentence] = useState('');
  // State for Project ID from webhook
  const [projectID, setProjectID] = useState('');
  const [productsServices, setProductsServices] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [ideaDifference, setIdeaDifference] = useState('');

  // State for Step 3 fields
  const [descriptionSynthetique, setDescriptionSynthetique] = useState('');
  const [produitService, setProduitService] = useState('');
  const [propositionValeur, setPropositionValeur] = useState('');
  const [elementDistinctif, setElementDistinctif] = useState('');
  const [clienteleCible, setClienteleCible] = useState('');
  const [problemResoudre, setProblemResoudre] = useState('');
  const [vision3Ans, setVision3Ans] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  const [competences, setCompetences] = useState('');

  // State for webhook response and loading
  const [isLoading, setIsLoading] = useState(false);

  const sectors = {
    "Agriculture, Sylviculture et Pêche": ["Agriculture", "Élevage", "Viticulture", "Pêche", "Aquaculture"],
    "Alimentation & Restauration": ["Restaurant traditionnel", "Fast-food/Restaurant rapide", "Traiteur", "Food truck", "Épicerie fine", "Production alimentaire", "Cave à vin"],
    "Arisanat & Métiers d'Art": ["Menuiserie", "Bijouterie", "Poterie/Céramique", "Textile/Mode", "Maroquinerie", "Ébénisterie", "Art/Design"],
    "Commerce & Distribution": ["Commerce de détail", "Commerce en gros", "E-commerce", "Grande distribution", "Commerce spécialisé", "Import/Export", "Marketplace"],
    "Construction & Immobilier": ["Construction", "Rénovation", "Promotion immobilière", "Agence immobilière", "Architecture", "Design d'intérieur", "Facility management"],
    "Digital & Technologie": ["Développement logiciel", "Applications mobiles", "Intelligence Générative", "Cybersécurité", "Cloud computing", "IoT/Objets connectés", "Blockchain", "Big Data", "SaaS (Software as a Service)"],
    "Éducation & Formation": ["Formation professionnelle", "Soutien scolaire", "E-learning", "Coaching", "Formation linguistique", "Formation technique"],
    "Environnement & Développement Durable": ["Énergies renouvelables", "Recyclage/Économie circulaire", "Conseil environnemental", "Solutions écologiques", "Agriculture biologique", "Cleantech"],
    "Finance & Assurance": ["Services bancaires", "Assurance", "Fintech", "Conseil financier", "Courtage", "Gestion de patrimoine"],
    "Industrie & Manufacturing": ["Production industrielle", "Fabrication", "Assemblage", "Impression 3D", "Robotique", "Industrie 4.0"],
    "Marketing & Communication": ["Agence de communication", "Marketing digital", "Relations publiques", "Publicité", "Design graphique", "Événementiel"],
    "Santé & Bien-être": ["Services médicaux", "Paramédical", "Bien-être/Spa", "Sport/Fitness", "Nutrition", "Thérapies alternatives", "E-santé"],
    "Services aux Entreprises": ["Conseil", "Comptabilité", "Ressources humaines", "Services juridiques", "Services informatiques", "Maintenance", "Nettoyage professionnel"],
    "Services aux Particuliers": ["Services à la personne", "Conciergerie", "Garde d'enfants", "Aide à domicile", "Services de proximité", "Loisirs/Divertissement"],
    "Transport & Logistique": ["Transport de marchandises", "Transport de personnes", "Logistique", "Stockage", "Livraison dernière mile", "Solutions de mobilité"],
    "Autre": ["Précisez votre secteur"]
  };

  const handleSectorChange = (event) => {
    setSelectedSector(event.target.value);
    setSelectedSubSectors([]); // Reset sub-sectors when main sector changes
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleIdeaSubmission = async () => {
    console.log('handleIdeaSubmission called');
    setIsLoading(true); // Start loading and show dialog
    try {
      const { data: { session } = {} } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      console.log('User ID:', userId);

      const formData = {
        userId: userId,
        step1: {
          projectName: projectName,
          projectNature: projectNature,
          selectedSector: selectedSector,
          selectedSubSectors: selectedSubSectors,
          projectScope: projectScope,
          selectedLocation: selectedLocation,
          preciseLocation: preciseLocation,
          hesitateLocations: hesitateLocations,
          selectedBudget: selectedBudget,
          preciseBudget: preciseBudget,
        },
        step2: {
          projectIdeaSentence: projectIdeaSentence,
          productsServices: productsServices,
          problemSolved: problemSolved,
          ideaDifference: ideaDifference,
        },
      };
      console.log('Form Data:', formData);

      console.log('Sending POST request to idea webhook...');
      const response = await fetch('https://n8n.eec-technologies.fr/webhook/idea', {
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
        const webhookData = result[0];
        if (webhookData) {
          // Extract and set state for all Step 3 fields from the webhook response
          setDescriptionSynthetique(webhookData.DescriptionSynthetique || '');
          setProduitService(webhookData["Produit/Service"] || '');
          setPropositionValeur(webhookData.PropositionValeur || '');
          setElementDistinctif(webhookData.ElementDistinctif || '');
          setClienteleCible(webhookData.ClienteleCible || '');
          setProblemResoudre(webhookData.ProblemResoudre || '');
          setVision3Ans(webhookData.Vision3Ans || '');
          setBusinessModel(webhookData.BusinessModel || '');
          setCompetences(webhookData.Compétences || '');
          // Store the ProjectID from the webhook response
          setProjectID(webhookData.ProjectID || '');
        } else {
          console.error('Webhook response array is empty or does not contain an object.');
          alert('Erreur lors du traitement de la réponse du formulaire.');
        }
        setCurrentStep(currentStep + 1); // Move to step 3
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
        step1: {
          projectName: projectName,
          projectNature: projectNature,
          selectedSector: selectedSector,
          selectedSubSectors: selectedSubSectors,
          projectScope: projectScope,
          selectedLocation: selectedLocation,
          preciseLocation: preciseLocation,
          hesitateLocations: hesitateLocations,
          selectedBudget: selectedBudget,
          preciseBudget: preciseBudget,
        },
        step2: {
          projectIdeaSentence: projectIdeaSentence,
          productsServices: productsServices,
          problemSolved: problemSolved,
          ideaDifference: ideaDifference,
        },
        step3: {
          descriptionSynthetique: descriptionSynthetique,
          produitService: produitService,
          propositionValeur: propositionValeur,
          elementDistinctif: elementDistinctif,
          clienteleCible: clienteleCible,
          problemResoudre: problemResoudre,
          vision3Ans: vision3Ans,
          businessModel: businessModel,
          projectID: projectID, // Include projectID here
          competences: competences,
        }
      };
      console.log('Form Data:', formData);

      console.log('Sending POST request to livrables webhook...');
      const response = await fetch('https://n8n.eec-technologies.fr/webhook-test/livrables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      console.log('Livrables webhook response:', response);

      if (response.ok) {
        console.log('Livrables webhook responded successfully.');
        const result = await response.json();
        console.log('Livrables webhook response JSON:', result);

        const userId = result.user_id;
        const projectId = result.project_id;

        if (userId && projectId) {
          // Navigate to the project page using the project_id
          navigate(`/project/${projectId}`, { state: { userId, projectId } });
        } else {
          console.error('user_id or project_id not found in webhook response.');
          alert('Erreur lors du traitement de la réponse du formulaire : IDs manquants.');
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

  const totalSteps = 3; // Total number of steps

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-2">Questionnaire de projet</h1>
      <p className="text-gray-600 text-lg mb-8">Répondez aux questions suivantes pour générer votre livrable personnalisé</p>

      {/* Loading Dialog */}
      <Dialog open={isLoading} onOpenChange={setIsLoading}>
        <DialogContent className="w-[95vw] max-w-[425px] rounded-lg sm:w-full" onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} hideCloseButton={true}>
          <DialogHeader>
            <DialogTitle>
              {currentStep === 2 ? 'Soumission des informations' : 'Génération de vos livrables'}
            </DialogTitle>
            <DialogDescription>
              {currentStep === 2 ? 'Veuillez patienter pendant la soumission de vos informations.' : 'Veuillez patienter pendant la génération de vos livrables.'}
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
          <p className="text-xs mt-1 w-20 text-center">Informations de base</p>
        </div>
        <div className={`flex-auto border-t-2 mx-4 ${currentStep > 1 ? 'border-orange-500' : 'border-gray-300'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {currentStep > 2 ? <CheckCircle size={24} /> : 2}
          </div>
          <p className="text-xs mt-1 w-20 text-center">Informations sur le projet</p>
        </div>
        <div className={`flex-auto border-t-2 mx-4 ${currentStep > 2 ? 'border-orange-500' : 'border-gray-300'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {currentStep > 3 ? <CheckCircle size={24} /> : 3}
          </div>
          <p className="text-xs mt-1 w-20 text-center">Retranscription du concept</p>
        </div>
      </div>

      {currentStep === 3 && (
        <div className="text-center text-2xl font-semibold mb-4 p-4 rounded-md bg-gradient-to-r from-red-500 to-orange-500 text-white mx-auto w-full md:w-4/5">
          Modifiez les réponses un maximum.
          <p className="text-sm font-normal mt-2">Plus vous donnez d'informations sur votre concept, plus la génération des livrables sera développé en conséquence.</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mx-auto w-full md:w-4/5 text-left">
        {currentStep === 1 && (
          <>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontSize: '26px' }}>Information de base</h2>
            <div className="space-y-4">
              <div className="bg-[#F9F6F2] rounded-md p-4">
                <p className="font-medium mb-2">Quel est le nom de votre projet ?</p>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={projectName}
                  onClick={() => handleFieldClick('projectName', projectName, 'Nom du projet')}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="bg-[#F9F9F2] rounded-md p-4">
                <p className="font-medium mb-2">Quelle est la nature de votre projet ?</p>
                <select className="w-full p-2 border border-gray-300 rounded-md" value={projectNature} onChange={(e) => setProjectNature(e.target.value)}>
                  <option value="">Sélectionner...</option>
                  <option value="produit physique">Produit physique</option>
                  <option value="service">Service</option>
                  <option value="application / solution digitale">Application / solution digitale</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="commerce en ligne">Commerce en ligne</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="bg-[#F9F9F2] rounded-md p-4">
                <p className="font-medium mb-2">Dans quel secteur d'activité se situe votre idée ?</p>
                <select className="w-full p-2 border border-gray-300 rounded-md" value={selectedSector} onChange={handleSectorChange}>
                  <option value="">Sélectionner une catégorie...</option>
                  {Object.keys(sectors).map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
                {selectedSector && (
                  <>
                    <p className="font-medium mb-2 mt-4">Précisez (Plusieurs réponses possibles)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {sectors[selectedSector].map((subSector) => (
                        <label key={subSector} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedSubSectors.includes(subSector)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSubSectors([...selectedSubSectors, subSector]);
                              } else {
                                setSelectedSubSectors(selectedSubSectors.filter(item => item !== subSector));
                              }
                            }}
                            className="checkbox-orange" // Add the checkbox-orange class
                          />
                          <span>{subSector}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="bg-[#F9F9F2] rounded-md p-4">
                <p className="font-medium mb-2">Quelle sera la portée du projet au lancement ?</p>
                <select className="w-full p-2 border border-gray-300 rounded-md" value={projectScope} onChange={(e) => setProjectScope(e.target.value)}>
                  <option value="">Sélectionner...</option>
                  <option value="local">Local</option>
                  <option value="régional">Régional</option>
                  <option value="national">National</option>
                  <option value="international">International</option>
                </select>
              </div>
              <div className="bg-[#F9F9F2] rounded-md p-4">
                <p className="font-medium mb-2">Où souhaitez-vous établir votre activité ?</p>
                <select className="w-full p-2 border border-gray-300 rounded-md" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                  <option value="">Sélectionner...</option>
                  <option value="precise_idea">J'ai déjà une idée précise</option>
                  <option value="hesitate">J'hésite entre plusieurs emplacements</option>
                </select>
                {selectedLocation === 'precise_idea' && (
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Précisez l'emplacement"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={preciseLocation}
                      onClick={() => handleFieldClick('preciseLocation', preciseLocation, 'Emplacement précis')}
                      onChange={(e) => setPreciseLocation(e.target.value)}
                    />
                  </div>
                )}
                {selectedLocation === 'hesitate' && (
                  <div className="mt-4">
                    <p className="font-medium mb-2">Précisez vos idées d'emplacement (villes, régions, etc.)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {hesitateLocations.map((location, index) => (
                        <input
                          key={index}
                          type="text"
                          placeholder={`Emplacement ${index + 1}`}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={location}
                          onClick={() => handleFieldClick(`hesitateLocations[${index}]`, location, `Emplacement ${index + 1}`)}
                          onChange={(e) => {
                            const newLocations = [...hesitateLocations];
                            newLocations[index] = e.target.value;
                            setHesitateLocations(newLocations);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-[#F9F9F2] rounded-md p-4">
                <p className="font-medium mb-2">Quel sera votre budget au lancement ?</p>
                <select className="w-full p-2 border border-gray-300 rounded-md" value={selectedBudget} onChange={(e) => setSelectedBudget(e.target.value)}>
                  <option value="">Sélectionner...</option>
                  <option value="1000-5000">1 000€ - 5 000€</option>
                  <option value="5000-10000">5 000€ - 10 000€</option>
                  <option value="10000-30000">10 000€ - 30 000€</option>
                  <option value="30000-50000">30 000€ - 50 000€</option>
                  <option value="50000-100000">50 000€ - 100 000€</option>
                  <option value="autre">Autre</option>
                </select>
                {selectedBudget === 'autre' && (
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Précisez votre budget"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={preciseBudget}
                      onClick={() => handleFieldClick('preciseBudget', preciseBudget, 'Budget précis')}
                      onChange={(e) => setPreciseBudget(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontSize: '26px' }}>Information sur le projet</h2>
            <div className="space-y-4">
              <div className="bg-[#F9F6F2] rounded-md p-4">
                <p className="font-medium mb-2">Décrivez votre idée de projet en une phrase.</p>
                <input
                  type="text"
                  placeholder="Formulez votre concept principal de manière concise et claire."
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={projectIdeaSentence}
                  onClick={() => handleFieldClick('projectIdeaSentence', projectIdeaSentence, 'Idée de projet en une phrase')}
                  onChange={(e) => setProjectIdeaSentence(e.target.value)}
                />
              </div>
              <div className="bg-[#F9F9F2] rounded-md p-4">
                <p className="font-medium mb-2">Quel produit / service allez-vous proposer ?</p>
                <textarea
                  placeholder="Noter sous forme de listes les produits ou services que vous allez proposer. Si vous pouvez, renseignez également les caractéristiques techniques des produits telles que leurs prix, etc."
                  className="w-full p-2 border border-gray-300 rounded-md h-32"
                  value={productsServices}
                  onClick={() => handleFieldClick('productsServices', productsServices, 'Produits / Services')}
                  onChange={(e) => setProductsServices(e.target.value)}
                ></textarea>
              </div>
              <div className="bg-[#F9F9F2] rounded-md p-4">
                <p className="font-medium mb-2">Quel problème précis cherchez-vous à résoudre ?</p>
                <textarea placeholder="Identifiez la difficulté ou le besoin spécifique auquel votre solution répond concrètement." className="w-full p-2 border border-gray-300 rounded-md h-32" value={problemSolved} onClick={() => handleFieldClick('problemSolved', problemSolved, 'Problème résolu')} onChange={(e) => setProblemSolved(e.target.value)}></textarea>
              </div>
              <div className="bg-[#F9F9F2] rounded-md p-4">
                <p className="font-medium mb-2">En quoi votre idée est-elle différente des autres ?</p>
                <textarea placeholder="Expliquez ce qui rend votre approche unique par rapport aux solutions existantes sur le marché." className="w-full p-2 border border-gray-300 rounded-md h-32" value={ideaDifference} onClick={() => handleFieldClick('ideaDifference', ideaDifference, 'Différence de l\'idée')} onChange={(e) => setIdeaDifference(e.target.value)}></textarea>
              </div>
            </div>
          </>
        )}

        {currentStep === 3 && (
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
                    value={produitService}
                    onClick={() => handleFieldClick('produitService', produitService, 'Produit / Service')}
                    onChange={(e) => setProduitService(e.target.value)}
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
                    value={clienteleCible}
                    onClick={() => handleFieldClick('clienteleCible', clienteleCible, 'Clientèle cible')}
                    onChange={(e) => setClienteleCible(e.target.value)}
                  ></textarea>
                </div>
                <div className="bg-[#F9F9F2] rounded-md p-4">
                  <p className="font-medium mb-2">Problème à résoudre</p>
                  <textarea
                    placeholder="Quel problème majeur votre solution résout-elle ?"
                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                    value={problemResoudre}
                    onClick={() => handleFieldClick('problemResoudre', problemResoudre, 'Problème à résoudre')}
                    onChange={(e) => setProblemResoudre(e.target.value)}
                  ></textarea>
                </div>
                <div className="bg-[#F9F9F2] rounded-md p-4">
                  <p className="font-medium mb-2">Vision à 3 ans</p>
                  <textarea
                    placeholder="Où voyez-vous votre projet dans 3 ans ?"
                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                    value={vision3Ans}
                    onClick={() => handleFieldClick('vision3Ans', vision3Ans, 'Vision à 3 ans')}
                    onChange={(e) => setVision3Ans(e.target.value)}
                  ></textarea>
                </div>
                <div className="bg-[#F9F9F2] rounded-md p-4">
                  <p className="font-medium mb-2">Business model</p>
                  <textarea
                    placeholder="Comment votre projet va-t-il générer des revenus ?"
                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                    value={businessModel}
                    onClick={() => handleFieldClick('businessModel', businessModel, 'Business model')}
                    onChange={(e) => setBusinessModel(e.target.value)}
                  ></textarea>
                </div>
                <div className="bg-[#F9F9F2] rounded-md p-4">
                  <p className="font-medium mb-2">Compétences de l'entrepreneur</p>
                  <textarea
                    placeholder="Quelles sont vos compétences clés pour mener à bien ce projet ?"
                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                    value={competences}
                    onClick={() => handleFieldClick('competences', competences, 'Compétences de l\'entrepreneur')}
                    onChange={(e) => setCompetences(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="btn-secondary"
            >
              Précédent
            </button>
          )}
          {currentStep === 1 && (
            <button
              onClick={handleNext}
              className="btn-primary"
            >
              Suivant
            </button>
          )}
          {currentStep === 2 && (
            <button
              onClick={handleIdeaSubmission}
              className="btn-primary"
            >
              Soumettre
            </button>
          )}
          {currentStep === 3 && (
            <button
              onClick={handleSubmit}
              className="btn-primary"
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
