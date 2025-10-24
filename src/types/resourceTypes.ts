// ============================================
// BLOCK TYPES (Content building blocks)
// ============================================

export interface TextBlock {
  id: string;
  type: 'text';
  title?: string; // Optional block title
  data: {
    markdown?: string; // For backwards compatibility and markdown mode
    html?: string; // For rich text mode
    mode?: 'markdown' | 'richtext'; // Current editing mode
  };
}

export interface ImageBlock {
  id: string;
  type: 'image';
  title?: string; // Optional block title
  data: {
    url: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
}

export interface VideoBlock {
  id: string;
  type: 'video';
  title?: string; // Optional block title
  data: {
    url: string;
    platform: 'youtube' | 'vimeo' | 'dailymotion' | 'other';
    embedId: string;
    title?: string;
    // File upload support
    uploadType?: 'embed' | 'upload'; // embed = URL embed, upload = file upload
    fileUrl?: string; // For uploaded video files
    filename?: string;
    size?: number;
  };
}

export interface FileBlock {
  id: string;
  type: 'file';
  title?: string; // Optional block title
  data: {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt?: string;
  };
}

export interface TableBlock {
  id: string;
  type: 'table';
  title?: string; // Optional block title
  data: {
    headers: string[];
    rows: string[][];
    hasHeader: boolean;
    columnWidths?: number[]; // Optional column widths in percentage
  };
}

export interface DividerBlock {
  id: string;
  type: 'divider';
  title?: string; // Optional block title
  data: {
    style?: 'solid' | 'dashed' | 'dotted' | 'thick';
  };
}

// ============================================
// NEW: LAYOUT BLOCKS (Container blocks)
// ============================================

/**
 * TabsLayout: Container avec tabs horizontaux
 * Chaque tab contient ses propres blocks
 */
export interface TabsLayoutBlock {
  id: string;
  type: 'tabs';
  title?: string; // Optional block title
  data: {
    tabs: Array<{
      id: string;
      label: string;
      icon?: string;
      blocks: ContentBlock[];
    }>;
    activeTab?: string; // ID du tab actif par défaut
  };
}

/**
 * ColumnsLayout: Container avec colonnes horizontales ou verticales
 * Divise l'espace en colonnes/rangées avec ratios personnalisables
 */
export interface ColumnsLayoutBlock {
  id: string;
  type: 'columns';
  title?: string; // Optional block title
  data: {
    columns: Array<{
      id: string;
      blocks: ContentBlock[];
      width?: number; // Largeur/Hauteur en pourcentage (optionnel, défaut: égal)
    }>;
    gap?: 'small' | 'medium' | 'large'; // Espace entre colonnes/rangées
    orientation?: 'vertical' | 'horizontal'; // vertical = côte à côte, horizontal = empilées
  };
}

/**
 * GridLayout: Container en grille (2x2, 3x3, 2x3, 3x2, 2x4, 4x2, etc.)
 */
export interface GridLayoutBlock {
  id: string;
  type: 'grid';
  title?: string; // Optional block title
  data: {
    cells: Array<{
      id: string;
      blocks: ContentBlock[];
      row?: number; // Position de la cellule (optionnel)
      col?: number;
    }>;
    rows?: number; // Nombre de lignes (optionnel, dérivé du layout)
    cols?: number; // Nombre de colonnes (optionnel, dérivé du layout)
    layout?: '2x2' | '3x3' | '2x3' | '3x2' | '2x4' | '4x2'; // Layout prédéfini
    gap?: 'small' | 'medium' | 'large';
  };
}

/**
 * AccordionLayout: Container avec sections pliables
 * Chaque section peut être ouverte/fermée
 */
export interface AccordionLayoutBlock {
  id: string;
  type: 'accordion';
  title?: string; // Optional block title
  data: {
    items: Array<{
      id: string;
      title: string;
      blocks: ContentBlock[];
      defaultOpen?: boolean;
    }>;
    allowMultiple?: boolean; // Permettre plusieurs sections ouvertes
  };
}

/**
 * CalloutLayout: Container stylisé (info, warning, success, error)
 * Contient des blocks avec un style visuel particulier
 */
export interface CalloutLayoutBlock {
  id: string;
  type: 'callout';
  title?: string; // Optional block title
  data: {
    variant: 'info' | 'warning' | 'success' | 'error';
    title?: string;
    icon?: string;
    blocks: ContentBlock[];
  };
}

// ============================================
// NEW: ADVANCED CONTENT BLOCKS
// ============================================

/**
 * CodeBlock: Code avec coloration syntaxique
 */
export interface CodeBlock {
  id: string;
  type: 'code';
  title?: string; // Optional block title
  data: {
    code: string;
    language: string; // 'javascript', 'python', 'typescript', etc.
    filename?: string;
    showLineNumbers?: boolean;
    theme?: 'dark' | 'light';
  };
}

/**
 * QuoteBlock: Citation avec auteur
 */
export interface QuoteBlock {
  id: string;
  type: 'quote';
  title?: string; // Optional block title
  data: {
    quote: string;
    author?: string;
    source?: string;
    style?: 'border' | 'background' | 'centered';
  };
}

/**
 * ButtonBlock: Bouton cliquable (CTA)
 */
export interface ButtonBlock {
  id: string;
  type: 'button';
  title?: string; // Optional block title
  data: {
    text: string;
    url: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    openInNewTab?: boolean;
    // Action settings
    actionType?: 'url' | 'download' | 'scroll' | 'email';
    actionValue?: string; // Used for scroll targets (#section-id), email addresses, etc.
    downloadFilename?: string; // For download action
  };
}

/**
 * AlertBlock: Message d'alerte
 */
export interface AlertBlock {
  id: string;
  type: 'alert';
  title?: string; // Optional block title
  data: {
    variant: 'info' | 'warning' | 'error' | 'success';
    title?: string;
    message: string;
    dismissible?: boolean;
  };
}

/**
 * ChecklistBlock: Liste de tâches interactives
 */
export interface ChecklistBlock {
  id: string;
  type: 'checklist';
  title?: string; // Optional block title
  data: {
    items: Array<{
      id: string;
      text: string;
      checked: boolean;
    }>;
    title?: string;
  };
}

/**
 * ToggleBlock: Contenu affichable/masquable
 */
export interface ToggleBlock {
  id: string;
  type: 'toggle';
  title?: string; // Optional block title
  data: {
    title: string;
    blocks: ContentBlock[];
    defaultOpen?: boolean;
  };
}

/**
 * EmbedBlock: Iframe générique
 */
export interface EmbedBlock {
  id: string;
  type: 'embed';
  title?: string; // Optional block title
  data: {
    url: string;
    height?: number;
    title?: string;
  };
}

/**
 * QuizBlock: Interactive quiz with questions and answers
 */
export interface QuizBlock {
  id: string;
  type: 'quiz';
  title?: string; // Optional block title
  data: {
    title?: string;
    description?: string;
    questions: Array<{
      id: string;
      question: string;
      type: 'multiple_choice' | 'true_false' | 'short_answer';
      options?: string[]; // For multiple choice
      correctAnswer: string | number; // Answer text or index
      explanation?: string;
      points?: number;
    }>;
    showResults?: boolean; // Show score after completion
    passingScore?: number; // Percentage needed to pass
    randomizeQuestions?: boolean;
    randomizeOptions?: boolean;
  };
}

// Union type for all content blocks (including layouts)
export type ContentBlock =
  | TextBlock
  | ImageBlock
  | VideoBlock
  | FileBlock
  | TableBlock
  | DividerBlock
  // Layout blocks
  | TabsLayoutBlock
  | ColumnsLayoutBlock
  | GridLayoutBlock
  | AccordionLayoutBlock
  | CalloutLayoutBlock
  | ToggleBlock
  // Advanced content blocks
  | CodeBlock
  | QuoteBlock
  | ButtonBlock
  | AlertBlock
  | ChecklistBlock
  | EmbedBlock
  | QuizBlock;

// Block type enum for easier reference
export type BlockType = ContentBlock['type'];

// ============================================
// SECTION & TAB STRUCTURE (New hierarchical organization)
// ============================================

/**
 * ResourceSection: Un groupe de blocks avec un titre
 * Les sections peuvent être collapsibles et fournissent une organisation logique
 */
export interface ResourceSection {
  id: string;
  title: string;
  description?: string;
  blocks: ContentBlock[];
  collapsible?: boolean; // Peut être replié/déplié
  collapsed?: boolean; // État actuel (replié ou non)
  order: number; // Ordre d'affichage
}

/**
 * ResourceTab: Un onglet principal contenant plusieurs sections OU des blocs directs
 * Permet une navigation par catégories (Introduction, Configuration, Exemples, etc.)
 * Mode 'sectioned': Utilise des sections pour organiser les blocs (par défaut)
 * Mode 'direct': Les blocs sont directement dans le tab sans sections
 */
export interface ResourceTab {
  id: string;
  title: string;
  icon?: string; // Nom d'icône Lucide (ex: "BookOpen", "Settings", etc.)
  mode?: 'sectioned' | 'direct'; // Comment organiser le contenu (défaut: 'sectioned')
  sections?: ResourceSection[]; // Utilisé en mode 'sectioned'
  blocks?: ContentBlock[]; // Utilisé en mode 'direct'
  order: number; // Ordre d'affichage
}

/**
 * ResourceMetadata: Métadonnées et paramètres de la ressource
 */
export interface ResourceMetadata {
  showTableOfContents?: boolean; // Afficher la table des matières
  allowComments?: boolean; // Autoriser les commentaires
  trackReading?: boolean; // Suivre la progression de lecture
  variables?: Record<string, string>; // Variables dynamiques ({{nom_organisation}}, etc.)
  lastModified?: string; // Date de dernière modification
  estimatedReadingTime?: number; // Temps de lecture estimé en minutes
}

/**
 * ResourceContent: Structure principale du contenu d'une ressource
 * Version 2.0: Support des tabs et sections
 */
export interface ResourceContent {
  // Structure V2.0 avec tabs et sections
  tabs?: ResourceTab[];

