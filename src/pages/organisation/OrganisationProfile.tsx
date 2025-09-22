import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useOrganisationData, useOrganisationStats } from '@/hooks/useOrganisationData';
import { updateOrganisation } from '@/services/organisationService';
import {
  Building,
  Users,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Info
} from "lucide-react";

// Options pour les spécialisations (alignées avec l'onboarding)
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

const geographicOptions = [
  "France", "Europe", "Amérique du Nord", "Amérique du Sud",
  "Afrique", "Asie", "Océanie", "International"
];

const supportTypeOptions = [
  "Mentoring individuel", "Workshops collectifs", "Formations",
  "Financement direct", "Mise en relation investisseurs",
  "Espaces de coworking", "Support technique", "Support juridique",
  "Développement commercial", "Networking"
];

interface OrganisationProfile {
  id: string;
  name: string;
  type: 'incubator' | 'accelerator' | 'venture_capital' | 'corporate' | 'university' | 'government';
  description: string;
  foundedYear: number;
  headquarters: string;
  website?: string;
  email: string;
  phone?: string;
  logo?: string;
  
  // Informations détaillées
  mission: string;
  vision: string;
  values: string[];
  
  // Statistiques et performance
  stats: {
    totalStartups: number;
    activePrograms: number;
    totalInvestment: number;
    successRate: number;
    teamSize: number;
    averageProgramDuration: number;
  };
  
  // Spécialisations et secteurs
  sectors: string[];
  stages: string[];
  geographicFocus: string[];
  
  // Contact et social
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  
  // Configuration
  isPublic: boolean;
  allowDirectApplications: boolean;
  
  // Metadata
  lastUpdated: Date;
}

