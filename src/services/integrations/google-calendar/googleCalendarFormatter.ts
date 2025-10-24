/**
 * Google Calendar Event Formatter
 * Converts Aurentia events into Google Calendar events
 */

import type { IntegrationEvent } from '@/types/integrationTypes';
import type {
  GoogleCalendarEvent,
  GoogleCalendarSettings,
  GOOGLE_CALENDAR_COLORS,
} from './googleCalendarTypes';

type ColorId = (typeof GOOGLE_CALENDAR_COLORS)[keyof typeof GOOGLE_CALENDAR_COLORS];

class GoogleCalendarFormatter {
  /**
   * Format an Aurentia event into a Google Calendar event
   */
  formatEvent(
    event: IntegrationEvent,
    settings: GoogleCalendarSettings
  ): GoogleCalendarEvent | null {
    // Only process event.created type (actual calendar events)
    if (event.type === 'event.created') {
      return this.formatEventCreated(event, settings);
    }

    // For other event types, we don't sync to calendar
    // (they're notifications, not calendar events)
    return null;
  }

  /**
   * Format: Event Created (Aurentia calendar event -> Google Calendar event)
   */
  private formatEventCreated(
    event: IntegrationEvent,
    settings: GoogleCalendarSettings
  ): GoogleCalendarEvent {
    const { data } = event;

    // Parse start date and time
    const startDateTime = this.parseDateTime(
      data.start_date,
      data.start_time,
      settings.timezone
    );

    // Parse end date and time (or calculate from start + duration)
    const endDateTime = this.parseDateTime(
      data.end_date || data.start_date,
      data.end_time || this.calculateEndTime(data.start_time, data.duration),
      settings.timezone
    );

    // Build Google Calendar event
    const calendarEvent: GoogleCalendarEvent = {
      summary: data.title || 'Événement Aurentia',
      description: this.buildDescription(data),
      location: data.location || undefined,
      start: startDateTime,
      end: endDateTime,
      colorId: this.getColorId(data.type, settings),
      status: 'confirmed',
    };

    // Add attendees if specified
    if (data.attendees && Array.isArray(data.attendees)) {
      calendarEvent.attendees = data.attendees.map((email: string) => ({
        email,
        responseStatus: 'needsAction',
      }));
    }

    // Add Google Meet link if enabled
    if (settings.create_meet_links) {
      calendarEvent.conferenceData = {
        createRequest: {
          requestId: `aurentia-${data.id}-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      };
    }

    return calendarEvent;
  }

  /**
   * Parse date and time into Google Calendar format
   */
  private parseDateTime(
    date: string | undefined,
    time: string | undefined,
    timezone?: string
  ): { dateTime?: string; date?: string; timeZone?: string } {
    if (!date) {
      // Default to today if no date specified
      date = new Date().toISOString().split('T')[0];
    }

    if (time) {
      // Specific time: use dateTime field
      const dateTimeStr = `${date}T${time}:00`;
      return {
        dateTime: dateTimeStr,
        timeZone: timezone || 'America/Toronto', // Default to Montreal timezone
      };
    } else {
      // All-day event: use date field
      return {
        date,
      };
    }
  }

  /**
   * Calculate end time from start time and duration (in minutes)
   */
  private calculateEndTime(startTime: string | undefined, duration: number | undefined): string | undefined {
    if (!startTime || !duration) {
      return undefined;
    }

    try {
      // Parse start time (HH:mm format)
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      // Add duration
      startDate.setMinutes(startDate.getMinutes() + duration);

      // Format as HH:mm
      const endHours = startDate.getHours().toString().padStart(2, '0');
      const endMinutes = startDate.getMinutes().toString().padStart(2, '0');
      return `${endHours}:${endMinutes}`;
    } catch {
      return undefined;
    }
  }

  /**
   * Build event description with Aurentia branding
   */
  private buildDescription(data: any): string {
    let description = '';

    if (data.description) {
      description += `${data.description}\n\n`;
    }

    description += '---\n';
    description += '📅 Créé via Aurentia\n';

    if (data.type) {
      const typeLabel = this.formatEventType(data.type);
      description += `Type: ${typeLabel}\n`;
    }

    if (data.organisation_name) {
      description += `Organisation: ${data.organisation_name}\n`;
    }

    return description.trim();
  }

  /**
   * Format event type for display
   */
  private formatEventType(type: string): string {
    const typeMap: Record<string, string> = {
      meeting: 'Réunion',
      workshop: 'Atelier',
      presentation: 'Présentation',
      deadline: 'Date limite',
      other: 'Autre',
    };

    return typeMap[type] || type;
  }

  /**
   * Get Google Calendar color ID based on event type
   */
  private getColorId(eventType: string | undefined, settings: GoogleCalendarSettings): ColorId {
    if (settings.color_mapping && eventType && settings.color_mapping[eventType]) {
      return settings.color_mapping[eventType] as ColorId;
    }

    // Default color mapping
    const defaultColors: Record<string, ColorId> = {
      meeting: '7', // Peacock (blue)
      workshop: '5', // Banana (yellow)
      presentation: '4', // Flamingo (red/pink)
      deadline: '11', // Tomato (red)
      other: '8', // Graphite (gray)
    };

    return eventType && defaultColors[eventType]
      ? defaultColors[eventType]
      : '8'; // Default to Graphite
  }
}

export const googleCalendarFormatter = new GoogleCalendarFormatter();
