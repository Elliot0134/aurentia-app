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
import ProjectSelector from './ProjectSelector';
import { Mail, UserPlus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const InviteModal = ({ 
  isOpen, 
  onClose, 
  onInvite, 
  projects = [], 
  loading = false,
  error = null 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    projects: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const roles = [
    {
      value: 'read',
      label: 'Lecteur',
      description: 'Peut consulter les projets et livrables'
    },
    {
      value: 'write',
      label: 'Éditeur',
      description: 'Peut modifier les projets et créer des livrables'
    },
    {
      value: 'admin',
      label: 'Administrateur',
      description: 'Accès complet à tous les projets et paramètres'
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

    // Validation projets (optionnel mais recommandé)
    if (formData.projects.length === 0) {
      errors.projects = 'Il est recommandé d\'assigner au moins un projet';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gérer la soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await onInvite(formData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  // Fermer la modal et réinitialiser
  const handleClose = () => {
    setFormData({ email: '', role: '', projects: [] });
    setFormErrors({});
    setSuccess(false);
    onClose();
  };

  // Obtenir la description du rôle sélectionné
  const getSelectedRoleDescription = () => {
    const role = roles.find(r => r.value === formData.role);
    return role ? role.description : '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            Inviter un nouveau collaborateur
          </DialogTitle>
          <DialogDescription>
            Invitez une personne à collaborer sur vos projets. Elle recevra un email d'invitation.
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
              {formData.role && (
                <p className="text-xs text-gray-600">{getSelectedRoleDescription()}</p>
              )}
              {formErrors.role && (
                <p className="text-sm text-red-500">{formErrors.role}</p>
              )}
            </div>

            {/* Projets */}
            <div className="space-y-2">
              <Label>Projets assignés</Label>
              <ProjectSelector
                projects={projects}
                selectedProjects={formData.projects}
                onChange={(projects) => setFormData(prev => ({ ...prev, projects }))}
                placeholder="Sélectionner des projets..."
                className={formErrors.projects ? 'border-red-500' : ''}
              />
              {formErrors.projects && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    {formErrors.projects}
                  </AlertDescription>
                </Alert>
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

export default InviteModal;