  // Métadonnées communes
  tags?: string[]; // Tags pour catégorisation et recherche
  metadata?: ResourceMetadata;

  version: string; // "2.0"
}

// Resource types
export type ResourceType =
  | 'standard'
  | 'document'
  | 'guide'
  | 'template'
  | 'custom'
  | 'tutorial'      // Step-by-step tutorials
  | 'policy'        // Company policies
  | 'procedure'     // Standard operating procedures
  | 'faq'           // Frequently asked questions
  | 'reference'     // Reference documentation
  | 'onboarding'    // Onboarding materials
  | 'training';     // Training modules

// Visibility options
export type ResourceVisibility =
  | 'public'        // Visible to everyone in the organization (all members + staff)
  | 'organization'  // Visible to all organization members (default, same as public)
  | 'private'       // Only visible to staff members
  | 'personal'      // Only visible to the creator
  | 'custom';       // Custom visibility - creator chooses specific users via assigned_to[]

// Organization Resource (for knowledge base, guides, templates)
export interface Resource {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  slug?: string;
  cover_image_url?: string;
  resource_type: ResourceType;
  category?: string;
  tags?: string[];
  content: ResourceContent;
  status: 'draft' | 'published' | 'archived';
  visibility: ResourceVisibility;
  assigned_to?: string[];
  view_count: number;
  favorite_count: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  // Computed fields
  is_favorited?: boolean;
  author_name?: string;
  author_avatar?: string;
}

// Type guard functions
export const isTextBlock = (block: ContentBlock): block is TextBlock => block.type === 'text';
export const isImageBlock = (block: ContentBlock): block is ImageBlock => block.type === 'image';
export const isVideoBlock = (block: ContentBlock): block is VideoBlock => block.type === 'video';
export const isFileBlock = (block: ContentBlock): block is FileBlock => block.type === 'file';
export const isTableBlock = (block: ContentBlock): block is TableBlock => block.type === 'table';
export const isDividerBlock = (block: ContentBlock): block is DividerBlock => block.type === 'divider';

// Type guards for layout blocks
export const isTabsBlock = (block: ContentBlock): block is TabsLayoutBlock => block.type === 'tabs';
export const isColumnsBlock = (block: ContentBlock): block is ColumnsLayoutBlock => block.type === 'columns';
export const isGridBlock = (block: ContentBlock): block is GridLayoutBlock => block.type === 'grid';
export const isAccordionBlock = (block: ContentBlock): block is AccordionLayoutBlock => block.type === 'accordion';
export const isCalloutBlock = (block: ContentBlock): block is CalloutLayoutBlock => block.type === 'callout';
export const isToggleBlock = (block: ContentBlock): block is ToggleBlock => block.type === 'toggle';

// Type guards for advanced content blocks
export const isCodeBlock = (block: ContentBlock): block is CodeBlock => block.type === 'code';
export const isQuoteBlock = (block: ContentBlock): block is QuoteBlock => block.type === 'quote';
export const isButtonBlock = (block: ContentBlock): block is ButtonBlock => block.type === 'button';
export const isAlertBlock = (block: ContentBlock): block is AlertBlock => block.type === 'alert';
export const isChecklistBlock = (block: ContentBlock): block is ChecklistBlock => block.type === 'checklist';
export const isEmbedBlock = (block: ContentBlock): block is EmbedBlock => block.type === 'embed';
export const isQuizBlock = (block: ContentBlock): block is QuizBlock => block.type === 'quiz';

// Helper to check if a block is a container (has children)
export const isContainerBlock = (block: ContentBlock): boolean => {
  return ['tabs', 'columns', 'grid', 'accordion', 'callout', 'toggle'].includes(block.type);
};

// Helper to create empty blocks
export const createEmptyBlock = (type: BlockType, id?: string): ContentBlock => {
  const blockId = id || `block_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  switch (type) {
    // Basic content blocks
    case 'text':
      return { id: blockId, type: 'text', data: { markdown: '', mode: 'markdown' } };
    case 'image':
      return { id: blockId, type: 'image', data: { url: '', alt: '' } };
    case 'video':
      return { id: blockId, type: 'video', data: { url: '', platform: 'youtube', embedId: '' } };
    case 'file':
      return { id: blockId, type: 'file', data: { url: '', filename: '', size: 0, mimeType: '' } };
    case 'table':
      return {
        id: blockId,
        type: 'table',
        data: {
          headers: ['Colonne 1', 'Colonne 2', 'Colonne 3'],
          rows: [
            ['Cellule 1', 'Cellule 2', 'Cellule 3'],
            ['Cellule 4', 'Cellule 5', 'Cellule 6']
          ],
          hasHeader: true
        }
      };
    case 'divider':
      return { id: blockId, type: 'divider', data: { style: 'solid' } };

    // Layout blocks
    case 'tabs':
      return {
        id: blockId,
        type: 'tabs',
        data: {
          tabs: [
            { id: 'tab1', label: 'Tab 1', blocks: [] },
            { id: 'tab2', label: 'Tab 2', blocks: [] }
          ],
          activeTab: 'tab1'
        }
      };
    case 'columns':
      return {
        id: blockId,
        type: 'columns',
        data: {
          columns: [
            { id: 'col1', blocks: [], width: 50 },
            { id: 'col2', blocks: [], width: 50 }
          ],
          gap: 'medium',
          orientation: 'vertical' // vertical = side by side (default)
        }
      };
    case 'grid':
      return {
        id: blockId,
        type: 'grid',
        data: {
          layout: '2x2',
          rows: 2,
          cols: 2,
          cells: [
            { id: 'cell-0-0', row: 0, col: 0, blocks: [] },
            { id: 'cell-0-1', row: 0, col: 1, blocks: [] },
            { id: 'cell-1-0', row: 1, col: 0, blocks: [] },
            { id: 'cell-1-1', row: 1, col: 1, blocks: [] }
          ],
          gap: 'medium'
        }
      };
    case 'accordion':
      return {
        id: blockId,
        type: 'accordion',
        data: {
          items: [
            { id: 'item1', title: 'Section 1', blocks: [], defaultOpen: true }
          ],
          allowMultiple: false
        }
      };
    case 'callout':
      return {
        id: blockId,
        type: 'callout',
        data: {
          variant: 'info',
          title: 'Note',
          blocks: []
        }
      };
    case 'toggle':
      return {
        id: blockId,
        type: 'toggle',
        data: {
          title: 'Cliquez pour afficher',
          blocks: [],
          defaultOpen: false
        }
      };

    // Advanced content blocks
    case 'code':
      return {
        id: blockId,
        type: 'code',
        data: {
          code: '// Votre code ici',
          language: 'javascript',
          showLineNumbers: true,
          theme: 'dark'
        }
      };
    case 'quote':
      return {
        id: blockId,
        type: 'quote',
        data: {
          quote: 'Votre citation ici',
          style: 'border'
        }
      };
    case 'button':
      return {
        id: blockId,
        type: 'button',
        data: {
          text: 'Cliquez ici',
          url: '',
          variant: 'primary',
          size: 'medium',
          openInNewTab: false
        }
      };
    case 'alert':
      return {
        id: blockId,
        type: 'alert',
        data: {
          variant: 'info',
          title: 'Information',
          message: 'Votre message ici',
          dismissible: false
        }
      };
    case 'checklist':
      return {
        id: blockId,
        type: 'checklist',
        data: {
          title: 'Liste de tâches',
          items: [
            { id: 'item1', text: 'Tâche 1', checked: false },
            { id: 'item2', text: 'Tâche 2', checked: false }
          ]
        }
      };
    case 'embed':
      return {
        id: blockId,
        type: 'embed',
        data: {
          url: '',
          height: 400
        }
      };
    case 'quiz':
      return {
        id: blockId,
        type: 'quiz',
        data: {
          title: 'Nouveau Quiz',
          description: '',
          questions: [
            {
              id: 'q1',
              question: 'Question 1',
              type: 'multiple_choice',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 0,
              points: 1
            }
          ],
          showResults: true,
          passingScore: 70,
          randomizeQuestions: false,
          randomizeOptions: false
        }
      };

    default:
      throw new Error(`Unknown block type: ${type}`);
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Créer une section vide
 */
export const createEmptySection = (title: string = 'Nouvelle section', order: number = 0): ResourceSection => ({
  id: `section_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  title,
  description: '',
  blocks: [],
  collapsible: true,
  collapsed: false,
  order
});

