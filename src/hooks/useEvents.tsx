import { useState, useEffect } from 'react';
import {
  getOrganisationEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  Event
} from '../services/organisationService';
import { useEventActivityTracker } from './useEventActivityTracker';

export interface EventFormData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  type: Event['type'];
  location?: string;
  meet_link?: string;
  organizer_id?: string;
  is_recurring: boolean;
  max_participants?: number;
  organization_id: string;
  participants?: string[];
}

export const useEvents = (organisationId: string | undefined) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackEventUpdate, trackParticipantAdded, trackParticipantRemoved, trackEventMoved } = useEventActivityTracker();

  const fetchEvents = async () => {
    if (!organisationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getOrganisationEvents(organisationId);
      setEvents(data);
    } catch (err) {
      setError('Erreur lors du chargement des événements');
      console.error('Erreur chargement événements:', err);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: EventFormData): Promise<boolean> => {
    try {
      const newEvent = await createEvent({
        ...eventData,
        participants: eventData.participants || []
      });

      if (newEvent) {
        setEvents(prev => [newEvent, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de la création de l\'événement');
      console.error('Erreur création événement:', err);
      return false;
    }
  };

  const editEvent = async (eventId: string, updates: Partial<Event>): Promise<Event | null> => {
    try {
      // Récupérer l'événement actuel pour comparer les changements
      const currentEvent = events.find(e => e.id === eventId);
      if (!currentEvent) {
        throw new Error('Événement non trouvé');
      }

      const updatedEvent = await updateEvent(eventId, updates);

      if (updatedEvent) {
        setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
        
        // Tracker les changements pour l'activité récente
        await trackEventUpdate(updatedEvent, updates, currentEvent);
        
        // Tracker spécifiquement les changements de participants
        if (updates.participants && currentEvent.participants) {
          const newParticipants = updates.participants.filter(p => !currentEvent.participants.includes(p));
          const removedParticipants = currentEvent.participants.filter(p => !updates.participants!.includes(p));
          
          if (newParticipants.length > 0) {
            // TODO: Récupérer les noms des participants depuis leur ID
            await trackParticipantAdded(updatedEvent, [`${newParticipants.length} participant(s)`]);
          }
          
          if (removedParticipants.length > 0) {
            // TODO: Récupérer les noms des participants depuis leur ID
            await trackParticipantRemoved(updatedEvent, [`${removedParticipants.length} participant(s)`]);
          }
        }
        
        // Tracker les déplacements d'événement
        if (updates.start_date && updates.start_date !== currentEvent.start_date) {
          await trackEventMoved(
            updatedEvent, 
            updates.start_date, 
            updates.end_date || currentEvent.end_date,
            currentEvent.start_date
          );
        }

        return updatedEvent;
      }
      return null;
    } catch (err) {
      setError('Erreur lors de la modification de l\'événement');
      console.error('Erreur modification événement:', err);
      return null;
    }
  };

  const removeEvent = async (eventId: string): Promise<boolean> => {
    try {
      const success = await deleteEvent(eventId);

      if (success) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de la suppression de l\'événement');
      console.error('Erreur suppression événement:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [organisationId]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    addEvent,
    editEvent,
    removeEvent
  };
};