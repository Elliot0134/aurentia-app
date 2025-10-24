import React, { useState } from 'react';
import { Save, BookMarked, Search, Plus, Trash2, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { ContentBlock } from '@/types/resourceTypes';

interface BlockLibraryItem {
  id: string;
  organization_id: string;
  created_by: string;
  name: string;
  description: string | null;
  block_data: ContentBlock;
  block_type: string;
  category: string;
  tags: string[];
  is_public: boolean;
  use_count: number;
  created_at: string;
}

interface BlockLibraryDialogProps {
  organizationId: string;
  isOpen: boolean;
  onClose: () => void;
  onInsertBlock?: (block: ContentBlock) => void;
  blockToSave?: ContentBlock | null;
}

export function BlockLibraryDialog({
  organizationId,
  isOpen,
  onClose,
  onInsertBlock,
  blockToSave
}: BlockLibraryDialogProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'save'>(blockToSave ? 'save' : 'browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const queryClient = useQueryClient();

  // Fetch library blocks
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['block-library', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('block_library')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BlockLibraryItem[];
    },
    enabled: isOpen
  });

  // Save block mutation
  const saveBlockMutation = useMutation({
    mutationFn: async () => {
      if (!blockToSave || !saveName.trim()) {
        throw new Error('Missing required data');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('block_library')
        .insert({
          organization_id: organizationId,
          created_by: user.id,
          name: saveName.trim(),
          description: saveDescription.trim() || null,
          block_data: blockToSave,
          block_type: blockToSave.type,
          category: 'custom'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['block-library', organizationId] });
      toast({ title: 'Bloc sauvegardé dans la bibliothèque' });
      setSaveName('');
      setSaveDescription('');
      setActiveTab('browse');
    },
    onError: (error) => {
      console.error('Error saving block:', error);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder le bloc', variant: 'destructive' });
    }
  });

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const { error } = await supabase
        .from('block_library')
        .delete()
        .eq('id', blockId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['block-library', organizationId] });
      toast({ title: 'Bloc supprimé de la bibliothèque' });
    }
  });

  // Insert block mutation (increment use count)
  const insertBlockMutation = useMutation({
    mutationFn: async (block: BlockLibraryItem) => {
      // Increment use count
      const { error } = await supabase.rpc('increment_block_use_count', {
        block_id: block.id
      });

      if (error) console.error('Error incrementing use count:', error);

      // Insert the block
      if (onInsertBlock) {
        onInsertBlock(block.block_data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['block-library', organizationId] });
      toast({ title: 'Bloc inséré' });
      onClose();
    }
  });

  const filteredBlocks = blocks.filter(block =>
    block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBlockTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'Texte',
      image: 'Image',
      video: 'Vidéo',
      code: 'Code',
      quote: 'Citation',
      table: 'Tableau',
      tabs: 'Onglets',
      columns: 'Colonnes',
      grid: 'Grille'
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-primary" />
            Bibliothèque de blocs
          </DialogTitle>
          <DialogDescription>
            Réutilisez vos blocs favoris ou sauvegardez-en de nouveaux
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'browse' | 'save')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Parcourir</TabsTrigger>
            <TabsTrigger value="save" disabled={!blockToSave}>Sauvegarder</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="flex-1 flex flex-col mt-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher dans la bibliothèque..."
                className="pl-10"
              />
            </div>

            {/* Blocks list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center text-sm text-gray-500 py-8">Chargement...</div>
              ) : filteredBlocks.length === 0 ? (
                <div className="text-center py-12">
                  <BookMarked className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {searchTerm ? 'Aucun bloc trouvé' : 'Aucun bloc dans la bibliothèque'}
                  </p>
                </div>
              ) : (
                filteredBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="p-4 border rounded-lg hover:border-primary transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{block.name}</h4>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                            {getBlockTypeLabel(block.block_type)}
                          </span>
                        </div>
                        {block.description && (
                          <p className="text-xs text-gray-600">{block.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => insertBlockMutation.mutate(block)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-red-600 hover:text-red-700"
                          onClick={() => deleteBlockMutation.mutate(block.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {block.use_count} utilisations
                      </span>
                      <span>{new Date(block.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Save Tab */}
          <TabsContent value="save" className="flex-1 flex flex-col mt-4">
            {blockToSave ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="block-name">Nom du bloc *</Label>
                  <Input
                    id="block-name"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Ex: En-tête avec image"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="block-description">Description (optionnel)</Label>
                  <Textarea
                    id="block-description"
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    placeholder="Décrivez ce bloc pour le retrouver facilement..."
                    className="mt-1.5 min-h-[80px]"
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="text-xs font-medium text-gray-700 mb-1">Aperçu</div>
                  <div className="text-sm">
                    <span className="px-2 py-1 bg-white rounded border text-xs">
                      {getBlockTypeLabel(blockToSave.type)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => saveBlockMutation.mutate()}
                  disabled={!saveName.trim() || saveBlockMutation.isPending}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder dans la bibliothèque
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm">
                Sélectionnez un bloc à sauvegarder
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default BlockLibraryDialog;
