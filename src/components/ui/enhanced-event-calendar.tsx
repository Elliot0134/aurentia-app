import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventTypeFilter } from "@/components/ui/event-type-filter";
import { Event } from "@/services/organisationService";
import { EVENT_TYPE_OPTIONS } from "@/lib/eventConstants";
import { Calendar as CalendarIcon, Settings } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { normalizeFullCalendarDate } from "@/utils/dateTimeUtils";
import './enhanced-event-calendar.css';

interface EnhancedEventCalendarProps {
  events: Event[];
  eventTypeColors: Record<Event['type'], string>;
  onEventClick: (event: Event) => void;
  onSelect: (selectInfo: any) => void;
  onEventResize: (resizeInfo: any) => void;
  onEventDrop: (dropInfo: any) => void;
  loading?: boolean;
}

export function EnhancedEventCalendar({
  events,
  eventTypeColors,
  onEventClick,
  onSelect,
  onEventResize,
  onEventDrop,
  loading = false
}: EnhancedEventCalendarProps) {
  const { userProfile } = useUserProfile();
  const { canManageOrganization } = useUserRole();
  const [visibleTypes, setVisibleTypes] = useState<Set<Event['type']>>(
    new Set(EVENT_TYPE_OPTIONS.map(option => option.value as Event['type'])) // Tous les types visibles par défaut
  );

  const handleVisibilityChange = (type: Event['type'], visible: boolean) => {
    const newVisibleTypes = new Set(visibleTypes);
    if (visible) {
      newVisibleTypes.add(type);
    } else {
      newVisibleTypes.delete(type);
    }
    setVisibleTypes(newVisibleTypes);
  };

  const handleToggleAll = (visible: boolean) => {
    if (visible) {
      // Afficher tous les types
      setVisibleTypes(new Set(EVENT_TYPE_OPTIONS.map(option => option.value as Event['type'])));
    } else {
      // Masquer tous les types
      setVisibleTypes(new Set());
    }
  };

  // Vérifier si l'utilisateur peut modifier un événement
  const canEditEvent = (event: Event) => {
    const isCreator = userProfile && event.organizer_id === userProfile.id;
    return isCreator || canManageOrganization();
  };

  // Filtrer les événements selon la visibilité des types
  const filteredEvents = useMemo(() => {
    return events.filter(event => visibleTypes.has(event.type));
  }, [events, visibleTypes]);

  // Convertir les événements pour FullCalendar
  const calendarEvents = useMemo(() => {
    return filteredEvents.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_date),
      end: new Date(event.end_date),
      backgroundColor: eventTypeColors[event.type],
      borderColor: eventTypeColors[event.type],
      textColor: '#ffffff',
      extendedProps: {
        ...event,
        color: eventTypeColors[event.type]
      }
    }));
  }, [filteredEvents, eventTypeColors]);

  // Configuration des événements pour FullCalendar avec style amélioré
  const eventContent = (eventInfo: any) => {
    const backgroundColor = eventInfo.event.extendedProps.color;
    const isSmallEvent = eventInfo.view.type === 'dayGridMonth';

    return (
      <div
        className="fc-event-content"
        style={{
          backgroundColor,
          color: 'white',
          padding: isSmallEvent ? '2px 6px' : '4px 8px',
          borderRadius: '6px',
          fontSize: isSmallEvent ? '11px' : '12px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        <div className="fc-event-title" style={{ 
          flex: 1, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {eventInfo.event.title}
        </div>
        {!isSmallEvent && eventInfo.event.extendedProps.max_participants && (
          <div style={{ 
            fontSize: '10px', 
            opacity: 0.8,
            flexShrink: 0
          }}>
            {eventInfo.event.extendedProps.participants?.length || 0}/{eventInfo.event.extendedProps.max_participants}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-aurentia-pink" />
            Calendrier des Événements
          </CardTitle>
          <EventTypeFilter
            eventTypeColors={eventTypeColors}
            visibleTypes={visibleTypes}
            onVisibilityChange={handleVisibilityChange}
            onToggleAll={handleToggleAll}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div style={{ height: '700px' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            locale={frLocale}
            events={calendarEvents}
            eventContent={eventContent}
            eventClick={(info) => {
              const event = events.find(e => e.id === info.event.id);
              if (event) {
                onEventClick(event);
              }
            }}
            selectable={true}
            selectMirror={true}
            select={(selectInfo) => {
              // Fix date selection issues:
              // FullCalendar gives us dates with potential timezone offsets
              // We need to ensure proper date handling for all-day events

              const isAllDay = selectInfo.allDay;

              if (isAllDay) {
                // All-day selection: FullCalendar gives us midnight to midnight (exclusive end)
                // For single day: start = day at 00:00, end = next day at 00:00
                // For multi-day: start = first day at 00:00, end = day after last day at 00:00

                // Create dates in local timezone without any offset issues
                const startDate = new Date(selectInfo.startStr); // Use the string to avoid timezone issues
                const endDate = new Date(selectInfo.endStr);

                // Set start to 00:01 AM of the selected day
                const adjustedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 1, 0, 0);

                // FullCalendar's end is exclusive (next day at 00:00), so we need to go back one day
                // and set to 23:59 PM of the actual last selected day
                const actualEndDate = new Date(endDate);
                actualEndDate.setDate(actualEndDate.getDate() - 1);
                const adjustedEnd = new Date(actualEndDate.getFullYear(), actualEndDate.getMonth(), actualEndDate.getDate(), 23, 59, 0, 0);

                onSelect({
                  ...selectInfo,
                  start: adjustedStart,
                  end: adjustedEnd
                });
              } else {
                // Time-specific selection (drag in week/day view)
                // Normalize dates to ensure they're in local timezone without conversion
                const normalizedStart = normalizeFullCalendarDate(selectInfo.start);
                const normalizedEnd = normalizeFullCalendarDate(selectInfo.end);

                console.log('Calendar selection - Raw:', {
                  start: selectInfo.start,
                  end: selectInfo.end
                });
                console.log('Calendar selection - Normalized:', {
                  start: normalizedStart,
                  end: normalizedEnd
                });

                onSelect({
                  ...selectInfo,
                  start: normalizedStart,
                  end: normalizedEnd
                });
              }
            }}
            editable={true}
            eventAllow={(dropInfo, draggedEvent) => {
              if (!draggedEvent) return true;
              const event = events.find(e => e.id === draggedEvent.id);
              return event ? canEditEvent(event) : false;
            }}
            eventResize={(info) => {
              const event = events.find(e => e.id === info.event.id);
              if (event && canEditEvent(event)) {
                onEventResize(info);
              } else {
                info.revert();
              }
            }}
            eventDrop={(info) => {
              const event = events.find(e => e.id === info.event.id);
              if (event && canEditEvent(event)) {
                onEventDrop(info);
              } else {
                info.revert();
              }
            }}
            height="100%"
            dayMaxEvents={4}
            moreLinkClick="popover"
            buttonText={{
              today: "Aujourd'hui",
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour'
            }}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              omitZeroMinute: false,
              meridiem: false
            }}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: false
            }}
            // Améliorer la gestion du drag & drop
            eventDragStart={(info) => {
              info.el.style.opacity = '0.7';
              info.el.style.transform = 'scale(1.05)';
              info.el.style.zIndex = '1000';
            }}
            eventDragStop={(info) => {
              info.el.style.opacity = '1';
              info.el.style.transform = 'scale(1)';
              info.el.style.zIndex = 'auto';
            }}
            // Configuration pour réduire la sensibilité du drag
            longPressDelay={300}
            eventLongPressDelay={300}
            selectLongPressDelay={300}
            // Améliorer la précision du resize
            eventResizeStart={(info) => {
              info.el.style.opacity = '0.8';
            }}
            eventResizeStop={(info) => {
              info.el.style.opacity = '1';
            }}
            // Styles CSS personnalisés
            eventClassNames={(arg) => {
              return ['custom-event', `event-${arg.event.extendedProps.type}`];
            }}
          />
        </div>
      </CardContent>
      

    </Card>
  );
}