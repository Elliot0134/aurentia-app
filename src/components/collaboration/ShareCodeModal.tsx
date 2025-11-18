import React, { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShareCodeService } from '@/services/shareCode.service';
import { ActivityLogService } from '@/services/activityLog.service';
import { ProjectShareCode, CollaboratorRole } from '@/types/collaboration';
import {
  Link2,
  Copy,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShareCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName?: string;
}

const ShareCodeModal: React.FC<ShareCodeModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName
}) => {
  const [shareCodes, setShareCodes] = useState<ProjectShareCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state for generating new code
  const [role, setRole] = useState<CollaboratorRole>('viewer');
  const [maxUses, setMaxUses] = useState('5');
  const [expiresInDays, setExpiresInDays] = useState('7');

  // Load existing share codes
  useEffect(() => {
    if (isOpen && projectId) {
      loadShareCodes();
    }
  }, [isOpen, projectId]);

  const loadShareCodes = async () => {
    setLoading(true);
    try {
      const codes = await ShareCodeService.getProjectShareCodes(projectId);
      setShareCodes(codes);
    } catch (error) {
      console.error('Error loading share codes:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les codes d\'invitation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const result = await ShareCodeService.createShareCode(
        projectId,
        role as Exclude<CollaboratorRole, 'owner'>,
        parseInt(maxUses) || 5,
        parseInt(expiresInDays) || undefined
      );

      if (result.success && result.shareCode) {
        toast({
          title: 'Code créé !',
          description: `Le code ${result.shareCode.code} a été généré avec succès`,
        });

        // Log activity
        const { data: { user } } = await import('@/integrations/supabase/client').then(m => m.supabase.auth.getUser());
        if (user) {
          await ActivityLogService.logShareCodeCreated(
            projectId,
            user.id,
            result.shareCode.code,
            role,
            parseInt(maxUses)
          );
        }

        // Reload codes
        await loadShareCodes();

        // Reset form
        setRole('viewer');
        setMaxUses('5');
        setExpiresInDays('7');
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de générer le code',
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
      setGenerating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      const shareUrl = `${window.location.origin}/join-project?code=${code}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedCode(code);
      toast({
        title: 'Copié !',
        description: 'Le lien d\'invitation a été copié dans le presse-papiers',
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le code',
        variant: 'destructive'
      });
    }
  };

  const handleDeactivateCode = async (codeId: string, code: string) => {
    try {
      const result = await ShareCodeService.deactivateShareCode(codeId);
      if (result.success) {
        toast({
          title: 'Code désactivé',
          description: `Le code ${code} a été désactivé`,
        });

        // Log activity
        const { data: { user } } = await import('@/integrations/supabase/client').then(m => m.supabase.auth.getUser());
        if (user) {
          await ActivityLogService.logShareCodeDeactivated(projectId, user.id, code);
        }

        await loadShareCodes();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de désactiver le code',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'viewer': 'Lecteur',
      'editor': 'Éditeur',
      'admin': 'Administrateur'
    };
    return labels[role] || role;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 size={20} className="text-blue-600" />
            Codes d'invitation partagés
          </DialogTitle>
          <DialogDescription>
            Générez des codes partageables pour inviter plusieurs personnes à rejoindre{' '}
            {projectName || 'votre projet'}.
          </DialogDescription>
        </DialogHeader>

        {/* Generate New Code Section */}
        <div className="space-y-4 border-b pb-4">
          <h3 className="font-semibold text-sm">Générer un nouveau code</h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs">Rôle</Label>
              <Select value={role} onValueChange={(value) => setRole(value as CollaboratorRole)}>
                <SelectTrigger id="role" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-w-full">
                  <SelectItem value="viewer">Lecteur</SelectItem>
                  <SelectItem value="editor">Éditeur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUses" className="text-xs">Max utilisations</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                max="100"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresIn" className="text-xs">Expire dans (jours)</Label>
              <Input
                id="expiresIn"
                type="number"
                min="1"
                max="90"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="h-9"
                placeholder="7"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateCode}
            disabled={generating}
            className="w-full btn-primary"
            size="sm"
          >
            {generating ? 'Génération...' : 'Générer le code'}
          </Button>
        </div>

        {/* Active Codes List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Codes actifs</h3>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Chargement...
            </div>
          ) : shareCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Link2 size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun code actif</p>
              <p className="text-xs text-gray-400 mt-1">
                Générez un code pour inviter des collaborateurs
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {shareCodes.map((shareCode) => (
                <div
                  key={shareCode.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                          {shareCode.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyCode(shareCode.code)}
                        >
                          {copiedCode === shareCode.code ? (
                            <CheckCircle size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {getRoleLabel(shareCode.role)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {shareCode.current_uses}/{shareCode.max_uses} utilisations
                        </span>
                        {shareCode.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Expire le {formatDate(shareCode.expires_at)}
                          </span>
                        )}
                      </div>

                      {/* Warnings */}
                      {ShareCodeService.isExpiringSoon(shareCode) && (
                        <Alert className="mt-2 py-1 px-2 border-yellow-200 bg-yellow-50">
                          <AlertCircle className="h-3 w-3 text-yellow-600" />
                          <AlertDescription className="text-xs text-yellow-700">
                            Expire bientôt
                          </AlertDescription>
                        </Alert>
                      )}
                      {ShareCodeService.isAlmostFull(shareCode) && (
                        <Alert className="mt-2 py-1 px-2 border-orange-200 bg-orange-50">
                          <AlertCircle className="h-3 w-3 text-orange-600" />
                          <AlertDescription className="text-xs text-orange-700">
                            Presque toutes les utilisations sont épuisées
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeactivateCode(shareCode.id, shareCode.code)}
                      title="Désactiver le code"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareCodeModal;
