import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, X, Clock, Users, UserPlus, Mail, AlertCircle } from "lucide-react";
import { CollaboratorsService } from '@/services/collaborators.service';
import { Invitation } from '@/types/collaboration';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PendingInvitationsModalProps {
  isOpen: boolean;
  invitations: Invitation[];
  onInvitationAccepted: () => void;
}

const PendingInvitationsModal: React.FC<PendingInvitationsModalProps> = ({
  isOpen,
  invitations,
  onInvitationAccepted
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectingInvitation, setRejectingInvitation] = useState<Invitation | null>(null);
  const [open, setOpen] = useState(isOpen);

  // Sync internal state with prop
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleAcceptInvitation = async (invitationId: string, projectName: string) => {
    setLoading(invitationId);
    try {
      const result = await CollaboratorsService.acceptInvitationById(invitationId);
      
      if (result.success) {
        toast({
          title: "Invitation acceptée !",
          description: `Vous êtes maintenant collaborateur du projet "${projectName}".`,
          variant: "default",
        });
        onInvitationAccepted();
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible d'accepter l'invitation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'acceptation de l'invitation.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const confirmRejectInvitation = async () => {
    if (!rejectingInvitation) return;

    setLoading(rejectingInvitation.id);
    try {
      const result = await CollaboratorsService.rejectInvitation(rejectingInvitation.id);

      if (result.success) {
        toast({
          title: "Invitation rejetée",
          description: `L'invitation pour le projet "${rejectingInvitation.project_name || 'ce projet'}" a été rejetée.`,
          variant: "default",
        });
        onInvitationAccepted(); // Reload invitations
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de rejeter l'invitation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors du rejet de l\'invitation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du rejet de l'invitation.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
      setRejectingInvitation(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'administrator':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'editor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'viewer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'editor':
        return 'Éditeur';
      case 'viewer':
        return 'Lecteur';
      default:
        return role;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        modal={true}
      >
        <DialogContent
          className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col gap-0 p-0"
          aria-describedby="pending-invitations-description"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              Invitations en attente
            </DialogTitle>
            <DialogDescription id="pending-invitations-description" className="text-base pt-1">
              Vous avez <span className="font-semibold text-foreground">{invitations.length}</span> invitation{invitations.length > 1 ? 's' : ''} en attente pour collaborer sur des projets.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto px-6 py-4 space-y-4">
            {invitations.map((invitation, index) => (
              <Card
                key={invitation.id}
                className={cn(
                  "border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-200",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        {invitation.project_name || `Projet ${invitation.project_id?.slice(0, 8)}...`}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span>Invitation envoyée à <span className="font-medium">{invitation.email}</span></span>
                      </CardDescription>
                    </div>
                    <Badge className={cn(getRoleColor(invitation.role), "text-xs px-3 py-1 font-medium whitespace-nowrap")}>
                      {getRoleLabel(invitation.role)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span>
                        Invité le <span className="font-medium text-foreground">{formatDate(invitation.invited_at)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span>
                        Expire le <span className="font-medium text-foreground">{formatDate(invitation.expires_at)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <Button
                      onClick={() => handleAcceptInvitation(invitation.id, invitation.project_name || 'ce projet')}
                      disabled={loading === invitation.id}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none min-h-[44px]"
                      aria-label={`Accepter l'invitation pour ${invitation.project_name || 'ce projet'}`}
                    >
                      {loading === invitation.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                          <span>Acceptation...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" aria-hidden="true" />
                          <span>Accepter</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setRejectingInvitation(invitation)}
                      disabled={loading === invitation.id}
                      className="flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 flex-1 sm:flex-none min-h-[44px]"
                      aria-label={`Refuser l'invitation pour ${invitation.project_name || 'ce projet'}`}
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                      <span>Refuser</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Rejection */}
      <AlertDialog open={!!rejectingInvitation} onOpenChange={(open) => !open && setRejectingInvitation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Confirmer le refus
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Êtes-vous sûr de vouloir refuser l'invitation pour le projet{' '}
              <span className="font-semibold text-foreground">
                {rejectingInvitation?.project_name || 'ce projet'}
              </span> ?
              <br />
              <br />
              Cette action est définitive et vous devrez demander une nouvelle invitation pour collaborer sur ce projet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRejectInvitation}
              className="bg-red-600 hover:bg-red-700 text-white min-h-[44px]"
            >
              Oui, refuser l'invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PendingInvitationsModal;