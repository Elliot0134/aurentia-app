import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useOrganisationData, useOrganisationStats } from '@/hooks/useOrganisationData';
import { useOrgPageTitle } from '@/hooks/usePageTitle';
import { updateOrganisation } from '@/services/organisationService';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import ImageUploader from '@/components/ui/ImageUploader';
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
  Info,
  X,
  Plus
} from "lucide-react";
import { 
  SECTOR_OPTIONS, 
  STAGE_OPTIONS, 
  SPECIALIZATION_OPTIONS, 
  SUPPORT_TYPE_OPTIONS, 
  GEOGRAPHIC_OPTIONS 
} from "@/constants/organizationTags";

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
  specializations: string[];
  
  // Méthodologie
  methodology: string;
  successCriteria: string;
  supportTypes: string[];
  
  // Contact et social
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  
  // Configuration
  isPublic: boolean;
  allowDirectApplications: boolean;
  
  // Metadata
  lastUpdated: Date;
}

const OrganisationProfile = () => {
  useOrgPageTitle("Profil");
  const { id: organisationId } = useParams();
  const { organisation, loading: orgLoading, refetch } = useOrganisationData();
  const { stats, loading: statsLoading } = useOrganisationStats();
  const { userProfile } = useUserRole();
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOwner, setIsOwner] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);

  // Check if current user is owner
  useEffect(() => {
    const checkOwnership = async () => {
      if (!userProfile?.id || !organisationId) {
        setCheckingOwnership(false);
        return;
      }

      try {
        const { data, error } = await (supabase as any)
          .from('organizations')
          .select('created_by')
          .eq('id', organisationId)
          .single();

        if (error) throw error;
        
        setIsOwner(data?.created_by === userProfile.id);
      } catch (error) {
        console.error('Error checking ownership:', error);
        setIsOwner(false);
      } finally {
        setCheckingOwnership(false);
      }
    };

    checkOwnership();
  }, [userProfile?.id, organisationId]);

  // État local pour l'édition
  const [editFormData, setEditFormData] = useState({
    // Informations de base
    name: '',
    type: 'incubator' as OrganisationProfile['type'],
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    foundedYear: new Date().getFullYear(),
    teamSize: 0,
    logo_url: '',
    banner_url: '',
    
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
      website: ''
    },
    
    // Paramètres
    isPublic: true,
    allowDirectApplications: true
  });

  // Adapter les données Supabase pour l'interface de profil
  const profile: OrganisationProfile | null = organisation ? {
    id: organisation.id,
    name: organisation.name,
    type: (organisation as any).type || 'incubator' as const,
    description: (organisation as any).description || 'Aucune description disponible',
    foundedYear: (organisation as any).founded_year || 2018,
    headquarters: organisation.address || 'Non spécifié',
    website: organisation.website || '',
    email: organisation.email || 'Non spécifié',
    phone: (organisation as any).phone || '',
    
    mission: (organisation as any).mission || 'Mission à définir',
    vision: (organisation as any).vision || 'Vision à définir',
    values: (organisation as any).values ? 
      (typeof (organisation as any).values === 'string' ? 
        JSON.parse((organisation as any).values) : 
        (organisation as any).values) : 
      ['Innovation', 'Excellence'],
    
    // Méthodologie et programme
    methodology: (organisation as any).methodology || '',
    successCriteria: (organisation as any).success_criteria || '',
    supportTypes: (organisation as any).support_types ? 
      (typeof (organisation as any).support_types === 'string' ? 
        JSON.parse((organisation as any).support_types) : 
        (organisation as any).support_types) : 
      [],
    
    stats: {
      totalStartups: stats?.totalAdherents || 0,
      activePrograms: 0, // Removed mock data
      totalInvestment: 0, // TODO: Ajouter tracking investissements
      successRate: stats?.successRate || 0,
      teamSize: (organisation as any).team_size || stats?.totalMentors || 0,
      averageProgramDuration: (organisation as any).program_duration_months || stats?.averageProjectDuration || 0
    },
    
    sectors: (organisation as any).sectors ? 
      (typeof (organisation as any).sectors === 'string' ? 
        JSON.parse((organisation as any).sectors) : 
        (organisation as any).sectors) : 
      ['Tech', 'Innovation'],
    stages: (organisation as any).stages ? 
      (typeof (organisation as any).stages === 'string' ? 
        JSON.parse((organisation as any).stages) : 
        (organisation as any).stages) : 
      ['Pré-seed', 'Seed'],
    geographicFocus: (organisation as any).geographic_focus ? 
      (typeof (organisation as any).geographic_focus === 'string' ? 
        JSON.parse((organisation as any).geographic_focus) : 
        (organisation as any).geographic_focus) : 
      ['France'],
    specializations: (organisation as any).specializations ? 
      (typeof (organisation as any).specializations === 'string' ? 
        JSON.parse((organisation as any).specializations) : 
        (organisation as any).specializations) : 
      [],
    
    socialMedia: (organisation as any).social_media ? 
      (typeof (organisation as any).social_media === 'string' ? 
        JSON.parse((organisation as any).social_media) : 
        (organisation as any).social_media) : 
      {
        linkedin: '',
        twitter: '',
        website: ''
      },
    
    isPublic: (organisation as any).is_public !== undefined ? (organisation as any).is_public : true,
    allowDirectApplications: (organisation as any).allow_direct_applications !== undefined ? (organisation as any).allow_direct_applications : true,
    
    lastUpdated: new Date(organisation.updated_at || organisation.created_at)
  } : null;

  // Initialiser le formulaire avec les données du profil quand les données sont chargées
  useEffect(() => {
    if (profile && !isEditing) {
      setEditFormData({
        // Informations de base
        name: profile.name || '',
        type: profile.type || 'incubator',
        description: profile.description || '',
        website: profile.website || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.headquarters || '',
        foundedYear: profile.foundedYear || new Date().getFullYear(),
        teamSize: profile.stats.teamSize || 0,
        logo_url: (organisation as any)?.logo_url || '',
        banner_url: (organisation as any)?.banner_url || '',
        
        // Mission, Vision, Valeurs
        mission: profile.mission || '',
        vision: profile.vision || '',
        values: profile.values || [],
        
        // Spécialisations
        sectors: profile.sectors || [],
        stages: profile.stages || [],
        specializations: profile.specializations || [],
        
        // Méthodologie
        methodology: profile.methodology || '',
        programDurationMonths: profile.stats.averageProgramDuration || 6,
        successCriteria: profile.successCriteria || '',
        supportTypes: profile.supportTypes || [],
        
        // Contact et social
        geographicFocus: profile.geographicFocus || [],
        socialMedia: {
          linkedin: profile.socialMedia?.linkedin || '',
          twitter: profile.socialMedia?.twitter || '',
          website: profile.socialMedia?.website || ''
        },
        
        // Paramètres
        isPublic: profile.isPublic !== undefined ? profile.isPublic : true,
        allowDirectApplications: profile.allowDirectApplications !== undefined ? profile.allowDirectApplications : true
      });
    }
  }, [profile, isEditing, organisation]);

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Réinitialiser le formulaire avec les données actuelles
    if (profile) {
      setEditFormData({
        // Informations de base
        name: profile.name || '',
        type: profile.type || 'incubator',
        description: profile.description || '',
        website: profile.website || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.headquarters || '',
        foundedYear: profile.foundedYear || new Date().getFullYear(),
        teamSize: profile.stats.teamSize || 0,
        logo_url: (organisation as any)?.logo_url || '',
        banner_url: (organisation as any)?.banner_url || '',
        
        // Mission, Vision, Valeurs
        mission: profile.mission || '',
        vision: profile.vision || '',
        values: profile.values || [],
        
        // Spécialisations
        sectors: profile.sectors || [],
        stages: profile.stages || [],
        specializations: profile.specializations || [],
        
        // Méthodologie
        methodology: profile.methodology || '',
        programDurationMonths: profile.stats.averageProgramDuration || 6,
        successCriteria: profile.successCriteria || '',
        supportTypes: profile.supportTypes || [],
        
        // Contact et social
        geographicFocus: profile.geographicFocus || [],
        socialMedia: {
          linkedin: profile.socialMedia?.linkedin || '',
          twitter: profile.socialMedia?.twitter || '',
          website: profile.socialMedia?.website || ''
        },
        
        // Paramètres
        isPublic: profile.isPublic !== undefined ? profile.isPublic : true,
        allowDirectApplications: profile.allowDirectApplications !== undefined ? profile.allowDirectApplications : true
      });
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editFormData.name?.trim()) {
      newErrors.name = 'Le nom de l\'organisation est requis';
    }
    
    if (editFormData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (editFormData.foundedYear && (editFormData.foundedYear < 1900 || editFormData.foundedYear > new Date().getFullYear())) {
      newErrors.foundedYear = 'Année de création invalide';
    }
    
    if (editFormData.teamSize < 0) {
      newErrors.teamSize = 'La taille de l\'équipe ne peut pas être négative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
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

  // Use shared options from constants

  if (orgLoading || statsLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <LoadingSpinner message="Chargement du profil..." fullScreen />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Organisation non trouvée</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaveStatus('saving');
    
    try {
      const updateData = {
        // Informations de base
        name: editFormData.name,
        type: editFormData.type,
        description: editFormData.description,
        website: editFormData.website,
        email: editFormData.email,
        phone: editFormData.phone,
        address: editFormData.address,
        founded_year: editFormData.foundedYear,
        team_size: editFormData.teamSize,
        logo_url: editFormData.logo_url || null,
        banner_url: editFormData.banner_url || null,
        
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
        social_media: JSON.stringify(editFormData.socialMedia),
        
        // Paramètres
        is_public: editFormData.isPublic,
        allow_direct_applications: editFormData.allowDirectApplications,
        
        updated_at: new Date().toISOString()
      };

      await updateOrganisation(organisation!.id, updateData);
      
      setSaveStatus('saved');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
      
      // Recharger les données
      await refetch();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
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

  // Composant pour les sélections multiples
  const MultiSelectField = ({ 
    label, 
    field, 
    options, 
    placeholder = "Ajouter...",
    className = "grid grid-cols-2 md:grid-cols-3 gap-2"
  }: {
    label: string;
    field: keyof typeof editFormData;
    options: string[];
    placeholder?: string;
    className?: string;
  }) => {
    const [customInput, setCustomInput] = useState('');
    const selectedValues = editFormData[field] as string[];

    const handleAddCustom = () => {
      if (customInput.trim()) {
        addCustomValue(field, customInput.trim());
        setCustomInput('');
      }
    };

    return (
      <div>
        <Label className="text-sm font-medium mb-3 block">{label}</Label>
        {isEditing ? (
          <div className="space-y-3">
            <div className={className}>
              {options.map(option => (
                <Button
                  key={option}
                  variant={selectedValues.includes(option) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleArrayFieldToggle(field, option)}
                  className={`text-xs ${selectedValues.includes(option) ? "bg-aurentia-pink hover:bg-aurentia-pink/90 text-white" : "hover:bg-gray-50"}`}
                >
                  {option}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={placeholder}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleAddCustom}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Valeurs personnalisées */}
            {selectedValues.filter(value => !options.includes(value)).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedValues
                  .filter(value => !options.includes(value))
                  .map((value, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-50 flex items-center gap-1"
                      onClick={() => removeValue(field, value)}
                    >
                      {value} <X className="w-3 h-3" />
                    </Badge>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedValues.length > 0 ? (
              selectedValues.map((value, index) => (
                <Badge key={index} variant="outline">
                  {value}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500 text-sm">Aucune information</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* En-tête */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Informations de l'Organisation</h1>
            <p className="text-gray-600 text-sm md:text-base">
              {isOwner ? 'Gérez les informations publiques de votre organisation.' : 'Consultez les informations de l\'organisation.'}
            </p>
          </div>
            {isOwner && (
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancel}>
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className="btn-white-label hover:opacity-90"
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
                    onClick={handleEdit}
                    className="btn-white-label hover:opacity-90"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier le profil
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status messages */}
        {saveStatus === 'saved' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Profil mis à jour avec succès</span>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">Erreur lors de la sauvegarde. Veuillez réessayer.</span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          {/* Colonne principale */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Informations générales avec logo et bannière */}
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Banner Image */}
                <div className="relative -mx-6 -mt-6 mb-6">
                  {isEditing && isOwner ? (
                    <div className="p-6 pb-0">
                      <Label className="mb-3 block">Bannière</Label>
                      <ImageUploader
                        bucket="organisation-banner"
                        value={editFormData.banner_url}
                        folder=""
                        maxSizeMB={5}
                        mode="banner"
                        disabled={!isEditing}
                        onUpload={(url) => setEditFormData(prev => ({ ...prev, banner_url: url }))}
                        onDelete={() => setEditFormData(prev => ({ ...prev, banner_url: '' }))}
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-r from-aurentia-pink to-aurentia-orange relative overflow-hidden">
                      {((organisation as any)?.banner_url || editFormData.banner_url) && (
                        <img
                          src={(organisation as any)?.banner_url || editFormData.banner_url || ''}
                          alt="Banner"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Logo and Name Section */}
                <div className="flex flex-col sm:flex-row items-start gap-4 -mt-16 relative z-10">
                  {isEditing && isOwner ? (
                    <div className="w-full">
                      <Label className="mb-3 block">Logo</Label>
                      <ImageUploader
                        bucket="organisation-logo"
                        value={editFormData.logo_url}
                        folder=""
                        maxSizeMB={2}
                        mode="logo"
                        disabled={!isEditing}
                        fallbackText={editFormData.name}
                        onUpload={(url) => setEditFormData(prev => ({ ...prev, logo_url: url }))}
                        onDelete={() => setEditFormData(prev => ({ ...prev, logo_url: '' }))}
                      />
                    </div>
                  ) : (
                    <>
                      {/* Logo Display */}
                      <div className="flex-shrink-0">
                        {((organisation as any)?.logo_url || editFormData.logo_url) ? (
                          <img
                            src={(organisation as any)?.logo_url || editFormData.logo_url || ''}
                            alt={`${profile.name} logo`}
                            className="w-24 h-24 rounded-lg object-cover border-4 border-white shadow-lg bg-white"
                            onError={(e) => {
                              // Fallback to initial letter
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                target.style.display = 'none';
                                const fallback = document.createElement('div');
                                fallback.className = 'w-24 h-24 rounded-lg flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg';
                                fallback.style.backgroundColor = (organisation as any)?.primary_color || '#FF592C';
                                fallback.textContent = profile.name.charAt(0).toUpperCase();
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div 
                            className="w-24 h-24 rounded-lg flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg"
                            style={{ backgroundColor: (organisation as any)?.primary_color || '#FF592C' }}
                          >
                            {profile.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      {/* Name and Type */}
                      <div className="flex-1 w-full pt-12">
                        <div className="space-y-4">
                          <div>
                            {isEditing ? (
                              <div>
                                <Input 
                                  id="name"
                                  value={editFormData.name}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                                  className={`text-lg font-semibold ${errors.name ? 'border-red-500' : ''}`}
                                  placeholder="Nom de votre organisation"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                              </div>
                            ) : (
                              <h2 className="text-2xl font-bold">{profile.name}</h2>
                            )}
                          </div>
                          
                          <div>
                            {isEditing ? (
                              <Select 
                                value={editFormData.type}
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
                            ) : (
                              <Badge className={getTypeColor(profile.type)}>
                                {getTypeLabel(profile.type)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Textarea 
                      id="description"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      placeholder="Décrivez votre organisation..."
                    />
                  ) : (
                    <p className="text-gray-600 mt-2">{profile.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="foundedYear">Année de création</Label>
                    {isEditing ? (
                      <div>
                        <Input 
                          id="foundedYear"
                          type="number"
                          value={editFormData.foundedYear}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, foundedYear: parseInt(e.target.value) || 0 }))}
                          className={errors.foundedYear ? 'border-red-500' : ''}
                          min="1900"
                          max={new Date().getFullYear()}
                        />
                        {errors.foundedYear && <p className="text-red-500 text-sm mt-1">{errors.foundedYear}</p>}
                      </div>
                    ) : (
                      <p className="text-gray-600 mt-2">{profile.foundedYear}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="teamSize">Taille de l'équipe</Label>
                    {isEditing ? (
                      <div>
                        <Input 
                          id="teamSize"
                          type="number"
                          value={editFormData.teamSize}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 0 }))}
                          className={errors.teamSize ? 'border-red-500' : ''}
                          min="0"
                        />
                        {errors.teamSize && <p className="text-red-500 text-sm mt-1">{errors.teamSize}</p>}
                      </div>
                    ) : (
                      <p className="text-gray-600 mt-2">{profile.stats.teamSize} personnes</p>
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
                  <Label htmlFor="mission">Mission</Label>
                  {isEditing ? (
                    <Textarea 
                      id="mission"
                      value={editFormData.mission}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, mission: e.target.value }))}
                      rows={3}
                      placeholder="Décrivez la mission de votre organisation..."
                    />
                  ) : (
                    <p className="text-gray-600 mt-2">{profile.mission || 'Aucune mission définie'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="vision">Vision</Label>
                  {isEditing ? (
                    <Textarea 
                      id="vision"
                      value={editFormData.vision}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, vision: e.target.value }))}
                      rows={2}
                      placeholder="Quelle est votre vision à long terme ?"
                    />
                  ) : (
                    <p className="text-gray-600 mt-2">{profile.vision || 'Aucune vision définie'}</p>
                  )}
                </div>

                <MultiSelectField
                  label="Valeurs"
                  field="values"
                  options={[]}
                  placeholder="Ajouter une valeur..."
                  className="flex flex-wrap gap-2"
                />
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
              <CardContent className="space-y-6">
                <MultiSelectField
                  label="Secteurs d'activité"
                  field="sectors"
                  options={SECTOR_OPTIONS}
                  placeholder="Autre secteur..."
                />

                <MultiSelectField
                  label="Stades d'investissement"
                  field="stages"
                  options={STAGE_OPTIONS}
                  placeholder="Autre stade..."
                />

                <MultiSelectField
                  label="Zones géographiques"
                  field="geographicFocus"
                  options={GEOGRAPHIC_OPTIONS}
                  placeholder="Autre zone..."
                  className="grid grid-cols-2 md:grid-cols-4 gap-2"
                />

                <MultiSelectField
                  label="Spécialisations"
                  field="specializations"
                  options={SPECIALIZATION_OPTIONS}
                  placeholder="Autre spécialisation..."
                />
              </CardContent>
            </Card>

            {/* Méthodologie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Méthodologie & Programme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="methodology">Méthodologie d'accompagnement</Label>
                  {isEditing ? (
                    <Textarea 
                      id="methodology"
                      value={editFormData.methodology}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, methodology: e.target.value }))}
                      rows={4}
                      placeholder="Décrivez votre méthodologie d'accompagnement..."
                    />
                  ) : (
                    <p className="text-gray-600 mt-2">{profile.methodology || 'Aucune méthodologie définie'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="programDuration">Durée des programmes (mois)</Label>
                  {isEditing ? (
                    <Input 
                      id="programDuration"
                      type="number"
                      value={editFormData.programDurationMonths}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, programDurationMonths: parseInt(e.target.value) || 0 }))}
                      min="1"
                      max="36"
                      placeholder="ex: 6, 12..."
                    />
                  ) : (
                    <p className="text-gray-600 mt-2">{profile.stats.averageProgramDuration || 'Non défini'} mois</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="successCriteria">Critères de succès</Label>
                  {isEditing ? (
                    <Textarea 
                      id="successCriteria"
                      value={editFormData.successCriteria}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, successCriteria: e.target.value }))}
                      rows={3}
                      placeholder="Comment mesurez-vous le succès de vos programmes ?"
                    />
                  ) : (
                    <p className="text-gray-600 mt-2">{profile.successCriteria || 'Aucun critère défini'}</p>
                  )}
                </div>

                <MultiSelectField
                  label="Types de support"
                  field="supportTypes"
                  options={SUPPORT_TYPE_OPTIONS}
                  placeholder="Autre type de support..."
                />
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
              <CardContent>
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
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sidebar-email">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {isEditing ? (
                      <div className="flex-1">
                        <Input 
                          id="sidebar-email"
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                          className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>
                    ) : (
                      <span className="text-sm">{profile.email}</span>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="sidebar-phone">Téléphone</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {isEditing ? (
                      <Input 
                        id="sidebar-phone"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="flex-1"
                        placeholder="Numéro de téléphone"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">{profile.phone || 'Non renseigné'}</span>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="sidebar-website">Site web</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {isEditing ? (
                      <Input 
                        id="sidebar-website"
                        value={editFormData.website}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="flex-1"
                        placeholder="https://..."
                      />
                    ) : (
                      profile.website ? (
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-aurentia-pink hover:underline text-sm"
                        >
                          {profile.website}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">Non renseigné</span>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="sidebar-address">Adresse</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {isEditing ? (
                      <Input 
                        id="sidebar-address"
                        value={editFormData.address}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="flex-1"
                        placeholder="Adresse complète"
                      />
                    ) : (
                      <span className="text-sm">{profile.headquarters}</span>
                    )}
                  </div>
                </div>

                {/* Réseaux sociaux */}
                <div className="pt-4 border-t">
                  <Label>Réseaux sociaux</Label>
                  <div className="space-y-3 mt-2">
                    {isEditing ? (
                      <>
                        <Input 
                          value={editFormData.socialMedia.linkedin}
                          onChange={(e) => setEditFormData(prev => ({ 
                            ...prev, 
                            socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
                          }))}
                          placeholder="Profil LinkedIn"
                        />
                        <Input 
                          value={editFormData.socialMedia.twitter}
                          onChange={(e) => setEditFormData(prev => ({ 
                            ...prev, 
                            socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                          }))}
                          placeholder="Profil Twitter"
                        />
                        <Input 
                          value={editFormData.socialMedia.website}
                          onChange={(e) => setEditFormData(prev => ({ 
                            ...prev, 
                            socialMedia: { ...prev.socialMedia, website: e.target.value }
                          }))}
                          placeholder="Site web additionnel"
                        />
                      </>
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
                        {!profile.socialMedia?.linkedin && !profile.socialMedia?.twitter && !profile.socialMedia?.website && (
                          <span className="text-sm text-gray-500">Aucun réseau social renseigné</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paramètres de visibilité */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Paramètres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Profil public</h4>
                    <p className="text-xs text-gray-600">Visible dans les annuaires</p>
                  </div>
                  <Switch 
                    checked={isEditing ? editFormData.isPublic : profile.isPublic}
                    onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isPublic: checked }))}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Candidatures directes</h4>
                    <p className="text-xs text-gray-600">Recevoir des candidatures</p>
                  </div>
                  <Switch 
                    checked={isEditing ? editFormData.allowDirectApplications : profile.allowDirectApplications}
                    onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, allowDirectApplications: checked }))}
                    disabled={!isEditing}
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
      </>
    );
  };

export default OrganisationProfile;