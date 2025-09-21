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

  // État local pour l'édition
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: ''
  });

  // Adapter les données Supabase pour l'interface de profil
  const profile = organisation ? {
    id: organisation.id,
    name: organisation.name,
    type: 'incubator' as const, // TODO: Ajouter type à la table organizations
    description: organisation.description || 'Aucune description disponible',
    foundedYear: 2018, // TODO: Ajouter founded_year à la table
    headquarters: organisation.address || 'Non spécifié',
    website: organisation.website || '',
    email: organisation.email || 'Non spécifié',
    phone: organisation.phone || 'Non spécifié',
    
    mission: 'Mission à définir', // TODO: Ajouter mission à la table
    vision: 'Vision à définir', // TODO: Ajouter vision à la table
    values: ['Innovation', 'Excellence'], // TODO: Ajouter values à la table
    
    stats: {
      totalStartups: stats?.totalEntrepreneurs || 0,
      activePrograms: 3, // TODO: Calculer depuis les données
      totalInvestment: 0, // TODO: Ajouter tracking investissements
      successRate: stats?.successRate || 0,
      teamSize: stats?.totalMentors || 0,
      averageProgramDuration: stats?.averageProjectDuration || 0
    },
    
    sectors: ['Tech', 'Innovation'], // TODO: Ajouter sectors à la table
    stages: ['Pré-seed', 'Seed'], // TODO: Ajouter stages à la table
    geographicFocus: ['France'], // TODO: Ajouter geographic_focus à la table
    
    socialMedia: {
      linkedin: '',
      twitter: '',
      facebook: ''
    }, // TODO: Ajouter social_media à la table
    
    isPublic: true, // TODO: Ajouter is_public à la table
    allowDirectApplications: true, // TODO: Ajouter allow_applications à la table
    
    lastUpdated: new Date(organisation.updated_at || organisation.created_at)
  } : null;

  // Initialiser le formulaire avec les données du profil
  const initializeEditForm = () => {
    if (organisation) {
      setEditFormData({
        name: organisation.name || '',
        description: organisation.description || '',
        website: organisation.website || '',
        email: organisation.email || '',
        phone: organisation.phone || '',
        address: organisation.address || ''
      });
    }
  };

  const handleEdit = () => {
    initializeEditForm();
    setIsEditing(true);
  };

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
      // TODO: Implémenter la sauvegarde avec Supabase
      console.log('Sauvegarde des données:', editFormData);
      setSaveStatus('saved');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
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
                      value={profile.mission}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, mission: e.target.value }))}
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-600">{profile.mission}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Vision</label>
                  {isEditing ? (
                    <Textarea 
                      value={profile.vision}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, vision: e.target.value }))}
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-600">{profile.vision}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Valeurs</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.values.map((value, index) => (
                      <Badge key={index} variant="outline">
                        {value}
                      </Badge>
                    ))}
                  </div>
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
                  <div className="flex flex-wrap gap-2">
                    {profile.sectors.map((sector, index) => (
                      <Badge key={index} variant="outline">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Stades d'investissement</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.stages.map((stage, index) => (
                      <Badge key={index} variant="outline">
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Zones géographiques</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.geographicFocus.map((zone, index) => (
                      <Badge key={index} variant="outline">
                        {zone}
                      </Badge>
                    ))}
                  </div>
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
                  <span>{profile.headquarters}</span>
                </div>
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