import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStaff } from '@/hooks/useOrganisationData';
import type { Staff } from '@/types/organisationTypes';
import { Plus, LogOut, UserX } from "lucide-react";
import { ModularDataTable } from "@/components/ui/modular-data-table";
import { staffTableConfig, StaffData } from "@/config/tables";
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

const OrganisationStaff = () => {
  const { id: organisationId } = useParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [organizationOwnerId, setOrganizationOwnerId] = useState<string | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [kickDialogOpen, setKickDialogOpen] = useState(false);
  const [staffToKick, setStaffToKick] = useState<StaffData | null>(null);

  // Utiliser les données Supabase
  const { staff, loading: staffLoading } = useStaff();

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

      // Deactivate staff entry
      const { error: staffError } = await (supabase as any)
        .from('staff')
        .update({ status: 'inactive' })
        .eq('user_id', currentUserId)
        .eq('organization_id', organisationId);

      if (staffError) console.warn('Staff deactivation error:', staffError);

      toast.success("Vous avez quitté l'organisation avec succès");
      setLeaveDialogOpen(false);

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error leaving organization:', error);
      toast.error("Erreur lors de la sortie de l'organisation");
    }
  };

  // Handle kicking a staff member (owner only)
  const handleKickStaff = async () => {
    try {
      if (!staffToKick || !isOwner) return;

      // Find the staff member's user_id from the staff list
      const staffMember = staff.find(s => s.id === staffToKick.id);
      if (!staffMember) return;

      // Remove from user_organizations
      const { error: removeError } = await (supabase as any)
        .from('user_organizations')
        .delete()
        .eq('user_id', staffMember.user_id)
        .eq('organization_id', organisationId);

      if (removeError) throw removeError;

      // Deactivate staff entry
      const { error: staffError } = await (supabase as any)
        .from('staff')
        .update({ status: 'inactive' })
        .eq('user_id', staffMember.user_id)
        .eq('organization_id', organisationId);

      if (staffError) console.warn('Staff deactivation error:', staffError);

      toast.success(`${staffToKick.prenom} ${staffToKick.nom} a été retiré de l'organisation`);
      setKickDialogOpen(false);
      setStaffToKick(null);

      // Reload page to refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error kicking staff:', error);
      toast.error("Erreur lors du retrait du staff");
    }
  };

  // Mapper les données Supabase vers le format attendu par le tableau modulaire
  const mappedStaff: StaffData[] = staff.map((member: Staff) => ({
    id: member.id,
    nom: member.last_name || 'N/A',
    prenom: member.first_name || 'N/A',
    email: member.email || 'N/A',
    telephone: member.phone || '',
    photoUrl: member.avatar_url,
    description: member.bio || undefined,
    jobRole: member.job_role || 'Non défini',
    manager: member.manager_name,
    linkedin: member.linkedin_url,
    statut: (member.status === 'active' ? 'Actif' : member.status === 'pending' ? 'En attente' : 'Inactif') as "Actif" | "En attente" | "Inactif",
    dateInscription: member.joined_at ? new Date(member.joined_at).toLocaleDateString('fr-FR') : 'N/A',
    is_also_mentor: member.is_also_mentor || false,
    // Store the user_id for permission checks
    user_id: member.user_id
  }));

  // Create custom config with permission-based actions
  const customStaffConfig = {
    ...staffTableConfig,
    rowActions: staffTableConfig.rowActions?.map(action => {
      if (action.label === "Supprimer") {
        return {
          ...action,
          onClick: (data: StaffData) => {
            // Only owner can kick others
            // Staff cannot kick anyone (including themselves via this action)
            if (!isOwner) {
              toast.error("Seul le propriétaire peut retirer des membres du staff");
              return;
            }

            // Owner cannot kick themselves
            const staffMember = staff.find(s => s.id === data.id);
            if (staffMember && staffMember.user_id === organizationOwnerId) {
              toast.error("Le propriétaire de l'organisation ne peut pas être retiré");
              return;
            }

            setStaffToKick(data);
            setKickDialogOpen(true);
          }
        };
      }
      return action;
    })
  };

  if (staffLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-orange mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement du staff...</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Staff & Administrateurs</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Gérez les membres du staff et administrateurs de votre organisation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Leave Organization Button (for staff, not owners) */}
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
              className="btn-white-label hover:opacity-90 w-full sm:w-auto h-9 sm:h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </div>

      {/* Tableau du staff avec le composant modulaire */}
      <Card>
        <CardContent className="p-6">
          <ModularDataTable
            data={mappedStaff}
            config={customStaffConfig}
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

      {/* Kick Staff Confirmation Dialog */}
      <Dialog open={kickDialogOpen} onOpenChange={setKickDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer ce membre du staff</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir retirer {staffToKick?.prenom} {staffToKick?.nom} de l'organisation ?
              Cette action peut être inversée en réinvitant le membre.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setKickDialogOpen(false);
              setStaffToKick(null);
            }}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleKickStaff}>
              <UserX className="w-4 h-4 mr-2" />
              Retirer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrganisationStaff;
