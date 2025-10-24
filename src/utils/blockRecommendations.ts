import type { BlockType, ResourceType } from '@/types/resourceTypes';

/**
 * Get recommended blocks based on resource type
 * These recommendations help users choose the most appropriate blocks for their content
 */
export const getRecommendedBlocks = (resourceType: ResourceType | string): BlockType[] => {
  const recommendations: Record<string, BlockType[]> = {
    // GUIDE: Educational content with explanations and visuals
    guide: [
      'text',       // Core content
      'image',      // Visual aids
      'video',      // Tutorial videos
      'checklist',  // Step-by-step tasks
      'divider',    // Content separation
      'callout',    // Important notes
      'accordion',  // FAQ sections
      'quiz',       // Knowledge checks
    ],

    // TEMPLATE: Reusable structures and forms
    template: [
      'text',       // Instructions
      'table',      // Data tables
      'checklist',  // Task lists
      'button',     // Action buttons
      'columns',    // Layout structure
      'callout',    // Tips and warnings
    ],

    // DOCUMENT: Formal documentation
    document: [
      'text',       // Main content
      'image',      // Diagrams and screenshots
      'table',      // Data presentation
      'code',       // Code samples
      'quote',      // Citations
      'divider',    // Section breaks
      'accordion',  // Collapsible sections
    ],

    // CUSTOM: Advanced layouts and interactive content
    custom: [
      'text',       // Base content
      'tabs',       // Organized sections
      'columns',    // Multi-column layouts
      'grid',       // Grid layouts
      'accordion',  // Collapsible content
      'callout',    // Highlighted content
      'toggle',     // Show/hide sections
    ],

    // STANDARD: General purpose (fallback)
    standard: [
      'text',
      'image',
      'video',
      'table',
      'divider',
      'checklist',
    ],
  };

  return recommendations[resourceType] || recommendations['standard'];
};

/**
 * Check if a block type is recommended for a resource type
 */
export const isRecommendedBlock = (blockType: BlockType, resourceType: ResourceType | string): boolean => {
  const recommended = getRecommendedBlocks(resourceType);
  return recommended.includes(blockType);
};

/**
 * Get block type category for better organization
 */
export const getBlockCategory = (blockType: BlockType): 'basic' | 'advanced' | 'layout' => {
  const categories = {
    basic: ['text', 'image', 'video', 'file', 'table', 'divider'],
    advanced: ['code', 'quote', 'button', 'alert', 'checklist', 'quiz', 'embed'],
    layout: ['tabs', 'columns', 'grid', 'accordion', 'callout', 'toggle'],
  };

  for (const [category, blocks] of Object.entries(categories)) {
    if (blocks.includes(blockType)) {
      return category as 'basic' | 'advanced' | 'layout';
    }
  }

  return 'basic'; // Default fallback
};
