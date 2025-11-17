import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { chatbotService } from '@/services/chatbotService';
import { Users, Info, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ConversationShareDialogProps {
  conversationId: string;
  isShared: boolean;
  isOpen: boolean;
  onClose: () => void;
  onShareToggled?: () => void;
}

export const ConversationShareDialog: React.FC<ConversationShareDialogProps> = ({
  conversationId,
  isShared: initialIsShared,
  isOpen,
  onClose,
  onShareToggled,
}) => {
  const [isShared, setIsShared] = useState(initialIsShared);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleShare = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await chatbotService.toggleConversationSharing(conversationId, checked);
      setIsShared(checked);
      
      toast({
        title: checked ? 'Conversation partagée' : 'Conversation privée',
        description: checked 
          ? 'Tous les collaborateurs du projet peuvent maintenant voir cette conversation'
          : 'Cette conversation est maintenant privée',
      });

      onShareToggled?.();
    } catch (error: any) {
      console.error('Error toggling conversation sharing:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le partage de la conversation',
        variant: 'destructive',
      });
      // Revert the switch state
      setIsShared(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Partager la conversation
          </DialogTitle>
          <DialogDescription>
            Contrôlez qui peut voir et participer à cette conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Share Toggle */}
          <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="share-toggle" className="text-base font-medium">
                Partager avec les collaborateurs
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Permettre à tous les collaborateurs du projet de voir et participer
              </p>
            </div>
            <Switch
              id="share-toggle"
              checked={isShared}
              onCheckedChange={handleToggleShare}
              disabled={isUpdating}
            />
          </div>

          {/* Info Alert */}
          {isShared ? (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
                <strong>Conversation partagée</strong>
                <p className="mt-1">
                  Tous les collaborateurs (Éditeurs, Administrateurs et Propriétaire) 
                  peuvent voir et participer à cette conversation.
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-gray-200 bg-gray-50">
              <Info className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-gray-700 text-sm">
                <strong>Conversation privée</strong>
                <p className="mt-1">
                  Seul vous pouvez voir cette conversation. Les autres collaborateurs 
                  ne pourront pas y accéder.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
