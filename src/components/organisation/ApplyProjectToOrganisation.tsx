import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Send, CheckCircle2, Clock, FolderOpen, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApplyProjectToOrganisationProps {
  userProjects: Array<{
    project_id: string;
    nom_projet: string;
    statut_project?: string;
    linked_to_organization?: boolean;
  }>;
  organisationId: string;
  organisationName: string;
  onSuccess?: () => void;
}

const ApplyProjectToOrganisation: React.FC<ApplyProjectToOrganisationProps> = ({
  userProjects,
  organisationId,
  organisationName,
  onSuccess
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Filter out projects already linked to an organization
  const availableProjects = userProjects.filter(p => !p.linked_to_organization);

  const selectedProject = userProjects.find(p => p.project_id === selectedProjectId);

  const handleSubmit = async () => {
    if (!selectedProjectId) {
      toast.error("Veuillez sélectionner un projet");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // Update project_summary to link to organization with "pending" validation status
      const { error: updateError } = await (supabase as any)
        .from('project_summary')
        .update({
          organization_id: organisationId,
          linked_to_organization: true,
          validation_status: 'pending', // Set as pending validation
          updated_at: new Date().toISOString()
        })
        .eq('project_id', selectedProjectId);

      if (updateError) throw updateError;

      // Log activity
      await (supabase as any).rpc('log_user_activity', {
        p_user_id: user.id,
        p_organization_id: organisationId,
        p_activity_type: 'project_application_submitted',
        p_description: `Demande de rattachement du projet "${selectedProject?.nom_projet}" à l'organisation`,
        p_entity_type: 'project',
        p_entity_id: selectedProjectId,
        p_metadata: {
          project_name: selectedProject?.nom_projet,
          organization_name: organisationName
        }
      }).catch(() => {
        // Ignore if activity log function doesn't exist yet
      });

      toast.success("Demande envoyée avec succès", {
        description: "Votre projet est en attente de validation par l'organisation"
      });

      setShowConfirmDialog(false);
      setSelectedProjectId('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error applying project to organization:', error);
      toast.error("Erreur lors de l'envoi de la demande", {
        description: "Veuillez réessayer plus tard"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDialog = () => {
    if (!selectedProjectId) {
      toast.error("Veuillez sélectionner un projet");
      return;
    }
    setShowConfirmDialog(true);
  };

  if (availableProjects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            Aucun projet disponible
          </p>
          <p className="text-sm text-muted-foreground">
            Tous vos projets sont déjà rattachés à une organisation
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Rattacher un projet existant</CardTitle>
                <CardDescription className="mt-1">
                  Soumettez l'un de vos projets pour validation par {organisationName}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sélectionnez un projet</label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisissez un de vos projets..." />
              </SelectTrigger>
              <SelectContent>
                {availableProjects.map((project) => (
                  <SelectItem key={project.project_id} value={project.project_id}>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      {project.nom_projet}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProject && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                <strong>Information :</strong> Une fois soumis, votre projet sera{' '}
                <Badge variant="outline" className="ml-1">En attente</Badge>{' '}
                de validation. Vous ne pourrez pas vous faire assigner de mentor tant que le projet n'est pas validé.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button
              onClick={handleOpenDialog}
              disabled={!selectedProjectId || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Soumettre pour validation
                </>
              )}
            </Button>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Après validation
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Votre projet apparaîtra dans les projets de l'organisation</li>
              <li>• Vous pourrez être assigné à un mentor</li>
              <li>• Vous aurez accès aux ressources de l'organisation</li>
              <li>• Vous participerez aux statistiques de l'organisation</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la soumission du projet</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de soumettre votre projet pour validation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Projet :</span>
                <span className="text-sm font-semibold">{selectedProject?.nom_projet}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Organisation :</span>
                <span className="text-sm font-semibold">{organisationName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Statut initial :</span>
                <Badge variant="outline">En attente</Badge>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Le projet sera soumis pour validation. Un administrateur de l'organisation devra 
                l'approuver avant que vous puissiez bénéficier du mentorat et des ressources.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Confirmer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplyProjectToOrganisation;
