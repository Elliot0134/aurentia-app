/**
 * Integration System Constants
 * Defines available integrations and events
 */

import type { IntegrationConfig, AvailableEvent } from '@/types/integrationTypes';

// =====================================================
// AVAILABLE INTEGRATIONS
// =====================================================

export const AVAILABLE_INTEGRATIONS: IntegrationConfig[] = [
  // Phase 1: Simple webhooks
  {
    type: 'slack',
    name: 'Slack',
    icon: '💬',
    description: 'Recevez des notifications dans vos channels Slack',
    setupInstructions:
      'Créez un Incoming Webhook dans votre workspace Slack et collez l\'URL ci-dessous. ' +
      'Pour créer un webhook: Workspace Settings → Apps → Incoming Webhooks → Add to Slack',
    credentialLabel: 'URL du Webhook Slack',
    credentialPlaceholder: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX',
    credentialHint:
      'Vous pouvez créer un webhook dans les paramètres de votre channel Slack. ' +
      'Le webhook enverra les messages dans le channel que vous sélectionnez lors de la création.',
    requiresOAuth: false,
    phase: 1,
    category: 'messaging'
  },
  {
    type: 'discord',
    name: 'Discord',
    icon: '🎮',
    description: 'Envoyez des messages dans vos serveurs Discord',
    setupInstructions:
      'Créez un webhook dans les paramètres de votre channel Discord et collez l\'URL ci-dessous. ' +
      'Pour créer un webhook: Server Settings → Integrations → Webhooks → New Webhook',
    credentialLabel: 'URL du Webhook Discord',
    credentialPlaceholder: 'https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN',
    credentialHint:
      'Dans votre serveur Discord: cliquez sur les paramètres du channel → Intégrations → ' +
      'Webhooks → Nouveau Webhook. Copiez l\'URL du webhook.',
    requiresOAuth: false,
    phase: 1,
    category: 'messaging'
  },

  // Phase 2: Teams webhook + Google Calendar OAuth
  {
    type: 'teams',
    name: 'Microsoft Teams',
    icon: '👥',
    description: 'Postez des cartes adaptatives dans Microsoft Teams',
    setupInstructions:
      'Ajoutez le connecteur "Incoming Webhook" à votre channel Teams et collez l\'URL ci-dessous. ' +
      'Pour créer un webhook: Channel → ⋯ → Connectors → Incoming Webhook → Configure',
    credentialLabel: 'URL du Webhook Teams',
    credentialPlaceholder: 'https://outlook.office.com/webhook/...',
    credentialHint:
      'Dans votre channel Teams: Menu (⋯) → Connecteurs → Incoming Webhook → Configurer. ' +
      'Donnez un nom au webhook et copiez l\'URL.',
    requiresOAuth: false,
    phase: 2,
    category: 'messaging'
  },
  {
    type: 'google_calendar',
    name: 'Google Calendar',
    icon: '📅',
    description: 'Synchronisez vos événements avec Google Calendar',
    setupInstructions:
      'Autorisez Aurentia à accéder à votre Google Calendar pour synchroniser automatiquement ' +
      'les événements créés dans la plateforme.',
    requiresOAuth: true,
    phase: 2,
    category: 'calendar'
  },

  // Phase 3: Trello, Google Drive & Gmail OAuth
  {
    type: 'trello',
    name: 'Trello',
    icon: '📋',
    description: 'Créez des cartes Trello depuis vos projets et livrables',
    setupInstructions:
      'Connectez votre compte Trello pour synchroniser automatiquement vos projets et livrables ' +
      'avec des cartes Trello dans le board de votre choix.',
    requiresOAuth: true,
    phase: 3,
    category: 'project_management'
  },
  {
    type: 'google_drive',
    name: 'Google Drive',
    icon: '📂',
    description: 'Synchronisez vos fichiers et livrables avec Google Drive',
    setupInstructions:
      'Autorisez Aurentia à accéder à votre Google Drive pour sauvegarder automatiquement ' +
      'vos livrables et documents de projet dans des dossiers organisés.',
    requiresOAuth: true,
    phase: 3,
    category: 'storage'
  },
  {
    type: 'gmail',
    name: 'Gmail',
    icon: '📧',
    description: 'Envoyez des notifications et mises à jour par email via Gmail',
    setupInstructions:
      'Autorisez Aurentia à envoyer des emails depuis votre compte Gmail pour notifier ' +
      'les membres de votre équipe des événements importants.',
    requiresOAuth: true,
    phase: 3,
    category: 'messaging'
  }
];

