/**
 * Template Utility Functions
 *
 * Functions to create templates from resources by preserving structure
 * while removing all content.
 */

import { ContentBlock, ResourceContent, ResourceTab, ResourceSection } from '@/types/resourceTypes';

/**
 * Generate a new unique ID
 */
const generateId = (prefix: string = 'item') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Strip content from a single block, keeping only structure
 */
export const stripBlockContent = (block: ContentBlock): ContentBlock => {
  const newId = generateId('block');

  switch (block.type) {
    case 'text':
      return { ...block, id: newId, data: { markdown: '' } };

    case 'image':
      return { ...block, id: newId, data: { url: '', alt: '', caption: '' } };

    case 'video':
      return {
        ...block,
        id: newId,
        data: {
          url: '',
          platform: 'youtube',
          embedId: '',
          title: '',
          uploadType: block.data.uploadType || 'embed',
          fileUrl: undefined,
          filename: undefined,
          size: undefined
        }
      };

    case 'file':
      return {
        ...block,
        id: newId,
        data: { url: '', filename: '', size: 0, mimeType: '' }
      };

    case 'table':
      return {
        ...block,
        id: newId,
        data: {
          headers: block.data.headers.map(() => ''),
          rows: block.data.rows.map(row => row.map(() => '')),
          hasHeader: block.data.hasHeader,
          columnWidths: block.data.columnWidths
        }
      };

    case 'divider':
      return { ...block, id: newId, data: { style: block.data.style || 'solid' } };

    case 'code':
      return {
        ...block,
        id: newId,
        data: {
          code: '',
          language: block.data.language || 'javascript',
          filename: '',
          showLineNumbers: block.data.showLineNumbers,
          theme: block.data.theme
        }
      };

    case 'quote':
      return {
        ...block,
        id: newId,
        data: {
          quote: '',
          author: '',
          source: '',
          style: block.data.style
        }
      };

    case 'button':
      return {
        ...block,
        id: newId,
        data: {
          text: '',
          url: '',
          variant: block.data.variant,
          size: block.data.size,
          openInNewTab: block.data.openInNewTab,
          actionType: block.data.actionType,
          actionValue: '',
          downloadFilename: ''
        }
      };

    case 'alert':
      return {
        ...block,
        id: newId,
        data: {
          variant: block.data.variant,
          title: '',
          message: '',
          dismissible: block.data.dismissible
        }
      };

    case 'checklist':
      return {
        ...block,
        id: newId,
        data: {
          title: '',
          items: block.data.items.map(item => ({
            id: generateId('item'),
            text: '',
            checked: false
          }))
        }
      };

    case 'embed':
      return {
        ...block,
        id: newId,
        data: {
          url: '',
          height: block.data.height,
          title: ''
        }
      };

    case 'quiz':
      return {
        ...block,
        id: newId,
        data: {
          title: '',
          description: '',
          questions: block.data.questions.map(q => ({
            id: generateId('q'),
            question: '',
            type: q.type,
            options: q.options?.map(() => ''),
            correctAnswer: typeof q.correctAnswer === 'number' ? 0 : '',
            explanation: '',
            points: q.points
          })),
          showResults: block.data.showResults,
          passingScore: block.data.passingScore,
          randomizeQuestions: block.data.randomizeQuestions,
          randomizeOptions: block.data.randomizeOptions
        }
      };

    // Container blocks - recursively strip nested blocks
    case 'tabs':
      return {
        ...block,
        id: newId,
        data: {
          tabs: block.data.tabs.map(tab => ({
            id: generateId('tab'),
            label: tab.label || '',
            icon: tab.icon,
            blocks: tab.blocks.map(stripBlockContent)
          })),
          activeTab: undefined
        }
      };

    case 'columns':
      return {
        ...block,
        id: newId,
        data: {
          columns: block.data.columns.map(col => ({
            id: generateId('col'),
            blocks: col.blocks.map(stripBlockContent),
            width: col.width
          })),
          gap: block.data.gap,
          orientation: block.data.orientation
        }
      };

    case 'grid':
      return {
        ...block,
        id: newId,
        data: {
          cells: block.data.cells.map(cell => ({
            id: generateId('cell'),
            blocks: cell.blocks.map(stripBlockContent),
            row: cell.row,
            col: cell.col
          })),
          rows: block.data.rows,
          cols: block.data.cols,
          layout: block.data.layout,
          gap: block.data.gap
        }
      };

    case 'accordion':
      return {
        ...block,
        id: newId,
        data: {
          items: block.data.items.map(item => ({
            id: generateId('item'),
            title: item.title || '',
            blocks: item.blocks.map(stripBlockContent),
            defaultOpen: item.defaultOpen
          })),
          allowMultiple: block.data.allowMultiple
        }
      };

    case 'callout':
      return {
        ...block,
        id: newId,
        data: {
          variant: block.data.variant,
          title: '',
          icon: block.data.icon,
          blocks: block.data.blocks.map(stripBlockContent)
        }
      };

    case 'toggle':
      return {
        ...block,
        id: newId,
        data: {
          title: '',
          blocks: block.data.blocks.map(stripBlockContent),
          defaultOpen: block.data.defaultOpen
        }
      };

    default:
      // Fallback for unknown block types
      return { ...block, id: newId };
  }
};

/**
 * Strip content from a section
 */
export const stripSectionContent = (section: ResourceSection): ResourceSection => {
  return {
    ...section,
    id: generateId('section'),
    title: section.title || '',
    description: '',
    blocks: section.blocks.map(stripBlockContent),
    collapsible: section.collapsible,
    collapsed: false,
    order: section.order
  };
};

/**
 * Strip content from a tab
 */
export const stripTabContent = (tab: ResourceTab): ResourceTab => {
  const newTab: ResourceTab = {
    ...tab,
    id: generateId('tab'),
    title: tab.title || '',
    icon: tab.icon,
    mode: tab.mode,
    order: tab.order
  };

  if (tab.mode === 'sectioned' && tab.sections) {
    newTab.sections = tab.sections.map(stripSectionContent);
    newTab.blocks = undefined;
  } else if (tab.mode === 'direct' && tab.blocks) {
    newTab.blocks = tab.blocks.map(stripBlockContent);
    newTab.sections = undefined;
  }

  return newTab;
};

/**
 * Create a template from a resource content
 * Preserves structure, removes all content
 */
export const createTemplate = (content: ResourceContent): ResourceContent => {
  return {
    version: '2.0',
    tabs: content.tabs?.map(stripTabContent) || [],
    tags: [], // Clear tags
    metadata: {
      showTableOfContents: content.metadata?.showTableOfContents ?? true,
      allowComments: content.metadata?.allowComments ?? true,
      trackReading: content.metadata?.trackReading ?? false,
      variables: {}, // Clear variables
      estimatedReadingTime: 0
    }
  };
};
