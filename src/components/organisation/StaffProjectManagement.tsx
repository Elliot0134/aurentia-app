import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  XCircle, 
  UserPlus, 
  FileEdit,
  Search,
  Filter
} from "lucide-react";interface Project {
  project_id: string;
  nom_projet: string;
  description_synthetique?: string;
  validation_status?: 'pending' | 'validated' | 'rejected' | 'in_progress' | 'completed';
  project_status?: string;
  user_id: string;
  user_name?: string;
  created_at: string;
  assigned_mentors?: any[];
  organization_id?: string;
}

interface Mentor {
  id: string;
  full_name: string;
  email: string;
  speciality?: string;
  current_projects?: number;
  max_projects?: number;
}

interface StaffProjectManagementProps {
  organizationId: string;
}

const StaffProjectManagement: React.FC<StaffProjectManagementProps> = ({ organizationId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showMentorDialog, setShowMentorDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [statusComment, setStatusComment] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchProjects();
    fetchMentors();
  }, [organizationId, filterStatus]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from('project_summary')
        .select(`
          project_id,
          nom_projet,
          description_synthetique,
          validation_status,
          statut_project,
          user_id,
          created_at,
          organization_id
        `)
        .eq('organization_id', organizationId);

      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('validation_status', filterStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
        return;
      }

      // If no data, set empty array and return
      if (!data || data.length === 0) {
        setProjects([]);
        return;
      }

      // Fetch user names separately
      const formattedProjects = await Promise.all(data.map(async (p: any) => {
        let userName = 'Utilisateur inconnu';
        
        if (p.user_id) {
          try {
            const { data: profileData } = await (supabase as any)
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', p.user_id)
              .single();
            
            if (profileData) {
              const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
              userName = fullName || profileData.email || 'Utilisateur inconnu';
            }
          } catch (profileError) {
            console.warn('Error fetching profile for user:', p.user_id, profileError);
          }
        }

        return {
          ...p,
          user_name: userName,
          project_status: p.statut_project
        };
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      // Don't show error toast if just empty results
      if (error && (error as any).code !== 'PGRST116') {
        toast.error("Erreur lors du chargement des projets");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('mentors')
        .select(`
          id,
          user_id,
          expertise,
          bio
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching mentors:', error);
        setMentors([]);
        return;
      }

      // If no data, set empty array and return
      if (!data || data.length === 0) {
        setMentors([]);
        return;
      }

      // Fetch user names separately
      const mentorsWithNames = await Promise.all(data.map(async (mentor: any) => {
        try {
          const { data: profileData } = await (supabase as any)
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', mentor.user_id)
            .single();

          const fullName = profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : '';

          return {
            id: mentor.id,
            full_name: fullName || profileData?.email || 'Mentor',
            email: profileData?.email || '',
            speciality: mentor.expertise?.[0] || 'Généraliste',
            max_projects: null
          };
        } catch (profileError) {
          console.warn('Error fetching profile for mentor:', mentor.user_id, profileError);
          return {
            id: mentor.id,
            full_name: 'Mentor',
            email: '',
            speciality: mentor.expertise?.[0] || 'Généraliste',
            max_projects: null
          };
        }
      }));

      setMentors(mentorsWithNames);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setMentors([]);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedProject || !newStatus) {
      toast.error("Veuillez sélectionner un statut");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Update project status
      const { error: updateError } = await supabase
        .from('project_summary')
        .update({
          validation_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', selectedProject.project_id);

      if (updateError) throw updateError;

      // Log activity
      await (supabase as any).rpc('log_user_activity', {
        p_user_id: user.id,
        p_organization_id: organizationId,
        p_activity_type: 'project_status_changed',
        p_description: `Statut du projet "${selectedProject.nom_projet}" changé en "${getStatusLabel(newStatus)}"${statusComment ? ': ' + statusComment : ''}`,
        p_entity_type: 'project',
        p_entity_id: selectedProject.project_id,
        p_metadata: {
          project_name: selectedProject.nom_projet,
          old_status: selectedProject.validation_status,
          new_status: newStatus,
          comment: statusComment
        }
      });

      toast.success("Statut mis à jour avec succès");
      setShowStatusDialog(false);
      setStatusComment('');
      fetchProjects();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleAssignMentor = async () => {
    if (!selectedProject || !selectedMentorId) {
      toast.error("Veuillez sélectionner un mentor");
      return;
    }

    // Check if project is validated
    if (selectedProject.validation_status !== 'validated' && selectedProject.validation_status !== 'in_progress') {
      toast.error("Le projet doit être validé avant d'assigner un mentor");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Create mentor assignment in project_mentors table (create if doesn't exist)
      const { error: assignError } = await (supabase as any)
        .from('project_mentors')
        .insert({
          project_id: selectedProject.project_id,
          mentor_id: selectedMentorId,
          assigned_at: new Date().toISOString(),
          assigned_by: user.id,
          status: 'active'
        });

      if (assignError) {
        // If table doesn't exist, we'll note this
        console.error('Error assigning mentor (table may not exist):', assignError);
        toast.error("Erreur: La table project_mentors n'existe pas encore. Voir la migration.");
        return;
      }

      const selectedMentor = mentors.find(m => m.id === selectedMentorId);

      // Log activity
      await (supabase as any).rpc('log_user_activity', {
        p_user_id: user.id,
        p_organization_id: organizationId,
        p_activity_type: 'mentor_assigned',
        p_description: `Mentor "${selectedMentor?.full_name}" assigné au projet "${selectedProject.nom_projet}"`,
        p_entity_type: 'project',
        p_entity_id: selectedProject.project_id,
        p_metadata: {
          project_name: selectedProject.nom_projet,
          mentor_name: selectedMentor?.full_name,
          mentor_id: selectedMentorId
        }
      });

      toast.success("Mentor assigné avec succès");
      setShowMentorDialog(false);
      setSelectedMentorId('');
      fetchProjects();
    } catch (error) {
      console.error('Error assigning mentor:', error);
      toast.error("Erreur lors de l'assignation du mentor");
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending: { 
        label: 'En attente', 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Clock
      },
      validated: { 
        label: 'Validé', 
        className: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle2
      },
      rejected: { 
        label: 'Rejeté', 
        className: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle
      },
      in_progress: { 
        label: 'En cours', 
        className: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: PlayCircle
      },
      completed: { 
        label: 'Terminé', 
        className: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: CheckCircle2
      }
    };

    const config = statusConfig[status || 'pending'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1`} variant="outline">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      validated: 'Validé',
      rejected: 'Rejeté',
      in_progress: 'En cours',
      completed: 'Terminé'
    };
    return labels[status] || status;
  };

  const filteredProjects = projects.filter(p => 
    searchQuery === '' || 
    p.nom_projet.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-aurentia-pink" />
              Gestion des projets
            </CardTitle>
            <CardDescription>
              Valider, suivre et assigner des mentors aux projets
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un projet ou utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="validated">Validé</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-pink"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileEdit className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Aucun projet trouvé</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Porteur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.project_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{project.nom_projet}</p>
                        {project.description_synthetique && (
                          <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                            {project.description_synthetique}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-700">{project.user_name}</p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(project.validation_status)}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">
                        {new Date(project.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setNewStatus(project.validation_status || 'pending');
                            setShowStatusDialog(true);
                          }}
                        >
                          Changer statut
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setShowMentorDialog(true);
                          }}
                          disabled={project.validation_status === 'pending' || project.validation_status === 'rejected'}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Assigner mentor
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Status Change Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le statut du projet</DialogTitle>
              <DialogDescription>
                Projet: {selectedProject?.nom_projet}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="status">Nouveau statut</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        En attente
                      </div>
                    </SelectItem>
                    <SelectItem value="validated">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Validé
                      </div>
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-blue-600" />
                        En cours
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        Terminé
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        Rejeté
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="comment">Commentaire (optionnel)</Label>
                <Textarea
                  id="comment"
                  placeholder="Ajoutez un commentaire sur ce changement de statut..."
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleStatusChange}>
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Mentor Dialog */}
        <Dialog open={showMentorDialog} onOpenChange={setShowMentorDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assigner un mentor</DialogTitle>
              <DialogDescription>
                Projet: {selectedProject?.nom_projet}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedProject?.validation_status === 'pending' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Ce projet doit d'abord être validé avant de pouvoir assigner un mentor.
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="mentor">Sélectionner un mentor</Label>
                  <Select value={selectedMentorId} onValueChange={setSelectedMentorId}>
                    <SelectTrigger id="mentor" className="mt-2">
                      <SelectValue placeholder="Choisir un mentor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mentors.map((mentor) => (
                        <SelectItem key={mentor.id} value={mentor.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{mentor.full_name}</span>
                            {mentor.speciality && (
                              <span className="text-xs text-gray-500">{mentor.speciality}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mentors.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Aucun mentor disponible dans votre organisation
                    </p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMentorDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleAssignMentor}
                disabled={selectedProject?.validation_status === 'pending' || !selectedMentorId}
              >
                Assigner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StaffProjectManagement;
