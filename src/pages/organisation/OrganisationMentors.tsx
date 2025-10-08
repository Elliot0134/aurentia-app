import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMentors } from '@/hooks/useOrganisationData';
import type { Mentor } from '@/types/organisationTypes';
import { Plus, LogOut, UserX } from "lucide-react";
import { ModularDataTable } from "@/components/ui/modular-data-table";
import { mentorsTableConfig, MentorData } from "@/config/tables";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OrganisationMentors = () => {
  const { id: organisationId } = useParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [organizationOwnerId, setOrganizationOwnerId] = useState<string | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [kickDialogOpen, setKickDialogOpen] = useState(false);
  const [mentorToKick, setMentorToKick] = useState<MentorData | null>(null);
  
  // Utiliser les données Supabase
  const { mentors, loading: mentorsLoading } = useMentors();

  // Fetch current user and organization owner
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      if (organisationId) {
        const { data: orgData } = await (supabase as any)
          .from('organizations')
          .select('created_by')
          .eq('id', organisationId)
          .single();
        
        if (orgData) {
          setOrganizationOwnerId(orgData.created_by);
        }
      }
    };

    fetchUserData();
  }, [organisationId]);

  // Check if current user is the owner
  const isOwner = currentUserId === organizationOwnerId;

  // Handle leaving organization
  const handleLeaveOrganization = async () => {
    try {
      if (!currentUserId || !organisationId) return;

      // Remove from user_organizations
      const { error: removeError } = await (supabase as any)
        .from('user_organizations')
        .delete()
        .eq('user_id', currentUserId)
        .eq('organization_id', organisationId);

      if (removeError) throw removeError;

      // Deactivate mentor entry
      const { error: mentorError } = await (supabase as any)
        .from('mentors')
        .update({ status: 'inactive' })
        .eq('user_id', currentUserId)
        .eq('organization_id', organisationId);

      if (mentorError) console.warn('Mentor deactivation error:', mentorError);

      toast.success("Vous avez quitté l'organisation avec succès");
      setLeaveDialogOpen(false);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error leaving organization:', error);
      toast.error("Erreur lors de la sortie de l'organisation");
    }
  };

  // Handle kicking a mentor (owner only)
  const handleKickMentor = async () => {
    try {
      if (!mentorToKick || !isOwner) return;

      // Find the mentor's user_id from the mentors list
      const mentor = mentors.find(m => m.id === mentorToKick.id);
      if (!mentor) return;

      // Remove from user_organizations
      const { error: removeError } = await (supabase as any)
        .from('user_organizations')
        .delete()
        .eq('user_id', mentor.user_id)
        .eq('organization_id', organisationId);

      if (removeError) throw removeError;

      // Deactivate mentor entry
      const { error: mentorError } = await (supabase as any)
        .from('mentors')
        .update({ status: 'inactive' })
        .eq('user_id', mentor.user_id)
        .eq('organization_id', organisationId);

      if (mentorError) console.warn('Mentor deactivation error:', mentorError);

      toast.success(`${mentorToKick.prenom} ${mentorToKick.nom} a été retiré de l'organisation`);
      setKickDialogOpen(false);
      setMentorToKick(null);
      
      // Reload page to refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error kicking mentor:', error);
      toast.error("Erreur lors du retrait du mentor");
    }
  };

    // Mapper les données Supabase vers le format attendu par le tableau modulaire
  const mappedMentors: MentorData[] = mentors.map((mentor: Mentor) => ({
    id: mentor.id,
    nom: mentor.last_name || 'N/A',
    prenom: mentor.first_name || 'N/A',
    email: mentor.email || 'N/A',
    telephone: mentor.phone || '',
    photoUrl: mentor.avatar_url,
    description: mentor.mentor_bio || mentor.bio || undefined,
    specialite: mentor.expertise?.[0] || 'Généraliste',
    linkedin: mentor.linkedin_url,
    disponibilites: mentor.availability ? JSON.stringify(mentor.availability) : undefined,
    nombreProjetsMax: mentor.max_projects || mentor.max_entrepreneurs,
    nombreProjetsActuels: mentor.current_entrepreneurs || 0,
    statut: (mentor.status === 'active' ? 'Actif' : mentor.status === 'pending' ? 'En attente' : 'Inactif') as "Actif" | "En attente" | "Inactif",
    nombreMentores: mentor.total_entrepreneurs || 0,
    dateInscription: mentor.joined_at ? new Date(mentor.joined_at).toLocaleDateString('fr-FR') : 'N/A',
    progressValue: mentor.success_rate || 0,
    relatedLinks: [
      { label: "Voir le profil", href: `/organisation/${organisationId}/mentors/${mentor.id}` },
      { label: "Entrepreneurs", href: `/organisation/${organisationId}/mentors/${mentor.id}/entrepreneurs` },
    ],
    // Store the user_id for permission checks
    user_id: mentor.user_id
  }));

  // Create custom config with permission-based actions
  const customMentorsConfig = {
    ...mentorsTableConfig,
    rowActions: mentorsTableConfig.rowActions?.map(action => {
      if (action.label === "Supprimer") {
        return {
          ...action,
          onClick: (data: MentorData) => {
            // Only owner can kick others
            // Mentors cannot kick anyone (including themselves via this action)
            if (!isOwner) {
              toast.error("Seul le propriétaire peut retirer des mentors");
              return;
            }
            
            // Owner cannot kick themselves
            if ((data as any).user_id === currentUserId) {
              toast.error("Vous ne pouvez pas vous retirer vous-même");
              return;
            }
            
            setMentorToKick(data);
            setKickDialogOpen(true);
          }
        };
      }
      return action;
    })
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
    <>
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
            {/* Leave Organization Button (for mentors, not owners) */}
            {!isOwner && (
              <Button 
                variant="outline"
                className="w-full sm:w-auto h-9 sm:h-10 border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => setLeaveDialogOpen(true)}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Quitter l'organisation
              </Button>
            )}
            
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

      {/* Tableau des mentors avec le composant modulaire */}
      <Card>
        <CardContent className="p-6">
          <ModularDataTable
            data={mappedMentors}
            config={customMentorsConfig}
            onDataChange={(newData) => {
              console.log("Nouvelles données:", newData);
              // Ici vous pouvez sauvegarder l'ordre dans Supabase
            }}
          />
        </CardContent>
      </Card>

      {/* Leave Organization Confirmation Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quitter l'organisation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir quitter cette organisation ? Vous perdrez l'accès à tous les projets et ressources.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleLeaveOrganization}>
              Quitter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kick Mentor Confirmation Dialog */}
      <Dialog open={kickDialogOpen} onOpenChange={setKickDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer ce mentor</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir retirer {mentorToKick?.prenom} {mentorToKick?.nom} de l'organisation ?
              Cette action peut être inversée en réinvitant le mentor.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setKickDialogOpen(false);
              setMentorToKick(null);
            }}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleKickMentor}>
              <UserX className="w-4 h-4 mr-2" />
              Retirer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrganisationMentors;