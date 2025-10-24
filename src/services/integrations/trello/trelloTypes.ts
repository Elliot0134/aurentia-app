/**
 * Trello Integration Types
 * Based on Trello REST API
 * Documentation: https://developer.atlassian.com/cloud/trello/rest/
 */

// =====================================================
// Trello API Types
// =====================================================

export interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  url: string;
  closed: boolean;
  prefs: {
    background: string;
    backgroundColor: string;
    backgroundImage: string;
  };
}

export interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
}

export interface TrelloCard {
  id: string;
  name: string;
  desc?: string;
  url: string;
  idBoard: string;
  idList: string;
  due?: string; // ISO 8601 date
  dueComplete?: boolean;
  labels?: TrelloLabel[];
  members?: TrelloMember[];
  pos: number;
  closed: boolean;
}

export interface TrelloLabel {
  id: string;
  idBoard: string;
  name: string;
  color: string;
}

export interface TrelloMember {
  id: string;
  username: string;
  fullName: string;
  initials: string;
  avatarUrl: string;
}

export interface TrelloChecklist {
  id: string;
  name: string;
  idBoard: string;
  idCard: string;
  checkItems: TrelloCheckItem[];
}

export interface TrelloCheckItem {
  id: string;
  name: string;
  state: 'complete' | 'incomplete';
  pos: number;
}

// =====================================================
// OAuth & Credentials
// =====================================================

export interface TrelloCredentials {
  apiKey: string;
  token: string;
  userId?: string;
  username?: string;
  fullName?: string;
}

// =====================================================
// Sync Settings
// =====================================================

export interface TrelloSettings {
  events: string[]; // Which Aurentia events to sync
  board_id: string | null; // Which Trello board to sync to
  sync_enabled: boolean;
  create_cards_for: string[]; // Which event types should create Trello cards
  list_mapping?: Record<string, string>; // Map Aurentia statuses to Trello lists
  label_mapping?: Record<string, string>; // Map Aurentia event types to Trello labels
}

// =====================================================
// API Request Types
// =====================================================

export interface CreateCardRequest {
  name: string;
  desc?: string;
  pos?: 'top' | 'bottom' | number;
  due?: string; // ISO 8601 date
  idList: string;
  idMembers?: string[];
  idLabels?: string[];
  urlSource?: string; // Link back to Aurentia
}

export interface UpdateCardRequest {
  name?: string;
  desc?: string;
  closed?: boolean;
  idList?: string;
  due?: string;
  dueComplete?: boolean;
  idMembers?: string[];
  idLabels?: string[];
}

// =====================================================
// Service Response Types
// =====================================================

export interface SyncCardResult {
  success: boolean;
  cardId?: string;
  cardUrl?: string;
  error?: string;
}

// =====================================================
// Trello Label Colors
// =====================================================

export const TRELLO_LABEL_COLORS = [
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'blue',
  'sky',
  'lime',
  'pink',
  'black',
] as const;

export type TrelloLabelColor = (typeof TRELLO_LABEL_COLORS)[number];