// =====================================================
// AVAILABLE EVENTS
// =====================================================

export const AVAILABLE_EVENTS: AvailableEvent[] = [
  // Project events
  {
    type: 'project.created',
    label: '🎉 Projet créé',
    description: 'Déclenché quand un nouveau projet est créé par un entrepreneur',
    category: 'project'
  },
  {
    type: 'project.updated',
    label: '📝 Projet mis à jour',
    description: 'Déclenché quand les informations d\'un projet sont modifiées',
    category: 'project'
  },
  {
    type: 'project.deleted',
    label: '🗑️ Projet supprimé',
    description: 'Déclenché quand un projet est supprimé',
    category: 'project'
  },

  // Deliverable events
  {
    type: 'deliverable.submitted',
    label: '📤 Livrable soumis',
    description: 'Déclenché quand un entrepreneur soumet un livrable pour révision',
    category: 'deliverable'
  },
  {
    type: 'deliverable.reviewed',
    label: '✅ Livrable évalué',
    description: 'Déclenché quand un mentor évalue et valide un livrable',
    category: 'deliverable'
  },
  {
    type: 'deliverable.updated',
    label: '🔄 Livrable mis à jour',
    description: 'Déclenché quand un livrable est modifié après soumission',
    category: 'deliverable'
  },

  // Comment events
  {
    type: 'comment.added',
    label: '💬 Commentaire ajouté',
    description: 'Déclenché quand un commentaire est ajouté sur un livrable',
    category: 'deliverable'
  },

  // Member events (organization only)
  {
    type: 'member.joined',
    label: '👋 Membre rejoint',
    description: 'Déclenché quand un nouveau membre rejoint l\'organisation (organisation uniquement)',
    category: 'member'
  },
  {
    type: 'member.updated',
    label: '👤 Membre mis à jour',
    description: 'Déclenché quand les informations d\'un membre sont modifiées (organisation uniquement)',
    category: 'member'
  },
  {
    type: 'member.removed',
    label: '👋 Membre retiré',
    description: 'Déclenché quand un membre quitte ou est retiré de l\'organisation (organisation uniquement)',
    category: 'member'
  },

  // Event (calendar) events
  {
    type: 'event.created',
    label: '📅 Événement créé',
    description: 'Déclenché quand un nouvel événement est créé dans le calendrier',
    category: 'event'
  },
  {
    type: 'event.updated',
    label: '📅 Événement modifié',
    description: 'Déclenché quand un événement du calendrier est modifié',
    category: 'event'
  },
  {
    type: 'event.reminder',
    label: '🔔 Rappel d\'événement',
    description: 'Déclenché 24h avant un événement pour rappel',
    category: 'event'
  },

  // Organization events
  {
    type: 'organization.settings.updated',
    label: '⚙️ Paramètres organisation mis à jour',
    description: 'Déclenché quand les paramètres de l\'organisation sont modifiés (organisation uniquement)',
    category: 'organization'
  }
];

// =====================================================
// EVENT CATEGORIES
// =====================================================

export const EVENT_CATEGORIES = {
  project: {
    label: 'Projets',
    icon: '📁',
    description: 'Événements liés aux projets'
  },
  deliverable: {
    label: 'Livrables',
    icon: '📦',
    description: 'Événements liés aux livrables et commentaires'
  },
  member: {
    label: 'Membres',
    icon: '👥',
    description: 'Événements liés aux membres (organisation uniquement)'
  },
  event: {
    label: 'Événements',
    icon: '📅',
    description: 'Événements liés au calendrier'
  },
  organization: {
    label: 'Organisation',
    icon: '🏢',
    description: 'Événements liés aux paramètres de l\'organisation'
  }
} as const;

