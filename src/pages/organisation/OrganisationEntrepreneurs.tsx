import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Star,
  Eye,
  Edit,
  MoreVertical
} from "lucide-react";
import { useEntrepreneurs } from '@/hooks/useOrganisationData';
import type { Entrepreneur } from '@/types/organisationTypes';
import { useOrgPageTitle } from '@/hooks/usePageTitle';

const OrganisationEntrepreneurs = () => {
  useOrgPageTitle("Entrepreneurs");
  const { id: organisationId } = useParams();

  // Get filters from URL params (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const validStatuses = ['all', 'active', 'inactive', 'pending'];
  const statusFromUrl = searchParams.get('status') || 'all';
  const selectedStatus = validStatuses.includes(statusFromUrl) ? statusFromUrl : 'all';

  // Functions to update filters and URL
  const setSearchTerm = (search: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (search) {
      newParams.set('search', search);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const setSelectedStatus = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (status && status !== 'all') {
      newParams.set('status', status);
    } else {
      newParams.delete('status');
    }
    setSearchParams(newParams);
  };

  const [dialogOpen, setDialogOpen] = useState(false);

  // Utiliser les données Supabase
  const { entrepreneurs, loading } = useEntrepreneurs();

  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur => {
    const fullName = `${entrepreneur.first_name} ${entrepreneur.last_name}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entrepreneur.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || entrepreneur.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Entrepreneur['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Entrepreneur['status']) => {
    const labels = {
      active: 'Actif',
      inactive: 'Inactif',
      pending: 'En attente'
    };
    return labels[status];
  };

  const stats = {
    total: entrepreneurs.length,
    active: entrepreneurs.filter(e => e.status === 'active').length,
    pending: entrepreneurs.filter(e => e.status === 'pending').length,
    avgProgress: entrepreneurs.length > 0 ? Math.round(
      entrepreneurs.reduce((sum, e) => sum + (e.completed_deliverables / e.total_deliverables), 0) / 
      entrepreneurs.length * 100
    ) : 0
  };

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-orange mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des entrepreneurs...</p>
          </div>
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
              <h1 className="text-3xl font-bold mb-2">Entrepreneurs</h1>
              <p className="text-gray-600 text-base">
                Gérez les entrepreneurs de votre organisation.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Inviter
              </Button>
              <Button className="btn-white-label hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entrepreneurs</CardTitle>
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
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progression Moy.</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProgress}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
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
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des entrepreneurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntrepreneurs.map((entrepreneur) => {
            const fullName = `${entrepreneur.first_name} ${entrepreneur.last_name}`.trim();
            const initials = `${entrepreneur.first_name?.[0] || ''}${entrepreneur.last_name?.[0] || ''}`.toUpperCase();
            const progressPercentage = entrepreneur.total_deliverables > 0 
              ? Math.round((entrepreneur.completed_deliverables / entrepreneur.total_deliverables) * 100) 
              : 0;
            
            return (
              <Card key={entrepreneur.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-aurentia-pink rounded-full flex items-center justify-center text-white font-semibold">
                        {initials || entrepreneur.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{fullName || entrepreneur.email}</h3>
                        <p className="text-sm text-gray-600">{entrepreneur.email}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(entrepreneur.status)}>
                      {getStatusLabel(entrepreneur.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Date d'adhésion */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Rejoint le {new Date(entrepreneur.joined_at).toLocaleDateString('fr-FR')}</span>
                    </div>

                    {/* Mentor - utiliser mentor_id pour l'instant */}
                    {entrepreneur.mentor_id && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>Mentor assigné</span>
                      </div>
                    )}

                    {/* Projets et livrables */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Projets</span>
                        <div className="font-semibold">{entrepreneur.project_count}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Livrables</span>
                        <div className="font-semibold">
                          {entrepreneur.completed_deliverables}/{entrepreneur.total_deliverables}
                        </div>
                      </div>
                    </div>

                    {/* Progression */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progression</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-aurentia-pink h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Dernière activité */}
                    <div className="text-xs text-gray-500">
                      {entrepreneur.last_activity 
                        ? `Dernière activité: ${new Date(entrepreneur.last_activity).toLocaleDateString('fr-FR')}`
                        : `Rejoint le ${new Date(entrepreneur.joined_at).toLocaleDateString('fr-FR')}`
                      }
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Message si aucun entrepreneur */}
        {filteredEntrepreneurs.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun entrepreneur trouvé</h3>
              <p className="text-gray-600 mb-4">
                Aucun entrepreneur ne correspond à vos critères de recherche.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrganisationEntrepreneurs;