/**
 * Microsoft Teams Integration Types
 * Based on Teams Incoming Webhook and Adaptive Cards API
 * Documentation: https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using
 */

// =====================================================
// Adaptive Card Types
// =====================================================

export interface TeamsAdaptiveCard {
  type: 'message';
  attachments: TeamsAttachment[];
}

export interface TeamsAttachment {
  contentType: 'application/vnd.microsoft.card.adaptive';
  contentUrl?: string;
  content: AdaptiveCardContent;
}

export interface AdaptiveCardContent {
  $schema: string;
  type: 'AdaptiveCard';
  version: string;
  body: AdaptiveCardElement[];
  actions?: AdaptiveCardAction[];
  msteams?: {
    width?: 'Full';
  };
}

// =====================================================
// Adaptive Card Elements
// =====================================================

export type AdaptiveCardElement =
  | TextBlock
  | FactSet
  | ImageElement
  | Container
  | ColumnSet;

export interface TextBlock {
  type: 'TextBlock';
  text: string;
  size?: 'Small' | 'Default' | 'Medium' | 'Large' | 'ExtraLarge';
  weight?: 'Lighter' | 'Default' | 'Bolder';
  color?: 'Default' | 'Dark' | 'Light' | 'Accent' | 'Good' | 'Warning' | 'Attention';
  horizontalAlignment?: 'Left' | 'Center' | 'Right';
  wrap?: boolean;
  maxLines?: number;
  spacing?: 'None' | 'Small' | 'Default' | 'Medium' | 'Large' | 'ExtraLarge' | 'Padding';
}

export interface FactSet {
  type: 'FactSet';
  facts: Fact[];
  spacing?: 'None' | 'Small' | 'Default' | 'Medium' | 'Large' | 'ExtraLarge' | 'Padding';
}

export interface Fact {
  title: string;
  value: string;
}

export interface ImageElement {
  type: 'Image';
  url: string;
  altText?: string;
  size?: 'Auto' | 'Stretch' | 'Small' | 'Medium' | 'Large';
  style?: 'Default' | 'Person';
  horizontalAlignment?: 'Left' | 'Center' | 'Right';
  spacing?: 'None' | 'Small' | 'Default' | 'Medium' | 'Large' | 'ExtraLarge' | 'Padding';
}

export interface Container {
  type: 'Container';
  items: AdaptiveCardElement[];
  style?: 'Default' | 'Emphasis' | 'Good' | 'Attention' | 'Warning' | 'Accent';
  spacing?: 'None' | 'Small' | 'Default' | 'Medium' | 'Large' | 'ExtraLarge' | 'Padding';
}

export interface ColumnSet {
  type: 'ColumnSet';
  columns: Column[];
  spacing?: 'None' | 'Small' | 'Default' | 'Medium' | 'Large' | 'ExtraLarge' | 'Padding';
}

export interface Column {
  type: 'Column';
  items: AdaptiveCardElement[];
  width?: string | number | 'auto' | 'stretch';
}

// =====================================================
// Adaptive Card Actions
// =====================================================

export type AdaptiveCardAction = OpenUrlAction | SubmitAction;

export interface OpenUrlAction {
  type: 'Action.OpenUrl';
  title: string;
  url: string;
}

export interface SubmitAction {
  type: 'Action.Submit';
  title: string;
  data?: Record<string, any>;
}

// =====================================================
// Teams Message (Simple Format)
// =====================================================

export interface TeamsSimpleMessage {
  text: string;
  title?: string;
  themeColor?: string; // Hex color
}

// =====================================================
// Teams Colors
// =====================================================

export const TEAMS_COLORS = {
  SUCCESS: '28a745',
  INFO: '007bff',
  WARNING: 'ffc107',
  ERROR: 'dc3545',
  PRIMARY: '6264a7', // Teams purple
  AURENTIA_PINK: 'F04F6A',
  AURENTIA_ORANGE: 'FF8A5C',
} as const;

// =====================================================
// Helper Types
// =====================================================

export interface TeamsMessageOptions {
  includeTimestamp?: boolean;
  themeColor?: string;
  imageUrl?: string;
}
