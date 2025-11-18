import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CollaboratorsService } from '@/services/collaborators.service';
import { Collaborator } from '@/types/collaboration';
import { Crown, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OwnershipTransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  collaborators: Collaborator[];
  onTransferComplete?: () => void;
}

const OwnershipTransferDialog: React.FC<OwnershipTransferDialogProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  collaborators,
  onTransferComplete
}) => {
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Filter out non-active collaborators
  const activeCollaborators = collaborators.filter(
    collab => collab.status === 'active' || collab.status === 'accepted'
  );

  const selectedCollaborator = activeCollaborators.find(
    collab => collab.user_id === selectedCollaboratorId
  );

  const handleTransfer = async () => {
    if (!selectedCollaboratorId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un collaborateur',
        variant: 'destructive'
      });
      return;
    }

    setIsTransferring(true);
    try {
      const result = await CollaboratorsService.transferOwnership(
        projectId,
        selectedCollaboratorId
      );

      if (result.success) {
        toast({
          title: 'Propriété transférée !',
          description: `${selectedCollaborator?.user?.email || 'Le collaborateur'} est maintenant propriétaire du projet. Vous êtes devenu administrateur.`,
        });

        // Close dialog and refresh
        setShowConfirmation(false);
        onClose();
        onTransferComplete?.();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de transférer la propriété',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClose = () => {
    setShowConfirmation(false);
    setSelectedCollaboratorId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown size={20} className="text-yellow-600" />
            Transférer la propriété
          </DialogTitle>
          <DialogDescription>
            Transférez la propriété de <strong>{projectName}</strong> à un autre collaborateur
          </DialogDescription>
        </DialogHeader>

        {!showConfirmation ? (
          <>
            <div className="space-y-4">
              {/* Warning Alert */}
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-sm">
                  <strong>Attention :</strong> Cette action est irréversible. Vous deviendrez
                  automatiquement administrateur après le transfert.
                </AlertDescription>
              </Alert>

              {/* Collaborator Selection */}
              <div className="space-y-2">
                <Label htmlFor="collaborator">Nouveau propriétaire</Label>
                {activeCollaborators.length === 0 ? (
                  <Alert className="border-gray-200">
                    <AlertDescription className="text-sm text-gray-600">
                      Aucun collaborateur actif disponible. Vous devez d'abord inviter des
                      collaborateurs pour pouvoir transférer la propriété.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Select
                    value={selectedCollaboratorId}
                    onValueChange={setSelectedCollaboratorId}
                  >
                    <SelectTrigger id="collaborator">
                      <SelectValue placeholder="Sélectionner un collaborateur" />
                    </SelectTrigger>
                    <SelectContent className="max-w-full">
                      {activeCollaborators.map((collab) => (
                        <SelectItem key={collab.user_id} value={collab.user_id}>
                          <div className="flex flex-col w-full min-w-0">
                            <span className="font-medium break-words whitespace-normal">{collab.user?.email}</span>
                            <span className="text-xs text-gray-500 break-words whitespace-normal">
                              Rôle actuel: {
                                collab.role === 'viewer' ? 'Lecteur' :
                                collab.role === 'editor' ? 'Éditeur' :
                                collab.role === 'admin' ? 'Administrateur' :
                                collab.role
                              }
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Info about what happens */}
              {selectedCollaborator && (
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm space-y-1">
                    <p><strong>Ce qui va se passer :</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                      <li>
                        <strong>{selectedCollaborator.user?.email}</strong> deviendra propriétaire du projet
                      </li>
                      <li>Vous deviendrez automatiquement <strong>Administrateur</strong></li>
                      <li>L'événement sera enregistré dans l'historique du projet</li>
                      <li>Le nouveau propriétaire aura tous les droits (y compris la suppression du projet)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isTransferring}>
                Annuler
              </Button>
              <Button
                onClick={() => setShowConfirmation(true)}
                disabled={!selectedCollaboratorId || activeCollaborators.length === 0}
                className="btn-primary"
              >
                Continuer
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Confirmation Step */}
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
                  <strong>Dernière confirmation</strong>
                  <p className="mt-2">
                    Êtes-vous absolument sûr de vouloir transférer la propriété de{' '}
                    <strong>{projectName}</strong> à{' '}
                    <strong>{selectedCollaborator?.user?.email}</strong> ?
                  </p>
                  <p className="mt-2">
                    Cette action est <strong>irréversible</strong>. Seul le nouveau propriétaire
                    pourra vous redonner les droits de propriétaire.
                  </p>
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isTransferring}
              >
                Retour
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={isTransferring}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isTransferring ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Transfert en cours...
                  </>
                ) : (
                  'Confirmer le transfert'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OwnershipTransferDialog;
