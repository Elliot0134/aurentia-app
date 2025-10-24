import React, { useState, useEffect } from 'react';
import { Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ResourceContent, ResourceTab, ResourceSection } from '@/types/resourceTypes';
import { createEmptyResourceContent, normalizeResourceContent } from '@/types/resourceTypes';
import { ResourceTabManager } from './ResourceTabManager';
import { ResourceSectionBuilder } from './ResourceSectionBuilder';
import { ResourceTagEditor } from './ResourceTagEditor';
import { ResourceTableOfContents } from './ResourceTableOfContents';
import { ResourceBuilderTour } from '@/components/help/ResourceBuilderTour';
import { ResourceBuilderHelpPanel } from '@/components/help/ResourceBuilderHelpPanel';
import { useStartTour } from '@/components/help/ResourceBuilderTour';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ResourceBuilderV2Props {
  initialContent?: ResourceContent;
  organizationId?: string;
  onSave?: (content: ResourceContent) => void;
  autoSave?: boolean;
  readOnly?: boolean;
  resourceType?: string; // For block recommendations
}

export function ResourceBuilderV2({
  initialContent,
  organizationId,
  onSave,
  autoSave = true,
  readOnly = false,
  resourceType = 'standard',
}: ResourceBuilderV2Props) {
  // Initialize content and normalize to ensure data integrity
  const [content, setContent] = useState<ResourceContent>(() => {
    const initial = initialContent || createEmptyResourceContent();
    // Normalize to ensure all arrays are defined and structure is valid
    return normalizeResourceContent(initial);
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    // Safe access with optional chaining and fallback
    if (content.tabs && content.tabs.length > 0) {
      return content.tabs[0].id;
    }
    return '';
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(true);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const { startTour } = useStartTour();

  // Notify parent of content changes (no auto-save)
  useEffect(() => {
    if (!onSave || readOnly) return;
    onSave(content);
  }, [content, onSave, readOnly]);

  // Handlers for tab management
  const handleTabsChange = (tabs: ResourceTab[]) => {
    setContent(prev => ({ ...prev, tabs }));
  };

  const handleActiveTabChange = (tabId: string) => {
    setActiveTabId(tabId);
  };

  // Handlers for sections management (supports both sectioned and direct modes)
  const handleSectionsChange = (sections: ResourceSection[]) => {
    if (!content.tabs) return;

    const updatedTabs = content.tabs.map(tab => {
      if (tab.id !== activeTabId) return tab;

      // If in direct mode, extract blocks from the temporary section
      if (tab.mode === 'direct') {
        const directBlocks = sections[0]?.blocks || [];
        return { ...tab, blocks: directBlocks };
      }

      // Sectioned mode: update sections normally
      return { ...tab, sections };
    });
    setContent(prev => ({ ...prev, tabs: updatedTabs }));
  };

  // Handlers for tags management
  const handleTagsChange = (tags: string[]) => {
    setContent(prev => ({ ...prev, tags }));
  };

  // Handlers for metadata
  const handleMetadataChange = (key: keyof NonNullable<ResourceContent['metadata']>, value: any) => {
    setContent(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value,
      },
    }));
  };

  // Get current tab with safe fallback
  const currentTab = content.tabs?.find(tab => tab.id === activeTabId);

  // Get content based on tab mode (sectioned or direct)
  const currentTabSections = currentTab?.mode === 'sectioned' || currentTab?.sections
    ? (currentTab?.sections || [])
    : currentTab?.mode === 'direct' && currentTab?.blocks
    ? [{
        id: 'direct-section',
        title: '',
        blocks: currentTab.blocks,
        order: 0,
        collapsible: false
      }]
    : [];

  if (readOnly) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex gap-6">
          {/* Table of contents */}
          {content.metadata?.showTableOfContents && content.tabs && content.tabs.length > 1 && (
            <div className="w-64 flex-shrink-0 sticky top-4 self-start">
              <ResourceTableOfContents
                content={content}
                activeTabId={activeTabId}
                onNavigate={handleActiveTabChange}
              />
            </div>
          )}

          {/* Main content */}
          <div className="flex-1">
            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="mb-6">
                <ResourceTagEditor
                  tags={content.tags}
                  onTagsChange={() => {}}
                  organizationId={organizationId}
                  readOnly={true}
                />
              </div>
            )}

            {/* Tabs */}
            {content.tabs && content.tabs.length > 1 && (
              <ResourceTabManager
                tabs={content.tabs}
                activeTabId={activeTabId}
                onTabsChange={() => {}}
                onActiveTabChange={handleActiveTabChange}
              />
            )}

            {/* Current tab sections */}
            {currentTab && (
              <div className="mt-6">
                <ResourceSectionBuilder
                  sections={currentTabSections}
                  onSectionsChange={() => {}}
                  organizationId={organizationId}
                  resourceType={resourceType}
                  readOnly={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-tour="builder-main">
      {/* Header with settings */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Éditeur de ressource</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelpPanel(true)}
              style={{ color: 'var(--color-primary, #ff5932)' }}
              className="hover:opacity-80"
              title="Ouvrir l'aide (Ctrl+Shift+H)"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Aide
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowToc(!showToc)}
            >
              {showToc ? 'Masquer' : 'Afficher'} ToC
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              data-tour="settings-button"
            >
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 overflow-x-hidden">
        <div className="flex gap-6">
          {/* Table of contents sidebar */}
          {showToc && (
            <div className="w-64 flex-shrink-0 sticky top-20 self-start" data-tour="table-of-contents">
              <ResourceTableOfContents
                content={content}
                activeTabId={activeTabId}
                onNavigate={handleActiveTabChange}
              />
            </div>
          )}

          {/* Main content area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Tags section */}
            <Card className="p-4 w-full max-w-full" data-tour="tags-section">
              <h3 className="text-sm font-semibold mb-3">Tags</h3>
              <ResourceTagEditor
                tags={content.tags || []}
                onTagsChange={handleTagsChange}
                organizationId={organizationId}
              />
            </Card>

            {/* Tabs manager */}
            {content.tabs && (
              <div data-tour="tab-bar" className="w-full max-w-full">
                <ResourceTabManager
                  tabs={content.tabs}
                  activeTabId={activeTabId}
                  onTabsChange={handleTabsChange}
                  onActiveTabChange={handleActiveTabChange}
                />
              </div>
            )}

            {/* Current tab content */}
            {currentTab && (
              <Card className="p-6 w-full max-w-full" data-tour="sections-container">
                <ResourceSectionBuilder
                  sections={currentTabSections}
                  onSectionsChange={handleSectionsChange}
                  organizationId={organizationId}
                  resourceType={resourceType}
                />
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Help Components */}
      <ResourceBuilderTour />
      <ResourceBuilderHelpPanel
        isOpen={showHelpPanel}
        onClose={() => setShowHelpPanel(false)}
        onStartTour={startTour}
      />

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paramètres de la ressource</DialogTitle>
            <DialogDescription>
              Configurez l'affichage et les fonctionnalités de votre ressource.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-toc" className="flex flex-col gap-1">
                <span>Table des matières</span>
                <span className="text-xs text-gray-500 font-normal">
                  Afficher la navigation dans la ressource
                </span>
              </Label>
              <Switch
                id="show-toc"
                checked={content.metadata?.showTableOfContents ?? true}
                onCheckedChange={(checked) => handleMetadataChange('showTableOfContents', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allow-comments" className="flex flex-col gap-1">
                <span>Commentaires</span>
                <span className="text-xs text-gray-500 font-normal">
                  Permettre aux membres de commenter
                </span>
              </Label>
              <Switch
                id="allow-comments"
                checked={content.metadata?.allowComments ?? true}
                onCheckedChange={(checked) => handleMetadataChange('allowComments', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="track-reading" className="flex flex-col gap-1">
                <span>Suivi de lecture</span>
                <span className="text-xs text-gray-500 font-normal">
                  Suivre la progression des membres
                </span>
              </Label>
              <Switch
                id="track-reading"
                checked={content.metadata?.trackReading ?? false}
                onCheckedChange={(checked) => handleMetadataChange('trackReading', checked)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowSettings(false)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ResourceBuilderV2;