const OrganisationProfile = () => {
  const { id: organisationId } = useParams();
  const { organisation, loading: orgLoading } = useOrganisationData();
  const { stats, loading: statsLoading } = useOrganisationStats();
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // État local pour l'édition - ÉTENDU pour tous les champs d'onboarding
  const [editFormData, setEditFormData] = useState({
    // Informations de base
    name: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    headquarters: '',
    foundedYear: new Date().getFullYear(),
    teamSize: 0,
    
    // Mission, Vision, Valeurs
    mission: '',
    vision: '',
    values: [] as string[],
    
    // Spécialisations
    sectors: [] as string[],
    stages: [] as string[],
    specializations: [] as string[],
    
    // Méthodologie
    methodology: '',
    programDurationMonths: 6,
    successCriteria: '',
    supportTypes: [] as string[],
    
    // Contact et social
    geographicFocus: [] as string[],
    socialMedia: {
      linkedin: '',
      twitter: '',
      facebook: '',
      website: ''
    },
    socialMediaLinkedin: '',
    socialMediaTwitter: '',
    socialMediaWebsite: '', // Aligné avec l'onboarding (pas Facebook/Instagram)
    
    // Paramètres
    isPublic: true,
    allowDirectApplications: true
  });

  // Adapter les données Supabase pour l'interface de profil
  const profile = organisation ? {
    id: organisation.id,
    name: organisation.name,
    type: (organisation as any).type || 'incubator' as const,
    description: (organisation as any).description || 'Aucune description disponible',
    foundedYear: (organisation as any).founded_year || 2018,
    headquarters: organisation.address || 'Non spécifié',
    website: organisation.website || '',
    email: organisation.email || 'Non spécifié',
    phone: (organisation as any).phone || 'Non spécifié',
    
    mission: (organisation as any).mission || 'Mission à définir',
    vision: (organisation as any).vision || 'Vision à définir',
    values: (organisation as any).values ? JSON.parse((organisation as any).values) : ['Innovation', 'Excellence'],
    
    // Méthodologie et programme
    methodology: (organisation as any).methodology || '',
    successCriteria: (organisation as any).success_criteria || '',
    supportTypes: (organisation as any).support_types ? JSON.parse((organisation as any).support_types) : [],
    
    stats: {
      totalStartups: stats?.totalEntrepreneurs || 0,
      activePrograms: 3, // TODO: Calculer depuis les données
      totalInvestment: 0, // TODO: Ajouter tracking investissements
      successRate: stats?.successRate || 0,
      teamSize: (organisation as any).team_size || stats?.totalMentors || 0,
      averageProgramDuration: (organisation as any).program_duration_months || stats?.averageProjectDuration || 0
    },
    
    sectors: (organisation as any).sectors ? JSON.parse((organisation as any).sectors) : ['Tech', 'Innovation'],
    stages: (organisation as any).stages ? JSON.parse((organisation as any).stages) : ['Pré-seed', 'Seed'],
    geographicFocus: (organisation as any).geographic_focus ? JSON.parse((organisation as any).geographic_focus) : ['France'],
    
    socialMedia: (organisation as any).social_media ? JSON.parse((organisation as any).social_media) : {
      linkedin: '',
      twitter: '',
      website: ''
    },
    
    isPublic: (organisation as any).is_public !== undefined ? (organisation as any).is_public : true,
    allowDirectApplications: (organisation as any).allow_direct_applications !== undefined ? (organisation as any).allow_direct_applications : true,
    
    lastUpdated: new Date(organisation.updated_at || organisation.created_at)
  } : null;

  // Initialiser le formulaire avec les données du profil - ÉTENDU
  const initializeEditForm = () => {
    if (organisation) {
      setEditFormData({
        // Informations de base
        name: organisation.name || '',
        description: (organisation as any).description || '',
        website: organisation.website || '',
        email: organisation.email || '',
        phone: (organisation as any).phone || '',
        address: organisation.address || '',
        headquarters: organisation.address || '',
        foundedYear: (organisation as any).founded_year || new Date().getFullYear(),
        teamSize: (organisation as any).team_size || 0,
        
        // Mission, Vision, Valeurs
        mission: (organisation as any).mission || '',
        vision: (organisation as any).vision || '',
        values: (organisation as any).values ? JSON.parse((organisation as any).values) : [],
        
        // Spécialisations
        sectors: (organisation as any).sectors ? JSON.parse((organisation as any).sectors) : [],
        stages: (organisation as any).stages ? JSON.parse((organisation as any).stages) : [],
        specializations: (organisation as any).specializations ? JSON.parse((organisation as any).specializations) : [],
        
        // Méthodologie
        methodology: (organisation as any).methodology || '',
        programDurationMonths: (organisation as any).program_duration_months || 6,
        successCriteria: (organisation as any).success_criteria || '',
        supportTypes: (organisation as any).support_types ? JSON.parse((organisation as any).support_types) : [],
        
        // Contact et social
        geographicFocus: (organisation as any).geographic_focus ? JSON.parse((organisation as any).geographic_focus) : [],
        socialMedia: (organisation as any).social_media ? JSON.parse((organisation as any).social_media) : {
          linkedin: '',
          twitter: '',
          website: ''
        },
        socialMediaLinkedin: (organisation as any).social_media ? JSON.parse((organisation as any).social_media).linkedin || '' : '',
        socialMediaTwitter: (organisation as any).social_media ? JSON.parse((organisation as any).social_media).twitter || '' : '',
        socialMediaWebsite: (organisation as any).social_media ? JSON.parse((organisation as any).social_media).website || '' : '',
        
        // Paramètres
        isPublic: (organisation as any).is_public !== undefined ? (organisation as any).is_public : true,
        allowDirectApplications: (organisation as any).allow_direct_applications !== undefined ? (organisation as any).allow_direct_applications : true
      });
    }
  };

  const handleEdit = () => {
    initializeEditForm();
    setIsEditing(true);
  };

  // Fonctions utilitaires pour gérer les tableaux (secteurs, stages, etc.)
  const handleArrayFieldToggle = (field: keyof typeof editFormData, value: string) => {
    setEditFormData(prev => {
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

  const addCustomValue = (field: keyof typeof editFormData, value: string) => {
    if (value.trim()) {
      setEditFormData(prev => {
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

  const removeValue = (field: keyof typeof editFormData, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  // Options prédéfinies pour les sélections multiples
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

  if (orgLoading || statsLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6 p-8">
        <div className="text-center">
          <p className="text-gray-500">Organisation non trouvée</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      // Utiliser le service d'organisation pour sauvegarder - TOUS LES CHAMPS
      const updateData = {
        // Informations de base
        name: editFormData.name,
        description: editFormData.description,
        website: editFormData.website,
        email: editFormData.email,
        phone: editFormData.phone,
        address: editFormData.address,
        founded_year: editFormData.foundedYear,
        team_size: editFormData.teamSize,
        
        // Mission, Vision, Valeurs
        mission: editFormData.mission,
        vision: editFormData.vision,
        values: JSON.stringify(editFormData.values),
        
        // Spécialisations
        sectors: JSON.stringify(editFormData.sectors),
        stages: JSON.stringify(editFormData.stages),
        specializations: JSON.stringify(editFormData.specializations),
        
        // Méthodologie
        methodology: editFormData.methodology,
        program_duration_months: editFormData.programDurationMonths,
        success_criteria: editFormData.successCriteria,
        support_types: JSON.stringify(editFormData.supportTypes),
        
        // Contact et social
        geographic_focus: JSON.stringify(editFormData.geographicFocus),
        social_media: JSON.stringify({
          linkedin: editFormData.socialMedia?.linkedin || editFormData.socialMediaLinkedin || '',
          twitter: editFormData.socialMedia?.twitter || editFormData.socialMediaTwitter || '',
          website: editFormData.socialMedia?.website || editFormData.socialMediaWebsite || ''
        }),
        
        // Paramètres
        is_public: editFormData.isPublic,
        allow_direct_applications: editFormData.allowDirectApplications,
        
        updated_at: new Date().toISOString()
      };

      await updateOrganisation(organisation!.id, updateData);
      
      setSaveStatus('saved');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
      
      // Recharger les données pour afficher les changements
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const getTypeLabel = (type: OrganisationProfile['type']) => {
    const labels = {
      incubator: 'Incubateur',
      accelerator: 'Accélérateur',
      venture_capital: 'Fonds d\'investissement',
      corporate: 'Corporate',
      university: 'Université',
      government: 'Public'
    };
    return labels[type];
  };

  const getTypeColor = (type: OrganisationProfile['type']) => {
    const colors = {
      incubator: 'bg-blue-100 text-blue-800',
      accelerator: 'bg-purple-100 text-purple-800',
      venture_capital: 'bg-green-100 text-green-800',
      corporate: 'bg-indigo-100 text-indigo-800',
      university: 'bg-orange-100 text-orange-800',
      government: 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M€`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toString();
  };

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Profil de l'Organisation</h1>
              <p className="text-gray-600 text-base">
                Gérez les informations publiques de votre organisation.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    style={{ backgroundColor: '#ff5932' }} 
                    className="hover:opacity-90 text-white"
                  >
                    {saveStatus === 'saving' ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : saveStatus === 'saved' ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saveStatus === 'saving' ? 'Enregistrement...' : 
                     saveStatus === 'saved' ? 'Enregistré' : 'Enregistrer'}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  style={{ backgroundColor: '#ff5932' }} 
                  className="hover:opacity-90 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier le profil
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Status de sauvegarde */}
        {saveStatus === 'saved' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Profil mis à jour avec succès</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-aurentia-pink rounded-lg flex items-center justify-center text-white text-xl font-bold">
                    {profile.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input 
                          value={profile.name}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="text-lg font-semibold"
                        />
                        <Select 
                          value={profile.type}
                          onValueChange={(value: OrganisationProfile['type']) => 
                            setEditFormData(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="incubator">Incubateur</SelectItem>
                            <SelectItem value="accelerator">Accélérateur</SelectItem>
                            <SelectItem value="venture_capital">Fonds d'investissement</SelectItem>
                            <SelectItem value="corporate">Corporate</SelectItem>
                            <SelectItem value="university">Université</SelectItem>
                            <SelectItem value="government">Public</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-xl font-semibold">{profile.name}</h2>
                        <Badge className={getTypeColor(profile.type)}>
                          {getTypeLabel(profile.type)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  {isEditing ? (
                    <Textarea 
                      value={profile.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-600">{profile.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Année de création</label>
                    {isEditing ? (
                      <Input 
                        type="number"
                        value={profile.foundedYear}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, foundedYear: parseInt(e.target.value) }))}
                      />
                    ) : (
                      <p className="text-gray-600">{profile.foundedYear}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Siège social</label>
                    {isEditing ? (
                      <Input 
                        value={profile.headquarters}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, headquarters: e.target.value }))}
                      />
                    ) : (
                      <p className="text-gray-600">{profile.headquarters}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mission, Vision, Valeurs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Mission, Vision & Valeurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Mission</label>
                  {isEditing ? (
                    <Textarea 
                      value={editFormData.mission}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, mission: e.target.value }))}
                      rows={3}
                      placeholder="Décrivez la mission de votre organisation..."
                    />
                  ) : (
                    <p className="text-gray-600">{profile.mission}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Vision</label>
                  {isEditing ? (
                    <Textarea 
                      value={editFormData.vision}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, vision: e.target.value }))}
                      rows={2}
                      placeholder="Quelle est votre vision à long terme ?"
                    />
                  ) : (
                    <p className="text-gray-600">{profile.vision}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Valeurs</label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        placeholder="Tapez une valeur et appuyez sur Entrée"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomValue('values', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <div className="flex flex-wrap gap-2">
                        {editFormData.values.map((value, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-red-50"
                            onClick={() => removeValue('values', value)}
                          >
                            {value} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.values.map((value, index) => (
                        <Badge key={index} variant="outline">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Spécialisations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Spécialisations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Secteurs d'activité</label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {sectorOptions.map(sector => (
                          <Button
                            key={sector}
                            variant={editFormData.sectors.includes(sector) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleArrayFieldToggle('sectors', sector)}
                            className={editFormData.sectors.includes(sector) ? "bg-aurentia-pink hover:bg-aurentia-pink/90" : ""}
                          >
                            {sector}
                          </Button>
                        ))}
                      </div>
                      <Input
                        placeholder="Autre secteur..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomValue('sectors', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <div className="flex flex-wrap gap-2">
                        {editFormData.sectors.filter(sector => !sectorOptions.includes(sector)).map((sector, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-red-50"
                            onClick={() => removeValue('sectors', sector)}
                          >
                            {sector} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.sectors.map((sector, index) => (
                        <Badge key={index} variant="outline">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Stades d'investissement</label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {stageOptions.map(stage => (
                          <Button
                            key={stage}
                            variant={editFormData.stages.includes(stage) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleArrayFieldToggle('stages', stage)}
                            className={editFormData.stages.includes(stage) ? "bg-aurentia-pink hover:bg-aurentia-pink/90" : ""}
                          >
                            {stage}
                          </Button>
                        ))}
                      </div>
                      <Input
                        placeholder="Autre stade..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomValue('stages', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.stages.map((stage, index) => (
                        <Badge key={index} variant="outline">
                          {stage}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Zones géographiques</label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {geographicOptions.map(zone => (
                          <Button
                            key={zone}
                            variant={editFormData.geographicFocus.includes(zone) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleArrayFieldToggle('geographicFocus', zone)}
                            className={editFormData.geographicFocus.includes(zone) ? "bg-aurentia-pink hover:bg-aurentia-pink/90" : ""}
                          >
                            {zone}
                          </Button>
                        ))}
                      </div>
                      <Input
                        placeholder="Autre zone géographique..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomValue('geographicFocus', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.geographicFocus.map((zone, index) => (
                        <Badge key={index} variant="outline">
                          {zone}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-aurentia-pink">
                      {profile.stats.totalStartups}
                    </div>
                    <div className="text-xs text-gray-600">Startups accompagnées</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-aurentia-pink">
                      {profile.stats.activePrograms}
                    </div>
                    <div className="text-xs text-gray-600">Programmes actifs</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-aurentia-pink">
                      {formatNumber(profile.stats.totalInvestment)}
                    </div>
                    <div className="text-xs text-gray-600">Investissements</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-aurentia-pink">
                      {profile.stats.successRate}%
                    </div>
                    <div className="text-xs text-gray-600">Taux de succès</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-aurentia-pink">
                      {profile.stats.teamSize}
                    </div>
                    <div className="text-xs text-gray-600">Équipe</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-aurentia-pink">
                      {profile.stats.averageProgramDuration}
                    </div>
                    <div className="text-xs text-gray-600">Durée (mois)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {isEditing ? (
                    <Input 
                      type="email"
                      value={profile.email}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="flex-1"
                    />
                  ) : (
                    <span>{profile.email}</span>
                  )}
                </div>

                {(profile.phone || isEditing) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {isEditing ? (
                      <Input 
                        value={profile.phone || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="flex-1"
                      />
                    ) : (
                      <span>{profile.phone}</span>
                    )}
                  </div>
                )}

                {(profile.website || isEditing) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-gray-400" />
                    {isEditing ? (
                      <Input 
                        value={profile.website || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="flex-1"
                      />
                    ) : (
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-aurentia-pink hover:underline"
                      >
                        {profile.website}
                      </a>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {isEditing ? (
                    <Input 
                      value={editFormData.headquarters}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, headquarters: e.target.value }))}
                      className="flex-1"
                      placeholder="Siège social"
                    />
                  ) : (
                    <span>{profile.headquarters}</span>
                  )}
                </div>

                {/* Méthodologie d'accompagnement */}
                {(profile.methodology || isEditing) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Méthodologie d'accompagnement</label>
                    {isEditing ? (
                      <Textarea 
                        value={editFormData.methodology || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, methodology: e.target.value }))}
                        className="w-full"
                        placeholder="Décrivez votre méthodologie..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{profile.methodology}</p>
                    )}
                  </div>
                )}

                {/* Durée des programmes */}
                {(profile.stats?.averageProgramDuration || isEditing) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Durée des programmes (mois)</label>
                    {isEditing ? (
                      <Input 
                        type="number"
                        value={editFormData.programDurationMonths || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, programDurationMonths: parseInt(e.target.value) || 0 }))}
                        className="w-full"
                        placeholder="ex: 6, 12..."
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{profile.stats.averageProgramDuration} mois</p>
                    )}
                  </div>
                )}

                {/* Critères de succès */}
                {(profile.successCriteria || isEditing) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Critères de succès</label>
                    {isEditing ? (
                      <Textarea 
                        value={editFormData.successCriteria || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, successCriteria: e.target.value }))}
                        className="w-full"
                        placeholder="Comment mesurez-vous le succès..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{profile.successCriteria}</p>
                    )}
                  </div>
                )}

                {/* Types de support */}
                {(profile.supportTypes?.length > 0 || isEditing) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Types de support</label>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {supportTypeOptions.map(type => (
                            <Button
                              key={type}
                              variant={editFormData.supportTypes.includes(type) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleArrayFieldToggle('supportTypes', type)}
                              className={editFormData.supportTypes.includes(type) ? "bg-aurentia-pink hover:bg-aurentia-pink/90" : ""}
                            >
                              {type}
                            </Button>
                          ))}
                        </div>
                        <Input
                          placeholder="Autre type de support..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomValue('supportTypes', e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.supportTypes.map((type, index) => (
                          <Badge key={index} variant="outline">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Réseaux sociaux */}
                {(profile.socialMedia || isEditing) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Réseaux sociaux</label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Input 
                            value={editFormData.socialMedia?.linkedin || ''}
                            onChange={(e) => setEditFormData(prev => ({ 
                              ...prev, 
                              socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
                            }))}
                            placeholder="LinkedIn"
                          />
                          <Input 
                            value={editFormData.socialMedia?.twitter || ''}
                            onChange={(e) => setEditFormData(prev => ({ 
                              ...prev, 
                              socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                            }))}
                            placeholder="Twitter"
                          />
                          <Input 
                            value={editFormData.socialMedia?.website || ''}
                            onChange={(e) => setEditFormData(prev => ({ 
                              ...prev, 
                              socialMedia: { ...prev.socialMedia, website: e.target.value }
                            }))}
                            placeholder="Site web"
                            className="md:col-span-2"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {profile.socialMedia?.linkedin && (
                          <a href={profile.socialMedia.linkedin} className="text-aurentia-pink hover:underline block text-sm">
                            LinkedIn
                          </a>
                        )}
                        {profile.socialMedia?.twitter && (
                          <a href={profile.socialMedia.twitter} className="text-aurentia-pink hover:underline block text-sm">
                            Twitter
                          </a>
                        )}
                        {profile.socialMedia?.website && (
                          <a href={profile.socialMedia.website} className="text-aurentia-pink hover:underline block text-sm">
                            Site web
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Paramètres de visibilité */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Visibilité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Profil public</h4>
                    <p className="text-xs text-gray-600">Visible sur les annuaires</p>
                  </div>
                  <Switch 
                    checked={profile.isPublic}
                    onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Candidatures directes</h4>
                    <p className="text-xs text-gray-600">Recevoir des candidatures</p>
                  </div>
                  <Switch 
                    checked={profile.allowDirectApplications}
                    onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, allowDirectApplications: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dernière mise à jour */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Dernière mise à jour: {profile.lastUpdated.toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganisationProfile;