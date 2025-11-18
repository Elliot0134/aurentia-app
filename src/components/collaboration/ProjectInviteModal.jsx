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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RolePermissionsPreview from './RolePermissionsPreview';
import { Mail, UserPlus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { ActivityLogService } from '@/services/activityLog.service';
import { supabase } from '@/integrations/supabase/client';

const ProjectInviteModal = ({
  isOpen,
  onClose,
  onInvite,
  projectId,
  projectName = 'ce projet',
  loading = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    email: '',
    role: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const roles = [
    {
      value: 'viewer',
      label: 'Lecteur',
      description: 'Peut uniquement consulter les projets et livrables (lecture seule)'
    },
    {
      value: 'editor',
      label: 'Éditeur',
      description: 'Peut modifier les projets, créer et éditer des livrables'
    },
    {
      value: 'admin',
      label: 'Administrateur',
      description: 'Peut inviter des collaborateurs, gérer les rôles et accéder à tout'
    }
  ];

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    // Validation email
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    // Validation rôle
    if (!formData.role) {
      errors.role = 'Le rôle est requis';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gérer la soumission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Add projectId to the invitation data
    const invitationData = {
      ...formData,
      projects: [projectId]
    };

    const result = await onInvite(invitationData);

    if (result.success) {
      setSuccess(true);

      // Log activity for the project invitation
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && projectId) {
          await ActivityLogService.logInvitationSent(
            projectId,
            user.id,
            formData.email,
            formData.role
          );
        }
      } catch (error) {
        console.error('Error logging invitation activity:', error);
        // Don't block the success flow for logging errors
      }

      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  // Fermer la modal et réinitialiser
  const handleClose = () => {
    setFormData({ email: '', role: '' });
    setFormErrors({});
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            Inviter un collaborateur
          </DialogTitle>
          <DialogDescription>
            Invitez une personne à collaborer sur <strong>{projectName}</strong>. Elle recevra un email d'invitation.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Invitation envoyée !
            </h3>
            <p className="text-gray-600">
              L'invitation a été envoyée à {formData.email}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} />
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="collaborateur@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Rôle */}
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className={formErrors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.label}</span>
                        <span className="text-xs text-gray-500">{role.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-sm text-red-500">{formErrors.role}</p>
              )}

              {/* Permissions Preview */}
              {formData.role && (
                <RolePermissionsPreview role={formData.role} className="mt-3" />
              )}
            </div>

            {/* Erreur générale */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} className="mr-2" />
                    Envoyer l'invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProjectInviteModal;
