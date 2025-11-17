import React, { useState } from 'react';
import { CheckCircle, X, Mail, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CollaboratorsService } from '@/services/collaborators.service';
import { Invitation } from '@/types/collaboration';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PendingInvitesSectionProps {
  invitations: Invitation[];
  onInvitationHandled: () => void;
}

export const PendingInvitesSection: React.FC<PendingInvitesSectionProps> = ({
  invitations,
  onInvitationHandled
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectingInvitation, setRejectingInvitation] = useState<Invitation | null>(null);

  const handleAcceptInvitation = async (invitationId: string, projectName: string) => {
    setLoading(invitationId);
    try {
      const result = await CollaboratorsService.acceptInvitationById(invitationId);

      if (result.success) {
        toast({
          title: "Invitation acceptée !",
          description: `Vous pouvez maintenant collaborer sur "${projectName}".`,
          variant: "default",
        });
        onInvitationHandled();
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible d'accepter l'invitation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite.",
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
      // TODO: Implement rejection logic with backend
      toast({
        title: "Invitation rejetée",
        description: `L'invitation pour "${rejectingInvitation.project_name || 'ce projet'}" a été rejetée.`,
        variant: "default",
      });
      onInvitationHandled();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
      setRejectingInvitation(null);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
      case 'administrator':
        return 'Admin';
      case 'editor':
        return 'Éditeur';
      case 'viewer':
        return 'Lecteur';
      default:
        return role;
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expiré';
    if (diffDays === 0) return 'Expire aujourd\'hui';
    if (diffDays === 1) return 'Expire demain';
    return `${diffDays}j restants`;
  };

  if (invitations.length === 0) return null;

  return (
    <>
      <div className="space-y-2 animate-fade-in">
        {/* Section Header */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">
            Invitations en attente
          </h3>
          <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 dark:bg-blue-500">
            <span className="text-[10px] font-bold text-white">
              {invitations.length}
            </span>
          </div>
        </div>

        {/* Invitations List */}
        <div className="space-y-1.5">
          {invitations.map((invitation, index) => {
            const isLoading = loading === invitation.id;
            const expiryLabel = formatExpiryDate(invitation.expires_at);
            const isExpiringSoon = expiryLabel.includes('aujourd\'hui') || expiryLabel.includes('demain');

            return (
              <div
                key={invitation.id}
                className={cn(
                  "group relative flex flex-col gap-2 px-3 py-2.5 rounded-lg border-2 transition-all duration-200",
                  "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
                  "border-blue-200 dark:border-blue-800",
                  "hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700",
                  "animate-slide-up"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Project Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-text-primary truncate">
                      {invitation.project_name || 'Nouveau projet'}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {getRoleLabel(invitation.role)}
                      </span>
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-medium",
                        isExpiringSoon ? "text-orange-600 dark:text-orange-400" : "text-text-muted"
                      )}>
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {expiryLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleAcceptInvitation(invitation.id, invitation.project_name || 'ce projet')}
                    disabled={isLoading}
                    size="sm"
                    className={cn(
                      "flex-1 h-8 text-xs font-medium",
                      "bg-green-600 hover:bg-green-700 text-white",
                      "transition-all duration-200",
                      "disabled:opacity-50"
                    )}
                    aria-label={`Accepter l'invitation pour ${invitation.project_name || 'ce projet'}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" aria-hidden="true" />
                        <span>Acceptation...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                        <span>Accepter</span>
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setRejectingInvitation(invitation)}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className={cn(
                      "flex-1 h-8 text-xs font-medium",
                      "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300",
                      "dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30",
                      "transition-all duration-200",
                      "disabled:opacity-50"
                    )}
                    aria-label={`Refuser l'invitation pour ${invitation.project_name || 'ce projet'}`}
                  >
                    <X className="w-3 h-3 mr-1" aria-hidden="true" />
                    <span>Refuser</span>
                  </Button>
                </div>

                {/* Expiring Soon Indicator */}
                {isExpiringSoon && (
                  <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 animate-pulse">
                    <AlertCircle className="w-2.5 h-2.5 text-white" aria-hidden="true" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-2" />
      </div>

      {/* Confirmation Dialog for Rejection */}
      <AlertDialog open={!!rejectingInvitation} onOpenChange={(open) => !open && setRejectingInvitation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
              Confirmer le refus
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Êtes-vous sûr de vouloir refuser l'invitation pour le projet{' '}
              <span className="font-semibold text-foreground">
                {rejectingInvitation?.project_name || 'ce projet'}
              </span> ?
              <br />
              <br />
              Vous devrez demander une nouvelle invitation pour collaborer sur ce projet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRejectInvitation}
              className="bg-red-600 hover:bg-red-700 text-white min-h-[44px]"
            >
              Oui, refuser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
