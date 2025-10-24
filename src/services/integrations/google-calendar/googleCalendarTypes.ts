/**
 * Google Calendar Integration Types
 * Based on Google Calendar API v3
 * Documentation: https://developers.google.com/calendar/api/v3/reference
 */

// =====================================================
// Google Calendar API Types
// =====================================================

export interface GoogleCalendarEvent {
  id?: string;
  summary: string; // Title
  description?: string;
  location?: string;
  start: {
    dateTime?: string; // ISO 8601 format
    date?: string; // For all-day events (YYYY-MM-DD)
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: GoogleCalendarAttendee[];
  conferenceData?: GoogleConferenceData;
  colorId?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string; // Link to event in Google Calendar
}

export interface GoogleCalendarAttendee {
  email: string;
  displayName?: string;
  optional?: boolean;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
}

export interface GoogleConferenceData {
  createRequest?: {
    requestId: string;
    conferenceSolutionKey: {
      type: 'hangoutsMeet' | 'eventHangout' | 'eventNamedHangout';
    };
  };
  entryPoints?: Array<{
    entryPointType: 'video' | 'phone' | 'sip' | 'more';
    uri: string;
    label?: string;
  }>;
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  timeZone?: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  accessRole?: 'freeBusyReader' | 'reader' | 'writer' | 'owner';
}

// =====================================================
// OAuth & Credentials
// =====================================================

export interface GoogleCalendarCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601 timestamp
  scope: string;
  email?: string;
}

// =====================================================
// Sync Settings
// =====================================================

export interface GoogleCalendarSettings {
  events: string[]; // Which Aurentia events to sync
  calendar_id: string; // Which Google Calendar to sync to (default: 'primary')
  sync_enabled: boolean;
  sync_direction: 'aurentia_to_google' | 'bidirectional'; // For future bidirectional sync
  create_meet_links?: boolean; // Auto-create Google Meet links
  color_mapping?: Record<string, string>; // Map Aurentia event types to Google Calendar colors
  timezone?: string; // User's timezone
}

// =====================================================
// API Response Types
// =====================================================

export interface GoogleCalendarListResponse {
  kind: 'calendar#calendarList';
  etag: string;
  items: GoogleCalendar[];
}

export interface GoogleCalendarEventsResponse {
  kind: 'calendar#events';
  etag: string;
  summary: string;
  updated: string;
  timeZone: string;
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
}

export interface GoogleCalendarErrorResponse {
  error: {
    code: number;
    message: string;
    errors: Array<{
      domain: string;
      reason: string;
      message: string;
    }>;
  };
}

// =====================================================
// Color IDs
// From Google Calendar API documentation
// =====================================================

export const GOOGLE_CALENDAR_COLORS = {
  LAVENDER: '1',
  SAGE: '2',
  GRAPE: '3',
  FLAMINGO: '4',
  BANANA: '5',
  TANGERINE: '6',
  PEACOCK: '7',
  GRAPHITE: '8',
  BLUEBERRY: '9',
  BASIL: '10',
  TOMATO: '11',
} as const;

// =====================================================
// Service Response Types
// =====================================================

export interface SyncEventResult {
  success: boolean;
  googleEventId?: string;
  googleEventLink?: string;
  error?: string;
}
