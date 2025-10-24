import React, { useState } from 'react';
import { ResourceContent, Resource } from '@/types/resourceTypes';
import { ResourceTableOfContents } from '../resource-builder/ResourceTableOfContents';
import { ResourceTagEditor } from '../resource-builder/ResourceTagEditor';
import { BlockWrapper } from '../resource-builder/BlockWrapper';
import { Card } from '@/components/ui/card';
import CustomTabs from '@/components/ui/CustomTabs';
import { ChevronDown, ChevronRight, Clock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface ResourceViewerV2Props {
  resource: Resource;
  showComments?: boolean;
  organizationId?: string;
}

export function ResourceViewerV2({
  resource,
  showComments = false,
  organizationId,
}: ResourceViewerV2Props) {
  const content = resource.content as ResourceContent;
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    if (content.tabs && content.tabs.length > 0) {
      return content.tabs[0].id;
    }
    return '';
  });
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSectionCollapse = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const currentTab = content.tabs?.find(tab => tab.id === activeTabId);

  // Calculer le temps de lecture estimé (basé sur le nombre de blocks)
  // Support both 'sectioned' and 'direct' tab modes
  const totalBlocks = content.tabs?.reduce((acc, tab) => {
    if (tab.mode === 'direct' && tab.blocks) {
      return acc + tab.blocks.length;
    } else if (tab.sections) {
      return acc + tab.sections.reduce((sec, section) => sec + (section.blocks?.length || 0), 0);
    }
    return acc;
  }, 0) || 0;
  const estimatedReadingTime = Math.max(1, Math.ceil(totalBlocks * 0.5)); // 0.5 min par block

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header avec métadonnées */}
      <div className="mb-6 pb-6 border-b">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
            {resource.description && (
              <p className="text-gray-600 text-lg">{resource.description}</p>
            )}
          </div>
        </div>

        {/* Métadonnées */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{estimatedReadingTime} min de lecture</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{resource.view_count || 0} vues</span>
          </div>
          {resource.author_name && (
            <div>
              Par {resource.author_name}
            </div>
          )}
          {resource.updated_at && (
            <div>
              Mis à jour {new Date(resource.updated_at).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="mt-4">
            <ResourceTagEditor
              tags={content.tags}
              onTagsChange={() => {}}
              organizationId={organizationId}
              readOnly={true}
            />
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Table des matières (sidebar) */}
        {content.metadata?.showTableOfContents && content.tabs && content.tabs.length > 1 && (
          <div className="w-64 flex-shrink-0 sticky top-4 self-start">
            <ResourceTableOfContents
              content={content}
              activeTabId={activeTabId}
              onNavigate={setActiveTabId}
            />
          </div>
        )}

        {/* Contenu principal */}
        <div className="flex-1 min-w-0 max-w-full">
          {/* Tabs si plusieurs */}
          {content.tabs && content.tabs.length > 1 && (
            <div className="mb-6">
              <CustomTabs
                tabs={content.tabs.map(tab => {
                  const IconComponent = tab.icon && (LucideIcons as any)[tab.icon]
                    ? (LucideIcons as any)[tab.icon]
                    : LucideIcons.FileText;
                  return {
                    key: tab.id,
                    label: tab.title,
                    icon: IconComponent,
                  };
                })}
                activeTab={activeTabId}
                onTabChange={setActiveTabId}
              >
                <div />
              </CustomTabs>
            </div>
          )}

          {/* Content du tab actif (sectioned or direct mode) */}
          {currentTab && (
            <div className="space-y-6">
              {/* Direct mode: render blocks directly without sections */}
              {currentTab.mode === 'direct' && currentTab.blocks ? (
                <Card className="overflow-hidden w-full">
                  <div className="p-6 prose max-w-none">
                    {currentTab.blocks.length === 0 ? (
                      <p className="text-gray-400 italic">Aucun contenu</p>
                    ) : (
                      <div className="space-y-4">
                        {currentTab.blocks.map((block) => (
                          <BlockWrapper
                            key={block.id}
                            block={block}
                            isActive={false}
                            onActivate={() => {}}
                            onUpdate={() => {}}
                            onDuplicate={() => {}}
                            onDelete={() => {}}
                            organizationId={organizationId}
                            readOnly={true}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                /* Sectioned mode: render sections with headers */
                currentTab.sections?.map((section) => {
                  const isCollapsed = collapsedSections.has(section.id);

                  return (
                    <Card
                      key={section.id}
                      id={`section-${section.id}`}
                      className="overflow-hidden w-full"
                    >
                      {/* Section header */}
                      <div
                        className={cn(
                          'p-4 bg-gray-50 border-b',
                          section.collapsible && 'cursor-pointer hover:bg-gray-100'
                        )}
                        onClick={() => section.collapsible && toggleSectionCollapse(section.id)}
                      >
                        <div className="flex items-center gap-3">
                          {section.collapsible && (
                            <button className="p-1 hover:bg-gray-200 rounded">
                              {isCollapsed ? (
                                <ChevronRight className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          )}
                          <div className="flex-1">
                            <h2 className="text-xl font-semibold">{section.title}</h2>
                            {section.description && (
                              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section content */}
                      {!isCollapsed && (
                        <div className="p-6 prose max-w-none">
                          {section.blocks.length === 0 ? (
                            <p className="text-gray-400 italic">Section vide</p>
                          ) : (
                            <div className="space-y-4">
                              {section.blocks.map((block) => (
                                <BlockWrapper
                                  key={block.id}
                                  block={block}
                                  isActive={false}
                                  onActivate={() => {}}
                                  onUpdate={() => {}}
                                  onDuplicate={() => {}}
                                  onDelete={() => {}}
                                  organizationId={organizationId}
                                  readOnly={true}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourceViewerV2;
