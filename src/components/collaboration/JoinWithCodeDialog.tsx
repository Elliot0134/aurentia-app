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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShareCodeService } from '@/services/shareCode.service';
import { ProjectShareCode } from '@/types/collaboration';
import {
  Link2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Users,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface JoinWithCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

const JoinWithCodeDialog: React.FC<JoinWithCodeDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [shareCode, setShareCode] = useState<ProjectShareCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCodeChange = (value: string) => {
    setCode(value.toUpperCase());
    setError(null);
    setShareCode(null);
  };

  const handleValidateCode = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer un code');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const result = await ShareCodeService.validateShareCode(code);
      if (result.valid && result.shareCode) {
        setShareCode(result.shareCode);
        setError(null);
      } else {
        setError(result.error || 'Code invalide');
        setShareCode(null);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la validation');
      setShareCode(null);
    } finally {
      setValidating(false);
    }
  };

  const handleJoinProject = async () => {
    if (!code || !shareCode) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Non authentifié',
        description: 'Vous devez être connecté pour rejoindre un projet',
        variant: 'destructive'
      });
      return;
    }

    setJoining(true);

    try {
      const result = await ShareCodeService.useShareCode(code, user.id);
      if (result.success && result.projectId) {
        toast({
          title: 'Projet rejoint !',
          description: 'Vous avez rejoint le projet avec succès',
        });

        // Reset and close
        handleClose();

        // Call success callback
        if (onSuccess) {
          onSuccess(result.projectId);
        }
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de rejoindre le projet',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setJoining(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setShareCode(null);
    setError(null);
    onClose();
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'viewer': 'Lecteur',
      'editor': 'Éditeur',
      'admin': 'Administrateur'
    };
    return labels[role] || role;
  };

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      'viewer': 'Accès en lecture seule',
      'editor': 'Peut créer et modifier du contenu',
      'admin': 'Accès complet avec gestion d\'équipe'
    };
    return descriptions[role] || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 size={20} className="text-blue-600" />
            Rejoindre avec un code
          </DialogTitle>
          <DialogDescription>
            Entrez le code d'invitation pour rejoindre un projet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Code Input */}
          <div className="space-y-2">
            <Label htmlFor="code">Code d'invitation</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                type="text"
                placeholder="Entrer le code..."
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !shareCode) {
                    handleValidateCode();
                  }
                }}
                className="uppercase font-mono"
                disabled={validating || joining}
                maxLength={12}
              />
              {!shareCode && (
                <Button
                  onClick={handleValidateCode}
                  disabled={validating || !code.trim()}
                  variant="outline"
                >
                  {validating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Valider'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Valid Code Info */}
          {shareCode && (
            <div className="space-y-3">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 text-sm font-medium">
                  Code valide !
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Projet
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {shareCode.project?.nom_projet || 'Projet'}
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Shield size={18} className="text-blue-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                      Votre rôle
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {getRoleLabel(shareCode.role)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {getRoleDescription(shareCode.role)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <Users size={14} className="text-gray-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {shareCode.current_uses}/{shareCode.max_uses} utilisations
                    </span>
                  </div>
                  {shareCode.expires_at && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <Clock size={14} className="text-gray-600" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Expire le {new Date(shareCode.expires_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={joining}
          >
            Annuler
          </Button>
          {shareCode && (
            <Button
              onClick={handleJoinProject}
              disabled={joining}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {joining ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Rejoindre...
                </>
              ) : (
                'Rejoindre le projet'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinWithCodeDialog;
