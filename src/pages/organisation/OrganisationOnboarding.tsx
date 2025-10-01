import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronLeft, ChevronRight, Building, Target, Users, Award, Globe, Settings } from 'lucide-react';
import { getOrganisation, updateOrganisation, createOrganisation } from "@/services/organisationService";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from '@/hooks/useUserRole';
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
import { AddressAutocompleteInput } from "@/components/ui/address-autocomplete-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";
import ImageUploader from '@/components/ImageUploader';
import STORAGE_BUCKETS from '@/config/storage';

const OrganisationOnboardingPage = () => {
  const { id: organisationId } = useParams<{ id: string }>();
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
  const [loading, setLoading] = useState(false);
  const [organisation, setOrganisation] = useState<any>(null);
  const [isNewOrganisation, setIsNewOrganisation] = useState(false);

  // État pour les données du formulaire
  const [formData, setFormData] = useState({
  // Étape 1: Informations de base (incluant les champs du setup)
  name: "",
  type: "",
  customType: "",
  description: "",
  foundedYear: new Date().getFullYear(),
  website: "",
  email: userProfile?.email || "",
  phone: "",
  address: "",
  teamSize: 0 as number | "",
  welcome_message: "",
  primary_color: "",
  secondary_color: "",
  // image fields
  logo_url: "",
  logo_path: "",
  banner_url: "",
  banner_path: "",
  newsletter_enabled: false,
    
    // Étape 2: Mission, Vision, Valeurs
    mission: "",
    vision: "",
    values: [] as string[],
    
    // Étape 3: Spécialisations
    sectors: [] as string[],
    stages: [] as string[],
    specializations: [] as string[],
    
    // Étape 4: Méthodologie
    methodology: "",
    programDurationMonths: 6 as number | "",
    successCriteria: "",
    supportTypes: [] as string[],
    
    // Étape 5: Zone géographique et contacts
    geographicFocus: [] as string[],
    customGeographic: "",
    socialMediaLinkedin: "",
    socialMediaTwitter: "",
    socialMediaWebsite: "",
    
    // Étape 6: Paramètres
    isPublic: true,
    allowDirectApplications: true
  });

  const totalSteps = 6;

  // Image uploader import
  // ...existing code...

  // Options prédéfinies pour les types d'organisations
  const organisationTypes = [
  { value: "incubator", label: "Incubateur" },
  { value: "accelerator", label: "Accélérateur" },
  { value: "business_school", label: "École de commerce" },
  { value: "university", label: "Université" },
  { value: "consulting", label: "Cabinet de conseil" },
  { value: "other", label: "Autre" }
  ];

  // Options prédéfinies
  const sectorOptions = [
    "Tech", "Fintech", "Healthtech", "Edtech", "Agritech", "Cleantech",
    "E-commerce", "SaaS", "IoT", "IA/Machine Learning", "Blockchain",
    "Mobilité", "Immobilier", "Retail", "Manufacturing", "Services",
    "Entertainment", "Autre"
  ];

  const stageOptions = [
    "Idéation", "Pré-seed", "Seed", "Série A", "Série B", "Série C+",
    "Growth stage", "Scale-up", "Expansion internationale"
  ];

  const specializationOptions = [
    "Accompagnement stratégique", "Développement produit", "Marketing digital",
    "Financement", "Juridique", "RH", "Technologie", "International",
    "Opérations", "Ventes", "Partenariats", "Pitch training"
  ];

  const supportTypeOptions = [
    "Mentoring individuel", "Workshops collectifs", "Formations",
    "Financement direct", "Mise en relation investisseurs",
    "Espaces de coworking", "Support technique", "Support juridique",
    "Développement commercial", "Networking"
  ];

  const geographicOptions = [
    "France", "Europe", "Amérique du Nord", "Amérique du Sud",
    "Afrique", "Asie", "Océanie", "International"
  ];

  // Charger les données de l'organisation ou initialiser une nouvelle organisation
  useEffect(() => {
    const initializeOrganisation = async () => {
      if (userLoading) return;

      // If we have an organisationId, load existing organization
      if (organisationId) {
        try {
          const data = await getOrganisation(organisationId);
          setOrganisation(data);
          setIsNewOrganisation(false);

          // Si l'onboarding est déjà complété, rediriger vers le dashboard
          if ((data as any).onboarding_completed) {
            // Ne redirige que si la route actuelle est une route organisation
            if (!window.location.pathname.startsWith('/individual')) {
              toast({
                title: "Onboarding déjà complété",
                description: "Redirection vers votre dashboard...",
              });
              navigate(`/organisation/${organisationId}/dashboard`);
              return;
            }
          }

          // Pré-remplir le formulaire avec les données existantes
          const safeParseJSON = (value: any) => {
            if (!value) return [];
            if (typeof value === 'string') {
              try {
                return JSON.parse(value);
              } catch {
                return [];
              }
            }
            return Array.isArray(value) ? value : [];
          };

          const safeParseSocialMedia = (value: any) => {
            if (!value) return {};
            if (typeof value === 'string') {
              try {
                return JSON.parse(value);
              } catch {
                return {};
              }
            }
            return typeof value === 'object' ? value : {};
          };

          setFormData({
            name: (data as any).name || "",
            type: (data as any).type || "",
            customType: (data as any).customType || "",
            description: (data as any).description || "",
            foundedYear: (data as any).founded_year || new Date().getFullYear(),
            website: (data as any).website || "",
            email: (data as any).email || userProfile?.email || "",
            phone: (data as any).phone || "",
            address: (data as any).address || "",
            teamSize: (data as any).team_size || 0,
            welcome_message: (data as any).welcome_message || "",
            primary_color: (data as any).primary_color || "",
            secondary_color: (data as any).secondary_color || "",
            logo_url: (data as any).logo_url || "",
            logo_path: (data as any).logo_path || "",
            banner_url: (data as any).banner_url || "",
            banner_path: (data as any).banner_path || "",
            newsletter_enabled: (data as any).newsletter_enabled || false,
            mission: (data as any).mission || "",
            vision: (data as any).vision || "",
            values: safeParseJSON((data as any).values),
            sectors: safeParseJSON((data as any).sectors),
            stages: safeParseJSON((data as any).stages),
            specializations: safeParseJSON((data as any).specializations),
            methodology: (data as any).methodology || "",
            programDurationMonths: (data as any).program_duration_months || 6,
            successCriteria: (data as any).success_criteria || "",
            supportTypes: safeParseJSON((data as any).support_types),
            geographicFocus: safeParseJSON((data as any).geographic_focus),
            customGeographic: (data as any).customGeographic || "",
            socialMediaLinkedin: safeParseSocialMedia((data as any).social_media).linkedin || "",
            socialMediaTwitter: safeParseSocialMedia((data as any).social_media).twitter || "",
            socialMediaWebsite: safeParseSocialMedia((data as any).social_media).website || "",
            isPublic: (data as any).is_public !== undefined ? (data as any).is_public : true,
            allowDirectApplications: (data as any).allow_direct_applications !== undefined ? (data as any).allow_direct_applications : true
          });

          // Commencer à l'étape où l'utilisateur s'était arrêté
          if ((data as any).onboarding_step && (data as any).onboarding_step > 0) {
            setCurrentStep(Math.min((data as any).onboarding_step + 1, totalSteps));
          }

        } catch (error: any) {
          console.error('Erreur lors du chargement de l\'organisation:', error);
          toast({
            title: "Erreur de chargement",
            description: error.message || "Une erreur s'est produite",
            variant: "destructive",
          });
          navigate('/dashboard');
        }
      } else {
        // No organisationId in params - this is a new organization setup
        if (!userProfile) {
          toast({
            title: "Erreur",
            description: "Profil utilisateur manquant",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        // Check if user already has an organization
        if (userProfile.organization_id) {
          // User already has an organization, redirect to onboarding
          if (!window.location.pathname.startsWith('/individual')) {
            navigate(`/organisation/${userProfile.organization_id}/onboarding`);
            return;
          }
        }

        // Initialize for new organization
        setIsNewOrganisation(true);
        setFormData(prev => ({
          ...prev,
          email: userProfile.email || ""
        }));
      }
    };

    initializeOrganisation();
  }, [organisationId, navigate, userProfile, userLoading]);

  const handleFieldClick = (field: string, content: string, title: string) => {
    setCurrentField(field);
    setPopupContent(content);
    setPopupTitle(title);
    setIsPopupOpen(true);
  };

  const handlePopupSave = () => {
    setFormData(prev => ({
      ...prev,
      [currentField]: popupContent
    }));
    setIsPopupOpen(false);
  };

  const handleArrayToggle = (field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addCustomValue = (field: keyof typeof formData, value: string) => {
    if (value.trim()) {
      setFormData(prev => {
        const currentArray = prev[field] as string[];
        if (!currentArray.includes(value.trim())) {
          return {
            ...prev,
            [field]: [...currentArray, value.trim()]
          };
        }
        return prev;
      });
    }
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast({
          title: "Champ requis",
          description: "Le nom de l'organisation est obligatoire.",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.type) {
        toast({
          title: "Champ requis", 
          description: "Le type d'organisation est obligatoire.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < totalSteps) {
      setSlideDirection('next');
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setSlideDirection('prev');
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      let finalOrganisationId = organisationId;

      if (isNewOrganisation) {
        // Create new organization first
        if (!userProfile?.id) {
          throw new Error("Profil utilisateur manquant");
        }

        const organizationData = {
          name: formData.name,
          type: formData.type,
          description: formData.description,
          website: formData.website,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          welcome_message: formData.welcome_message,
          primary_color: formData.primary_color || null,
          secondary_color: formData.secondary_color || null,
          logo_url: formData.logo_url || null,
          logo_path: formData.logo_path || null,
          banner_url: formData.banner_url || null,
          banner_path: formData.banner_path || null,
          newsletter_enabled: formData.newsletter_enabled,
          created_by: userProfile.id,
          founded_year: formData.foundedYear,
          team_size: typeof formData.teamSize === 'number' ? formData.teamSize : 0,
          founded_year: Number(formData.foundedYear) || new Date().getFullYear(),
          team_size: Number(formData.teamSize) || 0,
          mission: formData.mission,
          vision: formData.vision,
          values: JSON.stringify(formData.values),
          sectors: JSON.stringify(formData.sectors),
          stages: JSON.stringify(formData.stages),
          specializations: JSON.stringify(formData.specializations),
          methodology: formData.methodology,
          program_duration_months: Number(formData.programDurationMonths) || 6,
          success_criteria: formData.successCriteria,
          support_types: JSON.stringify(formData.supportTypes),
          geographic_focus: JSON.stringify(formData.geographicFocus),
          custom_geographic: formData.customGeographic,
          social_media: JSON.stringify({
            linkedin: formData.socialMediaLinkedin,
            twitter: formData.socialMediaTwitter,
            website: formData.socialMediaWebsite
          }),
          is_public: formData.isPublic,
          allow_direct_applications: formData.allowDirectApplications,
          onboarding_completed: true,
          onboarding_step: totalSteps,
        };

        const newOrganization = await createOrganisation(organizationData);
        finalOrganisationId = newOrganization.id;

        // Update user profile with organization info
        const { error: updateError } = await supabase
          .from('profiles' as any)
          .update({
            user_role: 'organisation',
            organization_id: newOrganization.id
          })
          .eq('id', userProfile.id);

        if (updateError) {
          console.error('Erreur lors de la mise à jour du profil:', updateError);
          throw updateError;
        }

      } else {
        // Update existing organization
        const updateData = {
          name: formData.name,
          type: formData.type,
          description: formData.description,
          founded_year: formData.foundedYear,
          website: formData.website,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          team_size: Number(formData.teamSize) || 0,
          welcome_message: formData.welcome_message,
          primary_color: formData.primary_color || null,
          secondary_color: formData.secondary_color || null,
          logo_url: formData.logo_url || null,
          logo_path: formData.logo_path || null,
          banner_url: formData.banner_url || null,
          banner_path: formData.banner_path || null,
          newsletter_enabled: formData.newsletter_enabled,
          mission: formData.mission,
          vision: formData.vision,
          values: JSON.stringify(formData.values),
          sectors: JSON.stringify(formData.sectors),
          stages: JSON.stringify(formData.stages),
          specializations: JSON.stringify(formData.specializations),
          methodology: formData.methodology,
          program_duration_months: Number(formData.programDurationMonths) || 6,
          success_criteria: formData.successCriteria,
          support_types: JSON.stringify(formData.supportTypes),
          geographic_focus: JSON.stringify(formData.geographicFocus),
          custom_geographic: formData.customGeographic,
          social_media: JSON.stringify({
            linkedin: formData.socialMediaLinkedin,
            twitter: formData.socialMediaTwitter,
            website: formData.socialMediaWebsite
          }),
          is_public: formData.isPublic,
          allow_direct_applications: formData.allowDirectApplications,
          onboarding_completed: true,
          onboarding_step: totalSteps,
          updated_at: new Date().toISOString()
        };

        await updateOrganisation(finalOrganisationId!, updateData);
      }

      toast({
        title: "Onboarding terminé !",
        description: "Votre organisation est maintenant configurée. Redirection vers votre tableau de bord...",
      });

      setTimeout(() => {
        navigate(`/organisation/${finalOrganisationId}/dashboard`);
      }, 1500);

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Une erreur s'est produite lors de la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step: number) => {
    const icons = [
      Building,
      Target,
      Award,
      Users,
      Globe,
      Settings
    ];
    return icons[step - 1] || Building;
  };

  if (userLoading || (!isNewOrganisation && !organisation)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-pink mx-auto mb-4"></div>
          <p className="text-gray-500">
            {userLoading ? "Chargement..." : "Chargement de l'organisation..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
            {isNewOrganisation ? "Créer votre organisation" : `Configuration de ${organisation?.name || "votre organisation"}`}
          </h1>
          <p className="text-gray-600">
            {isNewOrganisation 
              ? "Configurez votre organisation et complétez votre profil en 6 étapes" 
              : "Complétez votre profil d'organisation pour commencer à accompagner des entrepreneurs"
            }
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, i) => {
              const stepNumber = i + 1;
              const StepIcon = getStepIcon(stepNumber);
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              
              return (
                <React.Fragment key={stepNumber}>
                  <div className={`flex flex-col items-center ${isMobile ? 'scale-75' : ''}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isCurrent 
                          ? 'bg-aurentia-pink border-aurentia-pink text-white' 
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    {!isMobile && (
                      <span className={`text-xs mt-2 text-center ${isCurrent ? 'text-aurentia-pink font-medium' : 'text-gray-500'}`}>
                        Étape {stepNumber}
                      </span>
                    )}
                  </div>
                  {stepNumber < totalSteps && (
                    <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                      stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Contenu des étapes */}
        <div className="max-w-2xl mx-auto">
          <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
            
            {/* Étape 1: Informations de base */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Building className="w-6 h-6 text-aurentia-pink" />
                  <h2 className="text-xl font-semibold text-gray-800">Informations de base</h2>
                </div>
                
                <div className="space-y-4">
                  {/* Nom de l'organisation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'organisation *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom de votre organisation..."
                      className="w-full"
                      required
                    />
                  </div>

                  {/* Type d'organisation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'organisation *
                    </label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any, customType: "" }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez un type d'organisation" />
                      </SelectTrigger>
                      <SelectContent>
                        {organisationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.type === "other" && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Précisez le type d'organisation
                        </label>
                        <Input
                          value={formData.customType || ""}
                          onChange={e => setFormData(prev => ({ ...prev, customType: e.target.value }))}
                          placeholder="Ex: Association, Collectif, etc."
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description de votre organisation
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez votre mission et vos objectifs..."
                      className="w-full"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Année de fondation
                      </label>
                      <Input
                        type="number"
                        value={formData.foundedYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, foundedYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taille de l'équipe
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={formData.teamSize === "" ? "" : formData.teamSize}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === "") {
                            setFormData(prev => ({ ...prev, teamSize: "" }));
                          } else {
                            const num = parseInt(val);
                            setFormData(prev => ({ ...prev, teamSize: isNaN(num) || num < 0 ? 0 : num }));
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Contact et localisation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site web
                      </label>
                      <Input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://..."
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Numéro de téléphone..."
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de contact
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@organisation.com"
                      className="w-full"
                    />
                  </div>

                  {/* Message de bienvenue */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message de bienvenue (optionnel)
                    </label>
                    <Textarea
                      value={formData.welcome_message}
                      onChange={(e) => setFormData(prev => ({ ...prev, welcome_message: e.target.value }))}
                      placeholder="Message d'accueil pour les entrepreneurs..."
                      className="w-full"
                      rows={3}
                    />
                  </div>

                  {/* Couleurs de personnalisation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur principale (optionnel)
                      </label>
                      <Input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                        className="w-full h-10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur secondaire (optionnel)
                      </label>
                      <Input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                        className="w-full h-10"
                      />
                    </div>
                  </div>

                  {/* Newsletter */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Newsletter</h3>
                      <p className="text-sm text-gray-600">Activer l'inscription à la newsletter pour les entrepreneurs</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.newsletter_enabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, newsletter_enabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-aurentia-pink/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aurentia-pink"></div>
                    </label>
                  </div>
                  
                  {/* Logo & Banner uploaders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <ImageUploader
                        bucket="organisation-logo"
                        value={formData.logo_url || undefined}
                        existingPath={formData.logo_path || undefined}
                        folder={`organisations/${organisationId || 'temp'}`}
                        label="Logo de l'organisation"
                        maxSizeMB={STORAGE_BUCKETS['organisation-logo'].maxSizeMB}
                        onUpload={(publicUrl, path) => setFormData(prev => ({ ...prev, logo_url: publicUrl, logo_path: path }))}
                        onDelete={() => setFormData(prev => ({ ...prev, logo_url: '', logo_path: '' }))}
                      />
                    </div>

                    <div>
                      <ImageUploader
                        bucket="organisation-banner"
                        value={formData.banner_url || undefined}
                        existingPath={formData.banner_path || undefined}
                        folder={`organisations/${organisationId || 'temp'}`}
                        label="Bannière"
                        maxSizeMB={STORAGE_BUCKETS['organisation-banner'].maxSizeMB}
                        onUpload={(publicUrl, path) => setFormData(prev => ({ ...prev, banner_url: publicUrl, banner_path: path }))}
                        onDelete={() => setFormData(prev => ({ ...prev, banner_url: '', banner_path: '' }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2: Mission, Vision, Valeurs */}
            {currentStep === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-aurentia-pink" />
                  <h2 className="text-xl font-semibold text-gray-800">Mission, Vision & Valeurs</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mission
                    </label>
                    <Textarea
                      value={formData.mission}
                      onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                      placeholder="Définissez la mission de votre organisation..."
                      className="w-full min-h-[100px] resize-y"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vision
                    </label>
                    <Textarea
                      value={formData.vision}
                      onChange={(e) => setFormData(prev => ({ ...prev, vision: e.target.value }))}
                      placeholder="Définissez la vision de votre organisation..."
                      className="w-full min-h-[100px] resize-y"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valeurs
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.values.map((value, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-red-50"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            values: prev.values.filter((_, i) => i !== index)
                          }))}
                        >
                          {value} ×
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Ajouter une valeur..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = e.currentTarget.value.trim();
                          if (value && !formData.values.includes(value)) {
                            setFormData(prev => ({
                              ...prev,
                              values: [...prev.values, value]
                            }));
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Spécialisations */}
            {currentStep === 3 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-6 h-6 text-aurentia-pink" />
                  <h2 className="text-xl font-semibold text-gray-800">Spécialisations</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Secteurs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Secteurs d'activité
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {sectorOptions.map(sector => (
                        <Button
                          key={sector}
                          variant={formData.sectors.includes(sector) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleArrayToggle('sectors', sector)}
                          className={formData.sectors.includes(sector) ? "bg-aurentia-orange-aurentia hover:bg-aurentia-orange-aurentia/90" : ""}
                        >
                          {sector}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Stades */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Stades d'investissement
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {stageOptions.map(stage => (
                        <Button
                          key={stage}
                          variant={formData.stages.includes(stage) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleArrayToggle('stages', stage)}
                          className={formData.stages.includes(stage) ? "bg-aurentia-orange-aurentia hover:bg-aurentia-orange-aurentia/90" : ""}
                        >
                          {stage}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Spécialisations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Types d'accompagnement
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {specializationOptions.map(spec => (
                        <Button
                          key={spec}
                          variant={formData.specializations.includes(spec) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleArrayToggle('specializations', spec)}
                          className={formData.specializations.includes(spec) ? "bg-aurentia-orange-aurentia hover:bg-aurentia-orange-aurentia/90" : ""}
                        >
                          {spec}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 4: Méthodologie */}
            {currentStep === 4 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-aurentia-pink" />
                  <h2 className="text-xl font-semibold text-gray-800">Méthodologie</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Méthodologie d'accompagnement
                    </label>
                    <Textarea
                      value={formData.methodology}
                      onChange={(e) => setFormData(prev => ({ ...prev, methodology: e.target.value }))}
                      placeholder="Décrivez votre approche d'accompagnement..."
                      className="w-full"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée moyenne des programmes (mois)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.programDurationMonths === "" ? "" : formData.programDurationMonths}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === "") {
                          setFormData(prev => ({ ...prev, programDurationMonths: "" }));
                        } else {
                          const num = parseInt(val);
                          setFormData(prev => ({ ...prev, programDurationMonths: isNaN(num) || num < 1 ? 1 : num }));
                        }
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Critères de succès
                    </label>
                    <Textarea
                      value={formData.successCriteria}
                      onChange={(e) => setFormData(prev => ({ ...prev, successCriteria: e.target.value }))}
                      placeholder="Comment mesurez-vous le succès de vos accompagnements..."
                      className="w-full"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Types de support
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {supportTypeOptions.map(type => (
                        <Button
                          key={type}
                          variant={formData.supportTypes.includes(type) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleArrayToggle('supportTypes', type)}
                          className={formData.supportTypes.includes(type) ? "bg-aurentia-orange-aurentia hover:bg-aurentia-orange-aurentia/90" : ""}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 5: Zone géographique et contacts */}
            {currentStep === 5 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-6 h-6 text-aurentia-pink" />
                  <h2 className="text-xl font-semibold text-gray-800">Zone géographique & Contacts</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Zones géographiques d'intervention
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {geographicOptions.map(zone => (
                        <Button
                          key={zone}
                          variant={formData.geographicFocus.includes(zone) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleArrayToggle('geographicFocus', zone)}
                          className={formData.geographicFocus.includes(zone) ? "bg-aurentia-orange-aurentia hover:bg-aurentia-orange-aurentia/90" : ""}
                        >
                          {zone}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Précisez la ville
                      </label>
                      <AddressAutocompleteInput
                        addressType="regions"
                        value={formData.customGeographic}
                        onChange={(value) => setFormData(prev => ({ ...prev, customGeographic: value }))}
                        placeholder="Commencer à taper une adresse, région ou ville..."
                        className="w-full"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse exacte de l'organisation
                      </label>
                      <AddressAutocompleteInput
                        addressType="full"
                        value={formData.address}
                        onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                        placeholder="Commencer à taper une adresse complète..."
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <Input
                        value={formData.socialMediaLinkedin}
                        onChange={(e) => setFormData(prev => ({ ...prev, socialMediaLinkedin: e.target.value }))}
                        placeholder="URL LinkedIn..."
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twitter
                      </label>
                      <Input
                        value={formData.socialMediaTwitter}
                        onChange={(e) => setFormData(prev => ({ ...prev, socialMediaTwitter: e.target.value }))}
                        placeholder="URL Twitter..."
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site web supplémentaire
                    </label>
                    <Input
                      value={formData.socialMediaWebsite}
                      onChange={(e) => setFormData(prev => ({ ...prev, socialMediaWebsite: e.target.value }))}
                      placeholder="URL site web..."
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 6: Paramètres */}
            {currentStep === 6 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-6 h-6 text-aurentia-pink" />
                  <h2 className="text-xl font-semibold text-gray-800">Paramètres de visibilité</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Profil public</h3>
                      <p className="text-sm text-gray-600">Votre organisation sera visible dans les annuaires publics</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-aurentia-pink/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aurentia-pink"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Candidatures directes</h3>
                      <p className="text-sm text-gray-600">Permettre aux entrepreneurs de vous contacter directement</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowDirectApplications}
                        onChange={(e) => setFormData(prev => ({ ...prev, allowDirectApplications: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-aurentia-pink/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aurentia-pink"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-aurentia-pink/10 to-aurentia-orange/10 rounded-lg border border-aurentia-pink/20">
                  <h3 className="font-medium text-gray-800 mb-2">🎉 Prêt à lancer votre organisation !</h3>
                  <p className="text-sm text-gray-600">
                    Votre profil est maintenant complet. Vous pourrez modifier ces informations à tout moment depuis votre tableau de bord.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>

            {currentStep === totalSteps ? (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-aurentia-pink to-aurentia-orange hover:from-aurentia-pink/90 hover:to-aurentia-orange/90 text-white flex items-center gap-2"
              >
                {loading ? "Finalisation..." : "Terminer l'onboarding"}
                <CheckCircle className="w-4 h-4" />
              </Button>
            ) : (
            <Button
              onClick={nextStep}
              disabled={loading}
              className="bg-aurentia-orange-aurentia hover:bg-aurentia-orange-aurentia/90 text-white flex items-center gap-2"
            >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour les champs texte */}
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{popupTitle}</DialogTitle>
            <DialogDescription>
              Décrivez en détail cet aspect de votre organisation.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={popupContent}
            onChange={(e) => setPopupContent(e.target.value)}
            placeholder="Votre texte ici..."
            className="min-h-[150px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPopupOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handlePopupSave} className="bg-aurentia-pink hover:bg-aurentia-pink/90 text-white">
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganisationOnboardingPage;
