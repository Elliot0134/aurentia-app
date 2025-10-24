import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { ResourceContent, ResourceTab } from '@/types/resourceTypes';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourceTableOfContentsProps {
  content: ResourceContent;
  activeTabId?: string;
  activeSectionId?: string;
  onNavigate?: (tabId: string, sectionId?: string) => void;
  className?: string;
  compact?: boolean; // Mode compact pour afficher uniquement les tabs
}

export function ResourceTableOfContents({
  content,
  activeTabId,
  activeSectionId,
  onNavigate,
  className,
  compact = false,
}: ResourceTableOfContentsProps) {
  const [expandedTabs, setExpandedTabs] = useState<Set<string>>(new Set([activeTabId || '']));

  // Return null if no tabs available
  if (!content.tabs || content.tabs.length === 0) {
    return null;
  }

  const handleTabToggle = (tabId: string) => {
    const newExpanded = new Set(expandedTabs);
    if (newExpanded.has(tabId)) {
      newExpanded.delete(tabId);
    } else {
      newExpanded.add(tabId);
    }
    setExpandedTabs(newExpanded);
  };

  const handleTabClick = (tabId: string) => {
    if (onNavigate) {
      onNavigate(tabId);
    }
  };

  const handleSectionClick = (tabId: string, sectionId: string) => {
    if (onNavigate) {
      onNavigate(tabId, sectionId);
    }
  };

  const renderTab = (tab: ResourceTab) => {
    const isExpanded = expandedTabs.has(tab.id);
    const isActive = activeTabId === tab.id;
    const IconComponent = tab.icon && (LucideIcons as any)[tab.icon]
      ? (LucideIcons as any)[tab.icon]
      : LucideIcons.FileText;

    return (
      <div key={tab.id} className="mb-1">
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors',
            isActive
              ? 'font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          )}
          style={isActive ? {
            backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 10%, transparent)',
            color: 'var(--color-primary, #ff5932)'
          } : undefined}
        >
          {!compact && Array.isArray(tab.sections) && tab.sections.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTabToggle(tab.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={() => handleTabClick(tab.id)}
            className="flex items-center gap-2 flex-1 text-left"
          >
            <IconComponent className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{tab.title}</span>
          </button>
        </div>

        {/* Sections */}
        {!compact && isExpanded && Array.isArray(tab.sections) && tab.sections.length > 0 && (
          <div className="ml-6 mt-1 space-y-1">
            {tab.sections.map((section) => {
              const isSectionActive = activeSectionId === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(tab.id, section.id)}
                  className={cn(
                    'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors',
                    isSectionActive
                      ? 'font-medium'
                      : 'hover:bg-gray-100 text-gray-600'
                  )}
                  style={isSectionActive ? {
                    backgroundColor: 'color-mix(in srgb, var(--color-secondary, #ff7a59) 10%, transparent)',
                    color: 'var(--color-secondary, #ff7a59)'
                  } : undefined}
                >
                  {section.title}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={cn('bg-white border rounded-lg p-4', className)}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <BookOpen className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-sm text-gray-800">
          {compact ? 'Navigation' : 'Table des matières'}
        </h3>
      </div>
      <div className="space-y-1">
        {content.tabs.map((tab) => renderTab(tab))}
      </div>

      {/* Stats footer */}
      {!compact && (
        <div className="mt-4 pt-3 border-t text-xs text-gray-500">
          <div className="flex justify-between">
            <span>{content.tabs.length} {content.tabs.length > 1 ? 'tabs' : 'tab'}</span>
            <span>
              {content.tabs.reduce((acc, tab) => acc + (Array.isArray(tab.sections) ? tab.sections.length : 0), 0)} sections
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}

export default ResourceTableOfContents;
