import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Globe, FileText, Type, Search, Filter, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import KnowledgeBaseHeader from '@/components/knowledge-base/KnowledgeBaseHeader';
import KnowledgeBaseList from '@/components/knowledge-base/KnowledgeBaseList';
import SubscriptionGate from '@/components/knowledge-base/SubscriptionGate';
import AddUrlModal from '@/components/knowledge-base/AddUrlModal';
import AddFilesModal from '@/components/knowledge-base/AddFilesModal';
import CreateTextModal from '@/components/knowledge-base/CreateTextModal';
import {
  useProjectKnowledgeBase,
  useCreateProjectKnowledgeBaseItem,
  useDeleteProjectKnowledgeBaseItem,
} from '@/hooks/useKnowledgeBase';
import { useProjectKnowledgeBaseStorage } from '@/hooks/useKnowledgeBaseStorage';
import type {
  ProjectKnowledgeBaseItem,
  UrlContentData,
  DocumentContentData,
  TextContentData,
} from '@/types/knowledgeBaseTypes';

const KnowledgeBase: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const { currentProjectId } = useProject();
  const activeProjectId = projectId || currentProjectId;

  // Get search from URL params (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Function to update search in URL
  const setSearchQuery = (search: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (search) {
      newParams.set('search', search);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  // State
  const [addUrlModalOpen, setAddUrlModalOpen] = useState(false);
  const [addFilesModalOpen, setAddFilesModalOpen] = useState(false);
  const [createTextModalOpen, setCreateTextModalOpen] = useState(false);
  const [viewItemModalOpen, setViewItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProjectKnowledgeBaseItem | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID
  React.useEffect(() => {
    const fetchUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUserId();
  }, []);

  // Hooks
  const { data: items = [], isLoading: isLoadingItems } = useProjectKnowledgeBase(activeProjectId);
  const storage = useProjectKnowledgeBaseStorage(activeProjectId);
  const createItem = useCreateProjectKnowledgeBaseItem();
  const deleteItem = useDeleteProjectKnowledgeBaseItem();

  // Filter and search items
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [items, searchQuery]);

  // Handle add URL
  const handleAddUrl = async (title: string, contentData: UrlContentData, tags: string[]) => {
    if (!activeProjectId || !userId) {
      toast({
        title: 'Erreur',
        description: 'Projet ou utilisateur introuvable.',
        variant: 'destructive',
      });
      return;
    }

    await createItem.mutateAsync({
      project_id: activeProjectId,
      user_id: userId,
      title,
      content_type: 'url',
      content_data: contentData,
      tags,
    });
  };

  // Handle add files
  const handleAddFiles = async (
    title: string,
    contentData: DocumentContentData,
    tags: string[],
    fileSize: number,
    fileUrl: string
  ) => {
    if (!activeProjectId || !userId) {
      toast({
        title: 'Erreur',
        description: 'Projet ou utilisateur introuvable.',
        variant: 'destructive',
      });
      return;
    }

    // Check storage limit
    const uploadCheck = storage.canUpload(fileSize);
    if (!uploadCheck.canUpload) {
      toast({
        title: 'Limite de stockage atteinte',
        description: uploadCheck.reason,
        variant: 'destructive',
      });
      throw new Error(uploadCheck.reason);
    }

    await createItem.mutateAsync({
      project_id: activeProjectId,
      user_id: userId,
      title,
      content_type: 'document',
      content_data: contentData,
      file_size: fileSize,
      file_url: fileUrl,
      tags,
    });
  };

  // Handle create text
  const handleCreateText = async (title: string, contentData: TextContentData, tags: string[]) => {
    if (!activeProjectId || !userId) {
      toast({
        title: 'Erreur',
        description: 'Projet ou utilisateur introuvable.',
        variant: 'destructive',
      });
      return;
    }

    await createItem.mutateAsync({
      project_id: activeProjectId,
      user_id: userId,
      title,
      content_type: 'text',
      content_data: contentData,
      tags,
    });
  };

  // Handle view item
  const handleViewItem = (item: ProjectKnowledgeBaseItem) => {
    setSelectedItem(item);
    setViewItemModalOpen(true);
  };

  // Handle delete item
  const handleDeleteItem = async (item: ProjectKnowledgeBaseItem) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.title}" ?`)) {
      return;
    }

    await deleteItem.mutateAsync({
      itemId: item.id,
      projectId: item.project_id,
      fileUrl: item.file_url,
    });
  };

  // Handle unlock
  const handleUnlock = () => {
    navigate('/individual/profile'); // Navigate to subscription page
  };

  // Show storage warning
  React.useEffect(() => {
    if (storage.warningMessage && storage.warningLevel !== 'none') {
      toast({
        title: storage.warningLevel === 'full' ? 'Stockage plein' : 'Avertissement de stockage',
        description: storage.warningMessage,
        variant: storage.warningLevel === 'full' || storage.warningLevel === 'critical' ? 'destructive' : 'default',
      });
    }
  }, [storage.warningLevel]);

  // If no project selected
  if (!activeProjectId) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Aucun projet sélectionné</h3>
              <p className="text-yellow-700">
                Veuillez sélectionner un projet dans la barre latérale pour accéder à sa base de connaissance.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F1] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Subscription Gate */}
      <SubscriptionGate
        isBlocked={!storage.hasAccess}
        reason={storage.accessDeniedReason}
        onUnlockClick={handleUnlock}
      >
        <div className="space-y-6">
          {/* Header with Storage Indicator */}
          {!storage.isLoading && (
            <KnowledgeBaseHeader
              usedBytes={storage.usedBytes}
              limitBytes={storage.limitBytes}
              percentage={storage.limitDetails.percentage}
              warningLevel={storage.warningLevel}
            />
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <button
            onClick={() => setAddUrlModalOpen(true)}
            className="group flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:bg-gradient-to-br hover:from-aurentia-pink/5 hover:to-aurentia-orange/5 hover:border-aurentia-pink hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            aria-label="Ajouter une URL"
          >
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-aurentia-pink to-aurentia-orange flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-900 block">Ajouter URL</span>
              <span className="text-xs text-gray-500">Importez depuis le web</span>
            </div>
          </button>

          <button
            onClick={() => setAddFilesModalOpen(true)}
            className="group flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:bg-gradient-to-br hover:from-aurentia-pink/5 hover:to-aurentia-orange/5 hover:border-aurentia-pink hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            aria-label="Ajouter des fichiers"
          >
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-aurentia-pink to-aurentia-orange flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-900 block">Ajouter Fichiers</span>
              <span className="text-xs text-gray-500">PDF, DOCX, TXT...</span>
            </div>
          </button>

          <button
            onClick={() => setCreateTextModalOpen(true)}
            className="group flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:bg-gradient-to-br hover:from-aurentia-pink/5 hover:to-aurentia-orange/5 hover:border-aurentia-pink hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            aria-label="Créer du texte"
          >
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-aurentia-pink to-aurentia-orange flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Type className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-900 block">Créer Texte</span>
              <span className="text-xs text-gray-500">Ajoutez du contenu</span>
            </div>
          </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-aurentia-pink transition-colors" />
              <Input
                type="text"
                placeholder="Rechercher dans votre base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-aurentia-pink focus:ring-2 focus:ring-aurentia-pink/20 transition-all"
                aria-label="Rechercher des documents"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              className="flex items-center justify-center gap-2 px-4 h-11 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-aurentia-pink hover:shadow-md transition-all duration-200"
              aria-label="Filtrer par type"
            >
              <Filter className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-900 hidden sm:inline">Filtres</span>
            </button>
          </div>

          {/* List */}
          <KnowledgeBaseList
            items={filteredItems}
            onViewItem={handleViewItem}
            onDeleteItem={handleDeleteItem}
            isLoading={isLoadingItems}
          />
        </div>
      </SubscriptionGate>

      {/* Modals */}
      <AddUrlModal
        isOpen={addUrlModalOpen}
        onClose={() => setAddUrlModalOpen(false)}
        onSubmit={handleAddUrl}
      />

      <AddFilesModal
        isOpen={addFilesModalOpen}
        onClose={() => setAddFilesModalOpen(false)}
        onSubmit={handleAddFiles}
        bucket="knowledge-base-files"
        folderPath={userId || ''}
        canUpload={storage.canUpload}
        remainingStorage={storage.limitDetails.remaining_bytes}
      />

      <CreateTextModal
        isOpen={createTextModalOpen}
        onClose={() => setCreateTextModalOpen(false)}
        onSubmit={handleCreateText}
      />

      {/* View Item Modal */}
      {selectedItem && (
        <Dialog open={viewItemModalOpen} onOpenChange={setViewItemModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedItem.title}</DialogTitle>
              <DialogDescription>
                {selectedItem.content_type === 'url' && 'URL'}
                {selectedItem.content_type === 'document' && 'Document'}
                {selectedItem.content_type === 'text' && 'Texte'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedItem.content_type === 'url' && (
                <div>
                  <a
                    href={selectedItem.content_data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-aurentia-pink hover:underline"
                  >
                    {selectedItem.content_data.url}
                  </a>
                  {selectedItem.content_data.description && (
                    <p className="mt-4 text-gray-600">{selectedItem.content_data.description}</p>
                  )}
                </div>
              )}
              {selectedItem.content_type === 'document' && (
                <div>
                  <Button
                    onClick={() => window.open(selectedItem.file_url, '_blank')}
                    className="bg-gradient-primary"
                  >
                    Ouvrir le document
                  </Button>
                </div>
              )}
              {selectedItem.content_type === 'text' && (
                <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
                  {selectedItem.content_data.text}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