/**
 * Créer un tab vide (mode 'direct' par défaut pour une meilleure UX)
 */
export const createEmptyTab = (title: string = 'Nouveau tab', order: number = 0, mode: 'sectioned' | 'direct' = 'direct'): ResourceTab => ({
  id: `tab_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  title,
  icon: 'FileText',
  mode,
  sections: mode === 'sectioned' ? [createEmptySection('Section 1', 0)] : undefined,
  blocks: mode === 'direct' ? [] : undefined,
  order
});

/**
 * Créer un contenu de ressource vide (Version 2.0 avec tabs)
 */
export const createEmptyResourceContent = (): ResourceContent => ({
  tabs: [createEmptyTab('Contenu principal', 0)],
  tags: [],
  metadata: {
    showTableOfContents: true,
    allowComments: true,
    trackReading: false
  },
  version: '2.0'
});


/**
 * Obtenir tous les blocks d'un contenu (V2.0 uniquement)
 * Supporte les modes 'sectioned' et 'direct'
 */
export const getAllBlocks = (content: ResourceContent): ContentBlock[] => {
  return (content.tabs || []).flatMap(tab => {
    if (tab.mode === 'direct' && tab.blocks) {
      return tab.blocks;
    } else if (tab.sections) {
      return tab.sections.flatMap(section => section.blocks || []);
    }
    return [];
  });
};

// Helper to validate resource content (V2.0 only)
export const isValidResourceContent = (content: any): content is ResourceContent => {
  if (!content || typeof content !== 'object' || typeof content.version !== 'string') {
    return false;
  }

  // Only V2.0 is supported
  return content.version === '2.0' && Array.isArray(content.tabs);
};

/**
 * Normalize resource content to ensure all required fields exist
 * Fixes undefined/null arrays and malformed structures (V2.0 only)
 */
export const normalizeResourceContent = (content: ResourceContent): ResourceContent => {
  // Ensure basic structure
  const normalized: ResourceContent = {
    ...content,
    version: '2.0',
    tags: Array.isArray(content.tags) ? content.tags : [],
    metadata: content.metadata || {
      showTableOfContents: true,
      allowComments: true,
      trackReading: false
    }
  };

  // Ensure tabs are properly initialized
  if (!Array.isArray(normalized.tabs) || normalized.tabs.length === 0) {
    // Create default tab structure if missing (direct mode by default)
    normalized.tabs = [createEmptyTab('Contenu principal', 0, 'direct')];
  } else {
    // Normalize each tab
    normalized.tabs = normalized.tabs.map((tab, index) => {
      const mode = tab.mode || (tab.sections ? 'sectioned' : 'direct');

      const normalizedTab: ResourceTab = {
        ...tab,
        id: tab.id || `tab_${Date.now()}_${index}`,
        title: tab.title || `Tab ${index + 1}`,
        icon: tab.icon || 'FileText',
        mode,
        order: typeof tab.order === 'number' ? tab.order : index
      };

      // Normalize based on mode
      if (mode === 'sectioned') {
        normalizedTab.sections = Array.isArray(tab.sections) ? tab.sections.map((section, sIndex) => ({
          ...section,
          id: section.id || `section_${Date.now()}_${sIndex}`,
          title: section.title || `Section ${sIndex + 1}`,
          description: section.description || '',
          blocks: Array.isArray(section.blocks) ? section.blocks : [],
          collapsible: typeof section.collapsible === 'boolean' ? section.collapsible : true,
          collapsed: typeof section.collapsed === 'boolean' ? section.collapsed : false,
          order: typeof section.order === 'number' ? section.order : sIndex
        })) : [createEmptySection('Section 1', 0)];
        normalizedTab.blocks = undefined;
      } else {
        // direct mode
        normalizedTab.blocks = Array.isArray(tab.blocks) ? tab.blocks : [];
        normalizedTab.sections = undefined;
      }

      return normalizedTab;
    });
  }

  return normalized;
};
