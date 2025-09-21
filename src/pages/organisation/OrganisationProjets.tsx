import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Search,
  Filter,
  BarChart3,
  Users,
  TrendingUp,
  Clock
} from "lucide-react";
import { useProjects } from '@/hooks/useOrganisationData';

const OrganisationProjets = () => {
  const { id: organisationId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const { projects, loading } = useProjects();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.nom_projet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description_synthetique?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || project.statut === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.nom_projet.localeCompare(b.nom_projet);
      case 'progress':
        return (parseInt(b.avancement_global || '0') - parseInt(a.avancement_global || '0'));
      case 'recent':
      default:
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    }
  });

  const getStatusColor = (statut: string) => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800',
      'actif': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'terminé': 'bg-blue-100 text-blue-800',
      'draft': 'bg-gray-100 text-gray-800',
      'brouillon': 'bg-gray-100 text-gray-800',
      'archived': 'bg-red-100 text-red-800'
    };
    return statusColors[statut as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (statut: string) => {
    const statusLabels = {
      'active': 'Actif',
      'actif': 'Actif',
      'completed': 'Terminé',
      'terminé': 'Terminé',
      'draft': 'Brouillon',
      'brouillon': 'Brouillon',
      'archived': 'Archivé'
    };
    return statusLabels[statut as keyof typeof statusLabels] || statut;
  };

  const stats = {
    active: projects.filter(p => p.statut === 'active' || p.statut === 'actif').length,
    completed: projects.filter(p => p.statut === 'completed' || p.statut === 'terminé').length,
    total: projects.length
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Projets
          </h1>
          <p className="text-gray-600">
            Suivez et gérez tous les projets de votre organisation
          </p>
        </div>
        <Button onClick={() => navigate(`/organisation/${organisationId}/projects/new`)} className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Projet
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets Terminés</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récent</SelectItem>
            <SelectItem value="name">Nom A-Z</SelectItem>
            <SelectItem value="progress">Progression</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-500 mb-4">Commencez par créer votre premier projet.</p>
            <Button onClick={() => navigate(`/organisation/${organisationId}/projects/new`)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un projet
            </Button>
          </div>
        ) : (
          sortedProjects.map((project) => (
            <Card 
              key={project.project_id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/organisation/${organisationId}/projects/${project.project_id}`)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.nom_projet}</CardTitle>
                    <CardDescription className="mt-2">
                      {project.description_synthetique || 'Aucune description disponible'}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(project.statut)}>
                    {getStatusLabel(project.statut)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  {/* Avatar entrepreneur */}
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-aurentia-pink to-aurentia-orange rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {project.user_id ? project.user_id.slice(0, 2).toUpperCase() : 'NA'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Entrepreneur</p>
                      <p className="text-xs text-gray-500">{project.user_id || 'Non assigné'}</p>
                    </div>
                  </div>

                  {/* Progression */}
                  <div className="text-right">
                    <p className="text-sm font-medium">{project.avancement_global || 0}%</p>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-aurentia-pink to-aurentia-orange rounded-full transition-all duration-300"
                        style={{ width: `${project.avancement_global || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Date de création */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Créé le {new Date(project.created_at || '').toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OrganisationProjets;