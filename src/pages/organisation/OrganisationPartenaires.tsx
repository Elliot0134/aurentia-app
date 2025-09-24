import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import CustomTabs from "@/components/ui/CustomTabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePartners, Partner, PartnerFormData } from "@/hooks/usePartners";
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Star,
  Building,
  Calendar,
  HandHeart,
  Loader2,
  AlertCircle,
  DollarSign,
  Rocket,
  GraduationCap,
  Building2,
  Landmark,
  School,
  MoreHorizontal
} from "lucide-react";

const OrganisationPartenaires = () => {
  const { id: organisationId } = useParams();
  const { partners, loading, error, addPartner, editPartner, removePartner } = usePartners(organisationId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Formulaire pour ajouter un partenaire
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    type: 'other',
    description: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    collaboration_type: [],
    status: 'prospect',
    organization_id: organisationId || ''
  });

  const handleCreatePartner = async () => {
    if (!formData.name.trim() || !organisationId) return;
    
    const success = await addPartner({
      ...formData,
      organization_id: organisationId
    });
    
    if (success) {
      setDialogOpen(false);
      setFormData({
        name: '',
        type: 'other',
        description: '',
        website: '',
        contact_email: '',
        contact_phone: '',
        collaboration_type: [],
        status: 'prospect',
        organization_id: organisationId
      });
    }
  };

  const getTypeLabel = (type: Partner['type']) => {
    const labels = {
      investor: 'Investisseur',
      accelerator: 'Accélérateur',
      incubator: 'Incubateur',
      corporate: 'Entreprise',
      government: 'Public',
      university: 'Université',
      other: 'Autre'
    };
    return labels[type];
  };

  const getTypeColor = (type: Partner['type']) => {
    const colors = {
      investor: 'bg-green-100 text-green-800',
      accelerator: 'bg-blue-100 text-blue-800',
      incubator: 'bg-purple-100 text-purple-800',
      corporate: 'bg-indigo-100 text-indigo-800',
      government: 'bg-gray-100 text-gray-800',
      university: 'bg-orange-100 text-orange-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[type];
  };

  const getStatusColor = (status: Partner['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      prospect: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Partner['status']) => {
    const labels = {
      active: 'Actif',
      prospect: 'Prospect',
      inactive: 'Inactif'
    };
    return labels[status];
  };

  const getTypeIcon = (type: Partner['type']) => {
    const icons = {
      investor: HandHeart,
      accelerator: Building,
      incubator: Building,
      corporate: Building,
      government: Globe,
      university: Users,
      other: Star
    };
    return icons[type];
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (partner.description && partner.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || partner.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || partner.status === selectedStatus;
    const matchesTab = activeTab === 'all' || partner.type === activeTab;
    
    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  const stats = {
    total: partners.length,
    active: partners.filter(p => p.status === 'active').length,
    prospect: partners.filter(p => p.status === 'prospect').length,
    avgRating: partners.length > 0 ? Math.round(partners.reduce((sum, p) => sum + p.rating, 0) / partners.length * 10) / 10 : 0
  };

  const typeStats = {
    investor: partners.filter(p => p.type === 'investor').length,
    accelerator: partners.filter(p => p.type === 'accelerator').length,
    incubator: partners.filter(p => p.type === 'incubator').length,
    corporate: partners.filter(p => p.type === 'corporate').length,
    government: partners.filter(p => p.type === 'government').length,
    university: partners.filter(p => p.type === 'university').length,
    other: partners.filter(p => p.type === 'other').length
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <>
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Partenaires</h1>
            <p className="text-gray-600 text-base">
              Gérez vos partenaires et collaborateurs externes.
            </p>
          </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un partenaire
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau partenaire</DialogTitle>
                  <DialogDescription>
                    Ajoutez un nouveau partenaire à votre écosystème.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nom du partenaire</label>
                    <Input 
                      placeholder="Nom de l'organisation ou de la personne" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Partner['type'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investor">Investisseur</SelectItem>
                        <SelectItem value="accelerator">Accélérateur</SelectItem>
                        <SelectItem value="incubator">Incubateur</SelectItem>
                        <SelectItem value="corporate">Entreprise</SelectItem>
                        <SelectItem value="government">Public</SelectItem>
                        <SelectItem value="university">Université</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea 
                      placeholder="Description du partenaire et de ses activités" 
                      rows={3} 
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input 
                      type="email" 
                      placeholder="contact@partenaire.com" 
                      value={formData.contact_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Téléphone</label>
                    <Input 
                      placeholder="+33 1 23 45 67 89" 
                      value={formData.contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Site web</label>
                    <Input 
                      placeholder="https://partenaire.com" 
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    style={{ backgroundColor: '#ff5932' }} 
                    className="hover:opacity-90 text-white"
                    onClick={handleCreatePartner}
                    disabled={!formData.name.trim()}
                  >
                    Ajouter le partenaire
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Partenaires</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prospects</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.prospect}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating}/5</div>
            </CardContent>
          </Card>
        </div>

        {/* Chargement */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* Onglets par type */}
            <CustomTabs
              tabs={[
                { key: "all", label: `Tous (${stats.total})`, icon: Users },
                { key: "investor", label: `Investisseurs (${typeStats.investor})`, icon: DollarSign },
                { key: "accelerator", label: `Accélérateurs (${typeStats.accelerator})`, icon: Rocket },
                { key: "incubator", label: `Incubateurs (${typeStats.incubator})`, icon: Building },
                { key: "corporate", label: `Entreprises (${typeStats.corporate})`, icon: Building2 },
                { key: "government", label: `Public (${typeStats.government})`, icon: Landmark },
                { key: "university", label: `Universités (${typeStats.university})`, icon: GraduationCap },
                { key: "other", label: `Autres (${typeStats.other})`, icon: MoreHorizontal }
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              {/* Filtres */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Rechercher un partenaire..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des partenaires */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPartners.map((partner) => {
                  const TypeIcon = getTypeIcon(partner.type);
                  return (
                    <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-aurentia-pink rounded-lg flex items-center justify-center text-white">
                              <TypeIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{partner.name}</h3>
                              <p className="text-sm text-gray-600">{partner.contact_email || 'Aucun contact'}</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className={getTypeColor(partner.type)}>
                              {getTypeLabel(partner.type)}
                            </Badge>
                            <Badge className={getStatusColor(partner.status)}>
                              {getStatusLabel(partner.status)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {partner.description || 'Aucune description disponible'}
                          </p>

                          {/* Informations de contact */}
                          <div className="space-y-2">
                            {partner.contact_email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{partner.contact_email}</span>
                              </div>
                            )}
                            {partner.contact_phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{partner.contact_phone}</span>
                              </div>
                            )}
                            {partner.website && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Globe className="w-4 h-4" />
                                <a
                                  href={partner.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-aurentia-pink hover:underline"
                                >
                                  Site web
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Types de collaboration */}
                          <div className="flex flex-wrap gap-1">
                            {partner.collaboration_type.slice(0, 3).map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {partner.collaboration_type.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{partner.collaboration_type.length - 3}
                              </Badge>
                            )}
                          </div>

                          {/* Rating et date de création */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 block">Note</span>
                              <div className="flex">
                                {renderStars(partner.rating)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 block">Ajouté</span>
                              <div className="font-semibold">
                                {new Date(partner.created_at).getFullYear()}
                              </div>
                            </div>
                          </div>

                          {/* Dernière modification */}
                          <div className="text-xs text-gray-500">
                            Mis à jour: {new Date(partner.updated_at).toLocaleDateString('fr-FR')}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removePartner(partner.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Message si aucun partenaire */}
              {filteredPartners.length === 0 && !loading && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun partenaire trouvé</h3>
                    <p className="text-gray-600 mb-4">
                      {partners.length === 0
                        ? "Commencez par ajouter votre premier partenaire."
                        : "Aucun partenaire ne correspond à vos critères de recherche."
                      }
                    </p>
                    {partners.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedStatus('all');
                          setActiveTab('all');
                        }}
                      >
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </CustomTabs>
          </>
        )}
      </>
    );
  };

export default OrganisationPartenaires;