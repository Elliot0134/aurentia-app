import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CustomTabs from "@/components/ui/CustomTabs";
import {
  Search,
  FileText,
  Eye,
  Download,
  CheckCircle,
  Target,
  Award,
  Plus,
  Grid3X3,
  List
} from "lucide-react";
import { useDeliverables, type Deliverable as DeliverableType, type DeliverableFormData } from "@/hooks/useDeliverables";
import { useProjects, useAdherents } from "@/hooks/useOrganisationData";
import { useToast } from "@/hooks/use-toast";

const OrganisationLivrables = () => {
  const { id: organisationId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [activeTab, setActiveTab] = useState('Vue grille');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<DeliverableFormData>>({});

  // Utiliser les hooks Supabase
  const { deliverables, loading, error, stats: deliverableStats, refetch, addDeliverable } = useDeliverables(organisationId);
  const { projects, loading: projectsLoading } = useProjects();
  const { adherents, loading: adherentsLoading } = useAdherents();
  const { toast } = useToast();

  const getTypeLabel = (type: DeliverableType['type']) => {
    const labels = {
      'business-model': 'Business Model',
      'pitch': 'Pitch',
      'market-analysis': 'Analyse de Marché',
      'legal': 'Juridique',
      'financial': 'Financier',
      'other': 'Autre'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: DeliverableType['type']) => {
    const icons = {
      'business-model': '📊',
      'pitch': '🎯',
      'market-analysis': '📈',
      'legal': '⚖️',
      'financial': '💰',
      'other': '📋'
    };
    return icons[type] || '📋';
  };

  const getStatusLabel = (status: DeliverableType['status']) => {
    const labels = {
      'pending': 'En attente',
      'in-progress': 'En cours',
      'completed': 'Terminé',
      'reviewed': 'Validé'
    };
    return labels[status];
  };

  const getStatusColor = (status: DeliverableType['status']) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'reviewed': 'bg-purple-100 text-purple-800'
    };
    return colors[status];
  };

  // Créer un map des projets pour faciliter l'accès
  const projectsMap = useMemo(() => projects.reduce((acc, project) => {
    acc[project.project_id] = project;
    return acc;
  }, {} as Record<string, typeof projects[0]>), [projects]);

  const filteredDeliverables = useMemo(() => deliverables.filter(deliverable => {
    const project = deliverable.project_id ? projectsMap[deliverable.project_id] : null;
    
    const matchesSearch = deliverable.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project?.nom_projet && project.nom_projet.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (deliverable.description && deliverable.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || deliverable.status === selectedStatus;
    const matchesType = selectedType === 'all' || deliverable.type === selectedType;
    const matchesProject = selectedProject === 'all' || deliverable.project_id === selectedProject;
    
    return matchesSearch && matchesStatus && matchesType && matchesProject;
  }), [deliverables, searchTerm, selectedStatus, selectedType, selectedProject, projectsMap]);

  // Utiliser les stats du hook au lieu de les recalculer
  const stats = useMemo(() => ({
    total: deliverableStats.total,
    completed: deliverableStats.completed,
    inProgress: deliverableStats.inProgress,
    pending: deliverableStats.byStatus.pending || 0
  }), [deliverableStats]);

  const completionRate = useMemo(() => stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0, [stats]);

  const handleCreateDeliverable = async () => {
    if (!organisationId || !formData.title || !formData.type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const deliverableData: DeliverableFormData = {
      organization_id: organisationId,
      title: formData.title!,
      description: formData.description,
      type: formData.type!,
      status: 'pending',
      project_id: formData.project_id,
      entrepreneur_id: formData.entrepreneur_id,
      due_date: formData.due_date,
      quality_score: formData.quality_score
    };

    const success = await addDeliverable(deliverableData);

    if (success) {
      toast({
        title: "Succès",
        description: "Le livrable a été créé avec succès.",
      });
      setDialogOpen(false);
      setFormData({});
    } else {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du livrable.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="mx-auto py-8 min-h-screen animate-fade-in">
        <div className="w-[80vw] md:w-11/12 mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff5932] mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des livrables...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto py-8 min-h-screen animate-fade-in">
        <div className="w-[80vw] md:w-11/12 mx-auto px-4">
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-red-600 mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refetch} style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Livrables</h1>
              <p className="text-gray-600 text-base">
                Suivez et gérez les livrables de votre organisation.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="bg-white border border-gray-200 hover:bg-gray-50">
                Exporter
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau livrable
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau livrable</DialogTitle>
                    <DialogDescription>
                      Créez un nouveau livrable pour votre organisation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Titre *</Label>
                      <Input
                        id="title"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Titre du livrable..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select value={formData.type || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business-model">Business Model</SelectItem>
                          <SelectItem value="pitch">Pitch</SelectItem>
                          <SelectItem value="market-analysis">Analyse de Marché</SelectItem>
                          <SelectItem value="legal">Juridique</SelectItem>
                          <SelectItem value="financial">Financier</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="project">Projet (optionnel)</Label>
                      <Select value={formData.project_id || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un projet" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Aucun projet</SelectItem>
                          {projects.map(project => (
                            <SelectItem key={project.project_id} value={project.project_id}>{project.nom_projet}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="entrepreneur">Entrepreneur (optionnel)</Label>
                      <Select value={formData.entrepreneur_id || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, entrepreneur_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un adhérent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Aucun adhérent</SelectItem>
                          {adherents.map(adherent => (
                            <SelectItem key={adherent.id} value={adherent.id}>{adherent.email}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description du livrable..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateDeliverable} style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                      Créer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Livrables</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <Progress value={completionRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {completionRate}% terminé
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminés</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Livrables validés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                En développement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                À démarrer
              </p>
            </CardContent>
          </Card>
        </div>

        <CustomTabs
          tabs={[
            { key: "Vue grille", label: "Vue grille", icon: Grid3X3 },
            { key: "Vue liste", label: "Vue liste", icon: List }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un livrable, adhérent ou projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="reviewed">Validé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="business-model">Business Model</SelectItem>
                <SelectItem value="pitch">Pitch</SelectItem>
                <SelectItem value="market-analysis">Analyse de Marché</SelectItem>
                <SelectItem value="legal">Juridique</SelectItem>
                <SelectItem value="financial">Financier</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Projet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les projets</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.project_id} value={project.project_id}>{project.nom_projet}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeTab === "Vue grille" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeliverables.map((deliverable) => {
                const project = deliverable.project_id ? projectsMap[deliverable.project_id] : null;

                return (
                  <Card key={deliverable.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getTypeIcon(deliverable.type)}</span>
                            <CardTitle className="text-base font-semibold text-gray-900 leading-tight">
                              {deliverable.title}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-xs text-gray-500">
                            {project?.nom_projet || 'Projet inconnu'} • ID: {deliverable.entrepreneur_id || 'N/A'}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(deliverable.status)}>
                          {getStatusLabel(deliverable.status)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {deliverable.description || 'Aucune description'}
                      </p>

                      {deliverable.quality_score && (
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{deliverable.quality_score}/100</span>
                        </div>
                      )}

                      {deliverable.due_date && (
                        <div className="text-xs text-gray-500">
                          Échéance: {new Date(deliverable.due_date).toLocaleDateString('fr-FR')}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Créé: {new Date(deliverable.created_at).toLocaleDateString('fr-FR')}</span>
                        {deliverable.completed_at && (
                          <span>Terminé: {new Date(deliverable.completed_at).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {activeTab === "Vue liste" && (
            <div className="space-y-4">
              {filteredDeliverables.map((deliverable) => {
                const project = deliverable.project_id ? projectsMap[deliverable.project_id] : null;

                return (
                  <Card key={deliverable.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-2xl">{getTypeIcon(deliverable.type)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900">{deliverable.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{deliverable.description || 'Aucune description'}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>📋 {project?.nom_projet || 'Projet inconnu'}</span>
                              <span>👤 ID: {deliverable.entrepreneur_id || 'N/A'}</span>
                              <span>📅 {getTypeLabel(deliverable.type)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(deliverable.status)}>
                            {getStatusLabel(deliverable.status)}
                          </Badge>
                          {deliverable.quality_score && (
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">{deliverable.quality_score}/100</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CustomTabs>        {filteredDeliverables.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun livrable trouvé</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedStatus !== 'all' || selectedType !== 'all' || selectedProject !== 'all'
                  ? 'Aucun livrable ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre premier livrable.'
                }
              </p>
              {searchTerm || selectedStatus !== 'all' || selectedType !== 'all' || selectedProject !== 'all' ? (
                <Button 
                  style={{ backgroundColor: '#ff5932' }} 
                  className="hover:opacity-90 text-white"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('all');
                    setSelectedType('all');
                    setSelectedProject('all');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              ) : (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau livrable
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrganisationLivrables;