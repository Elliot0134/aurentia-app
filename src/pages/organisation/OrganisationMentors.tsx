import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMentors } from '@/hooks/useOrganisationData';
import type { Mentor } from '@/types/organisationTypes';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Star,
  Calendar,
  UserCheck,
  Building
} from "lucide-react";

const OrganisationMentors = () => {
  const { id: organisationId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  
  // Utiliser les données Supabase
  const { mentors, loading: mentorsLoading } = useMentors();

  const filteredMentors = mentors.filter(mentor => {
    const fullName = `${mentor.first_name} ${mentor.last_name}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || mentor.status === selectedStatus;
    const matchesRole = selectedRole === 'all' || mentor.user_role === selectedRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      active: 'Actif',
      pending: 'En attente',
      inactive: 'Inactif'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-blue-100 text-blue-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      organisation: 'bg-purple-100 text-purple-800',
      staff: 'bg-blue-100 text-blue-800'
    };
    const labels = {
      organisation: 'Propriétaire',
      staff: 'Administrateur'
    };
    return (
      <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    );
  };

  const stats = {
    total: mentors.length,
    active: mentors.filter(m => m.status === 'active').length,
    owners: mentors.filter(m => m.user_role === 'organisation').length,
    admins: mentors.filter(m => m.user_role === 'staff').length
  };

  if (mentorsLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des mentors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mentors & Administrateurs</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Gérez les mentors et administrateurs de votre organisation.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" className="w-full sm:w-auto h-9 sm:h-10">
                <Mail className="w-4 h-4 mr-2" />
                Inviter
              </Button>
              <Button 
                style={{ backgroundColor: '#ff5932' }} 
                className="hover:opacity-90 text-white w-full sm:w-auto h-9 sm:h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Actifs</CardTitle>
              <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Propriétaires</CardTitle>
              <Building className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.owners}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Administrateurs</CardTitle>
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher par nom, email ou expertise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 sm:h-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32 sm:w-40 h-9 sm:h-10">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-32 sm:w-40 h-9 sm:h-10">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="organisation">Propriétaire</SelectItem>
                    <SelectItem value="staff">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des mentors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredMentors.map((mentor) => {
            const fullName = `${mentor.first_name} ${mentor.last_name}`.trim();
            const initials = `${mentor.first_name?.[0] || ''}${mentor.last_name?.[0] || ''}`.toUpperCase();
            
            return (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-aurentia-pink rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                        {initials || mentor.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{fullName || mentor.email}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{mentor.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0 ml-2">
                      {getRoleBadge(mentor.user_role)}
                      {getStatusBadge(mentor.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Bio */}
                    {mentor.bio && (
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{mentor.bio}</p>
                    )}

                    {/* Expertise */}
                    {mentor.expertise && mentor.expertise.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Expertise</p>
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertise.slice(0, 2).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                              {skill}
                            </Badge>
                          ))}
                          {mentor.expertise.length > 2 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              +{mentor.expertise.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Statistiques */}
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-600">Entrepreneurs</span>
                        <div className="font-semibold">{mentor.total_entrepreneurs}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Taux de succès</span>
                        <div className="font-semibold">{mentor.success_rate}%</div>
                      </div>
                    </div>

                    {/* Note */}
                    {mentor.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                        <span className="text-xs sm:text-sm font-medium">{mentor.rating}/5</span>
                      </div>
                    )}

                    {/* Date d'adhésion */}
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">Rejoint le {new Date(mentor.joined_at).toLocaleDateString('fr-FR')}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm h-8">
                        <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Voir profil</span>
                        <span className="sm:hidden">Profil</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm h-8">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Contacter</span>
                        <span className="sm:hidden">Mail</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Message si aucun mentor */}
        {filteredMentors.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun mentor trouvé</h3>
              <p className="text-gray-600 mb-4">
                Aucun mentor ne correspond à vos critères de recherche.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedRole('all');
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

export default OrganisationMentors;