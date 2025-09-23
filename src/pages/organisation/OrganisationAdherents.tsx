import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { useAdherents } from '@/hooks/useOrganisationData';
import type { Adherent } from '@/types/organisationTypes';

const OrganisationAdherents = () => {
  const { id: organisationId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Utiliser les données Supabase
  const { adherents, loading } = useAdherents();

  const filteredAdherents = adherents.filter(adherent => {
    const fullName = `${adherent.first_name} ${adherent.last_name}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adherent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || adherent.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Adherent['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Adherent['status']) => {
    const labels = {
      active: 'Actif',
      inactive: 'Inactif',
      pending: 'En attente'
    };
    return labels[status];
  };

  const stats = {
    total: adherents.length,
    active: adherents.filter(e => e.status === 'active').length,
    pending: adherents.filter(e => e.status === 'pending').length,
    avgProgress: adherents.length > 0 ? Math.round(
      adherents.reduce((sum, e) => sum + (e.completed_deliverables / e.total_deliverables), 0) / 
      adherents.length * 100
    ) : 0
  };

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des adhérents...</p>
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
              <h1 className="text-3xl font-bold mb-2">Adhérents</h1>
              <p className="text-gray-600 text-base">
                Gérez les adhérents de votre organisation.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Inviter
              </Button>
              <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
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
              <CardTitle className="text-sm font-medium">Total Adhérents</CardTitle>
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

        {/* Liste des adhérents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdherents.map((adherent) => {
            const fullName = `${adherent.first_name} ${adherent.last_name}`.trim();
            const initials = `${adherent.first_name?.[0] || ''}${adherent.last_name?.[0] || ''}`.toUpperCase();
            const progressPercentage = adherent.total_deliverables > 0 
              ? Math.round((adherent.completed_deliverables / adherent.total_deliverables) * 100) 
              : 0;
            
            return (
              <Card key={adherent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-aurentia-pink rounded-full flex items-center justify-center text-white font-semibold">
                        {initials || adherent.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{fullName || adherent.email}</h3>
                        <p className="text-sm text-gray-600">{adherent.email}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(adherent.status)}>
                      {getStatusLabel(adherent.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Date d'adhésion */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Rejoint le {new Date(adherent.joined_at).toLocaleDateString('fr-FR')}</span>
                    </div>

                    {/* Mentor - utiliser mentor_id pour l'instant */}
                    {adherent.mentor_id && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>Mentor assigné</span>
                      </div>
                    )}

                    {/* Projets et livrables */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Projets</span>
                        <div className="font-semibold">{adherent.project_count}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Livrables</span>
                        <div className="font-semibold">
                          {adherent.completed_deliverables}/{adherent.total_deliverables}
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
                      {adherent.last_activity 
                        ? `Dernière activité: ${new Date(adherent.last_activity).toLocaleDateString('fr-FR')}`
                        : `Rejoint le ${new Date(adherent.joined_at).toLocaleDateString('fr-FR')}`
                      }
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/organisation/mentors/assign?adherent=${adherent.id}`)}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {adherent.mentor_id ? 'Changer' : 'Assigner'} mentor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Message si aucun adhérent */}
        {filteredAdherents.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun adhérent trouvé</h3>
              <p className="text-gray-600 mb-4">
                Aucun adhérent ne correspond à vos critères de recherche.
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

export default OrganisationAdherents;