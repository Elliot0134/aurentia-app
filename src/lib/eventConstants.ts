import { Event } from "@/hooks/useEvents";

// Couleurs des types d'événements pour l'affichage dans le calendrier
export const EVENT_TYPE_COLORS: Record<Event['type'], string> = {
  workshop: '#ff5932', // Couleur principale Aurentia
  meeting: '#6366f1', // Indigo
  webinar: '#8b5cf6', // Violet
  networking: '#06b6d4', // Cyan
  presentation: '#f59e0b', // Amber
  training: '#10b981', // Emerald
  other: '#64748b' // Slate
};

// Labels français des types d'événements
export const EVENT_TYPE_LABELS: Record<Event['type'], string> = {
  workshop: 'Atelier',
  meeting: 'Réunion',
  webinar: 'Webinaire',
  networking: 'Networking',
  presentation: 'Présentation',
  training: 'Formation',
  other: 'Autre'
};

// Options pour les selects de type d'événement
export const EVENT_TYPE_OPTIONS = [
  { value: 'workshop', label: 'Atelier' },
  { value: 'meeting', label: 'Réunion' },
  { value: 'webinar', label: 'Webinaire' },
  { value: 'networking', label: 'Networking' },
  { value: 'presentation', label: 'Présentation' },
  { value: 'training', label: 'Formation' },
  { value: 'other', label: 'Autre' }
] as const;

// Fonctions utilitaires pour récupérer les couleurs et labels
export const getEventTypeColor = (type: Event['type']): string => {
  return EVENT_TYPE_COLORS[type];
};

export const getEventTypeLabel = (type: Event['type']): string => {
  return EVENT_TYPE_LABELS[type];
};