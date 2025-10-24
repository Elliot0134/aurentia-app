import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Globe, FileText, Type, Search, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import KnowledgeBaseHeader from '@/components/knowledge-base/KnowledgeBaseHeader';
import KnowledgeBaseList from '@/components/knowledge-base/KnowledgeBaseList';
import AddUrlModal from '@/components/knowledge-base/AddUrlModal';
import AddFilesModal from '@/components/knowledge-base/AddFilesModal';
import CreateTextModal from '@/components/knowledge-base/CreateTextModal';
import {
  useOrganizationKnowledgeBase,
  useCreateOrganizationKnowledgeBaseItem,
  useDeleteOrganizationKnowledgeBaseItem,
} from '@/hooks/useKnowledgeBase';
import { useOrganizationKnowledgeBaseStorage } from '@/hooks/useKnowledgeBaseStorage';
import type {
  OrganizationKnowledgeBaseItem,
  UrlContentData,
  DocumentContentData,
  TextContentData,
} from '@/types/knowledgeBaseTypes';

const OrganisationKnowledgeBase: React.FC = () => {
  const { organisationId } = useParams<{ organisationId: string }>();

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
  const [selectedItem, setSelectedItem] = useState<OrganizationKnowledgeBaseItem | null>(null);
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
  const { data: items = [], isLoading: isLoadingItems } = useOrganizationKnowledgeBase(organisationId);
  const storage = useOrganizationKnowledgeBaseStorage(organisationId);
  const createItem = useCreateOrganizationKnowledgeBaseItem();
  const deleteItem = useDeleteOrganizationKnowledgeBaseItem();

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
    if (!organisationId || !userId) {
      toast({
        title: 'Erreur',
        description: 'Organisation ou utilisateur introuvable.',
        variant: 'destructive',
      });
      return;
    }

    await createItem.mutateAsync({
      organization_id: organisationId,
      created_by: userId,
      title,
      content_type: 'url',
      content_data: contentData,
      tags,
      visibility: 'organization',
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
    if (!organisationId || !userId) {
      toast({
        title: 'Erreur',
        description: 'Organisation ou utilisateur introuvable.',
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
      organization_id: organisationId,
      created_by: userId,
      title,
      content_type: 'document',
      content_data: contentData,
      file_size: fileSize,
      file_url: fileUrl,
      tags,
      visibility: 'organization',
    });
  };

  // Handle create text
  const handleCreateText = async (title: string, contentData: TextContentData, tags: string[]) => {
    if (!organisationId || !userId) {
      toast({
        title: 'Erreur',
        description: 'Organisation ou utilisateur introuvable.',
        variant: 'destructive',
      });
      return;
    }

    await createItem.mutateAsync({
      organization_id: organisationId,
      created_by: userId,
      title,
      content_type: 'text',
      content_data: contentData,
      tags,
      visibility: 'organization',
    });
  };

  // Handle view item
  const handleViewItem = (item: OrganizationKnowledgeBaseItem) => {
    setSelectedItem(item);
    setViewItemModalOpen(true);
  };

  // Handle delete item
  const handleDeleteItem = async (item: OrganizationKnowledgeBaseItem) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.title}" ?`)) {
      return;
    }

    await deleteItem.mutateAsync({
      itemId: item.id,
      organizationId: item.organization_id,
      fileUrl: item.file_url,
    });
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

  // If no organization
  if (!organisationId) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Organisation introuvable</h3>
              <p className="text-yellow-700">
                Impossible d'accéder à la base de connaissance.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check access
  if (!storage.hasAccess) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Accès non autorisé</h3>
              <p className="text-yellow-700">
                {storage.accessDeniedReason || 'Votre plan ne permet pas d\'accéder à la base de connaissance.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
      {/* Header with Storage Indicator - Always visible like ElevenLabs */}
      {!storage.isLoading && (
        <KnowledgeBaseHeader
          usedBytes={storage.usedBytes}
          limitBytes={storage.limitBytes}
          percentage={storage.limitDetails.percentage}
          warningLevel={storage.warningLevel}
        />
      )}

      {/* Action Buttons - ElevenLabs Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setAddUrlModalOpen(true)}
          disabled={!storage.hasAccess}
          className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-aurentia-pink transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-white">Add URL</span>
        </button>

        <button
          onClick={() => setAddFilesModalOpen(true)}
          disabled={!storage.hasAccess}
          className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-aurentia-pink transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-white">Add Files</span>
        </button>

        <button
          onClick={() => setCreateTextModalOpen(true)}
          disabled={!storage.hasAccess}
          className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-aurentia-pink transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
            <Type className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-white">Create Text</span>
        </button>
      </div>

      {/* Search and Filter - ElevenLabs Style */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search Knowledge Base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-aurentia-pink"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200">
          <Filter className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">Type</span>
        </button>
      </div>

      {/* List */}
      <KnowledgeBaseList
        items={filteredItems}
        onViewItem={handleViewItem}
        onDeleteItem={handleDeleteItem}
        isLoading={isLoadingItems}
      />

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
        bucket="org-knowledge-base-files"
        folderPath={organisationId || ''}
        maxFileSizeMB={100}
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

export default OrganisationKnowledgeBase;
