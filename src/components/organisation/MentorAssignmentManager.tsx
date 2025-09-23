import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMentorAssignments, useUnassignedEntrepreneurs, useAvailableMentors } from "@/hooks/useMentorAssignments";
import {
  Users,
  Plus,
  UserCheck,
  UserX,
  Calendar,
  MessageSquare
} from "lucide-react";

const MentorAssignmentManager = () => {
  const { toast } = useToast();
  const { assignments, loading: assignmentsLoading, createAssignment, cancelAssignment } = useMentorAssignments();
  const { entrepreneurs, loading: entrepreneursLoading } = useUnassignedEntrepreneurs();
  const { mentors, loading: mentorsLoading } = useAvailableMentors();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<string>('');
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAssignment = async () => {
    if (!selectedMentor || !selectedEntrepreneur) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un mentor et un entrepreneur.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createAssignment({
        mentor_id: selectedMentor,
        entrepreneur_id: selectedEntrepreneur,
        notes: notes || undefined
      });

      toast({
        title: "Assignation créée",
        description: "Le mentor a été assigné avec succès à l'entrepreneur.",
      });

      setDialogOpen(false);
      setSelectedMentor('');
      setSelectedEntrepreneur('');
      setNotes('');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'assignation.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelAssignment = async (assignmentId: string) => {
    try {
      await cancelAssignment(assignmentId);
      toast({
        title: "Assignation annulée",
        description: "L'assignation a été annulée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'annulation.",
        variant: "destructive",
      });
    }
  };

  if (assignmentsLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des assignations...</p>
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
              <h1 className="text-3xl font-bold mb-2">Gestion des Mentors</h1>
              <p className="text-gray-600 text-base">
                Gérez les assignations entre mentors et entrepreneurs.
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Assignation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assigner un Mentor</DialogTitle>
                  <DialogDescription>
                    Assignez un mentor à un entrepreneur pour l'accompagner dans son projet.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Entrepreneur</label>
                    <Select value={selectedEntrepreneur} onValueChange={setSelectedEntrepreneur}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un entrepreneur" />
                      </SelectTrigger>
                      <SelectContent>
                        {entrepreneursLoading ? (
                          <SelectItem value="loading" disabled>Chargement...</SelectItem>
                        ) : entrepreneurs.length === 0 ? (
                          <SelectItem value="none" disabled>Aucun entrepreneur sans mentor</SelectItem>
                        ) : (
                          entrepreneurs.map((entrepreneur) => (
                            <SelectItem key={entrepreneur.id} value={entrepreneur.id}>
                              {entrepreneur.first_name} {entrepreneur.last_name} ({entrepreneur.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Mentor</label>
                    <Select value={selectedMentor} onValueChange={setSelectedMentor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un mentor" />
                      </SelectTrigger>
                      <SelectContent>
                        {mentorsLoading ? (
                          <SelectItem value="loading" disabled>Chargement...</SelectItem>
                        ) : mentors.length === 0 ? (
                          <SelectItem value="none" disabled>Aucun mentor disponible</SelectItem>
                        ) : (
                          mentors.map((mentor) => (
                            <SelectItem key={mentor.id} value={mentor.id}>
                              {mentor.profiles?.first_name} {mentor.profiles?.last_name} 
                              {mentor.expertise?.length > 0 && ` - ${mentor.expertise.slice(0, 2).join(', ')}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes (optionnel)</label>
                    <Textarea
                      placeholder="Notes sur cette assignation..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
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
                    onClick={handleCreateAssignment}
                    disabled={isCreating || !selectedMentor || !selectedEntrepreneur}
                  >
                    {isCreating ? 'Création...' : 'Créer l\'assignation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignations Actives</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => a.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entrepreneurs Sans Mentor</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entrepreneurs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mentors Disponibles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mentors.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des assignations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Assignations Mentor-Entrepreneur
            </CardTitle>
            <CardDescription>
              Toutes les assignations entre mentors et entrepreneurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune assignation</h3>
                <p className="text-gray-600 mb-4">
                  Commencez par créer votre première assignation mentor-entrepreneur.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.id} className="border-l-4 border-l-aurentia-pink">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-aurentia-pink" />
                              <span className="font-medium">
                                Mentor #{assignment.mentor_id.substring(0, 8)} → 
                                Entrepreneur #{assignment.entrepreneur_id.substring(0, 8)}
                              </span>
                            </div>
                            <Badge 
                              className={
                                assignment.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : assignment.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {assignment.status === 'active' ? 'Actif' : 
                               assignment.status === 'cancelled' ? 'Annulé' : 
                               'Terminé'}
                            </Badge>
                          </div>

                          {assignment.notes && (
                            <p className="text-sm text-gray-600">
                              Notes: {assignment.notes}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Assigné le {new Date(assignment.assigned_at).toLocaleDateString('fr-FR')}
                            </span>
                            {assignment.assigned_by && (
                              <span>Assigné par: {assignment.assigned_by.substring(0, 8)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {assignment.status === 'active' && (
                            <>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Messages
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleCancelAssignment(assignment.id)}
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Annuler
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MentorAssignmentManager;