// =====================================================
// INTEGRATION CATEGORIES
// =====================================================

export const INTEGRATION_CATEGORIES = {
  messaging: {
    label: 'Messagerie',
    icon: '💬',
    description: 'Notifications et messages instantanés'
  },
  calendar: {
    label: 'Calendrier',
    icon: '📅',
    description: 'Synchronisation d\'événements'
  },
  project_management: {
    label: 'Gestion de projet',
    icon: '📋',
    description: 'Outils de gestion de projets et tâches'
  },
  storage: {
    label: 'Stockage',
    icon: '📂',
    description: 'Stockage et partage de fichiers'
  }
} as const;

// =====================================================
// WEBHOOK VALIDATION
// =====================================================

/**
 * Allowed webhook domains for security
 * SSRF protection: only allow known integration domains
 */
export const ALLOWED_WEBHOOK_DOMAINS = [
  'hooks.slack.com',
  'discord.com',
  'discordapp.com',
  'outlook.office.com',
  'outlook.office365.com'
];

/**
 * Maximum webhook URL length
 */
export const MAX_WEBHOOK_URL_LENGTH = 500;

/**
 * Webhook timeout in milliseconds
 */
export const WEBHOOK_TIMEOUT_MS = 5000;

/**
 * Maximum retries for failed webhooks
 */
export const MAX_WEBHOOK_RETRIES = 3;

// =====================================================
// API KEY CONFIGURATION
// =====================================================

/**
 * API key prefix formats
 */
export const API_KEY_PREFIXES = {
  personal: 'sk_live',
  organization: 'sk_org_live',
  test: 'sk_test'
} as const;

/**
 * Default rate limits (requests per hour)
 */
export const DEFAULT_RATE_LIMITS = {
  personal: 1000,
  organization: 5000,
  enterprise: 10000
} as const;

// =====================================================
// ENCRYPTION
// =====================================================

/**
 * Encryption algorithm
 */
export const ENCRYPTION_ALGORITHM = 'AES-256';

/**
 * Note: For Phase 1, we use client-side encryption for webhook URLs (semi-public)
 * For Phase 2 (OAuth tokens), we'll migrate to Supabase Vault for better security
 */

// =====================================================
// NOTIFICATION FORMATTING
// =====================================================

/**
 * Color scheme for different notification types
 */
export const NOTIFICATION_COLORS = {
  success: '#10b981', // green-500
  info: '#3b82f6', // blue-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444', // red-500
  project: '#8b5cf6', // violet-500
  deliverable: '#ec4899', // pink-500
  member: '#06b6d4', // cyan-500
  event: '#f97316' // orange-500
} as const;

/**
 * Default notification format
 */
export const DEFAULT_NOTIFICATION_FORMAT = 'rich';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get integration config by type
 */
export function getIntegrationConfig(type: string): IntegrationConfig | undefined {
  return AVAILABLE_INTEGRATIONS.find((integration) => integration.type === type);
}

/**
 * Get event config by type
 */
export function getEventConfig(type: string): AvailableEvent | undefined {
  return AVAILABLE_EVENTS.find((event) => event.type === type);
}

/**
 * Get integrations by phase
 */
export function getIntegrationsByPhase(phase: 1 | 2 | 3): IntegrationConfig[] {
  return AVAILABLE_INTEGRATIONS.filter((integration) => integration.phase === phase);
}

/**
 * Get events by category
 */
export function getEventsByCategory(category: string): AvailableEvent[] {
  return AVAILABLE_EVENTS.filter((event) => event.category === category);
}

/**
 * Check if integration requires OAuth
 */
export function requiresOAuth(type: string): boolean {
  const config = getIntegrationConfig(type);
  return config?.requiresOAuth ?? false;
}

/**
 * Validate webhook URL domain
 */
export function isAllowedWebhookDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_WEBHOOK_DOMAINS.some((domain) =>
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}
