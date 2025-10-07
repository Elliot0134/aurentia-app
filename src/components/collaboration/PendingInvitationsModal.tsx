import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Clock, Users, UserPlus, Mail } from "lucide-react";
import { CollaboratorsService } from '@/services/collaborators.service';
import { Invitation } from '@/types/collaboration';
import { useToast } from "@/hooks/use-toast";

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

  const handleRejectInvitation = async (invitationId: string, projectName: string) => {
    setLoading(invitationId);
    try {
      // TODO: Implémenter la logique de rejet d'invitation
      toast({
        title: "Invitation rejetée",
        description: `L'invitation pour le projet "${projectName}" a été rejetée.`,
        variant: "default",
      });
      onInvitationAccepted(); // Recharge les invitations
    } catch (error) {
      console.error('Erreur lors du rejet de l\'invitation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du rejet de l'invitation.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
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
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invitations en attente
          </DialogTitle>
          <DialogDescription>
            Vous avez {invitations.length} invitation{invitations.length > 1 ? 's' : ''} en attente pour collaborer sur des projets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {invitations.map((invitation) => (
            <Card key={invitation.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">
                      {invitation.project_name || `Projet ${invitation.project_id.slice(0, 8)}...`}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Invitation envoyée à {invitation.email}
                    </CardDescription>
                  </div>
                  <Badge className={getRoleColor(invitation.role)}>
                    {getRoleLabel(invitation.role)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Invité le {formatDate(invitation.invited_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Expire le {formatDate(invitation.expires_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={() => handleAcceptInvitation(invitation.id, invitation.project_name || 'ce projet')}
                      disabled={loading === invitation.id}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {loading === invitation.id ? 'Acceptation...' : 'Accepter'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleRejectInvitation(invitation.id, invitation.project_name || 'ce projet')}
                      disabled={loading === invitation.id}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Refuser
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PendingInvitationsModal;