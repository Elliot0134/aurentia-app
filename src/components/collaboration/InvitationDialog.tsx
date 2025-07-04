import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Mail, Eye, Edit, FolderSearch } from 'lucide-react';
import { toast } from 'sonner';
import { useProject } from '@/contexts/ProjectContext';
import { collaborationManager } from '@/services/collaborationManager';

interface InvitationDialogProps {
  trigger?: React.ReactNode;
  defaultProjectId?: string;
  onInvitationSent?: () => void;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  showProjectSelector?: boolean;
}

const InvitationDialog: React.FC<InvitationDialogProps> = ({
  trigger,
  defaultProjectId,
  onInvitationSent,
  buttonText = "Inviter un collaborateur",
  buttonVariant = "default",
  buttonSize = "default",
  showProjectSelector = true
}) => {
  const { userProjects } = useProject();
  
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'reader' | 'editor'>('reader');
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
  const [loading, setLoading] = useState(false);

  // Initialiser le projet sélectionné si pas de defaultProjectId
  React.useEffect(() => {
    if (!defaultProjectId && userProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(userProjects[0].project_id);
    }
  }, [userProjects, defaultProjectId, selectedProjectId]);

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('Veuillez entrer une adresse email');
      return;
    }

    const projectId = defaultProjectId || selectedProjectId;
    if (!projectId) {
      toast.error('Veuillez sélectionner un projet');
      return;
    }

    // Vérifier si l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);

    try {
      const result = await collaborationManager.inviteByEmail(
        projectId,
        inviteEmail,
        inviteRole
      );

      if (result.success) {
        toast.success(`Invitation envoyée à ${inviteEmail}`);
        setInviteEmail('');
        setInviteRole('reader');
        setIsOpen(false);
        
        // Callback pour recharger les données si nécessaire
        if (onInvitationSent) {
          onInvitationSent();
        }
      } else {
        toast.error(`Erreur: ${result.error}`);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  const getProjectName = (projectId: string) => {
    const project = userProjects.find(p => p.project_id === projectId);
    return project?.nom_projet || projectId;
  };

  const defaultTrigger = (
    <Button 
      variant={buttonVariant} 
      size={buttonSize}
      className="flex items-center gap-2"
    >
      <UserPlus className="w-4 h-4" />
      {buttonText}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto my-4 sm:w-full">
        <DialogHeader>
          <DialogTitle>Inviter un nouveau collaborateur</DialogTitle>
          <DialogDescription>
            Envoyez une invitation par email pour donner accès à votre projet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="collaborateur@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="pl-10 placeholder:text-xs"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role">Rôle</Label>
            <Select 
              value={inviteRole} 
              onValueChange={(value) => setInviteRole(value as 'reader' | 'editor')}
              disabled={loading}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reader">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Lecteur - Peut consulter le projet
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div className="flex items-center">
                    <Edit className="w-4 h-4 mr-2" />
                    Éditeur - Peut modifier le projet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {showProjectSelector && !defaultProjectId && (
            <div className="grid gap-2">
              <Label htmlFor="selected-project">Projet</Label>
              <Select 
                value={selectedProjectId} 
                onValueChange={setSelectedProjectId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {userProjects.map(project => (
                    <SelectItem key={project.project_id} value={project.project_id}>
                      <div className="flex items-center gap-2">
                        <FolderSearch className="w-4 h-4" />
                        {project.nom_projet}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {defaultProjectId && (
            <div className="grid gap-2">
              <Label>Projet sélectionné</Label>
              <div className="p-2 bg-gray-100 rounded text-sm flex items-center gap-2">
                <FolderSearch className="w-4 h-4" />
                {getProjectName(defaultProjectId)}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)} 
            className="mr-2 flex-1"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleInvite} 
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Envoi...' : 'Envoyer l\'invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationDialog;
