import React, { useState } from 'react';
import { History, Clock, User, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ContentBlock } from '@/types/resourceTypes';

interface ResourceVersion {
  id: string;
  resource_id: string;
  organization_id: string;
  version_number: number;
  title: string;
  content: ContentBlock[];
  change_summary: string | null;
  created_by: string;
  created_at: string;
  creator?: {
    email: string;
    full_name?: string;
  };
}

interface VersionHistoryDialogProps {
  resourceId: string;
  organizationId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore?: (version: ResourceVersion) => void;
}

export function VersionHistoryDialog({
  resourceId,
  organizationId,
  isOpen,
  onClose,
  onRestore
}: VersionHistoryDialogProps) {
  const [selectedVersion, setSelectedVersion] = useState<ResourceVersion | null>(null);
  const queryClient = useQueryClient();

  // Fetch versions
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['resource-versions', resourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resource_versions')
        .select(`
          *,
          creator:created_by(email, full_name:raw_user_meta_data->full_name)
        `)
        .eq('resource_id', resourceId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data as ResourceVersion[];
    },
    enabled: isOpen
  });

  // Restore version mutation
  const restoreVersionMutation = useMutation({
    mutationFn: async (version: ResourceVersion) => {
      const { error } = await supabase
        .from('organization_resources')
        .update({
          title: version.title,
          content: version.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', resourceId);

      if (error) throw error;
      return version;
    },
    onSuccess: (version) => {
      queryClient.invalidateQueries({ queryKey: ['organization-resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource-versions', resourceId] });
      toast({
        title: 'Version restaurée',
        description: `Version ${version.version_number} restaurée avec succès`
      });
      if (onRestore) {
        onRestore(version);
      }
      onClose();
    },
    onError: (error) => {
      console.error('Error restoring version:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de restaurer cette version',
        variant: 'destructive'
      });
    }
  });

  const handleRestore = (version: ResourceVersion) => {
    if (confirm(`Êtes-vous sûr de vouloir restaurer la version ${version.version_number} ? Les modifications actuelles seront sauvegardées dans l'historique.`)) {
      restoreVersionMutation.mutate(version);
    }
  };

  const getBlockCount = (content: ContentBlock[]) => {
    let count = 0;
    const countBlocks = (blocks: ContentBlock[]) => {
      blocks.forEach(block => {
        count++;
        // Count nested blocks
        if ('tabs' in block.data && block.data.tabs) {
          block.data.tabs.forEach((tab: any) => {
            if (tab.blocks) countBlocks(tab.blocks);
          });
        }
        if ('columns' in block.data && block.data.columns) {
          block.data.columns.forEach((col: any) => {
            if (col.blocks) countBlocks(col.blocks);
          });
        }
        if ('sections' in block.data && block.data.sections) {
          block.data.sections.forEach((section: any) => {
            if (section.blocks) countBlocks(section.blocks);
          });
        }
        if ('blocks' in block.data && Array.isArray(block.data.blocks)) {
          countBlocks(block.data.blocks);
        }
        if ('cells' in block.data && block.data.cells) {
          block.data.cells.forEach((cell: any) => {
            if (cell.blocks) countBlocks(cell.blocks);
          });
        }
      });
    };
    countBlocks(content);
    return count;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1100px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Historique des versions
          </DialogTitle>
          <DialogDescription>
            Parcourez toutes les versions sauvegardées de cette ressource. Chaque modification importante est automatiquement versionnée. Vous pouvez restaurer n'importe quelle version précédente, et la version actuelle sera automatiquement sauvegardée avant la restauration.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Versions list */}
          <div className="w-2/5 border-r pr-6">
            <h3 className="font-semibold text-sm mb-3 text-gray-700">Toutes les versions</h3>
            <ScrollArea className="h-[calc(85vh-240px)]">
              {isLoading ? (
                <div className="text-center text-sm text-gray-500 py-8">Chargement...</div>
              ) : versions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Aucune version dans l'historique
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Les versions sont créées automatiquement à chaque modification
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      onClick={() => setSelectedVersion(version)}
                      className={cn(
                        'p-3 border rounded-lg cursor-pointer transition-colors hover:border-primary',
                        selectedVersion?.id === version.id && 'border-primary bg-orange-50'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-sm">
                            Version {version.version_number}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {version.title}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(version.created_at), 'Pp', { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {version.creator?.full_name || version.creator?.email || 'Utilisateur'}
                        </span>
                      </div>

                      {version.change_summary && (
                        <div className="mt-2 text-xs text-gray-600 italic">
                          {version.change_summary}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Version details */}
          <div className="w-3/5 pl-6">
            {selectedVersion ? (
              <ScrollArea className="h-[calc(85vh-240px)]">
                <div className="space-y-6">
                  {/* Header info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Version {selectedVersion.version_number}</h3>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Titre de la ressource</label>
                          <p className="text-sm font-medium mt-1">{selectedVersion.title}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date de création</label>
                          <p className="text-sm font-medium mt-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {format(new Date(selectedVersion.created_at), 'PPp', { locale: fr })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Créée par</label>
                          <p className="text-sm font-medium mt-1 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {selectedVersion.creator?.full_name || selectedVersion.creator?.email || 'Utilisateur inconnu'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre de blocs</label>
                          <p className="text-sm font-medium mt-1">{getBlockCount(selectedVersion.content)} blocs de contenu</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Change summary */}
                  {selectedVersion.change_summary && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Résumé des modifications</label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">{selectedVersion.change_summary}</p>
                      </div>
                    </div>
                  )}

                  {/* Content structure preview */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Structure du contenu</label>
                    <div className="bg-gray-50 border rounded-lg p-4 max-h-[200px] overflow-y-auto">
                      <div className="space-y-1 text-sm">
                        {selectedVersion.content && selectedVersion.content.length > 0 ? (
                          selectedVersion.content.slice(0, 10).map((block, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-gray-600">
                              <span className="text-xs text-gray-400">•</span>
                              <span className="capitalize">{block.type.replace('_', ' ')}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-xs">Aucun contenu dans cette version</p>
                        )}
                        {selectedVersion.content && selectedVersion.content.length > 10 && (
                          <div className="text-xs text-gray-400 pt-2">
                            ... et {selectedVersion.content.length - 10} autres blocs
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Restore section */}
                  <div className="pt-4 border-t">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-sm text-orange-900 mb-2">⚠️ À propos de la restauration</h4>
                      <ul className="text-xs text-orange-800 space-y-1.5">
                        <li>• La version actuelle de la ressource sera automatiquement sauvegardée</li>
                        <li>• Le contenu sera remplacé par celui de la version {selectedVersion.version_number}</li>
                        <li>• Cette action est réversible - vous pourrez toujours revenir en arrière</li>
                        <li>• Un nouveau numéro de version sera créé après la restauration</li>
                      </ul>
                    </div>

                    <Button
                      onClick={() => handleRestore(selectedVersion)}
                      className="w-full btn-white-label"
                      size="lg"
                      disabled={restoreVersionMutation.isPending}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {restoreVersionMutation.isPending ? 'Restauration en cours...' : 'Restaurer cette version'}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="bg-gray-100 rounded-full p-4 mb-4">
                  <History className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-2">Aucune version sélectionnée</p>
                <p className="text-sm text-gray-400 max-w-xs">
                  Cliquez sur une version dans la liste de gauche pour afficher ses détails et la restaurer si nécessaire
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VersionHistoryDialog;
